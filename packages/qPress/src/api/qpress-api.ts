import { existsSync, promises as fs, readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import ts from 'typescript'

export type QPressApiEntryGroup = 'functions' | 'methods'

export type QPressApiGenerateEntry = {
  docsUrl?: string
  generatedSuffix?: string
  group?: QPressApiEntryGroup
  input: string
  output: string
  type?: string
}

export type QPressApiGenerateOptions = {
  cwd?: string
  entries: QPressApiGenerateEntry[]
  generatedSuffix?: string
  publicUrl?: string
  writeOutput?: boolean
}

export type QPressApiFieldChange = {
  current?: unknown
  generated?: unknown
  path: string
  type: 'added' | 'changed' | 'removed'
}

export type QPressApiGeneratedEntry = {
  differsFromOutput: boolean | null
  exportCount: number
  fieldChanges: QPressApiFieldChange[]
  generatedOutputPath: string
  inputPath: string
  outputPath: string
}

export type QPressApiGenerateResult = {
  entries: QPressApiGeneratedEntry[]
}

export type QPressApiCheckDiagnostic = {
  code: 'api-output-missing' | 'api-output-stale'
  fieldChanges: QPressApiFieldChange[]
  generatedOutputPath: string
  inputPath: string
  outputPath: string
}

export type QPressApiCheckResult = {
  diagnostics: QPressApiCheckDiagnostic[]
  entries: QPressApiGeneratedEntry[]
}

type GeneratedApiProperty = {
  __exemption?: string[]
  addedIn?: string
  applicable?: string[]
  category?: string
  default?: string
  definition?: Record<string, GeneratedApiProperty>
  deprecated?: string | boolean
  desc: string
  examples?: string[]
  params?: Record<string, GeneratedApiProperty>
  required?: boolean
  returns?: GeneratedApiProperty | null
  scope?: Record<string, GeneratedApiProperty>
  tsSignature?: string
  tsType?: string
  type?: string
  values?: string[]
}

type GeneratedApiJson = {
  [group: string]: unknown
  generated_at: string
  meta?: {
    docsUrl?: string
  }
  type: string
}

type GeneratedApiGroupName = 'props' | 'events' | 'slots' | 'methods'

type FunctionLikeNode =
  | ts.FunctionDeclaration
  | ts.MethodDeclaration
  | ts.ArrowFunction
  | ts.FunctionExpression

type SourceFileContext = {
  cache: Map<string, ts.SourceFile>
  inputPath: string
  sourceFile: ts.SourceFile
}

const defaultGeneratedSuffix = '.generated'

/**
 * Generates Q-Press API JSON from TypeScript exports and JSDoc.
 *
 * Existing API JSON files are not overwritten by default. For an output file
 * such as `src/.q-press/api/Foo.json`, this writes
 * `src/.q-press/api/Foo.generated.json` so authors can review generated output
 * before publishing it. Set `writeOutput` when a release build should write
 * configured output files directly.
 */
export async function generateQPressApi(
  options: QPressApiGenerateOptions,
): Promise<QPressApiGenerateResult> {
  const cwd = options.cwd ?? process.cwd()
  const writeOutput = options.writeOutput === true
  const entries = await Promise.all(
    options.entries.map(async (entry) => {
      const generated = await generateApiJsonForEntry(entry, cwd, options.publicUrl)
      const outputPath = resolve(cwd, entry.output)
      const generatedOutputPath = writeOutput
        ? outputPath
        : getGeneratedOutputPath(
            outputPath,
            entry.generatedSuffix ?? options.generatedSuffix ?? defaultGeneratedSuffix,
          )
      const generatedContent = stringifyApiJson(generated.api)
      const currentOutput = await readOptionalFile(outputPath)
      const fieldChanges = getApiFieldChanges(currentOutput, generated.api)

      await fs.mkdir(dirname(generatedOutputPath), { recursive: true })
      await fs.writeFile(generatedOutputPath, generatedContent)

      return {
        differsFromOutput: currentOutput === null ? null : fieldChanges.length > 0,
        exportCount: generated.exportCount,
        fieldChanges,
        generatedOutputPath,
        inputPath: generated.inputPath,
        outputPath,
      }
    }),
  )

  return { entries }
}

/**
 * Checks generated API JSON against committed API JSON without writing files.
 */
export async function checkQPressApi(
  options: QPressApiGenerateOptions,
): Promise<QPressApiCheckResult> {
  const cwd = options.cwd ?? process.cwd()
  const diagnostics: QPressApiCheckDiagnostic[] = []
  const entries: QPressApiGeneratedEntry[] = []

  for (const entry of options.entries) {
    const generated = await generateApiJsonForEntry(entry, cwd, options.publicUrl)
    const outputPath = resolve(cwd, entry.output)
    const generatedOutputPath = getGeneratedOutputPath(
      outputPath,
      entry.generatedSuffix ?? options.generatedSuffix ?? defaultGeneratedSuffix,
    )
    const currentOutput = await readOptionalFile(outputPath)
    const fieldChanges = getApiFieldChanges(currentOutput, generated.api)
    const differsFromOutput = currentOutput === null ? null : fieldChanges.length > 0

    entries.push({
      differsFromOutput,
      exportCount: generated.exportCount,
      fieldChanges,
      generatedOutputPath,
      inputPath: generated.inputPath,
      outputPath,
    })

    if (currentOutput === null) {
      diagnostics.push({
        code: 'api-output-missing',
        fieldChanges,
        generatedOutputPath,
        inputPath: generated.inputPath,
        outputPath,
      })
    } else if (differsFromOutput === true) {
      diagnostics.push({
        code: 'api-output-stale',
        fieldChanges,
        generatedOutputPath,
        inputPath: generated.inputPath,
        outputPath,
      })
    }
  }

  return { diagnostics, entries }
}

/**
 * Returns the generated comparison output path for an API JSON file.
 */
export function getGeneratedOutputPath(
  outputPath: string,
  suffix = defaultGeneratedSuffix,
): string {
  const extension = extname(outputPath)

  if (extension === '') {
    return `${outputPath}${suffix}`
  }

  return `${outputPath.slice(0, -extension.length)}${suffix}${extension}`
}

async function generateApiJsonForEntry(
  entry: QPressApiGenerateEntry,
  cwd: string,
  publicUrl?: string,
): Promise<{ api: GeneratedApiJson; exportCount: number; inputPath: string }> {
  const inputPath = resolve(cwd, entry.input)
  const source = await fs.readFile(inputPath, 'utf8')
  const api: GeneratedApiJson = {
    generated_at: new Date().toISOString(),
    type: entry.type ?? 'component',
  }

  if (entry.docsUrl !== undefined) {
    api.meta = {
      docsUrl: resolveDocsUrl(entry.docsUrl, publicUrl),
    }
  }

  const exportCount =
    extname(inputPath) === '.vue'
      ? populateVueComponentApi(api, inputPath, source)
      : populateTypeScriptEntryApi(api, inputPath, source, entry.group ?? 'functions')

  return {
    api,
    exportCount,
    inputPath,
  }
}

function resolveDocsUrl(docsUrl: string, publicUrl: string | undefined): string {
  if (publicUrl === undefined || isAbsoluteUrl(docsUrl)) {
    return docsUrl
  }

  return `${withoutTrailingSlash(publicUrl)}/${docsUrl.replace(/^\/+/, '')}`
}

function isAbsoluteUrl(value: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(value)
}

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

function populateTypeScriptApi(
  api: GeneratedApiJson,
  inputPath: string,
  source: string,
  group: QPressApiEntryGroup,
): number {
  const sourceFile = ts.createSourceFile(inputPath, source, ts.ScriptTarget.Latest, true)
  const context = createSourceFileContext(sourceFile)
  const generatedEntries = extractExportedFunctions(sourceFile, context)

  api[group] = generatedEntries

  return Object.keys(generatedEntries).length
}

function populateTypeScriptEntryApi(
  api: GeneratedApiJson,
  inputPath: string,
  source: string,
  group: QPressApiEntryGroup,
): number {
  if (api.type === 'component') {
    const componentExportCount = populateTypeScriptComponentApi(api, inputPath, source)

    if (
      componentExportCount > 0 ||
      isPlainRecord(api.props) ||
      isPlainRecord(api.events) ||
      isPlainRecord(api.slots) ||
      isPlainRecord(api.methods)
    ) {
      return componentExportCount
    }
  }

  return populateTypeScriptApi(api, inputPath, source, group)
}

function populateVueComponentApi(api: GeneratedApiJson, inputPath: string, source: string): number {
  const scriptSetup = extractScriptSetup(source)
  let sourceFile: ts.SourceFile | undefined

  if (scriptSetup !== undefined) {
    sourceFile = ts.createSourceFile(inputPath, scriptSetup, ts.ScriptTarget.Latest, true)
    const context = createSourceFileContext(sourceFile, inputPath)
    const props = extractVueProps(sourceFile, context)
    const events = extractVueEvents(sourceFile)
    const methods = extractVueMethods(sourceFile, context)

    if (Object.keys(props).length > 0) {
      api.props = props
    }

    if (Object.keys(events).length > 0) {
      api.events = events
    }

    if (Object.keys(methods).length > 0) {
      api.methods = methods
    }
  }

  const slots = extractVueSlots(source, sourceFile)

  if (Object.keys(slots).length > 0) {
    api.slots = slots
  }

  return ['props', 'events', 'slots', 'methods'].reduce((count, group) => {
    const entries = api[group]

    return count + (isPlainRecord(entries) ? Object.keys(entries).length : 0)
  }, 0)
}

function populateTypeScriptComponentApi(
  api: GeneratedApiJson,
  inputPath: string,
  source: string,
): number {
  const sourceFile = ts.createSourceFile(inputPath, source, ts.ScriptTarget.Latest, true)
  const context = createSourceFileContext(sourceFile, inputPath)
  const component = findDefaultVueComponent(sourceFile)

  if (component === undefined) {
    return 0
  }

  const options = component.options
  const props = extractVueOptionsProps(options, context)
  const events = extractVueOptionsEvents(options, context)
  const slots = extractVueOptionsSlots(options, context)
  const methods = extractVueOptionsMethods(options, context)

  if (Object.keys(props).length > 0) {
    api.props = props
  }

  if (Object.keys(events).length > 0) {
    api.events = events
  }

  if (Object.keys(slots).length > 0) {
    api.slots = slots
  }

  if (Object.keys(methods).length > 0) {
    api.methods = methods
  }

  applyForwardedVueComponentApi(api, component.node, context)

  return ['props', 'events', 'slots', 'methods'].reduce((count, group) => {
    const entries = api[group]

    return count + (isPlainRecord(entries) ? Object.keys(entries).length : 0)
  }, 0)
}

function findDefaultVueComponent(
  sourceFile: ts.SourceFile,
): { node: ts.ExportAssignment; options: ts.ObjectLiteralExpression } | undefined {
  for (const statement of sourceFile.statements) {
    if (!ts.isExportAssignment(statement)) {
      continue
    }

    const expression = statement.expression

    if (ts.isObjectLiteralExpression(expression)) {
      return {
        node: statement,
        options: expression,
      }
    }

    if (
      ts.isCallExpression(expression) &&
      ts.isIdentifier(expression.expression) &&
      expression.expression.text === 'defineComponent' &&
      ts.isObjectLiteralExpression(expression.arguments[0])
    ) {
      return {
        node: statement,
        options: expression.arguments[0],
      }
    }
  }

  return undefined
}

function applyForwardedVueComponentApi(
  api: GeneratedApiJson,
  componentNode: ts.Node,
  context: SourceFileContext,
): void {
  const docs = readJSDoc(componentNode, context.sourceFile)
  const hasExplicitGroupTags =
    docs.apiEventsSources.length > 0 ||
    docs.apiMethodsSources.length > 0 ||
    docs.apiPropsSources.length > 0 ||
    docs.apiSlotsSources.length > 0

  const sourcesByGroup: Record<GeneratedApiGroupName, string[]> = {
    props: docs.apiPropsSources.length > 0 ? docs.apiPropsSources : [],
    events: docs.apiEventsSources.length > 0 ? docs.apiEventsSources : [],
    slots: docs.apiSlotsSources.length > 0 ? docs.apiSlotsSources : [],
    methods: docs.apiMethodsSources.length > 0 ? docs.apiMethodsSources : [],
  }

  if (hasExplicitGroupTags === false) {
    sourcesByGroup.props = docs.apiSources
    sourcesByGroup.events = docs.apiSources
    sourcesByGroup.slots = docs.apiSources
    sourcesByGroup.methods = docs.apiSources
  }

  for (const group of ['props', 'events', 'slots', 'methods'] as const) {
    const entries = extractForwardedVueComponentGroup(sourcesByGroup[group], group, context)

    if (Object.keys(entries).length > 0) {
      mergeApiGroup(api, group, entries)
    }
  }
}

function extractForwardedVueComponentGroup(
  sources: string[],
  group: GeneratedApiGroupName,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const entries: Record<string, GeneratedApiProperty> = {}

  for (const source of sources) {
    const component = resolveForwardedVueComponent(source, context)

    if (component === undefined) {
      continue
    }

    const componentContext = {
      ...context,
      inputPath: component.sourceFile.fileName,
      sourceFile: component.sourceFile,
    }
    const groupEntries = extractVueOptionsApiGroup(component.options, group, componentContext)
    const applicable = getForwardedSourceApplicable(source)

    for (const [name, entry] of Object.entries(groupEntries)) {
      const forwardedEntry = addForwardedApplicable(entry, applicable)

      entries[name] =
        entries[name] === undefined
          ? forwardedEntry
          : mergeForwardedApiProperty(entries[name], forwardedEntry)
    }
  }

  return entries
}

function getForwardedSourceApplicable(source: string): string {
  return toKebabCase(source.replace(/^QCalendar/, '') || source)
}

function addForwardedApplicable(
  entry: GeneratedApiProperty,
  applicable: string,
): GeneratedApiProperty {
  return {
    ...entry,
    applicable: mergeStringLists(entry.applicable, [applicable]),
  }
}

function mergeForwardedApiProperty(
  current: GeneratedApiProperty,
  incoming: GeneratedApiProperty,
): GeneratedApiProperty {
  return {
    ...current,
    applicable: mergeStringLists(current.applicable, incoming.applicable),
    desc: current.desc || incoming.desc,
    ...(current.definition === undefined && incoming.definition === undefined
      ? {}
      : { definition: mergeForwardedPropertyRecords(current.definition, incoming.definition) }),
    ...(current.params === undefined && incoming.params === undefined
      ? {}
      : { params: mergeForwardedPropertyRecords(current.params, incoming.params) }),
    ...(current.scope === undefined && incoming.scope === undefined
      ? {}
      : { scope: mergeForwardedPropertyRecords(current.scope, incoming.scope) }),
    ...(current.tsType === undefined && incoming.tsType === undefined
      ? {}
      : { tsType: mergeApiTypes(current.tsType, incoming.tsType) }),
    ...(current.type === undefined && incoming.type === undefined
      ? {}
      : { type: mergeApiTypes(current.type, incoming.type, { normalize: true }) }),
  }
}

function mergeForwardedPropertyRecords(
  current: Record<string, GeneratedApiProperty> | undefined,
  incoming: Record<string, GeneratedApiProperty> | undefined,
): Record<string, GeneratedApiProperty> {
  const merged: Record<string, GeneratedApiProperty> = {}
  const keys = new Set([...Object.keys(current ?? {}), ...Object.keys(incoming ?? {})])

  for (const key of keys) {
    const currentProperty = current?.[key]
    const incomingProperty = incoming?.[key]

    if (currentProperty === undefined && incomingProperty !== undefined) {
      merged[key] = markForwardedPropertyOptional(incomingProperty)
    } else if (currentProperty !== undefined && incomingProperty === undefined) {
      merged[key] = markForwardedPropertyOptional(currentProperty)
    } else if (currentProperty !== undefined && incomingProperty !== undefined) {
      merged[key] = {
        ...mergeForwardedApiProperty(currentProperty, incomingProperty),
        required: currentProperty.required === true && incomingProperty.required === true,
      }
    }
  }

  return merged
}

function markForwardedPropertyOptional(prop: GeneratedApiProperty): GeneratedApiProperty {
  return {
    ...prop,
    required: prop.required === undefined ? undefined : false,
  }
}

function mergeStringLists(
  current: string[] | undefined,
  incoming: string[] | undefined,
): string[] | undefined {
  const merged = [...(current ?? []), ...(incoming ?? [])].filter(Boolean)

  if (merged.length === 0) {
    return undefined
  }

  const seen = new Set<string>()

  return merged.filter((value) => {
    const normalized = value.toLowerCase()

    if (seen.has(normalized)) {
      return false
    }

    seen.add(normalized)

    return true
  })
}

function mergeApiTypes(
  current: string | undefined,
  incoming: string | undefined,
  options: { normalize?: boolean } = {},
): string | undefined {
  const types = [...splitApiType(current), ...splitApiType(incoming)].map((type) =>
    options.normalize === true ? normalizeApiType(type) : type,
  )

  return types.length === 0 ? undefined : Array.from(new Set(types)).join(' | ')
}

function splitApiType(type: string | undefined): string[] {
  return type === undefined
    ? []
    : type
        .split(/\s+\|\s+/)
        .map((value) => value.trim())
        .filter(Boolean)
}

function resolveForwardedVueComponent(
  source: string,
  context: SourceFileContext,
): { options: ts.ObjectLiteralExpression; sourceFile: ts.SourceFile } | undefined {
  const imported = resolveImportedName(source, context)

  if (imported === undefined) {
    return undefined
  }

  const component = findDefaultVueComponent(imported.sourceFile)

  if (component === undefined) {
    return undefined
  }

  return {
    options: component.options,
    sourceFile: imported.sourceFile,
  }
}

function extractVueOptionsApiGroup(
  options: ts.ObjectLiteralExpression,
  group: GeneratedApiGroupName,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  if (group === 'props') {
    return extractVueOptionsProps(options, context)
  }

  if (group === 'events') {
    return extractVueOptionsEvents(options, context)
  }

  if (group === 'slots') {
    return extractVueOptionsSlots(options, context)
  }

  return extractVueOptionsMethods(options, context)
}

function mergeApiGroup(
  api: GeneratedApiJson,
  group: GeneratedApiGroupName,
  entries: Record<string, GeneratedApiProperty>,
): void {
  const current = isPlainRecord(api[group])
    ? (api[group] as Record<string, GeneratedApiProperty>)
    : {}

  api[group] = {
    ...entries,
    ...current,
  }
}

function extractVueOptionsProps(
  options: ts.ObjectLiteralExpression,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const propsOption = options.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      getObjectPropertyName(property, context.sourceFile) === 'props' &&
      ts.isObjectLiteralExpression(property.initializer),
  )

  if (propsOption === undefined || !ts.isObjectLiteralExpression(propsOption.initializer)) {
    return {}
  }

  const props: Record<string, GeneratedApiProperty> = {}

  for (const property of propsOption.initializer.properties) {
    if (ts.isSpreadAssignment(property)) {
      Object.assign(props, extractVuePropSpread(property.expression, context))
      continue
    }

    const name = getObjectPropertyName(property, context.sourceFile)

    if (name === undefined) {
      continue
    }

    const prop = createVuePropEntry(property, context.sourceFile)

    if (prop !== undefined) {
      props[toKebabCase(name)] = prop
    }
  }

  return props
}

function extractVuePropSpread(
  expression: ts.Expression,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const object = resolveObjectLiteral(expression, context)

  if (object === undefined) {
    return {}
  }

  const sourceFile = object.getSourceFile()
  const props: Record<string, GeneratedApiProperty> = {}

  for (const property of object.properties) {
    if (ts.isSpreadAssignment(property)) {
      Object.assign(
        props,
        extractVuePropSpread(property.expression, {
          ...context,
          sourceFile,
        }),
      )
      continue
    }

    const name = getObjectPropertyName(property, sourceFile)

    if (name === undefined) {
      continue
    }

    const prop = createVuePropEntry(property, sourceFile)

    if (prop !== undefined) {
      props[toKebabCase(name)] = prop
    }
  }

  return props
}

function extractVueOptionsEvents(
  options: ts.ObjectLiteralExpression,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const sourceFile = context.sourceFile
  const emitsOption = options.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && getObjectPropertyName(property, sourceFile) === 'emits',
  )

  if (emitsOption === undefined) {
    return {}
  }

  return extractVueEmitsFromExpression(emitsOption.initializer, context)
}

function extractVueEmitsFromExpression(
  expression: ts.Expression,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  if (ts.isArrayLiteralExpression(expression)) {
    return extractVueEmitsArray(expression, context)
  }

  if (ts.isObjectLiteralExpression(expression)) {
    const events: Record<string, GeneratedApiProperty> = {}

    for (const property of expression.properties) {
      const name = getObjectPropertyName(property, expression.getSourceFile())

      if (name !== undefined) {
        events[normalizeVueEventName(name)] = {
          desc: readJSDoc(property, expression.getSourceFile()).desc,
          params: {},
        }
      }
    }

    return events
  }

  const resolved = resolveInitializer(expression, context)

  return resolved === undefined ? {} : extractVueEmitsFromExpression(resolved, context)
}

function extractVueEmitsArray(
  array: ts.ArrayLiteralExpression,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const events: Record<string, GeneratedApiProperty> = {}

  for (const element of array.elements) {
    if (ts.isStringLiteral(element) || ts.isNoSubstitutionTemplateLiteral(element)) {
      const elementContext = {
        ...context,
        sourceFile: element.getSourceFile(),
      }
      const docs = readJSDoc(element, elementContext.sourceFile)

      events[normalizeVueEventName(element.text)] = createEventFromDocs(docs, elementContext)
      continue
    }

    if (ts.isSpreadElement(element)) {
      Object.assign(
        events,
        extractVueEmitsSpread(element, {
          ...context,
          sourceFile: element.getSourceFile(),
        }),
      )
    }
  }

  return events
}

function normalizeVueEventName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

function createEventFromDocs(docs: JSDocDetails, context: SourceFileContext): GeneratedApiProperty {
  return applyJSDocMetadata(
    {
      desc: docs.desc,
      params: createParamsFromDocs(docs, context) ?? {},
    },
    docs,
  )
}

function extractVueEmitsSpread(
  spread: ts.SpreadElement,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const expression = spread.expression

  if (
    ts.isCallExpression(expression) &&
    ts.isIdentifier(expression.expression) &&
    expression.expression.text === 'getRawMouseEvents' &&
    expression.arguments.length > 0
  ) {
    const suffix = getStaticString(expression.arguments[0])

    return suffix === undefined
      ? {}
      : createRawMouseEventEntries(suffix, readJSDoc(spread, context.sourceFile), context)
  }

  const resolved = resolveInitializer(expression, context)

  return resolved === undefined ? {} : extractVueEmitsFromExpression(resolved, context)
}

function createRawMouseEventEntries(
  suffix: string,
  docs?: JSDocDetails,
  context?: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const shouldApplyDocs = docs?.apiFollow === 'getRawMouseEvents'
  const eventParams =
    shouldApplyDocs === true && docs !== undefined && context !== undefined
      ? createFollowedMouseEventParams(docs, context)
      : undefined

  return [
    'click',
    'contextmenu',
    'mousedown',
    'mousemove',
    'mouseup',
    'mouseenter',
    'mouseleave',
    'touchstart',
    'touchmove',
    'touchend',
  ].reduce<Record<string, GeneratedApiProperty>>((events, name) => {
    events[`${name}${suffix}`] = {
      desc: shouldApplyDocs === true ? (docs?.desc ?? '') : '',
      params: eventParams ?? {},
    }

    return events
  }, {})
}

function createFollowedMouseEventParams(
  docs: JSDocDetails,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> | undefined {
  const params: Record<string, GeneratedApiProperty> = {}

  if (docs.apiScope !== undefined) {
    params.scope = {
      desc: docs.params.get('scope') ?? '',
      definition: resolveTypeProperties(docs.apiScope, context),
      required: true,
      tsType: docs.apiScope,
      type: 'Object',
    }
  }

  params.event = {
    desc: docs.params.get('event') ?? 'Native mouse or touch event.',
    required: true,
    tsType: 'MouseEvent | TouchEvent',
    type: 'MouseEvent | TouchEvent',
  }

  return Object.keys(params).length === 0 ? undefined : params
}

function createParamsFromDocs(
  docs: JSDocDetails,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> | undefined {
  const names = new Set([...docs.params.keys(), ...docs.paramMetadata.keys()])

  if (names.size === 0) {
    return undefined
  }

  const params: Record<string, GeneratedApiProperty> = {}

  for (const name of names) {
    const metadata = docs.paramMetadata.get(name)
    const tsType = metadata?.tsType ?? metadata?.type ?? 'unknown'
    const definition =
      metadata?.tsType === undefined ? undefined : resolveTypeProperties(metadata.tsType, context)

    params[name] = applyPropertyMetadata(
      {
        desc: docs.params.get(name) ?? '',
        ...(definition === undefined ? {} : { definition }),
        required: metadata?.required ?? true,
        tsType,
        type: metadata?.type ?? normalizeApiType(tsType),
      },
      metadata,
    )
  }

  return params
}

function extractVueOptionsSlots(
  options: ts.ObjectLiteralExpression,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const sourceFile = context.sourceFile
  const usedSlots = extractVueOptionsSlotUsages(options, context)
  const slotsOption = options.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) && getObjectPropertyName(property, sourceFile) === 'slots',
  )

  if (slotsOption === undefined) {
    return usedSlots
  }

  const slotsType = getSlotsTypeReference(slotsOption.initializer)

  if (slotsType === undefined || slotsType.typeArguments?.[0] === undefined) {
    return usedSlots
  }

  return {
    ...usedSlots,
    ...extractSlotsFromType(slotsType.typeArguments[0], context),
  }
}

function getSlotsTypeReference(node: ts.Expression): ts.TypeReferenceNode | undefined {
  if (!ts.isAsExpression(node)) {
    return undefined
  }

  if (
    ts.isTypeReferenceNode(node.type) &&
    ts.isIdentifier(node.type.typeName) &&
    node.type.typeName.text === 'SlotsType'
  ) {
    return node.type
  }

  return undefined
}

function extractVueOptionsSlotUsages(
  options: ts.ObjectLiteralExpression,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const setup = findVueOptionsSetup(options, context.sourceFile)
  const body = getVueOptionsSetupBody(setup)

  if (setup === undefined || body === undefined) {
    return {}
  }

  const slotBindings = getSetupSlotBindingNames(setup, context.sourceFile)

  if (slotBindings.size === 0) {
    return {}
  }

  const slots: Record<string, GeneratedApiProperty> = {}

  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      slotBindings.has(node.expression.text)
    ) {
      slots[node.name.text] ??= {
        desc: '',
      }
    } else if (
      ts.isElementAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      slotBindings.has(node.expression.text) &&
      ts.isStringLiteral(node.argumentExpression)
    ) {
      slots[node.argumentExpression.text] ??= {
        desc: '',
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(body)

  return slots
}

function getSetupSlotBindingNames(
  setup: ts.MethodDeclaration | ts.PropertyAssignment,
  sourceFile: ts.SourceFile,
): Set<string> {
  const bindings = new Set<string>()
  const parameters = ts.isMethodDeclaration(setup)
    ? setup.parameters
    : isFunctionLikeInitializer(setup.initializer)
      ? setup.initializer.parameters
      : undefined
  const contextParameter = parameters?.[1]

  if (contextParameter === undefined) {
    return bindings
  }

  if (ts.isObjectBindingPattern(contextParameter.name)) {
    for (const element of contextParameter.name.elements) {
      const propertyName =
        element.propertyName?.getText(sourceFile) ?? element.name.getText(sourceFile)

      if (propertyName === 'slots' && ts.isIdentifier(element.name)) {
        bindings.add(element.name.text)
      }
    }
  } else if (ts.isIdentifier(contextParameter.name)) {
    bindings.add(`${contextParameter.name.text}.slots`)
  }

  return bindings
}

function extractSlotsFromType(
  type: ts.TypeNode,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const declaration = resolveTypeDeclaration(type, context)

  if (declaration === undefined || !ts.isInterfaceDeclaration(declaration)) {
    return {}
  }

  const sourceFile = declaration.getSourceFile()
  const slots: Record<string, GeneratedApiProperty> = {}

  for (const member of declaration.members) {
    if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) {
      continue
    }

    const memberSourceFile = member.getSourceFile()
    const name = getMemberName(member, memberSourceFile)

    if (name === undefined) {
      continue
    }

    const docs = readJSDoc(member, memberSourceFile)
    const scope = ts.isPropertySignature(member)
      ? (getSlotPropScope(member.type, {
          ...context,
          sourceFile,
        }) ?? createSlotScope(member, docs, memberSourceFile))
      : createSlotScope(member, docs, memberSourceFile)

    slots[name] = applyJSDocMetadata(
      {
        desc: docs.desc,
        ...(scope === undefined ? {} : { scope }),
      },
      docs,
    )
  }

  return slots
}

function getSlotPropScope(
  type: ts.TypeNode | undefined,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> | undefined {
  if (
    type === undefined ||
    !ts.isTypeReferenceNode(type) ||
    !ts.isIdentifier(type.typeName) ||
    type.typeName.text !== 'SlotProps' ||
    type.typeArguments?.[0] === undefined
  ) {
    return undefined
  }

  const scopeType = type.typeArguments[0]
  const declaration = resolveTypeDeclaration(scopeType, context)

  if (declaration === undefined) {
    return {
      scope: {
        desc: '',
        tsType: scopeType.getText(context.sourceFile),
        type: normalizeApiType(scopeType.getText(context.sourceFile)),
      },
    }
  }

  return getTypeDeclarationProperties(declaration, context)
}

function extractVueOptionsMethods(
  options: ts.ObjectLiteralExpression,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const body = getVueOptionsSetupBody(findVueOptionsSetup(options, context.sourceFile))

  if (body === undefined) {
    return {}
  }

  return extractExposedMethods(body, context)
}

function findVueOptionsSetup(
  options: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): ts.MethodDeclaration | ts.PropertyAssignment | undefined {
  return options.properties.find(
    (property): property is ts.MethodDeclaration | ts.PropertyAssignment =>
      (ts.isMethodDeclaration(property) || ts.isPropertyAssignment(property)) &&
      getObjectPropertyName(property, sourceFile) === 'setup',
  )
}

function getVueOptionsSetupBody(
  setup: ts.MethodDeclaration | ts.PropertyAssignment | undefined,
): ts.Block | undefined {
  if (setup === undefined) {
    return undefined
  }

  return ts.isMethodDeclaration(setup)
    ? setup.body
    : isFunctionLikeInitializer(setup.initializer)
      ? getFunctionBody(setup.initializer)
      : undefined
}

function extractExposedMethods(
  body: ts.Block,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> {
  const methods: Record<string, GeneratedApiProperty> = {}
  const sourceFile = context.sourceFile
  const localFunctions = collectLocalFunctions(body)

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'expose' &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      for (const property of node.arguments[0].properties) {
        const name = getObjectPropertyName(property, sourceFile)

        if (name === undefined) {
          continue
        }

        const local = localFunctions.get(name) ?? getExposedInlineFunction(property)

        if (local !== undefined) {
          methods[name] = createFunctionEntry(local, sourceFile, {
            context,
            fallbackJSDocNode: property,
            name,
          })
          continue
        }

        const docs = readJSDoc(property, sourceFile)

        if (docs.desc !== '') {
          methods[name] = {
            desc: docs.desc,
            type: 'Function',
          }
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(body)

  return methods
}

function getExposedInlineFunction(
  property: ts.ObjectLiteralElementLike,
): FunctionLikeNode | undefined {
  if (ts.isPropertyAssignment(property) && isFunctionLikeInitializer(property.initializer)) {
    return property.initializer
  }

  return ts.isMethodDeclaration(property) ? property : undefined
}

function collectLocalFunctions(body: ts.Block): Map<string, FunctionLikeNode> {
  const functions = new Map<string, FunctionLikeNode>()

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name !== undefined) {
      functions.set(node.name.text, node)
    } else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      if (node.initializer !== undefined && isFunctionLikeInitializer(node.initializer)) {
        functions.set(node.name.text, node.initializer)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(body)

  return functions
}

function resolveObjectLiteral(
  expression: ts.Expression,
  context: SourceFileContext,
): ts.ObjectLiteralExpression | undefined {
  const resolved = resolveInitializer(expression, context)

  return resolved !== undefined && ts.isObjectLiteralExpression(resolved) ? resolved : undefined
}

function resolveInitializer(
  expression: ts.Expression,
  context: SourceFileContext,
): ts.Expression | undefined {
  if (ts.isIdentifier(expression)) {
    return resolveIdentifierInitializer(expression.text, context)
  }

  if (ts.isAsExpression(expression)) {
    return resolveInitializer(expression.expression, context) ?? expression.expression
  }

  return expression
}

function resolveIdentifierInitializer(
  name: string,
  context: SourceFileContext,
): ts.Expression | undefined {
  const local = findVariableInitializer(name, context.sourceFile)

  if (local !== undefined) {
    return resolveInitializer(local, context) ?? local
  }

  const imported = resolveImportedName(name, context)

  if (imported === undefined) {
    return undefined
  }

  const importedContext = {
    ...context,
    sourceFile: imported.sourceFile,
  }
  const importedInitializer = findVariableInitializer(imported.importedName, imported.sourceFile)

  return importedInitializer === undefined
    ? undefined
    : (resolveInitializer(importedInitializer, importedContext) ?? importedInitializer)
}

function resolveTypeDeclaration(
  type: ts.TypeNode,
  context: SourceFileContext,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined {
  if (!ts.isTypeReferenceNode(type) || !ts.isIdentifier(type.typeName)) {
    return undefined
  }

  return resolveTypeDeclarationByName(type.typeName.text, context)
}

function resolveTypeDeclarationByName(
  name: string,
  context: SourceFileContext,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined {
  const local = findTypeDeclarationInSource(name, context.sourceFile, context)

  if (local !== undefined) {
    return local
  }

  const imported = resolveImportedName(name, context)

  if (imported === undefined) {
    return undefined
  }

  return findTypeDeclarationInSource(imported.importedName, imported.sourceFile, {
    ...context,
    sourceFile: imported.sourceFile,
  })
}

function resolveTypeProperties(
  name: string,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> | undefined {
  const declaration = resolveTypeDeclarationByName(name, context)

  return declaration === undefined ? undefined : getTypeDeclarationProperties(declaration, context)
}

function getTypeDeclarationProperties(
  declaration: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> | undefined {
  const declarationContext = {
    ...context,
    sourceFile: declaration.getSourceFile(),
  }
  const properties: Record<string, GeneratedApiProperty> = {}

  if (ts.isInterfaceDeclaration(declaration)) {
    for (const heritage of declaration.heritageClauses ?? []) {
      if (heritage.token !== ts.SyntaxKind.ExtendsKeyword) {
        continue
      }

      for (const type of heritage.types) {
        if (!ts.isIdentifier(type.expression)) {
          continue
        }

        const inherited = resolveTypeDeclarationByName(type.expression.text, declarationContext)
        const inheritedProperties =
          inherited === undefined
            ? undefined
            : getTypeDeclarationProperties(inherited, declarationContext)

        if (inheritedProperties !== undefined) {
          Object.assign(properties, inheritedProperties)
        }
      }
    }
  }

  const members = ts.isInterfaceDeclaration(declaration)
    ? declaration.members
    : ts.isTypeLiteralNode(declaration.type)
      ? declaration.type.members
      : undefined

  if (members === undefined) {
    return Object.keys(properties).length === 0 ? undefined : properties
  }

  for (const member of members) {
    if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) {
      continue
    }

    const memberSourceFile = member.getSourceFile()
    const name = getMemberName(member, memberSourceFile)

    if (name === undefined) {
      continue
    }

    const docs = readJSDoc(member, memberSourceFile)

    properties[name] = applyJSDocMetadata(
      {
        desc: docs.desc,
        required: member.questionToken === undefined,
        tsType: getMemberType(member, memberSourceFile),
        type: normalizeApiType(getMemberType(member, memberSourceFile)),
      },
      docs,
    )
  }

  return Object.keys(properties).length === 0 ? undefined : properties
}

function findVariableInitializer(
  name: string,
  sourceFile: ts.SourceFile,
): ts.Expression | undefined {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue
    }

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer !== undefined
      ) {
        return declaration.initializer
      }
    }
  }

  return undefined
}

function findTypeDeclarationInSource(
  name: string,
  sourceFile: ts.SourceFile,
  context: SourceFileContext,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined {
  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) && statement.name.text === name) {
      return statement
    }

    if (ts.isTypeAliasDeclaration(statement) && statement.name.text === name) {
      return statement
    }

    if (ts.isExportDeclaration(statement)) {
      const moduleSpecifier = statement.moduleSpecifier
      const exportClause = statement.exportClause

      if (
        moduleSpecifier === undefined ||
        !ts.isStringLiteral(moduleSpecifier) ||
        exportClause === undefined ||
        !ts.isNamedExports(exportClause)
      ) {
        continue
      }

      const exported = exportClause.elements.find((element) => element.name.text === name)

      if (exported === undefined) {
        continue
      }

      const sourcePath = resolveImportPath(moduleSpecifier.text, sourceFile.fileName)

      if (sourcePath === undefined) {
        continue
      }

      const reexportedSourceFile = readSourceFile(sourcePath, context)
      const exportedName = exported.propertyName?.text ?? exported.name.text
      const declaration = findTypeDeclarationInSource(exportedName, reexportedSourceFile, {
        ...context,
        sourceFile: reexportedSourceFile,
      })

      if (declaration !== undefined) {
        return declaration
      }
    }
  }

  return undefined
}

function resolveImportedName(
  name: string,
  context: SourceFileContext,
): { importedName: string; sourceFile: ts.SourceFile } | undefined {
  for (const statement of context.sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue
    }

    const importClause = statement.importClause

    if (importClause === undefined) {
      continue
    }

    const sourcePath = resolveImportPath(
      statement.moduleSpecifier.text,
      context.sourceFile.fileName,
    )

    if (sourcePath === undefined) {
      continue
    }

    if (importClause.name?.text === name) {
      return {
        importedName: 'default',
        sourceFile: readSourceFile(sourcePath, context),
      }
    }

    const namedBindings = importClause.namedBindings

    if (namedBindings === undefined || !ts.isNamedImports(namedBindings)) {
      continue
    }

    for (const element of namedBindings.elements) {
      if (element.name.text !== name) {
        continue
      }

      return {
        importedName: element.propertyName?.text ?? element.name.text,
        sourceFile: readSourceFile(sourcePath, context),
      }
    }
  }

  return undefined
}

function resolveImportPath(moduleSpecifier: string, fromFile: string): string | undefined {
  if (!moduleSpecifier.startsWith('.')) {
    return resolveWorkspacePackageImportPath(moduleSpecifier, fromFile)
  }

  const base = resolve(dirname(fromFile), moduleSpecifier)
  const sourceBase = base.replace(/\.(?:cjs|js|jsx|mjs)$/, '')
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.vue`,
    `${sourceBase}.ts`,
    `${sourceBase}.tsx`,
    `${sourceBase}.vue`,
    resolve(base, 'index.ts'),
    resolve(base, 'index.tsx'),
    resolve(sourceBase, 'index.ts'),
    resolve(sourceBase, 'index.tsx'),
  ]

  return candidates.find((candidate) => existsSync(candidate))
}

function resolveWorkspacePackageImportPath(
  moduleSpecifier: string,
  fromFile: string,
): string | undefined {
  let directory = dirname(fromFile)

  while (true) {
    const packagePath = findWorkspacePackagePath(directory, moduleSpecifier)

    if (packagePath !== undefined) {
      return packagePath
    }

    const parent = dirname(directory)

    if (parent === directory) {
      return undefined
    }

    directory = parent
  }
}

function findWorkspacePackagePath(root: string, packageName: string): string | undefined {
  const packagesRoot = resolve(root, 'packages')

  if (!existsSync(packagesRoot)) {
    return undefined
  }

  let entries: Array<{ isDirectory(): boolean; name: string }>

  try {
    entries = readdirSync(packagesRoot, { withFileTypes: true }) as Array<{
      isDirectory(): boolean
      name: string
    }>
  } catch {
    return undefined
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const packageDirectory = resolve(packagesRoot, entry.name)
    const packageJsonPath = resolve(packageDirectory, 'package.json')

    if (!existsSync(packageJsonPath)) {
      continue
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { name?: string }

      if (packageJson.name !== packageName) {
        continue
      }

      return [
        resolve(packageDirectory, 'src/index.ts'),
        resolve(packageDirectory, 'src/index.tsx'),
        resolve(packageDirectory, 'index.ts'),
        resolve(packageDirectory, 'index.tsx'),
      ].find((candidate) => existsSync(candidate))
    } catch {
      continue
    }
  }

  return undefined
}

function readSourceFile(path: string, context: SourceFileContext): ts.SourceFile {
  const cached = context.cache.get(path)

  if (cached !== undefined) {
    return cached
  }

  const source = readFileSync(path, 'utf8')
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true)

  context.cache.set(path, sourceFile)

  return sourceFile
}

function createSourceFileContext(
  sourceFile: ts.SourceFile,
  inputPath = sourceFile.fileName,
): SourceFileContext {
  return {
    cache: new Map([[inputPath, sourceFile]]),
    inputPath,
    sourceFile,
  }
}

function getStaticString(node: ts.Expression): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }

  return undefined
}

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/_/g, '-')
    .toLowerCase()
}

function extractExportedFunctions(
  sourceFile: ts.SourceFile,
  context = createSourceFileContext(sourceFile),
): Record<string, GeneratedApiProperty> {
  const entries: Record<string, GeneratedApiProperty> = {}

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && isExported(statement) && statement.name) {
      entries[statement.name.text] = createFunctionEntry(statement, sourceFile, {
        context,
      })
      continue
    }

    if (ts.isVariableStatement(statement) && isExported(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || declaration.initializer === undefined) {
          continue
        }

        if (isFunctionLikeInitializer(declaration.initializer)) {
          entries[declaration.name.text] = createFunctionEntry(
            declaration.initializer,
            sourceFile,
            {
              context,
              fallbackJSDocNode: statement,
              name: declaration.name.text,
            },
          )
          continue
        }

        const constantEntry = createConstantEntry(declaration, statement, sourceFile, context)

        if (constantEntry !== undefined) {
          entries[declaration.name.text] = constantEntry
        }
      }
    }
  }

  return entries
}

function createConstantEntry(
  declaration: ts.VariableDeclaration,
  statement: ts.VariableStatement,
  sourceFile: ts.SourceFile,
  context: SourceFileContext,
): GeneratedApiProperty | undefined {
  const docs = readJSDoc(declaration, sourceFile, statement)

  if (docs.desc === '' && docs.api === false) {
    return undefined
  }

  const type = getVariableType(declaration, sourceFile)
  const entry: GeneratedApiProperty = {
    desc: docs.desc,
    tsSignature: getVariableSignature(declaration, sourceFile),
    tsType: type,
    type: 'Constant',
  }

  if (docs.examples.length > 0) {
    entry.examples = docs.examples
  }

  if (docs.category !== undefined) {
    entry.category = docs.category
  }

  if (docs.since !== undefined) {
    entry.addedIn = docs.since
  }

  if (docs.deprecated !== undefined) {
    entry.deprecated = docs.deprecated
  }

  const definition = getConstantDefinition(declaration, sourceFile, context)

  if (definition !== undefined) {
    entry.definition = definition
  }

  applyPropertyMetadata(entry, docs.metadata)

  if (entry.tsType === undefined) {
    entry.tsType = type
  }

  return entry
}

function getConstantDefinition(
  declaration: ts.VariableDeclaration,
  sourceFile: ts.SourceFile,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> | undefined {
  const object = getObjectLiteralInitializer(declaration.initializer, sourceFile)

  if (object === undefined) {
    return undefined
  }

  const typedDefinition = getReturnProperties(declaration.type, context)
  const definition: Record<string, GeneratedApiProperty> =
    typedDefinition === undefined
      ? {}
      : Object.fromEntries(
          Object.entries(typedDefinition).map(([name, property]) => [name, { ...property }]),
        )

  for (const property of object.properties) {
    const name = getObjectPropertyName(property, sourceFile)

    if (name === undefined) {
      continue
    }

    const entry = createObjectDefinitionEntry(name, property, sourceFile, context)

    if (entry !== undefined) {
      definition[name] =
        definition[name] === undefined
          ? entry
          : mergeConstantDefinitionEntry(name, definition[name], entry)
    }
  }

  return Object.keys(definition).length === 0 ? undefined : definition
}

function mergeConstantDefinitionEntry(
  name: string,
  typedEntry: GeneratedApiProperty,
  objectEntry: GeneratedApiProperty,
): GeneratedApiProperty {
  const merged: GeneratedApiProperty = {
    ...objectEntry,
    ...typedEntry,
    default: objectEntry.default ?? typedEntry.default,
    desc: objectEntry.desc === '' ? typedEntry.desc : objectEntry.desc,
    required: objectEntry.required ?? typedEntry.required,
  }

  if (typedEntry.tsType !== undefined && objectEntry.type !== 'Function') {
    merged.type = normalizeApiType(typedEntry.tsType)
  }

  if (objectEntry.type === 'Function' && typedEntry.tsType !== undefined) {
    const signature = /^\((.*)\)\s*=>\s*(.+)$/.exec(typedEntry.tsType)

    merged.type = 'Function'

    if (signature !== null) {
      const params = signature[1]?.trim() ?? ''
      const returnType = signature[2]?.trim() ?? 'unknown'

      merged.tsSignature = `function ${name}(${params}): ${returnType}`
      merged.returns = {
        ...(objectEntry.returns ?? { desc: '' }),
        tsType: returnType,
        type: normalizeApiType(returnType),
      }
    }
  }

  return merged
}

function createObjectDefinitionEntry(
  name: string,
  property: ts.ObjectLiteralElementLike,
  sourceFile: ts.SourceFile,
  context: SourceFileContext,
): GeneratedApiProperty | undefined {
  const docs = readJSDoc(property, sourceFile)

  if (ts.isMethodDeclaration(property)) {
    return {
      ...createFunctionEntry(property, sourceFile, { context, name }),
      required: true,
    }
  }

  if (ts.isPropertyAssignment(property)) {
    if (isFunctionLikeInitializer(property.initializer)) {
      return {
        ...createFunctionEntry(property.initializer, sourceFile, { context, name }),
        required: true,
      }
    }

    return applyJSDocMetadata(
      {
        ...getExpressionType(property.initializer, sourceFile),
        default: getExpressionDefault(property.initializer, sourceFile),
        desc: docs.desc,
        required: true,
      },
      docs,
    )
  }

  if (ts.isShorthandPropertyAssignment(property)) {
    return applyJSDocMetadata(
      {
        desc: docs.desc,
        required: true,
        tsType: 'unknown',
        type: 'unknown',
      },
      docs,
    )
  }

  return undefined
}

function getObjectLiteralInitializer(
  initializer: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | undefined {
  if (initializer === undefined) {
    return undefined
  }

  if (ts.isObjectLiteralExpression(initializer)) {
    return initializer
  }

  if (isObjectFreezeCall(initializer, sourceFile)) {
    const [value] = initializer.arguments

    return value !== undefined && ts.isObjectLiteralExpression(value) ? value : undefined
  }

  return undefined
}

function getExpressionType(
  expression: ts.Expression,
  sourceFile: ts.SourceFile,
): Pick<GeneratedApiProperty, 'tsType' | 'type'> {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return {
      tsType: 'string',
      type: 'String',
    }
  }

  if (ts.isNumericLiteral(expression)) {
    return {
      tsType: 'number',
      type: 'Number',
    }
  }

  if (
    expression.kind === ts.SyntaxKind.TrueKeyword ||
    expression.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return {
      tsType: 'boolean',
      type: 'Boolean',
    }
  }

  if (ts.isArrayLiteralExpression(expression)) {
    return {
      tsType: 'Array',
      type: 'Array',
    }
  }

  if (isObjectFreezeCall(expression, sourceFile)) {
    const [value] = expression.arguments

    if (value !== undefined && ts.isArrayLiteralExpression(value)) {
      return {
        tsType: 'ReadonlyArray',
        type: 'Array',
      }
    }

    if (value !== undefined && ts.isObjectLiteralExpression(value)) {
      return {
        tsType: 'ReadonlyObject',
        type: 'Object',
      }
    }
  }

  if (ts.isObjectLiteralExpression(expression)) {
    return {
      tsType: 'Object',
      type: 'Object',
    }
  }

  return {
    tsType: expression.getText(sourceFile),
    type: normalizeApiType(expression.getText(sourceFile)),
  }
}

function getExpressionDefault(
  expression: ts.Expression,
  sourceFile: ts.SourceFile,
): string | undefined {
  if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
    return expression.text
  }

  if (
    ts.isNumericLiteral(expression) ||
    expression.kind === ts.SyntaxKind.TrueKeyword ||
    expression.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return expression.getText(sourceFile)
  }

  if (ts.isArrayLiteralExpression(expression)) {
    return expression.getText(sourceFile)
  }

  if (isObjectFreezeCall(expression, sourceFile)) {
    const [value] = expression.arguments

    if (value !== undefined && ts.isArrayLiteralExpression(value)) {
      return value.getText(sourceFile)
    }
  }

  return undefined
}

function isObjectFreezeCall(
  expression: ts.Expression,
  sourceFile: ts.SourceFile,
): expression is ts.CallExpression {
  return (
    ts.isCallExpression(expression) &&
    ts.isPropertyAccessExpression(expression.expression) &&
    expression.expression.expression.getText(sourceFile) === 'Object' &&
    expression.expression.name.text === 'freeze'
  )
}

function extractScriptSetup(source: string): string | undefined {
  const match = /<script\s+setup(?:\s[^>]*)?>([\s\S]*?)<\/script>/i.exec(source)

  return match?.[1]
}

function extractVueProps(
  sourceFile: ts.SourceFile,
  context = createSourceFileContext(sourceFile),
): Record<string, GeneratedApiProperty> {
  const propsCall = findMacroCall(sourceFile, 'defineProps')
  const propsArg = propsCall?.arguments[0]
  const propsDefaults = getVuePropsDefaults(sourceFile)

  if (propsArg === undefined) {
    return extractTypedVueProps(propsCall, sourceFile, context, propsDefaults)
  }

  if (!ts.isObjectLiteralExpression(propsArg)) {
    return {}
  }

  const props: Record<string, GeneratedApiProperty> = {}

  for (const property of propsArg.properties) {
    const name = getObjectPropertyName(property, sourceFile)

    if (name === undefined) {
      continue
    }

    const prop = createVuePropEntry(property, sourceFile)

    if (prop !== undefined) {
      props[name] = prop
    }
  }

  return props
}

function extractTypedVueProps(
  propsCall: ts.CallExpression | undefined,
  sourceFile: ts.SourceFile,
  context: SourceFileContext,
  defaults: ts.ObjectLiteralExpression | undefined,
): Record<string, GeneratedApiProperty> {
  const propsType = propsCall?.typeArguments?.[0]
  const members = getTypedVuePropMembers(propsType, context)

  if (members === undefined) {
    return {}
  }

  const props: Record<string, GeneratedApiProperty> = {}

  for (const member of members) {
    if (!ts.isPropertySignature(member)) {
      continue
    }

    const memberSourceFile = member.getSourceFile()
    const name = getMemberName(member, memberSourceFile)

    if (name === undefined) {
      continue
    }

    const docs = readJSDoc(member, memberSourceFile)
    const type = getVueTypedPropType(member, memberSourceFile)

    const prop = applyJSDocMetadata(
      {
        desc: docs.desc,
        required: member.questionToken === undefined,
        tsType: member.type?.getText(memberSourceFile) ?? 'unknown',
        type,
      },
      docs,
    )
    const defaultValue = getVueTypedPropDefault(defaults, name, sourceFile)

    if (defaultValue !== undefined) {
      prop.default = defaultValue
    }

    props[name] = prop
  }

  return props
}

function getTypedVuePropMembers(
  propsType: ts.TypeNode | undefined,
  context: SourceFileContext,
): ts.NodeArray<ts.TypeElement> | undefined {
  if (propsType === undefined) {
    return undefined
  }

  if (ts.isTypeLiteralNode(propsType)) {
    return propsType.members
  }

  const declaration = resolveTypeDeclaration(propsType, context)

  if (declaration === undefined) {
    return undefined
  }

  if (ts.isInterfaceDeclaration(declaration)) {
    return declaration.members
  }

  return ts.isTypeLiteralNode(declaration.type) ? declaration.type.members : undefined
}

function getVuePropsDefaults(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
  const withDefaultsCall = findMacroCall(sourceFile, 'withDefaults')

  if (
    withDefaultsCall === undefined ||
    !ts.isCallExpression(withDefaultsCall.arguments[0]) ||
    !ts.isIdentifier(withDefaultsCall.arguments[0].expression) ||
    withDefaultsCall.arguments[0].expression.text !== 'defineProps' ||
    !ts.isObjectLiteralExpression(withDefaultsCall.arguments[1])
  ) {
    return undefined
  }

  return withDefaultsCall.arguments[1]
}

function getVueTypedPropDefault(
  defaults: ts.ObjectLiteralExpression | undefined,
  name: string,
  sourceFile: ts.SourceFile,
): string | undefined {
  if (defaults === undefined) {
    return undefined
  }

  for (const property of defaults.properties) {
    if (
      !ts.isPropertyAssignment(property) ||
      getObjectPropertyName(property, sourceFile) !== name
    ) {
      continue
    }

    return getVuePropDefault(property.initializer, sourceFile)
  }

  return undefined
}

function getVueTypedPropType(member: ts.PropertySignature, sourceFile: ts.SourceFile): string {
  const type = member.type?.getText(sourceFile) ?? 'unknown'
  const withoutUndefined = type
    .split('|')
    .map((part) => part.trim())
    .filter((part) => part !== 'undefined')
    .join(' | ')

  return normalizeApiType(withoutUndefined || type)
}

function createVuePropEntry(
  property: ts.ObjectLiteralElementLike,
  sourceFile: ts.SourceFile,
): GeneratedApiProperty | undefined {
  if (ts.isPropertyAssignment(property)) {
    const docs = readJSDoc(property, sourceFile)

    if (ts.isIdentifier(property.initializer)) {
      return applyJSDocMetadata(
        {
          desc: docs.desc,
          type: property.initializer.text,
        },
        docs,
      )
    }

    if (!ts.isObjectLiteralExpression(property.initializer)) {
      return applyJSDocMetadata(
        {
          desc: docs.desc,
          type: getVuePropType(property.initializer, sourceFile),
        },
        docs,
      )
    }

    return createVueObjectPropEntry(property.initializer, sourceFile, docs)
  }

  if (ts.isShorthandPropertyAssignment(property)) {
    const docs = readJSDoc(property, sourceFile)

    return applyJSDocMetadata(
      {
        desc: docs.desc,
        type: property.name.text,
      },
      docs,
    )
  }

  return undefined
}

function createVueObjectPropEntry(
  object: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
  docs: JSDocDetails,
): GeneratedApiProperty {
  const prop: GeneratedApiProperty = {
    desc: docs.desc,
    type: 'Any',
  }

  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue
    }

    const name = getObjectPropertyName(property, sourceFile)

    if (name === 'type') {
      const type = getVuePropTypeDetails(property.initializer, sourceFile)

      prop.type = type.type

      if (type.tsType !== undefined) {
        prop.tsType = type.tsType
      }
    } else if (name === 'required') {
      prop.required = property.initializer.kind === ts.SyntaxKind.TrueKeyword
    } else if (name === 'default') {
      const defaultValue = getVuePropDefault(property.initializer, sourceFile)

      if (defaultValue !== undefined) {
        prop.default = defaultValue
      }
    } else if (name === 'validator') {
      const values = getValidatorValues(property.initializer, sourceFile)

      if (values !== undefined) {
        prop.values = values
      }
    }
  }

  return applyJSDocMetadata(prop, docs)
}

function applyJSDocMetadata(prop: GeneratedApiProperty, docs: JSDocDetails): GeneratedApiProperty {
  applyPropertyMetadata(prop, docs.metadata)

  if (docs.category !== undefined) {
    prop.category = docs.category
  }

  if (docs.examples.length > 0) {
    prop.examples = [...(prop.examples ?? []), ...docs.examples]
  }

  if (docs.since !== undefined) {
    prop.addedIn = docs.since
  }

  return prop
}

function applyPropertyMetadata(
  prop: GeneratedApiProperty,
  metadata: GeneratedApiPropertyMetadata | undefined,
): GeneratedApiProperty {
  if (metadata === undefined) {
    return prop
  }

  if (metadata.__exemption !== undefined) {
    prop.__exemption = metadata.__exemption
  }

  if (metadata.applicable !== undefined) {
    prop.applicable = metadata.applicable
  }

  if (metadata.default !== undefined) {
    prop.default = metadata.default
  }

  if (metadata.examples !== undefined) {
    prop.examples = [...(prop.examples ?? []), ...metadata.examples]
  }

  if (metadata.required !== undefined) {
    prop.required = metadata.required
  }

  if (metadata.tsType !== undefined) {
    prop.tsType = metadata.tsType
  }

  if (metadata.type !== undefined) {
    prop.type = metadata.type
  }

  if (metadata.values !== undefined) {
    prop.values = metadata.values
  }

  return prop
}

function extractVueEvents(sourceFile: ts.SourceFile): Record<string, GeneratedApiProperty> {
  const emitsCall = findMacroCall(sourceFile, 'defineEmits')
  const emitsArg = emitsCall?.arguments[0]
  const events = extractVueDocumentedEvents(sourceFile)

  if (emitsArg === undefined) {
    return events
  }

  if (ts.isArrayLiteralExpression(emitsArg)) {
    for (const element of emitsArg.elements) {
      if (ts.isStringLiteral(element)) {
        events[normalizeVueEventName(element.text)] = {
          desc: '',
          params: {},
        }
      }
    }
  } else if (ts.isObjectLiteralExpression(emitsArg)) {
    for (const property of emitsArg.properties) {
      const name = getObjectPropertyName(property, sourceFile)

      if (name === undefined || !ts.isPropertyAssignment(property)) {
        continue
      }

      const docs = readJSDoc(property, sourceFile)
      const params = isFunctionLikeInitializer(property.initializer)
        ? createParams(property.initializer, docs, sourceFile)
        : undefined

      events[normalizeVueEventName(name)] = {
        desc: docs.desc,
        params: params ?? {},
      }
    }
  }

  applyVueEventPayloads(events, sourceFile)

  return events
}

function extractVueDocumentedEvents(
  sourceFile: ts.SourceFile,
): Record<string, GeneratedApiProperty> {
  const events: Record<string, GeneratedApiProperty> = {}

  for (const statement of sourceFile.statements) {
    if (!ts.isFunctionDeclaration(statement) || statement.name === undefined) {
      continue
    }

    const docs = readJSDoc(statement, sourceFile)

    if (docs.event === undefined) {
      continue
    }

    events[normalizeVueEventName(docs.event)] = {
      desc: docs.desc,
      params: createParams(statement, docs, sourceFile) ?? {},
    }
  }

  return events
}

function extractVueMethods(
  sourceFile: ts.SourceFile,
  context = createSourceFileContext(sourceFile),
): Record<string, GeneratedApiProperty> {
  const methods: Record<string, GeneratedApiProperty> = {}

  for (const statement of sourceFile.statements) {
    if (!ts.isFunctionDeclaration(statement) || statement.name === undefined) {
      continue
    }

    const docs = readJSDoc(statement, sourceFile)

    if (docs.api !== true) {
      continue
    }

    methods[statement.name.text] = createFunctionEntry(statement, sourceFile, {
      context,
    })
  }

  return methods
}

function applyVueEventPayloads(
  events: Record<string, GeneratedApiProperty>,
  sourceFile: ts.SourceFile,
): void {
  const emitNames = getVueEmitBindingNames(sourceFile)

  if (emitNames.size === 0) {
    return
  }

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      emitNames.has(node.expression.text) &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      const eventName = node.arguments[0].text
      const event = events[eventName] ?? events[normalizeVueEventName(eventName)]

      if (event !== undefined) {
        event.params = mergeGeneratedParams(
          event.params,
          createVueEventPayloadParams(eventName, node.arguments.slice(1), sourceFile),
        )
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
}

function mergeGeneratedParams(
  current: Record<string, GeneratedApiProperty> | undefined,
  generated: Record<string, GeneratedApiProperty>,
): Record<string, GeneratedApiProperty> {
  const params = { ...current }

  for (const [name, generatedParam] of Object.entries(generated)) {
    params[name] =
      params[name] === undefined
        ? generatedParam
        : {
            ...generatedParam,
            ...params[name],
          }
  }

  return params
}

function getVueEmitBindingNames(sourceFile: ts.SourceFile): Set<string> {
  const names = new Set<string>()

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue
    }

    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.initializer !== undefined &&
        ts.isCallExpression(declaration.initializer) &&
        ts.isIdentifier(declaration.initializer.expression) &&
        declaration.initializer.expression.text === 'defineEmits'
      ) {
        names.add(declaration.name.text)
      }
    }
  }

  return names
}

function createVueEventPayloadParams(
  eventName: string,
  args: ts.NodeArray<ts.Expression> | ts.Expression[],
  sourceFile: ts.SourceFile,
): Record<string, GeneratedApiProperty> {
  const params: Record<string, GeneratedApiProperty> = {}

  args.forEach((arg, index) => {
    const name = getVueEventPayloadParamName(eventName, index)

    if (params[name] === undefined) {
      params[name] = {
        desc: '',
        type: getVueEventPayloadType(arg, sourceFile),
      }
    }
  })

  return params
}

function getVueEventPayloadParamName(eventName: string, index: number): string {
  if (index > 0) {
    return `arg${index + 1}`
  }

  const updateMatch = /^update:(.+)$/.exec(eventName)

  return updateMatch?.[1] ?? 'value'
}

function getVueEventPayloadType(node: ts.Expression, sourceFile: ts.SourceFile): string {
  if (ts.isConditionalExpression(node)) {
    const whenTrue = getVueEventPayloadType(node.whenTrue, sourceFile)
    const whenFalse = getVueEventPayloadType(node.whenFalse, sourceFile)

    return whenTrue === whenFalse ? whenTrue : `${whenTrue} | ${whenFalse}`
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return 'String'
  }

  if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
    return 'Boolean'
  }

  if (ts.isNumericLiteral(node)) {
    return 'Number'
  }

  if (ts.isObjectLiteralExpression(node)) {
    return 'Object'
  }

  if (ts.isArrayLiteralExpression(node)) {
    return 'Array'
  }

  return node.getText(sourceFile)
}

function extractVueSlots(
  source: string,
  sourceFile: ts.SourceFile | undefined,
): Record<string, GeneratedApiProperty> {
  const slots = sourceFile === undefined ? {} : extractVueDefinedSlots(sourceFile)
  const template = /<template(?:\s[^>]*)?>([\s\S]*?)<\/template>/i.exec(source)?.[1]

  if (template === undefined) {
    return slots
  }

  const slotRE = /<slot(?:\s[^>]*)?>/gi
  let match: RegExpExecArray | null

  while ((match = slotRE.exec(template)) !== null) {
    const slotTag = match[0]
    const name = /\sname=["']([^"']+)["']/.exec(slotTag)?.[1] ?? 'default'

    slots[name] ??= {
      desc: '',
    }
  }

  return slots
}

function extractVueDefinedSlots(sourceFile: ts.SourceFile): Record<string, GeneratedApiProperty> {
  const slotsCall = findMacroCall(sourceFile, 'defineSlots')
  const slotsType = slotsCall?.typeArguments?.[0]

  if (slotsType === undefined || !ts.isTypeLiteralNode(slotsType)) {
    return {}
  }

  const slots: Record<string, GeneratedApiProperty> = {}

  for (const member of slotsType.members) {
    if (!ts.isMethodSignature(member) && !ts.isPropertySignature(member)) {
      continue
    }

    const name = getMemberName(member, sourceFile)

    if (name === undefined) {
      continue
    }

    const docs = readJSDoc(member, sourceFile)
    const scope = createSlotScope(member, docs, sourceFile)

    slots[name] = applyJSDocMetadata(
      {
        desc: docs.desc,
        ...(scope === undefined ? {} : { scope }),
      },
      docs,
    )
  }

  return slots
}

function createSlotScope(
  member: ts.MethodSignature | ts.PropertySignature,
  docs: JSDocDetails,
  sourceFile: ts.SourceFile,
): Record<string, GeneratedApiProperty> | undefined {
  const parameters =
    ts.isMethodSignature(member) && member.parameters.length > 0
      ? member.parameters
      : ts.isPropertySignature(member) && member.type !== undefined
        ? getFunctionTypeParameters(member.type)
        : undefined

  if (parameters === undefined || parameters.length === 0) {
    return undefined
  }

  const scope: Record<string, GeneratedApiProperty> = {}

  for (const parameter of parameters) {
    const name = getParameterName(parameter, sourceFile)

    scope[name] = applyPropertyMetadata(
      {
        desc: docs.params.get(name) ?? '',
        tsType: parameter.type?.getText(sourceFile) ?? 'unknown',
        type: normalizeApiType(parameter.type?.getText(sourceFile) ?? 'unknown'),
      },
      docs.paramMetadata.get(name),
    )
  }

  return scope
}

function getFunctionTypeParameters(
  type: ts.TypeNode,
): ts.NodeArray<ts.ParameterDeclaration> | undefined {
  if (ts.isFunctionTypeNode(type)) {
    return type.parameters
  }

  if (ts.isParenthesizedTypeNode(type) || ts.isTypeOperatorNode(type)) {
    return undefined
  }

  return undefined
}

function normalizeApiType(type: string): string {
  if (/\s+\|\s+/.test(type)) {
    return Array.from(new Set(splitApiType(type).map((part) => normalizeApiType(part)))).join(' | ')
  }

  if (/^\{[\s\S]*\}$/.test(type)) {
    return 'Object'
  }

  if (/^Array\b/.test(type) || type.endsWith('[]')) {
    return 'Array'
  }

  if (type === 'string') {
    return 'String'
  }

  if (type === 'number') {
    return 'Number'
  }

  if (type === 'boolean') {
    return 'Boolean'
  }

  return type
}

function findMacroCall(sourceFile: ts.SourceFile, name: string): ts.CallExpression | undefined {
  let match: ts.CallExpression | undefined

  const visit = (node: ts.Node) => {
    if (
      match === undefined &&
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === name
    ) {
      match = node
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return match
}

function getVuePropType(node: ts.Expression, sourceFile: ts.SourceFile): string {
  return getVuePropTypeDetails(node, sourceFile).type
}

function getVuePropTypeDetails(
  node: ts.Expression,
  sourceFile: ts.SourceFile,
): { tsType?: string; type: string } {
  if (ts.isAsExpression(node)) {
    const runtimeType = getVuePropTypeDetails(node.expression, sourceFile).type
    const tsType = getVuePropTypeFromPropType(node.type, sourceFile)

    return tsType === undefined ? { type: runtimeType } : { tsType, type: runtimeType }
  }

  if (ts.isIdentifier(node)) {
    return { type: node.text }
  }

  if (ts.isArrayLiteralExpression(node)) {
    return {
      type: node.elements.map((element) => getVuePropType(element, sourceFile)).join(' | '),
    }
  }

  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    return { type: 'Function' }
  }

  return { type: node.getText(sourceFile) }
}

function getVuePropTypeFromPropType(
  node: ts.TypeNode,
  sourceFile: ts.SourceFile,
): string | undefined {
  if (
    ts.isTypeReferenceNode(node) &&
    ts.isIdentifier(node.typeName) &&
    node.typeName.text === 'PropType'
  ) {
    return node.typeArguments?.[0]?.getText(sourceFile)
  }

  if (ts.isFunctionTypeNode(node) && node.type !== undefined) {
    return node.type.getText(sourceFile)
  }

  return undefined
}

function getValidatorValues(node: ts.Expression, sourceFile: ts.SourceFile): string[] | undefined {
  const body =
    ts.isArrowFunction(node) || ts.isFunctionExpression(node)
      ? ts.isBlock(node.body)
        ? findReturnedExpression(node.body)
        : node.body
      : undefined

  if (body === undefined) {
    return undefined
  }

  const values = findIncludesArray(body)

  return values === undefined
    ? undefined
    : values.elements.map((value) => value.getText(sourceFile))
}

function findReturnedExpression(body: ts.Block): ts.Expression | undefined {
  for (const statement of body.statements) {
    if (ts.isReturnStatement(statement)) {
      return statement.expression
    }
  }

  return undefined
}

function findIncludesArray(node: ts.Node): ts.ArrayLiteralExpression | undefined {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === 'includes' &&
    ts.isArrayLiteralExpression(node.expression.expression)
  ) {
    return node.expression.expression
  }

  let match: ts.ArrayLiteralExpression | undefined

  const visit = (child: ts.Node) => {
    if (match !== undefined) {
      return
    }

    match = findIncludesArray(child)

    if (match === undefined) {
      ts.forEachChild(child, visit)
    }
  }

  ts.forEachChild(node, visit)

  return match
}

function getVuePropDefault(node: ts.Expression, sourceFile: ts.SourceFile): string | undefined {
  if (
    ts.isVoidExpression(node) ||
    node.getText(sourceFile) === 'void 0' ||
    (ts.isIdentifier(node) && node.text === 'undefined')
  ) {
    return undefined
  }

  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }

  return node.getText(sourceFile)
}

function createFunctionEntry(
  node: FunctionLikeNode,
  sourceFile: ts.SourceFile,
  options: {
    context?: SourceFileContext
    fallbackJSDocNode?: ts.Node
    name?: string
  } = {},
): GeneratedApiProperty {
  const docs = readJSDoc(node, sourceFile, options.fallbackJSDocNode)
  const returnType = getReturnType(node, sourceFile)
  const returnProperties =
    getReturnProperties(node.type, options.context ?? createSourceFileContext(sourceFile)) ??
    getReturnedObjectProperties(node, sourceFile, options.context)
  const entry: GeneratedApiProperty = {
    desc: docs.desc,
    params: createParams(node, docs, sourceFile),
    tsSignature: getFunctionSignature(node, sourceFile, options.name, returnProperties),
    type: 'Function',
  }

  if (docs.examples.length > 0) {
    entry.examples = docs.examples
  }

  if (docs.category !== undefined) {
    entry.category = docs.category
  }

  if (docs.since !== undefined) {
    entry.addedIn = docs.since
  }

  if (docs.deprecated !== undefined) {
    entry.deprecated = docs.deprecated
  }

  applyPropertyMetadata(entry, docs.metadata)

  if (returnType === 'void') {
    entry.returns = null
  } else {
    const type = returnType === 'unknown' && returnProperties !== undefined ? 'Object' : returnType
    entry.returns = applyPropertyMetadata(
      {
        definition: returnProperties,
        desc: docs.returns,
        type,
      },
      docs.returnsMetadata,
    )

    if (returnType !== 'unknown') {
      entry.returns.tsType = returnType
    }
  }

  return entry
}

function createParams(
  node: FunctionLikeNode,
  docs: JSDocDetails,
  sourceFile: ts.SourceFile,
): Record<string, GeneratedApiProperty> | undefined {
  if (node.parameters.length === 0) {
    return undefined
  }

  const params: Record<string, GeneratedApiProperty> = {}

  for (const parameter of node.parameters) {
    if (ts.isObjectBindingPattern(parameter.name)) {
      Object.assign(params, createObjectBindingParams(parameter, parameter.name, docs, sourceFile))
      continue
    }

    const name = getParameterName(parameter, sourceFile)
    const doc = docs.params.get(name)

    params[name] = applyPropertyMetadata(
      {
        desc: doc ?? '',
        required: parameter.questionToken === undefined && parameter.initializer === undefined,
        tsType: parameter.type?.getText(sourceFile) ?? 'unknown',
        type: parameter.type?.getText(sourceFile) ?? 'unknown',
      },
      docs.paramMetadata.get(name),
    )
  }

  return params
}

function createObjectBindingParams(
  parameter: ts.ParameterDeclaration,
  binding: ts.ObjectBindingPattern,
  docs: JSDocDetails,
  sourceFile: ts.SourceFile,
): Record<string, GeneratedApiProperty> {
  const params: Record<string, GeneratedApiProperty> = {}

  for (const element of binding.elements) {
    if (!ts.isIdentifier(element.name)) {
      continue
    }

    const name = element.propertyName?.getText(sourceFile) ?? element.name.text
    const type = getObjectBindingElementType(parameter.type, name, sourceFile)

    params[name] = applyPropertyMetadata(
      {
        desc: docs.params.get(name) ?? '',
        required:
          parameter.questionToken === undefined &&
          parameter.initializer === undefined &&
          element.initializer === undefined &&
          isObjectBindingElementOptional(parameter.type, name) === false,
        tsType: type,
        type,
      },
      docs.paramMetadata.get(name),
    )
  }

  return params
}

type JSDocDetails = {
  api: boolean
  apiEventsSources: string[]
  apiFollow?: string
  apiMethodsSources: string[]
  apiPropsSources: string[]
  apiScope?: string
  apiSlotsSources: string[]
  apiSources: string[]
  category?: string
  deprecated?: string | boolean
  desc: string
  event?: string
  examples: string[]
  metadata: GeneratedApiPropertyMetadata
  paramMetadata: Map<string, GeneratedApiPropertyMetadata>
  params: Map<string, string>
  returns: string
  returnsMetadata: GeneratedApiPropertyMetadata
  since?: string
}

type GeneratedApiPropertyMetadata = Pick<
  Partial<GeneratedApiProperty>,
  '__exemption' | 'applicable' | 'default' | 'examples' | 'required' | 'tsType' | 'type' | 'values'
>

function readJSDoc(node: ts.Node, sourceFile: ts.SourceFile, fallbackNode?: ts.Node): JSDocDetails {
  const docs =
    getLastJSDoc(node) ?? (fallbackNode === undefined ? undefined : getLastJSDoc(fallbackNode))
  const params = new Map<string, string>()
  const paramMetadata = new Map<string, GeneratedApiPropertyMetadata>()
  const examples: string[] = []
  const categories: string[] = []
  let api = false
  const apiEventsSources: string[] = []
  let apiFollow: string | undefined
  const apiMethodsSources: string[] = []
  const apiPropsSources: string[] = []
  let apiScope: string | undefined
  const apiSlotsSources: string[] = []
  const apiSources: string[] = []
  let deprecated: string | boolean | undefined
  let desc = normalizeDescriptionComment(docs?.comment)
  let event: string | undefined
  const metadata: GeneratedApiPropertyMetadata = {}
  let returns = ''
  const returnsMetadata: GeneratedApiPropertyMetadata = {}
  let since: string | undefined

  if (docs?.tags !== undefined) {
    for (const tag of docs.tags) {
      if (ts.isJSDocParameterTag(tag)) {
        params.set(tag.name.getText(sourceFile), normalizeTagComment(tag.comment))
      } else if (ts.isJSDocReturnTag(tag)) {
        returns = normalizeDescriptionComment(tag.comment)
      } else {
        const tagName = tag.tagName.getText(sourceFile)

        if (tagName === 'example') {
          examples.push(normalizeComment(tag.comment))
        } else if (tagName === 'api') {
          api = true
        } else if (tagName === 'api-events') {
          apiEventsSources.push(...normalizeListTag(tag.comment))
        } else if (tagName === 'api-follow') {
          apiFollow = normalizeComment(tag.comment)
        } else if (tagName === 'api-methods') {
          apiMethodsSources.push(...normalizeListTag(tag.comment))
        } else if (tagName === 'api-props') {
          apiPropsSources.push(...normalizeListTag(tag.comment))
        } else if (tagName === 'api-scope' || tagName === 'api-event-scope') {
          apiScope = normalizeComment(tag.comment)
        } else if (tagName === 'api-slots') {
          apiSlotsSources.push(...normalizeListTag(tag.comment))
        } else if (tagName === 'api-source') {
          apiSources.push(...normalizeListTag(tag.comment))
        } else if (tagName === 'category') {
          categories.push(...normalizeCategories(tag.comment))
        } else if (tagName === 'deprecated') {
          deprecated = normalizeDescriptionComment(tag.comment) || true
        } else if (tagName === 'event') {
          event = normalizeComment(tag.comment)
        } else if (tagName === 'values') {
          metadata.values = normalizeListTag(tag.comment)
        } else if (tagName === 'applicable') {
          metadata.applicable = normalizeListTag(tag.comment)
        } else if (tagName === 'api-exemption' || tagName === 'exemption') {
          metadata.__exemption = normalizeListTag(tag.comment)
        } else if (tagName === 'default') {
          metadata.default = normalizeComment(tag.comment)
        } else if (tagName === 'required') {
          metadata.required = normalizeBooleanTag(tag.comment)
        } else if (tagName === 'type') {
          metadata.type = normalizeComment(tag.comment)
        } else if (tagName === 'tsType' || tagName === 'ts-type') {
          metadata.tsType = normalizeComment(tag.comment)
        } else if (tagName.startsWith('param-')) {
          applyNamedMetadataTag(paramMetadata, tagName.slice('param-'.length), tag.comment)
        } else if (tagName.startsWith('returns-') || tagName.startsWith('return-')) {
          applyMetadataTag(
            returnsMetadata,
            tagName.startsWith('returns-')
              ? tagName.slice('returns-'.length)
              : tagName.slice('return-'.length),
            tag.comment,
          )
        } else if (tagName === 'since') {
          since = normalizeComment(tag.comment)
        }
      }
    }
  }

  if (docs === undefined) {
    const leadingDocs = readLeadingJSDocComment(node, sourceFile)

    if (leadingDocs !== undefined) {
      desc = normalizeDescriptionComment(leadingDocs.desc)

      for (const tag of leadingDocs.tags) {
        if (tag.tagName === 'param' && tag.name !== undefined) {
          params.set(tag.name, normalizeTagComment(tag.comment))
        } else if (tag.tagName === 'returns' || tag.tagName === 'return') {
          returns = normalizeDescriptionComment(tag.comment)
        } else if (tag.tagName === 'example') {
          examples.push(normalizeComment(tag.comment))
        } else if (tag.tagName === 'api') {
          api = true
        } else if (tag.tagName === 'api-events') {
          apiEventsSources.push(...normalizeListTag(tag.comment))
        } else if (tag.tagName === 'api-follow') {
          apiFollow = normalizeComment(tag.comment)
        } else if (tag.tagName === 'api-methods') {
          apiMethodsSources.push(...normalizeListTag(tag.comment))
        } else if (tag.tagName === 'api-props') {
          apiPropsSources.push(...normalizeListTag(tag.comment))
        } else if (tag.tagName === 'api-scope' || tag.tagName === 'api-event-scope') {
          apiScope = normalizeComment(tag.comment)
        } else if (tag.tagName === 'api-slots') {
          apiSlotsSources.push(...normalizeListTag(tag.comment))
        } else if (tag.tagName === 'api-source') {
          apiSources.push(...normalizeListTag(tag.comment))
        } else if (tag.tagName === 'category') {
          categories.push(...normalizeCategories(tag.comment))
        } else if (tag.tagName === 'deprecated') {
          deprecated = normalizeDescriptionComment(tag.comment) || true
        } else if (tag.tagName === 'event') {
          event = normalizeComment(tag.comment)
        } else if (tag.tagName === 'values') {
          metadata.values = normalizeListTag(tag.comment)
        } else if (tag.tagName === 'applicable') {
          metadata.applicable = normalizeListTag(tag.comment)
        } else if (tag.tagName === 'api-exemption' || tag.tagName === 'exemption') {
          metadata.__exemption = normalizeListTag(tag.comment)
        } else if (tag.tagName === 'default') {
          metadata.default = normalizeComment(tag.comment)
        } else if (tag.tagName === 'required') {
          metadata.required = normalizeBooleanTag(tag.comment)
        } else if (tag.tagName === 'type') {
          metadata.type = normalizeComment(tag.comment)
        } else if (tag.tagName === 'tsType' || tag.tagName === 'ts-type') {
          metadata.tsType = normalizeComment(tag.comment)
        } else if (tag.tagName.startsWith('param-')) {
          applyNamedMetadataTag(paramMetadata, tag.tagName.slice('param-'.length), tag.comment)
        } else if (tag.tagName.startsWith('returns-') || tag.tagName.startsWith('return-')) {
          applyMetadataTag(
            returnsMetadata,
            tag.tagName.startsWith('returns-')
              ? tag.tagName.slice('returns-'.length)
              : tag.tagName.slice('return-'.length),
            tag.comment,
          )
        } else if (tag.tagName === 'since') {
          since = normalizeComment(tag.comment)
        }
      }
    }
  }

  return {
    api,
    apiEventsSources,
    apiFollow,
    apiMethodsSources,
    apiPropsSources,
    apiScope,
    apiSlotsSources,
    apiSources,
    category: categories.length > 0 ? categories.join('|') : undefined,
    deprecated,
    desc,
    event,
    examples,
    metadata,
    paramMetadata,
    params,
    returns,
    returnsMetadata,
    since,
  }
}

function applyNamedMetadataTag(
  metadata: Map<string, GeneratedApiPropertyMetadata>,
  tagName: string,
  comment: unknown,
): void {
  const named = splitNamedTagComment(comment)

  if (named === undefined) {
    return
  }

  const entry = metadata.get(named.name) ?? {}

  applyMetadataTag(entry, tagName, named.value)
  metadata.set(named.name, entry)
}

function applyMetadataTag(
  metadata: GeneratedApiPropertyMetadata,
  tagName: string,
  comment: unknown,
): void {
  if (tagName === 'values') {
    metadata.values = normalizeListTag(comment)
  } else if (tagName === 'applicable') {
    metadata.applicable = normalizeListTag(comment)
  } else if (tagName === 'api-exemption' || tagName === 'exemption') {
    metadata.__exemption = normalizeListTag(comment)
  } else if (tagName === 'example') {
    metadata.examples = [...(metadata.examples ?? []), normalizeComment(comment)]
  } else if (tagName === 'default') {
    metadata.default = normalizeComment(comment)
  } else if (tagName === 'required') {
    metadata.required = normalizeBooleanTag(comment)
  } else if (tagName === 'type') {
    metadata.type = normalizeComment(comment)
  } else if (tagName === 'tsType' || tagName === 'ts-type') {
    metadata.tsType = normalizeComment(comment)
  }
}

function splitNamedTagComment(comment: unknown): { name: string; value: string } | undefined {
  const normalized = normalizeComment(comment)
  const match = /^(\S+)\s+([\s\S]+)$/.exec(normalized)

  if (match === null) {
    return undefined
  }

  return {
    name: match[1],
    value: match[2],
  }
}

function normalizeListTag(comment: unknown): string[] {
  return normalizeComment(comment)
    .split(/[|,]/)
    .map((value) => value.trim())
    .filter(Boolean)
}

function normalizeBooleanTag(comment: unknown): boolean | undefined {
  const normalized = normalizeComment(comment).toLowerCase()

  if (normalized === 'true') {
    return true
  }

  if (normalized === 'false') {
    return false
  }

  return undefined
}

function normalizeCategories(comment: unknown): string[] {
  return normalizeComment(comment)
    .split(/[|,]/)
    .map((category) => category.trim())
    .filter(Boolean)
}

function getLastJSDoc(node: ts.Node): ts.JSDoc | undefined {
  const docs = (node as { jsDoc?: ts.JSDoc[] }).jsDoc

  return docs?.at(-1)
}

type ParsedLeadingJSDoc = {
  desc: string
  tags: {
    comment: string
    name?: string
    tagName: string
  }[]
}

function readLeadingJSDocComment(
  node: ts.Node,
  sourceFile: ts.SourceFile,
): ParsedLeadingJSDoc | undefined {
  const text = sourceFile.getFullText()
  const ranges = ts.getLeadingCommentRanges(text, node.getFullStart()) ?? []
  const jsDocRange = ranges
    .filter(
      (range) =>
        range.kind === ts.SyntaxKind.MultiLineCommentTrivia &&
        text.slice(range.pos, range.pos + 3) === '/**',
    )
    .at(-1)

  if (jsDocRange === undefined) {
    return undefined
  }

  return parseLeadingJSDocText(text.slice(jsDocRange.pos, jsDocRange.end))
}

function parseLeadingJSDocText(comment: string): ParsedLeadingJSDoc {
  const lines = comment
    .replace(/^\/\*\*/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\* ?/, '').trimEnd())

  const desc: string[] = []
  const tags: ParsedLeadingJSDoc['tags'] = []
  let currentTag: ParsedLeadingJSDoc['tags'][number] | undefined

  for (const line of lines) {
    const tagMatch = line.match(/^@(\S+)(?:\s+(.*))?$/)

    if (tagMatch !== null) {
      const tagName = tagMatch[1]!
      const rawComment = tagMatch[2] ?? ''
      const paramMatch = tagName === 'param' ? rawComment.match(/^(\S+)(?:\s+(.*))?$/) : null

      currentTag =
        paramMatch === null
          ? { comment: rawComment, tagName }
          : { comment: paramMatch[2] ?? '', name: paramMatch[1]!, tagName }
      tags.push(currentTag)
      continue
    }

    if (currentTag !== undefined) {
      currentTag.comment = cleanupComment(`${currentTag.comment}\n${line}`)
    } else {
      desc.push(line)
    }
  }

  return {
    desc: cleanupComment(desc.join('\n')),
    tags,
  }
}

function normalizeComment(comment: unknown): string {
  if (comment === undefined || comment === null) {
    return ''
  }

  if (typeof comment === 'string') {
    return cleanupComment(comment)
  }

  if (Array.isArray(comment)) {
    return cleanupComment(
      comment
        .map((part) => {
          if (typeof part === 'string') {
            return part
          }

          if (typeof part === 'object' && part !== null && 'text' in part) {
            return String((part as { text: unknown }).text)
          }

          return ''
        })
        .join(''),
    )
  }

  return cleanupComment(String(comment))
}

function normalizeDescriptionComment(comment: unknown): string {
  return collapseSoftCommentLineBreaks(normalizeComment(comment))
}

function normalizeTagComment(comment: unknown): string {
  return normalizeDescriptionComment(comment).replace(/^-\s*/, '')
}

function cleanupComment(comment: string): string {
  return comment
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line, index, lines) => line !== '' || (index > 0 && index < lines.length - 1))
    .join('\n')
    .trim()
}

function collapseSoftCommentLineBreaks(comment: string): string {
  const lines = comment.split('\n')
  const result: string[] = []
  let prose = ''
  let inFence = false

  const flushProse = () => {
    if (prose !== '') {
      result.push(prose)
      prose = ''
    }
  }

  for (const line of lines) {
    if (isFencedCodeBoundary(line) === true) {
      flushProse()
      result.push(line)
      inFence = !inFence
      continue
    }

    if (inFence === true) {
      result.push(line)
      continue
    }

    if (line === '') {
      flushProse()

      if (result.at(-1) !== '') {
        result.push('')
      }

      continue
    }

    if (isStructuredCommentLine(line) === true) {
      flushProse()
      result.push(line)
      continue
    }

    if (prose === '' && isListCommentLine(result.at(-1)) === true) {
      result[result.length - 1] = `${result[result.length - 1]} ${line}`
      continue
    }

    prose = prose === '' ? line : `${prose} ${line}`
  }

  flushProse()

  return result.join('\n').trim()
}

function isFencedCodeBoundary(line: string): boolean {
  return /^(```|~~~)/.test(line)
}

function isStructuredCommentLine(line: string): boolean {
  return (
    isListCommentLine(line) ||
    /^>\s?/.test(line) ||
    /^#{1,6}\s+/.test(line) ||
    /^\|.*\|$/.test(line) ||
    /^:?-{3,}:?\s*(\|:?-{3,}:?\s*)+$/.test(line) ||
    /^-{3,}$/.test(line)
  )
}

function isListCommentLine(line: string | undefined): boolean {
  return line !== undefined && /^([-*+]|\d+[.)])\s+/.test(line)
}

function getReturnType(node: FunctionLikeNode, sourceFile: ts.SourceFile): string {
  if (node.type !== undefined) {
    return node.type.getText(sourceFile)
  }

  if (ts.isArrowFunction(node) && !ts.isBlock(node.body)) {
    return ts.isObjectLiteralExpression(node.body) ? 'Object' : 'unknown'
  }

  const body = getFunctionBody(node)

  if (body !== undefined && hasReturnExpression(body) === false) {
    return 'void'
  }

  return 'unknown'
}

function getVariableType(declaration: ts.VariableDeclaration, sourceFile: ts.SourceFile): string {
  if (declaration.type !== undefined) {
    return declaration.type.getText(sourceFile)
  }

  if (declaration.initializer === undefined) {
    return 'unknown'
  }

  if (ts.isStringLiteral(declaration.initializer)) {
    return 'string'
  }

  if (ts.isNumericLiteral(declaration.initializer)) {
    return 'number'
  }

  if (
    declaration.initializer.kind === ts.SyntaxKind.TrueKeyword ||
    declaration.initializer.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return 'boolean'
  }

  if (ts.isObjectLiteralExpression(declaration.initializer)) {
    return 'Object'
  }

  if (ts.isArrayLiteralExpression(declaration.initializer)) {
    return 'Array'
  }

  if (ts.isIdentifier(declaration.initializer)) {
    return `typeof ${declaration.initializer.text}`
  }

  return 'unknown'
}

function getVariableSignature(
  declaration: ts.VariableDeclaration,
  sourceFile: ts.SourceFile,
): string | undefined {
  if (!ts.isIdentifier(declaration.name)) {
    return undefined
  }

  return `const ${declaration.name.text}: ${getVariableType(declaration, sourceFile)}`
}

function getReturnProperties(
  returnType: ts.TypeNode | undefined,
  context: SourceFileContext,
): Record<string, GeneratedApiProperty> | undefined {
  const declaration = resolveReturnTypeDeclaration(returnType, context)

  if (declaration === undefined) {
    return undefined
  }

  const sourceFile = declaration.getSourceFile()
  const members = ts.isInterfaceDeclaration(declaration)
    ? declaration.members
    : ts.isTypeLiteralNode(declaration.type)
      ? declaration.type.members
      : undefined

  if (members === undefined) {
    return undefined
  }

  const properties: Record<string, GeneratedApiProperty> = {}

  for (const member of members) {
    if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) {
      continue
    }

    const name = getMemberName(member, sourceFile)

    if (name === undefined) {
      continue
    }

    const docs = readJSDoc(member, sourceFile)

    properties[name] = applyJSDocMetadata(
      {
        desc: docs.desc,
        required: member.questionToken === undefined,
        tsType: getMemberType(member, sourceFile),
        type: getMemberType(member, sourceFile),
      },
      docs,
    )
  }

  return Object.keys(properties).length === 0 ? undefined : properties
}

function resolveReturnTypeDeclaration(
  returnType: ts.TypeNode | undefined,
  context: SourceFileContext,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined {
  if (returnType === undefined) {
    return undefined
  }

  if (ts.isTypeReferenceNode(returnType) && ts.isIdentifier(returnType.typeName)) {
    return resolveTypeDeclaration(returnType, context)
  }

  if (ts.isUnionTypeNode(returnType) || ts.isIntersectionTypeNode(returnType)) {
    const declarations = returnType.types
      .map((type) => resolveReturnTypeDeclaration(type, context))
      .filter(
        (declaration): declaration is ts.InterfaceDeclaration | ts.TypeAliasDeclaration =>
          declaration !== undefined,
      )

    return declarations.length === 1 ? declarations[0] : undefined
  }

  return undefined
}

function getMemberName(
  member: ts.PropertySignature | ts.MethodSignature,
  sourceFile: ts.SourceFile,
): string | undefined {
  if (
    ts.isIdentifier(member.name) ||
    ts.isStringLiteral(member.name) ||
    ts.isNumericLiteral(member.name)
  ) {
    return member.name.text
  }

  return member.name.getText(sourceFile)
}

function getMemberType(
  member: ts.PropertySignature | ts.MethodSignature,
  sourceFile: ts.SourceFile,
): string {
  if (ts.isMethodSignature(member)) {
    const params = member.parameters
      .map(
        (parameter) =>
          `${getParameterName(parameter, sourceFile)}: ${parameter.type?.getText(sourceFile) ?? 'unknown'}`,
      )
      .join(', ')
    const returnType = member.type?.getText(sourceFile) ?? 'unknown'

    return `(${params}) => ${returnType}`
  }

  return member.type?.getText(sourceFile) ?? 'unknown'
}

function getObjectBindingElementType(
  type: ts.TypeNode | undefined,
  name: string,
  sourceFile: ts.SourceFile,
): string {
  const member = getObjectBindingMember(type, name)

  return member?.type?.getText(sourceFile) ?? 'unknown'
}

function isObjectBindingElementOptional(type: ts.TypeNode | undefined, name: string): boolean {
  return getObjectBindingMember(type, name)?.questionToken !== undefined
}

function getObjectBindingMember(
  type: ts.TypeNode | undefined,
  name: string,
): ts.PropertySignature | undefined {
  if (type === undefined || !ts.isTypeLiteralNode(type)) {
    return undefined
  }

  return type.members.find(
    (member): member is ts.PropertySignature =>
      ts.isPropertySignature(member) &&
      ((ts.isIdentifier(member.name) && member.name.text === name) ||
        (ts.isStringLiteral(member.name) && member.name.text === name)),
  )
}

function getReturnedObjectProperties(
  node: FunctionLikeNode,
  sourceFile: ts.SourceFile,
  context?: SourceFileContext,
): Record<string, GeneratedApiProperty> | undefined {
  const returnedObject = getReturnedObjectLiteral(node)

  if (returnedObject === undefined) {
    return undefined
  }

  const localFunctions = getLocalFunctions(node)
  const properties: Record<string, GeneratedApiProperty> = {}

  for (const property of returnedObject.properties) {
    const name = getObjectPropertyName(property, sourceFile)

    if (name === undefined) {
      continue
    }

    if (ts.isShorthandPropertyAssignment(property)) {
      const localFunction = localFunctions.get(name)

      properties[name] =
        localFunction === undefined
          ? createReturnedValueProperty('unknown')
          : createReturnedFunctionProperty(name, localFunction, sourceFile, context)

      continue
    }

    if (ts.isPropertyAssignment(property)) {
      if (isFunctionLikeInitializer(property.initializer)) {
        properties[name] = createReturnedFunctionProperty(
          name,
          property.initializer,
          sourceFile,
          context,
        )
      } else {
        properties[name] = createReturnedValueProperty(property.initializer.getText(sourceFile))
      }
    }
  }

  return Object.keys(properties).length === 0 ? undefined : properties
}

function getReturnedObjectLiteral(node: FunctionLikeNode): ts.ObjectLiteralExpression | undefined {
  if (ts.isArrowFunction(node) && ts.isObjectLiteralExpression(node.body)) {
    return node.body
  }

  const body = getFunctionBody(node)

  if (body === undefined) {
    return undefined
  }

  for (const statement of body.statements) {
    if (
      ts.isReturnStatement(statement) &&
      statement.expression !== undefined &&
      ts.isObjectLiteralExpression(statement.expression)
    ) {
      return statement.expression
    }
  }

  return undefined
}

function getLocalFunctions(node: FunctionLikeNode): Map<string, FunctionLikeNode> {
  const functions = new Map<string, FunctionLikeNode>()
  const body = getFunctionBody(node)

  if (body === undefined) {
    return functions
  }

  for (const statement of body.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name !== undefined) {
      functions.set(statement.name.text, statement)
      continue
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer !== undefined &&
          isFunctionLikeInitializer(declaration.initializer)
        ) {
          functions.set(declaration.name.text, declaration.initializer)
        }
      }
    }
  }

  return functions
}

function createReturnedFunctionProperty(
  name: string,
  node: FunctionLikeNode,
  sourceFile: ts.SourceFile,
  context?: SourceFileContext,
): GeneratedApiProperty {
  return {
    ...createFunctionEntry(node, sourceFile, { context, name }),
    required: true,
  }
}

function createReturnedValueProperty(type: string): GeneratedApiProperty {
  return {
    desc: '',
    required: true,
    tsType: type,
    type,
  }
}

function getObjectPropertyName(
  property: ts.ObjectLiteralElementLike,
  sourceFile: ts.SourceFile,
): string | undefined {
  if (ts.isSpreadAssignment(property)) {
    return undefined
  }

  const name = property.name

  if (name === undefined) {
    return undefined
  }

  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text
  }

  return name.getText(sourceFile)
}

function getFunctionBody(node: FunctionLikeNode): ts.Block | undefined {
  return node.body !== undefined && ts.isBlock(node.body) ? node.body : undefined
}

function hasReturnExpression(body: ts.Block): boolean {
  for (const statement of body.statements) {
    if (ts.isReturnStatement(statement) && statement.expression !== undefined) {
      return true
    }
  }

  return false
}

function getFunctionSignature(
  node: FunctionLikeNode,
  sourceFile: ts.SourceFile,
  fallbackName?: string,
  returnProperties?: Record<string, GeneratedApiProperty>,
): string | undefined {
  const name = ts.isFunctionDeclaration(node) && node.name ? node.name.text : fallbackName

  if (name === undefined) {
    return undefined
  }

  const params = node.parameters
    .map((parameter) => getParameterSignature(parameter, sourceFile))
    .join(', ')
  const rawReturnType = getReturnType(node, sourceFile)
  const returnType =
    rawReturnType === 'unknown' && returnProperties !== undefined ? 'Object' : rawReturnType

  return `function ${name}(${params}): ${returnType}`
}

function getParameterSignature(
  parameter: ts.ParameterDeclaration,
  sourceFile: ts.SourceFile,
): string {
  const name = getParameterName(parameter, sourceFile)
  const optional =
    parameter.questionToken === undefined && parameter.initializer === undefined ? '' : '?'
  const type = parameter.type?.getText(sourceFile) ?? 'unknown'

  return `${name}${optional}: ${type}`
}

function getParameterName(parameter: ts.ParameterDeclaration, sourceFile: ts.SourceFile): string {
  if (ts.isIdentifier(parameter.name)) {
    return parameter.name.text
  }

  return parameter.name.getText(sourceFile)
}

function isExported(node: ts.Node): boolean {
  return (
    ts.canHaveModifiers(node) &&
    ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ===
      true
  )
}

function isFunctionLikeInitializer(
  node: ts.Expression,
): node is ts.ArrowFunction | ts.FunctionExpression {
  return ts.isArrowFunction(node) || ts.isFunctionExpression(node)
}

function stringifyApiJson(api: GeneratedApiJson): string {
  return `${JSON.stringify(api, null, 2)}\n`
}

function getApiFieldChanges(
  currentOutput: string | null,
  generatedApi: GeneratedApiJson,
): QPressApiFieldChange[] {
  if (currentOutput === null) {
    return []
  }

  try {
    return diffJsonFields(JSON.parse(currentOutput), generatedApi)
  } catch {
    return [
      {
        generated: generatedApi,
        path: '$',
        type: 'changed',
      },
    ]
  }
}

function diffJsonFields(
  currentValue: unknown,
  generatedValue: unknown,
  path = '$',
): QPressApiFieldChange[] {
  if (isPlainRecord(currentValue) && isPlainRecord(generatedValue)) {
    const changes: QPressApiFieldChange[] = []
    const keys = new Set([...Object.keys(currentValue), ...Object.keys(generatedValue)])

    for (const key of Array.from(keys).sort()) {
      const childPath = `${path}.${key}`

      if (childPath === '$.generated_at') {
        continue
      }

      if (!(key in currentValue)) {
        if (generatedValue[key] === undefined) {
          continue
        }

        changes.push({
          generated: generatedValue[key],
          path: childPath,
          type: 'added',
        })
      } else if (!(key in generatedValue)) {
        changes.push({
          current: currentValue[key],
          path: childPath,
          type: 'removed',
        })
      } else {
        changes.push(...diffJsonFields(currentValue[key], generatedValue[key], childPath))
      }
    }

    return changes
  }

  if (JSON.stringify(currentValue) === JSON.stringify(generatedValue)) {
    return []
  }

  return [
    {
      current: currentValue,
      generated: generatedValue,
      path,
      type: 'changed',
    },
  ]
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Array.isArray(value) === false && typeof value === 'object' && value !== null
}

async function readOptionalFile(path: string): Promise<string | null> {
  try {
    return await fs.readFile(path, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }

    throw error
  }
}
