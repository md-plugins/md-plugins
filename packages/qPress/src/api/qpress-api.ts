import { promises as fs } from 'node:fs'
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
  addedIn?: string
  category?: string
  default?: string
  definition?: Record<string, GeneratedApiProperty>
  deprecated?: string | boolean
  desc: string
  examples?: string[]
  params?: Record<string, GeneratedApiProperty>
  required?: boolean
  returns?: GeneratedApiProperty | null
  tsSignature?: string
  tsType?: string
  type?: string
}

type GeneratedApiJson = {
  [group: string]: unknown
  meta?: {
    docsUrl?: string
  }
  type: string
}

type FunctionLikeNode = ts.FunctionDeclaration | ts.ArrowFunction | ts.FunctionExpression

const defaultGeneratedSuffix = '.generated'

/**
 * Generates Q-Press API JSON comparison files from TypeScript exports and JSDoc.
 *
 * Existing API JSON files are never overwritten. For an output file such as
 * `src/.q-press/api/Foo.json`, this writes `src/.q-press/api/Foo.generated.json`
 * so authors can compare generated output before adopting it.
 */
export async function generateQPressApi(
  options: QPressApiGenerateOptions,
): Promise<QPressApiGenerateResult> {
  const cwd = options.cwd ?? process.cwd()
  const entries = await Promise.all(
    options.entries.map(async (entry) => {
      const generated = await generateApiJsonForEntry(entry, cwd)
      const outputPath = resolve(cwd, entry.output)
      const generatedOutputPath = getGeneratedOutputPath(
        outputPath,
        entry.generatedSuffix ?? options.generatedSuffix ?? defaultGeneratedSuffix,
      )
      const generatedContent = stringifyApiJson(generated.api)
      const currentOutput = await readOptionalFile(outputPath)
      const fieldChanges = getApiFieldChanges(currentOutput, generated.api)

      await fs.mkdir(dirname(generatedOutputPath), { recursive: true })
      await fs.writeFile(generatedOutputPath, generatedContent)

      return {
        differsFromOutput:
          currentOutput === null ? null : normalizeNewline(currentOutput) !== generatedContent,
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
    const generated = await generateApiJsonForEntry(entry, cwd)
    const outputPath = resolve(cwd, entry.output)
    const generatedOutputPath = getGeneratedOutputPath(
      outputPath,
      entry.generatedSuffix ?? options.generatedSuffix ?? defaultGeneratedSuffix,
    )
    const generatedContent = stringifyApiJson(generated.api)
    const currentOutput = await readOptionalFile(outputPath)
    const fieldChanges = getApiFieldChanges(currentOutput, generated.api)
    const differsFromOutput =
      currentOutput === null ? null : normalizeNewline(currentOutput) !== generatedContent

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
): Promise<{ api: GeneratedApiJson; exportCount: number; inputPath: string }> {
  const inputPath = resolve(cwd, entry.input)
  const source = await fs.readFile(inputPath, 'utf8')
  const api: GeneratedApiJson = {
    type: entry.type ?? 'component',
  }

  if (entry.docsUrl !== undefined) {
    api.meta = {
      docsUrl: entry.docsUrl,
    }
  }

  const exportCount =
    extname(inputPath) === '.vue'
      ? populateVueComponentApi(api, inputPath, source)
      : populateTypeScriptApi(api, inputPath, source, entry.group ?? 'functions')

  return {
    api,
    exportCount,
    inputPath,
  }
}

function populateTypeScriptApi(
  api: GeneratedApiJson,
  inputPath: string,
  source: string,
  group: QPressApiEntryGroup,
): number {
  const sourceFile = ts.createSourceFile(inputPath, source, ts.ScriptTarget.Latest, true)
  const generatedEntries = extractExportedFunctions(sourceFile)

  api[group] = generatedEntries

  return Object.keys(generatedEntries).length
}

function populateVueComponentApi(api: GeneratedApiJson, inputPath: string, source: string): number {
  const scriptSetup = extractScriptSetup(source)

  if (scriptSetup !== undefined) {
    const sourceFile = ts.createSourceFile(inputPath, scriptSetup, ts.ScriptTarget.Latest, true)
    const props = extractVueProps(sourceFile)
    const events = extractVueEvents(sourceFile)

    if (Object.keys(props).length > 0) {
      api.props = props
    }

    if (Object.keys(events).length > 0) {
      api.events = events
    }
  }

  const slots = extractVueSlots(source)

  if (Object.keys(slots).length > 0) {
    api.slots = slots
  }

  return ['props', 'events', 'slots'].reduce((count, group) => {
    const entries = api[group]

    return count + (isPlainRecord(entries) ? Object.keys(entries).length : 0)
  }, 0)
}

function extractExportedFunctions(sourceFile: ts.SourceFile): Record<string, GeneratedApiProperty> {
  const entries: Record<string, GeneratedApiProperty> = {}

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && isExported(statement) && statement.name) {
      entries[statement.name.text] = createFunctionEntry(statement, sourceFile)
      continue
    }

    if (ts.isVariableStatement(statement) && isExported(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer !== undefined &&
          isFunctionLikeInitializer(declaration.initializer)
        ) {
          entries[declaration.name.text] = createFunctionEntry(
            declaration.initializer,
            sourceFile,
            {
              fallbackJSDocNode: statement,
              name: declaration.name.text,
            },
          )
        }
      }
    }
  }

  return entries
}

function extractScriptSetup(source: string): string | undefined {
  const match = /<script\s+setup(?:\s[^>]*)?>([\s\S]*?)<\/script>/i.exec(source)

  return match?.[1]
}

function extractVueProps(sourceFile: ts.SourceFile): Record<string, GeneratedApiProperty> {
  const propsCall = findMacroCall(sourceFile, 'defineProps')
  const propsArg = propsCall?.arguments[0]

  if (propsArg === undefined || !ts.isObjectLiteralExpression(propsArg)) {
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

function createVuePropEntry(
  property: ts.ObjectLiteralElementLike,
  sourceFile: ts.SourceFile,
): GeneratedApiProperty | undefined {
  if (ts.isPropertyAssignment(property)) {
    if (ts.isIdentifier(property.initializer)) {
      return {
        desc: readJSDoc(property, sourceFile).desc,
        type: property.initializer.text,
      }
    }

    if (!ts.isObjectLiteralExpression(property.initializer)) {
      return {
        desc: readJSDoc(property, sourceFile).desc,
        type: getVuePropType(property.initializer, sourceFile),
      }
    }

    return createVueObjectPropEntry(property.initializer, sourceFile, readJSDoc(property, sourceFile))
  }

  if (ts.isShorthandPropertyAssignment(property)) {
    return {
      desc: readJSDoc(property, sourceFile).desc,
      type: property.name.text,
    }
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
      prop.type = getVuePropType(property.initializer, sourceFile)
    } else if (name === 'required') {
      prop.required = property.initializer.kind === ts.SyntaxKind.TrueKeyword
    } else if (name === 'default') {
      const defaultValue = getVuePropDefault(property.initializer, sourceFile)

      if (defaultValue !== undefined) {
        prop.default = defaultValue
      }
    }
  }

  if (docs.examples.length > 0) {
    prop.examples = docs.examples
  }

  return prop
}

function extractVueEvents(sourceFile: ts.SourceFile): Record<string, GeneratedApiProperty> {
  const emitsCall = findMacroCall(sourceFile, 'defineEmits')
  const emitsArg = emitsCall?.arguments[0]

  if (emitsArg === undefined || !ts.isArrayLiteralExpression(emitsArg)) {
    return {}
  }

  const events: Record<string, GeneratedApiProperty> = {}

  for (const element of emitsArg.elements) {
    if (ts.isStringLiteral(element)) {
      events[element.text] = {
        desc: '',
        params: {},
      }
    }
  }

  return events
}

function extractVueSlots(source: string): Record<string, GeneratedApiProperty> {
  const slots: Record<string, GeneratedApiProperty> = {}
  const template = /<template(?:\s[^>]*)?>([\s\S]*?)<\/template>/i.exec(source)?.[1]

  if (template === undefined) {
    return slots
  }

  const slotRE = /<slot(?:\s[^>]*)?>/gi
  let match: RegExpExecArray | null

  while ((match = slotRE.exec(template)) !== null) {
    const slotTag = match[0]
    const name = /\sname=["']([^"']+)["']/.exec(slotTag)?.[1] ?? 'default'

    slots[name] = {
      desc: '',
    }
  }

  return slots
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
  if (ts.isIdentifier(node)) {
    return node.text
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => getVuePropType(element, sourceFile)).join(' | ')
  }

  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    return 'Function'
  }

  return node.getText(sourceFile)
}

function getVuePropDefault(node: ts.Expression, sourceFile: ts.SourceFile): string | undefined {
  if (ts.isVoidExpression(node) || node.getText(sourceFile) === 'void 0') {
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
    fallbackJSDocNode?: ts.Node
    name?: string
  } = {},
): GeneratedApiProperty {
  const docs = readJSDoc(node, sourceFile, options.fallbackJSDocNode)
  const returnType = getReturnType(node, sourceFile)
  const returnProperties =
    getReturnProperties(returnType, sourceFile) ?? getReturnedObjectProperties(node, sourceFile)
  const entry: GeneratedApiProperty = {
    desc: docs.desc,
    params: createParams(node, docs, sourceFile),
    tsSignature: getFunctionSignature(node, sourceFile, options.name, returnProperties),
    type: 'Function',
  }

  if (docs.examples.length > 0) {
    entry.examples = docs.examples
  }

  if (docs.since !== undefined) {
    entry.addedIn = docs.since
  }

  if (docs.deprecated !== undefined) {
    entry.deprecated = docs.deprecated
  }

  if (returnType === 'void') {
    entry.returns = null
  } else {
    const type = returnType === 'unknown' && returnProperties !== undefined ? 'Object' : returnType
    entry.returns = {
      definition: returnProperties,
      desc: docs.returns,
      type,
    }

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

    params[name] = {
      desc: doc ?? '',
      required: parameter.questionToken === undefined && parameter.initializer === undefined,
      tsType: parameter.type?.getText(sourceFile) ?? 'unknown',
      type: parameter.type?.getText(sourceFile) ?? 'unknown',
    }
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

    params[name] = {
      desc: docs.params.get(name) ?? '',
      required:
        parameter.questionToken === undefined &&
        parameter.initializer === undefined &&
        element.initializer === undefined &&
        isObjectBindingElementOptional(parameter.type, name) === false,
      tsType: type,
      type,
    }
  }

  return params
}

type JSDocDetails = {
  deprecated?: string | boolean
  desc: string
  examples: string[]
  params: Map<string, string>
  returns: string
  since?: string
}

function readJSDoc(node: ts.Node, sourceFile: ts.SourceFile, fallbackNode?: ts.Node): JSDocDetails {
  const docs =
    getLastJSDoc(node) ?? (fallbackNode === undefined ? undefined : getLastJSDoc(fallbackNode))
  const params = new Map<string, string>()
  const examples: string[] = []
  let deprecated: string | boolean | undefined
  let returns = ''
  let since: string | undefined

  if (docs?.tags !== undefined) {
    for (const tag of docs.tags) {
      if (ts.isJSDocParameterTag(tag)) {
        params.set(tag.name.getText(sourceFile), normalizeTagComment(tag.comment))
      } else if (ts.isJSDocReturnTag(tag)) {
        returns = normalizeComment(tag.comment)
      } else {
        const tagName = tag.tagName.getText(sourceFile)

        if (tagName === 'example') {
          examples.push(normalizeComment(tag.comment))
        } else if (tagName === 'deprecated') {
          deprecated = normalizeComment(tag.comment) || true
        } else if (tagName === 'since') {
          since = normalizeComment(tag.comment)
        }
      }
    }
  }

  return {
    deprecated,
    desc: normalizeComment(docs?.comment),
    examples,
    params,
    returns,
    since,
  }
}

function getLastJSDoc(node: ts.Node): ts.JSDoc | undefined {
  const docs = (node as { jsDoc?: ts.JSDoc[] }).jsDoc

  return docs?.at(-1)
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

function normalizeTagComment(comment: unknown): string {
  return normalizeComment(comment).replace(/^-\s*/, '')
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

function getReturnProperties(
  returnType: string,
  sourceFile: ts.SourceFile,
): Record<string, GeneratedApiProperty> | undefined {
  const declaration = findTypeDeclaration(returnType, sourceFile)

  if (declaration === undefined) {
    return undefined
  }

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

    properties[name] = {
      desc: readJSDoc(member, sourceFile).desc,
      required: member.questionToken === undefined,
      tsType: getMemberType(member, sourceFile),
      type: getMemberType(member, sourceFile),
    }
  }

  return Object.keys(properties).length === 0 ? undefined : properties
}

function findTypeDeclaration(
  returnType: string,
  sourceFile: ts.SourceFile,
): ts.InterfaceDeclaration | ts.TypeAliasDeclaration | undefined {
  for (const statement of sourceFile.statements) {
    if (ts.isInterfaceDeclaration(statement) && statement.name.text === returnType) {
      return statement
    }

    if (ts.isTypeAliasDeclaration(statement) && statement.name.text === returnType) {
      return statement
    }
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
          : createReturnedFunctionProperty(name, localFunction, sourceFile)

      continue
    }

    if (ts.isPropertyAssignment(property)) {
      if (isFunctionLikeInitializer(property.initializer)) {
        properties[name] = createReturnedFunctionProperty(name, property.initializer, sourceFile)
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
): GeneratedApiProperty {
  return {
    ...createFunctionEntry(node, sourceFile, { name }),
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

      if (!(key in currentValue)) {
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

function normalizeNewline(value: string): string {
  const normalized = value.replace(/\r\n/g, '\n')

  return normalized.endsWith('\n') ? normalized : `${normalized}\n`
}
