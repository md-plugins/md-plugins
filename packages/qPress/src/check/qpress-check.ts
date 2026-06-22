import { promises as fs } from 'node:fs'
import { extname, join, posix, relative, resolve, sep } from 'node:path'
import {
  checkQPressApi,
  type QPressApiGenerateEntry,
  type QPressApiCheckDiagnostic,
} from '../api/qpress-api.js'

export type QPressCheckSeverity = 'error' | 'warning'

export type QPressCheckDiagnostic = {
  code: string
  file?: string
  hint?: string
  line?: number
  message: string
  route?: string
  severity: QPressCheckSeverity
}

export type QPressCheckRoute = {
  file: string
  route: string
}

export type QPressCheckOptions = {
  allowedRoutes?: string[]
  apiDir?: string
  apiEntries?: QPressApiGenerateEntry[]
  apiGeneratedSuffix?: string
  checkNavigation?: boolean
  checkGeneratedApi?: boolean
  checkSsgUnsafe?: boolean
  checkUnreachable?: boolean
  cwd?: string
  examplesDir?: string
  ignoreFiles?: string[]
  landingPage?: string
  markdownDir?: string
  siteConfigDir?: string
  srcDir?: string
}

export type QPressCheckResult = {
  diagnostics: QPressCheckDiagnostic[]
  errors: QPressCheckDiagnostic[]
  markdownRoot: string
  root: string
  routes: QPressCheckRoute[]
  warnings: QPressCheckDiagnostic[]
}

type MarkdownFile = QPressCheckRoute & {
  absolutePath: string
  content: string
  maskedContent: string
}

type FrontmatterRouteReference = {
  line: number
  route: string
  value: string
}

const markdownExampleTagRegex = /<MarkdownExample\b[^>]*>/g
const markdownExtensionRegex = /\.md$/i
const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/
const apiImportRegex = /from\s+['"]@\/\.q-press\/api\/([^'"]+\.json)['"]/g
const markdownLinkRegex = /\[[^\]]+\]\(([^)\s]+)(?:\s+["'][^"']+["'])?\)/g
const htmlLinkRegex = /\b(?:href|to)=["']([^"']+)["']/g
const exampleAttrRegex = /\b(?:file|src|example|component)=["']([^"']+)["']/i
const siteConfigRouteRegex = /\b(?:path|route|to|href|link|url)\s*:\s*(['"`])([^'"`]+)\1/g
const browserGlobalRegex =
  /\b(window|document|localStorage|sessionStorage|navigator|ResizeObserver|IntersectionObserver|MutationObserver)\b/
const guardedBrowserGlobalRegex =
  /typeof\s+(?:window|document|localStorage|sessionStorage|navigator|ResizeObserver|IntersectionObserver|MutationObserver)|process\.env\.CLIENT|import\.meta\.env\.SSR/

const skippedDirectories = new Set(['.git', '.quasar', 'dist', 'node_modules'])
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.vue'])
const siteConfigExtensions = new Set(['.js', '.json', '.ts'])

type SiteConfigRouteReference = {
  file: string
  line: number
  route: string
  value: string
}

/**
 * Runs Q-Press project checks against Markdown routes, API JSON, examples, and SSG-risky code.
 */
export async function checkQPressProject(
  options: QPressCheckOptions = {},
): Promise<QPressCheckResult> {
  const root = resolve(options.cwd ?? process.cwd())
  const srcRoot = resolve(root, options.srcDir ?? 'src')
  const markdownRoot = resolve(srcRoot, options.markdownDir ?? 'markdown')
  const examplesRoot = resolve(srcRoot, options.examplesDir ?? 'examples')
  const apiRoot = resolve(srcRoot, options.apiDir ?? '.q-press/api')
  const siteConfigRoot = resolve(srcRoot, options.siteConfigDir ?? 'siteConfig')
  const landingPage = options.landingPage ?? 'landing-page.md'
  const ignoreFileMatchers = (options.ignoreFiles ?? []).map(createPathMatcher)
  const diagnostics: QPressCheckDiagnostic[] = []

  const markdownFiles = await readMarkdownFiles(
    markdownRoot,
    landingPage,
    ignoreFileMatchers,
    diagnostics,
  )
  const routeSet = new Set<string>([
    ...markdownFiles.map((markdownFile) => markdownFile.route),
    ...(options.allowedRoutes ?? []).map(normalizeRoutePath),
  ])

  checkDuplicateRoutes(markdownFiles, diagnostics)
  await checkMarkdownFiles(markdownFiles, routeSet, examplesRoot, apiRoot, diagnostics)
  await checkApiJson(apiRoot, diagnostics)

  if (options.checkGeneratedApi !== false && options.apiEntries?.length) {
    await checkGeneratedApiEntries(
      root,
      options.apiEntries,
      options.apiGeneratedSuffix,
      diagnostics,
    )
  }

  const navigationRoutes =
    options.checkNavigation === false
      ? new Set<string>()
      : await checkSiteConfigNavigation(siteConfigRoot, routeSet, diagnostics)

  if (options.checkUnreachable === true) {
    checkUnreachableMarkdownRoutes(markdownFiles, navigationRoutes, diagnostics)
  }

  if (options.checkSsgUnsafe !== false) {
    await checkSsgUnsafeExamples(examplesRoot, diagnostics)
  }

  const errors = diagnostics.filter((diagnostic) => diagnostic.severity === 'error')
  const warnings = diagnostics.filter((diagnostic) => diagnostic.severity === 'warning')

  return {
    diagnostics,
    errors,
    markdownRoot,
    root,
    routes: markdownFiles.map(({ file, route }) => ({ file, route })),
    warnings,
  }
}

/**
 * Formats qpress check diagnostics for terminal output.
 */
export function formatQPressCheckResult(result: QPressCheckResult): string {
  const lines: string[] = [
    `Q-Press check scanned ${result.routes.length} Markdown route${result.routes.length === 1 ? '' : 's'}.`,
  ]

  if (result.diagnostics.length === 0) {
    lines.push('No Q-Press issues found.')
    return `${lines.join('\n')}\n`
  }

  if (result.errors.length > 0) {
    lines.push('', `Errors (${result.errors.length})`)
    lines.push(...result.errors.map(formatDiagnostic))
  }

  if (result.warnings.length > 0) {
    lines.push('', `Warnings (${result.warnings.length})`)
    lines.push(...result.warnings.map(formatDiagnostic))
  }

  lines.push(
    '',
    `${result.errors.length} error${result.errors.length === 1 ? '' : 's'}, ${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'}.`,
  )

  return `${lines.join('\n')}\n`
}

/**
 * Reports stale generated API JSON when qpress API entries are configured.
 */
async function checkGeneratedApiEntries(
  root: string,
  entries: QPressApiGenerateEntry[],
  generatedSuffix: string | undefined,
  diagnostics: QPressCheckDiagnostic[],
): Promise<void> {
  const result = await checkQPressApi({
    cwd: root,
    entries,
    generatedSuffix,
  })

  for (const diagnostic of result.diagnostics) {
    diagnostics.push(toProjectApiDiagnostic(root, diagnostic))
  }
}

function toProjectApiDiagnostic(
  root: string,
  diagnostic: QPressApiCheckDiagnostic,
): QPressCheckDiagnostic {
  const outputPath = normalizeRelativePath(relative(root, diagnostic.outputPath))
  const generatedPath = normalizeRelativePath(relative(root, diagnostic.generatedOutputPath))
  const sourcePath = normalizeRelativePath(relative(root, diagnostic.inputPath))
  const fieldSummary =
    diagnostic.fieldChanges.length === 0
      ? ''
      : ` Field changes: ${formatApiFieldChangeSummary(diagnostic.fieldChanges)}.`

  return {
    code: diagnostic.code,
    file: outputPath,
    hint: `Run qpress api generate and compare ${generatedPath}.`,
    message:
      diagnostic.code === 'api-output-missing'
        ? `Configured API JSON is missing for ${sourcePath}.${fieldSummary}`
        : `Configured API JSON is stale for ${sourcePath}.${fieldSummary}`,
    severity: 'error',
  }
}

function formatApiFieldChangeSummary(
  fieldChanges: QPressApiCheckDiagnostic['fieldChanges'],
): string {
  const summary = fieldChanges.reduce(
    (acc, change) => {
      acc[change.type] += 1

      return acc
    },
    {
      added: 0,
      changed: 0,
      removed: 0,
    },
  )

  return `${summary.added} added, ${summary.changed} changed, ${summary.removed} removed`
}

/**
 * Reads every Markdown file from the configured Q-Press markdown root.
 */
async function readMarkdownFiles(
  markdownRoot: string,
  landingPage: string,
  ignoreFileMatchers: ((path: string) => boolean)[],
  diagnostics: QPressCheckDiagnostic[],
): Promise<MarkdownFile[]> {
  if (!(await pathExists(markdownRoot))) {
    diagnostics.push({
      code: 'markdown-root-missing',
      file: markdownRoot,
      message: 'Q-Press markdown directory was not found.',
      severity: 'error',
    })
    return []
  }

  const markdownPaths = (
    await collectFiles(markdownRoot, (file) => extname(file) === '.md')
  ).filter((absolutePath) => {
    const file = normalizeRelativePath(relative(markdownRoot, absolutePath))

    return !ignoreFileMatchers.some((matches) => matches(file))
  })

  return Promise.all(
    markdownPaths.map(async (absolutePath) => {
      const file = normalizeRelativePath(relative(markdownRoot, absolutePath))
      const content = await fs.readFile(absolutePath, 'utf8')
      const route = markdownFileToRoutePath(file, landingPage)

      return {
        absolutePath,
        content,
        file,
        maskedContent: maskMarkdownCode(content),
        route,
      }
    }),
  )
}

/**
 * Reports duplicate route output from multiple Markdown files.
 */
function checkDuplicateRoutes(
  markdownFiles: MarkdownFile[],
  diagnostics: QPressCheckDiagnostic[],
): void {
  const routeFiles = new Map<string, MarkdownFile[]>()

  for (const markdownFile of markdownFiles) {
    const files = routeFiles.get(markdownFile.route) ?? []
    files.push(markdownFile)
    routeFiles.set(markdownFile.route, files)
  }

  for (const [route, files] of routeFiles) {
    if (files.length < 2) {
      continue
    }

    diagnostics.push({
      code: 'route-duplicate',
      file: files.map((file) => file.file).join(', '),
      hint: 'Rename one Markdown file or move it so each route maps to one source file.',
      message: `Multiple Markdown files generate the same route: ${route}.`,
      route,
      severity: 'error',
    })
  }
}

/**
 * Runs content-level checks for frontmatter, links, examples, and API imports.
 */
async function checkMarkdownFiles(
  markdownFiles: MarkdownFile[],
  routeSet: Set<string>,
  examplesRoot: string,
  apiRoot: string,
  diagnostics: QPressCheckDiagnostic[],
): Promise<void> {
  await Promise.all(
    markdownFiles.map(async (markdownFile) => {
      checkFrontmatter(markdownFile, diagnostics)
      checkFrontmatterRoutes(markdownFile, routeSet, diagnostics)
      checkInternalLinks(markdownFile, routeSet, diagnostics)
      await checkExampleReferences(markdownFile, examplesRoot, diagnostics)
      await checkApiImports(markdownFile, apiRoot, diagnostics)
    }),
  )
}

/**
 * Reports missing or incomplete frontmatter as warnings.
 */
function checkFrontmatter(markdownFile: MarkdownFile, diagnostics: QPressCheckDiagnostic[]): void {
  const frontmatter = readFrontmatter(markdownFile.content)

  if (frontmatter === undefined) {
    diagnostics.push({
      code: 'frontmatter-missing',
      file: markdownFile.file,
      hint: 'Add title and desc frontmatter so navigation, search, and social metadata stay consistent.',
      message: 'Markdown file is missing frontmatter.',
      route: markdownFile.route,
      severity: 'warning',
    })
    return
  }

  for (const key of ['title', 'desc']) {
    if (!frontmatter.has(key)) {
      diagnostics.push({
        code: `frontmatter-${key}-missing`,
        file: markdownFile.file,
        hint: `Add a ${key} frontmatter field.`,
        message: `Markdown frontmatter is missing "${key}".`,
        route: markdownFile.route,
        severity: 'warning',
      })
    }
  }
}

/**
 * Reports route-like frontmatter entries that do not match a known Markdown or allowed route.
 */
function checkFrontmatterRoutes(
  markdownFile: MarkdownFile,
  routeSet: Set<string>,
  diagnostics: QPressCheckDiagnostic[],
): void {
  for (const reference of readRelatedFrontmatterRoutes(markdownFile.content)) {
    if (routeSet.has(reference.route)) {
      continue
    }

    diagnostics.push({
      code: 'frontmatter-route-missing',
      file: markdownFile.file,
      hint: 'Add the target Markdown page, fix the frontmatter route, or pass --allow-route for custom Vue routes.',
      line: reference.line,
      message: `Frontmatter related route points to a route that qpress check could not find: ${reference.value}.`,
      route: reference.route,
      severity: 'error',
    })
  }
}

/**
 * Reports internal route links that do not match a known Markdown route.
 */
function checkInternalLinks(
  markdownFile: MarkdownFile,
  routeSet: Set<string>,
  diagnostics: QPressCheckDiagnostic[],
): void {
  for (const match of findMatches(markdownFile.maskedContent, [markdownLinkRegex, htmlLinkRegex])) {
    const href = match.value
    const route = resolveInternalRoute(href, markdownFile.route)

    if (route === undefined || routeSet.has(route)) {
      continue
    }

    diagnostics.push({
      code: 'link-route-missing',
      file: markdownFile.file,
      hint: 'Add the target Markdown page, fix the link, or pass --allow-route for custom Vue routes.',
      line: lineNumberForIndex(markdownFile.content, match.index),
      message: `Internal link points to a route that qpress check could not find: ${href}.`,
      route,
      severity: 'error',
    })
  }
}

/**
 * Reports MarkdownExample references that cannot resolve to an example source file.
 */
async function checkExampleReferences(
  markdownFile: MarkdownFile,
  examplesRoot: string,
  diagnostics: QPressCheckDiagnostic[],
): Promise<void> {
  const frontmatter = readFrontmatter(markdownFile.content)
  const examplesFolder = frontmatter?.get('examples')

  for (const match of markdownFile.maskedContent.matchAll(markdownExampleTagRegex)) {
    const tag = match[0]
    const file = tag.match(exampleAttrRegex)?.[1]
    const line = lineNumberForIndex(markdownFile.content, match.index ?? 0)

    if (file === undefined) {
      diagnostics.push({
        code: 'example-file-missing',
        file: markdownFile.file,
        hint: 'Add a file attribute such as <MarkdownExample file="BasicExample" />.',
        line,
        message: 'MarkdownExample is missing a file reference.',
        route: markdownFile.route,
        severity: 'error',
      })
      continue
    }

    if (examplesFolder === undefined) {
      diagnostics.push({
        code: 'example-frontmatter-missing',
        file: markdownFile.file,
        hint: 'Add examples: FolderName to the page frontmatter.',
        line,
        message: 'MarkdownExample cannot resolve because page frontmatter is missing examples.',
        route: markdownFile.route,
        severity: 'error',
      })
      continue
    }

    if (!(await exampleExists(examplesRoot, examplesFolder, file))) {
      diagnostics.push({
        code: 'example-source-missing',
        file: markdownFile.file,
        hint: `Expected to find an example source under src/examples/${examplesFolder}.`,
        line,
        message: `MarkdownExample file was not found: ${file}.`,
        route: markdownFile.route,
        severity: 'error',
      })
    }
  }
}

/**
 * Reports imported Q-Press API JSON files that are missing.
 */
async function checkApiImports(
  markdownFile: MarkdownFile,
  apiRoot: string,
  diagnostics: QPressCheckDiagnostic[],
): Promise<void> {
  for (const match of markdownFile.maskedContent.matchAll(apiImportRegex)) {
    const apiFile = match[1]

    if (await pathExists(resolve(apiRoot, apiFile))) {
      continue
    }

    diagnostics.push({
      code: 'api-import-missing',
      file: markdownFile.file,
      hint: 'Confirm the JSON file exists under src/.q-press/api.',
      line: lineNumberForIndex(markdownFile.content, match.index ?? 0),
      message: `Q-Press API JSON import does not exist: ${apiFile}.`,
      route: markdownFile.route,
      severity: 'error',
    })
  }
}

/**
 * Reports API JSON files that cannot be parsed or do not contain an object.
 */
async function checkApiJson(apiRoot: string, diagnostics: QPressCheckDiagnostic[]): Promise<void> {
  if (!(await pathExists(apiRoot))) {
    return
  }

  const apiFiles = await collectFiles(apiRoot, (file) => extname(file) === '.json')

  await Promise.all(
    apiFiles.map(async (absolutePath) => {
      const file = normalizeRelativePath(relative(apiRoot, absolutePath))

      try {
        const parsed = JSON.parse(await fs.readFile(absolutePath, 'utf8')) as unknown

        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
          diagnostics.push({
            code: 'api-json-shape',
            file,
            hint: 'API JSON should be an object compatible with MarkdownApi.',
            message: 'Q-Press API JSON must contain an object.',
            severity: 'error',
          })
        }
      } catch (error) {
        diagnostics.push({
          code: 'api-json-invalid',
          file,
          hint: 'Fix the JSON syntax before rendering it with MarkdownApi.',
          message: `Q-Press API JSON could not be parsed: ${(error as Error).message}.`,
          severity: 'error',
        })
      }
    }),
  )
}

/**
 * Reports siteConfig navigation links that do not match a Markdown or allowed route.
 */
async function checkSiteConfigNavigation(
  siteConfigRoot: string,
  routeSet: Set<string>,
  diagnostics: QPressCheckDiagnostic[],
): Promise<Set<string>> {
  const navigationRoutes = new Set<string>(['/'])

  if (!(await pathExists(siteConfigRoot))) {
    return navigationRoutes
  }

  const routeReferences = await readSiteConfigRouteReferences(siteConfigRoot)

  for (const reference of routeReferences) {
    navigationRoutes.add(reference.route)

    if (routeSet.has(reference.route)) {
      continue
    }

    diagnostics.push({
      code: 'navigation-route-missing',
      file: reference.file,
      hint: 'Add the target Markdown page, fix the siteConfig route, or pass --allow-route for custom Vue routes.',
      line: reference.line,
      message: `siteConfig navigation points to a route that qpress check could not find: ${reference.value}.`,
      route: reference.route,
      severity: 'error',
    })
  }

  return navigationRoutes
}

/**
 * Reports Markdown pages that are not referenced by siteConfig navigation.
 */
function checkUnreachableMarkdownRoutes(
  markdownFiles: MarkdownFile[],
  navigationRoutes: Set<string>,
  diagnostics: QPressCheckDiagnostic[],
): void {
  if (navigationRoutes.size <= 1) {
    return
  }

  for (const markdownFile of markdownFiles) {
    if (navigationRoutes.has(markdownFile.route)) {
      continue
    }

    diagnostics.push({
      code: 'navigation-route-unreachable',
      file: markdownFile.file,
      hint: 'Add the route to siteConfig navigation, remove the page, or omit --check-unreachable for intentional hidden pages.',
      message: `Markdown route is not referenced from siteConfig navigation: ${markdownFile.route}.`,
      route: markdownFile.route,
      severity: 'warning',
    })
  }
}

/**
 * Reads route-like values from siteConfig files without executing user application code.
 */
async function readSiteConfigRouteReferences(
  siteConfigRoot: string,
): Promise<SiteConfigRouteReference[]> {
  const files = await collectFiles(siteConfigRoot, (file) =>
    siteConfigExtensions.has(extname(file)),
  )
  const references = await Promise.all(
    files.map(async (absolutePath) => {
      const content = await fs.readFile(absolutePath, 'utf8')
      const maskedContent = maskSourceComments(content)
      const file = normalizeRelativePath(relative(siteConfigRoot, absolutePath))
      const references: SiteConfigRouteReference[] = []

      for (const match of maskedContent.matchAll(siteConfigRouteRegex)) {
        const value = match[2]
        const route = resolveSiteConfigRoute(value)

        if (route === undefined) {
          continue
        }

        references.push({
          file,
          line: lineNumberForIndex(content, match.index ?? 0),
          route,
          value,
        })
      }

      return references
    }),
  )

  return references.flat()
}

/**
 * Reports common browser-only globals in examples as SSG-safety warnings.
 */
async function checkSsgUnsafeExamples(
  examplesRoot: string,
  diagnostics: QPressCheckDiagnostic[],
): Promise<void> {
  if (!(await pathExists(examplesRoot))) {
    return
  }

  const exampleFiles = await collectFiles(examplesRoot, (file) =>
    sourceExtensions.has(extname(file)),
  )

  await Promise.all(
    exampleFiles.map(async (absolutePath) => {
      const content = await fs.readFile(absolutePath, 'utf8')
      const relativeFile = normalizeRelativePath(relative(examplesRoot, absolutePath))
      const lines = content.split(/\r?\n/)

      lines.forEach((line, index) => {
        if (!browserGlobalRegex.test(line) || guardedBrowserGlobalRegex.test(line)) {
          return
        }

        diagnostics.push({
          code: 'ssg-browser-global',
          file: relativeFile,
          hint: 'Guard browser-only code with typeof checks, onMounted, or another client-only boundary.',
          line: index + 1,
          message: 'Example appears to reference a browser-only global that can fail during SSG.',
          severity: 'warning',
        })
      })
    }),
  )
}

/**
 * Recursively collects files under a root using a caller-provided predicate.
 */
async function collectFiles(
  root: string,
  includeFile: (file: string) => boolean,
): Promise<string[]> {
  const files: string[] = []

  async function walk(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    await Promise.all(
      entries.map(async (entry) => {
        const absolutePath = join(directory, entry.name)

        if (entry.isDirectory()) {
          if (!skippedDirectories.has(entry.name)) {
            await walk(absolutePath)
          }

          return
        }

        if (entry.isFile() && includeFile(absolutePath)) {
          files.push(absolutePath)
        }
      }),
    )
  }

  await walk(root)

  return files.sort((left, right) => left.localeCompare(right))
}

/**
 * Checks whether a filesystem path exists.
 */
async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Reads simple YAML-style frontmatter keys.
 */
function readFrontmatter(content: string): Map<string, string> | undefined {
  const match = content.match(frontmatterRegex)

  if (match === null) {
    return undefined
  }

  const frontmatter = new Map<string, string>()

  for (const line of match[1].split(/\r?\n/)) {
    const keyValue = line.match(/^([a-zA-Z][\w-]*):\s*(.*)$/)

    if (keyValue !== null) {
      frontmatter.set(keyValue[1], keyValue[2].replace(/^['"]|['"]$/g, '').trim())
    }
  }

  return frontmatter
}

/**
 * Reads related-route entries from simple YAML-style frontmatter.
 */
function readRelatedFrontmatterRoutes(content: string): FrontmatterRouteReference[] {
  const match = content.match(frontmatterRegex)

  if (match === null) {
    return []
  }

  const frontmatterStartLine = lineNumberForIndex(content, match.index ?? 0)
  const references: FrontmatterRouteReference[] = []
  const lines = match[1].split(/\r?\n/)

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const relatedScalar = line.match(/^related:\s*(.+)$/)

    if (relatedScalar !== null) {
      addFrontmatterRouteReference(references, relatedScalar[1], frontmatterStartLine + index + 1)
      continue
    }

    if (!/^related:\s*$/.test(line)) {
      continue
    }

    for (let listIndex = index + 1; listIndex < lines.length; listIndex += 1) {
      const listLine = lines[listIndex]

      if (/^\S/.test(listLine)) {
        break
      }

      const item = listLine.match(/^\s*-\s+(.+)$/)

      if (item !== null) {
        addFrontmatterRouteReference(references, item[1], frontmatterStartLine + listIndex + 1)
      }
    }
  }

  return references
}

/**
 * Adds a normalized frontmatter route reference when the value is route-like.
 */
function addFrontmatterRouteReference(
  references: FrontmatterRouteReference[],
  value: string,
  line: number,
): void {
  const route = resolveFrontmatterRoute(value)

  if (route === undefined) {
    return
  }

  references.push({
    line,
    route,
    value: value.trim(),
  })
}

/**
 * Resolves a frontmatter route value into the route path used by Q-Press.
 */
function resolveFrontmatterRoute(value: string): string | undefined {
  const cleanValue = value.trim().replace(/^['"]|['"]$/g, '')

  if (
    cleanValue === '' ||
    cleanValue.startsWith('#') ||
    /^[a-z][a-z0-9+.-]*:/i.test(cleanValue) ||
    cleanValue.startsWith('//') ||
    hasStaticAssetExtension(cleanValue)
  ) {
    return undefined
  }

  return normalizeRoutePath(cleanValue.endsWith('.md') ? cleanValue.slice(0, -3) : cleanValue)
}

/**
 * Resolves a Markdown or HTML link to a route path when it points inside the docs app.
 */
function resolveInternalRoute(href: string, currentRoute: string): string | undefined {
  const cleanHref = href.trim().split('#')[0]?.split('?')[0] ?? ''

  if (
    cleanHref === '' ||
    cleanHref.startsWith('#') ||
    /^[a-z][a-z0-9+.-]*:/i.test(cleanHref) ||
    cleanHref.startsWith('//')
  ) {
    return undefined
  }

  if (hasStaticAssetExtension(cleanHref)) {
    return undefined
  }

  const routeHref = cleanHref.endsWith('.md') ? cleanHref.slice(0, -3) : cleanHref

  if (cleanHref.startsWith('/')) {
    return normalizeRoutePath(routeHref)
  }

  if (!routeHref.startsWith('.') && extname(routeHref) !== '') {
    return undefined
  }

  const baseRoute = currentRoute === '/' ? '/' : posix.dirname(currentRoute)

  return normalizeRoutePath(posix.join(baseRoute, routeHref))
}

/**
 * Resolves absolute internal siteConfig links into route paths.
 */
function resolveSiteConfigRoute(href: string): string | undefined {
  const cleanHref = href.trim().split('#')[0]?.split('?')[0] ?? ''

  if (
    cleanHref === '' ||
    cleanHref.startsWith('#') ||
    !cleanHref.startsWith('/') ||
    cleanHref.startsWith('//') ||
    /^[a-z][a-z0-9+.-]*:/i.test(cleanHref)
  ) {
    return undefined
  }

  if (hasStaticAssetExtension(cleanHref)) {
    return undefined
  }

  return normalizeRoutePath(cleanHref.endsWith('.md') ? cleanHref.slice(0, -3) : cleanHref)
}

/**
 * Normalizes routes for route-set lookup.
 */
function normalizeRoutePath(path: string): string {
  const route = path.startsWith('/') ? path : `/${path}`
  const normalized = posix.normalize(route)

  return normalized.length > 1 ? normalized.replace(/\/+$/, '') : '/'
}

/**
 * Detects links that likely point to files rather than routed pages.
 */
function hasStaticAssetExtension(path: string): boolean {
  const extension = extname(path)

  return extension !== '' && extension !== '.md'
}

/**
 * Checks whether a MarkdownExample source file exists.
 */
async function exampleExists(
  examplesRoot: string,
  examplesFolder: string,
  file: string,
): Promise<boolean> {
  const base = resolve(examplesRoot, examplesFolder)
  const candidates = extname(file) === '' ? [`${file}.vue`, file] : [file]

  for (const candidate of candidates) {
    if (await pathExists(resolve(base, candidate))) {
      return true
    }
  }

  return false
}

/**
 * Finds matches from multiple regexes while preserving match indexes.
 */
function findMatches(content: string, regexes: RegExp[]): { index: number; value: string }[] {
  return regexes.flatMap((regex) =>
    [...content.matchAll(regex)].map((match) => ({
      index: match.index ?? 0,
      value: match[1],
    })),
  )
}

/**
 * Calculates a 1-based line number for a character index.
 */
function lineNumberForIndex(content: string, index: number): number {
  return content.slice(0, index).split(/\r?\n/).length
}

/**
 * Normalizes relative paths for stable diagnostics across platforms.
 */
function normalizeRelativePath(path: string): string {
  return path.split(sep).join('/')
}

/**
 * Creates a minimal glob-style path matcher for explicit qpress check ignores.
 */
function createPathMatcher(pattern: string): (path: string) => boolean {
  const normalizedPattern = normalizeRelativePath(pattern).replace(/^\.\//, '')

  if (!normalizedPattern.includes('*')) {
    return (path) => path === normalizedPattern || path.endsWith(`/${normalizedPattern}`)
  }

  const doubleStarToken = '__QPRESS_DOUBLE_STAR__'
  const regexSource = escapeRegex(normalizedPattern)
    .replace(/\*\*/g, doubleStarToken)
    .replace(/\*/g, '[^/]*')
    .replaceAll(doubleStarToken, '.*')
  const regex = new RegExp(`^${regexSource}$`)

  return (path) => regex.test(path)
}

/**
 * Escapes a string for use in a regular expression.
 */
function escapeRegex(value: string): string {
  return value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
}

/**
 * Replaces Markdown code fences and inline code with whitespace while preserving line numbers.
 */
function maskMarkdownCode(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, maskNonNewlineCharacters)
    .replace(/~~~[\s\S]*?~~~/g, maskNonNewlineCharacters)
    .replace(/`[^`\n]*`/g, (match) => ' '.repeat(match.length))
}

/**
 * Replaces JavaScript/TypeScript comments with whitespace while preserving line numbers.
 */
function maskSourceComments(content: string): string {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, maskNonNewlineCharacters)
    .replace(/(^|[^:])\/\/.*$/gm, (match, prefix: string) => {
      return `${prefix}${' '.repeat(match.length - prefix.length)}`
    })
}

/**
 * Preserves newlines while hiding matched code content from structural checks.
 */
function maskNonNewlineCharacters(content: string): string {
  return content.replace(/[^\n]/g, ' ')
}

/**
 * Converts a Markdown file path into the route path generated by Q-Press conventions.
 */
function markdownFileToRoutePath(markdownFile: string, landingPage: string): string {
  const normalizedFile = markdownFile.replace(/\\/g, '/').replace(/^\.\//, '')
  const normalizedLandingPage = landingPage.replace(/\\/g, '/').replace(/^\.\//, '')

  if (normalizedFile === normalizedLandingPage) {
    return '/'
  }

  const routeParts = normalizedFile.replace(markdownExtensionRegex, '').split('/')
  const lastPart = routeParts.at(-1)
  const parentPart = routeParts.at(-2)

  if (routeParts.length > 1 && lastPart === parentPart) {
    routeParts.pop()
  }

  return `/${routeParts.join('/')}`
}

/**
 * Formats one diagnostic for terminal output.
 */
function formatDiagnostic(diagnostic: QPressCheckDiagnostic): string {
  const location = [
    diagnostic.file,
    diagnostic.line === undefined ? undefined : `line ${diagnostic.line}`,
    diagnostic.route,
  ]
    .filter((value): value is string => value !== undefined)
    .join(' ')
  const prefix = location === '' ? diagnostic.code : `${diagnostic.code} ${location}`
  const hint = diagnostic.hint === undefined ? '' : `\n  Hint: ${diagnostic.hint}`

  return `- ${prefix}\n  ${diagnostic.message}${hint}`
}
