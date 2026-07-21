import { Buffer } from 'node:buffer'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, posix as pathPosix, resolve } from 'node:path'
import {
  createSsgRouteManifest,
  defaultSsgAppShellFile,
  defaultSsgManifestFile,
  defaultSsgReportFile,
  isSsgRouteExcluded,
  isStaticSsgRoutePath,
  normalizeSsgRoute,
  normalizeSsgRoutePath,
} from './routes'
import { renderSsgRouteHtml } from './html'
import { resolveSsgOutDirFile } from './outputPaths'
import type {
  PrerenderSsgRoutesOptions,
  PrerenderSsgRoutesResult,
  PrerenderedSsgRoute,
  SkippedSsgRoute,
  SsgGenerationReport,
  SsgGenerationWarning,
  SsgGeneratedPage,
  SsgRoute,
  SsgRouteManifest,
} from './types'

/**
 * Returns whether an unknown error is a missing-file filesystem error.
 */
function isMissingFileError(error: unknown): boolean {
  return isRecord(error) && error.code === 'ENOENT'
}

/**
 * Reads the immutable app shell, creating it from the built SPA entry when it
 * does not exist yet. Existing snapshots are never overwritten by prerendering.
 */
async function readOrCreateAppShell(
  resolvedAppHtmlFile: string,
  resolvedAppShellFile: string,
): Promise<string> {
  try {
    return await readFile(resolvedAppShellFile, 'utf8')
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error
    }
  }

  const appHtml = await readFile(resolvedAppHtmlFile, 'utf8')

  await mkdir(dirname(resolvedAppShellFile), { recursive: true })
  await writeFile(resolvedAppShellFile, appHtml)

  return appHtml
}

/**
 * Reads the JSON SSG route manifest emitted by the Vite plugin.
 */
async function readSsgRouteManifest(
  outDir: string,
  manifestFile: string,
): Promise<SsgRouteManifest> {
  const manifestJson = await readFile(
    resolveSsgOutDirFile(outDir, manifestFile, 'SSG route manifest'),
    'utf8',
  )

  return JSON.parse(manifestJson) as SsgRouteManifest
}

/**
 * Joins an emitted asset path with the configured Vite base.
 */
function joinAssetHref(base: string, file: string): string {
  if (base === './') {
    return `./${file}`
  }

  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base.replace(/\/$/, '')}/${file}`
  }

  return `${base === '/' ? '' : base}/${file}`
}

/**
 * Recursively collects CSS assets from the built output directory.
 */
async function collectCssFiles(outDir: string, dir = 'assets'): Promise<string[]> {
  const entries = await readdir(join(outDir, dir), {
    withFileTypes: true,
  }).catch(() => [])
  const files: string[] = []

  for (const entry of entries) {
    const path = `${dir}/${entry.name}`

    if (entry.isDirectory()) {
      files.push(...(await collectCssFiles(outDir, path)))
    } else if (entry.isFile() && path.endsWith('.css')) {
      files.push(path)
    }
  }

  return files.sort()
}

/**
 * Adds stylesheet links that Vite emitted but did not include in the app shell.
 */
async function injectMissingCssAssets(
  appHtml: string,
  outDir: string,
  base: string,
): Promise<string> {
  const cssFiles = await collectCssFiles(outDir)
  const missingLinks = cssFiles
    .map((file) => joinAssetHref(base, file))
    .filter((href) => !appHtml.includes(`href="${href}"`) && !appHtml.includes(`href=${href}`))
    .map((href) => `<link rel="stylesheet" crossorigin href="${href}">`)

  if (missingLinks.length === 0) {
    return appHtml
  }

  const content = `${missingLinks.join('\n')}\n`

  return appHtml.includes('</head>')
    ? appHtml.replace('</head>', `${content}</head>`)
    : `${content}${appHtml}`
}

/**
 * Normalizes route rendering concurrency to a safe positive integer.
 */
function clampConcurrency(concurrency: number | undefined): number {
  return Math.max(1, Math.floor(concurrency ?? 1))
}

/**
 * Normalizes the optional delay between prerender batches.
 */
function clampInterval(interval: number | undefined): number {
  return Math.max(0, Math.floor(interval ?? 0))
}

/**
 * Pauses prerender execution for the requested number of milliseconds.
 */
function wait(milliseconds: number): Promise<void> {
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, milliseconds)
  })
}

/**
 * Narrows unknown values to plain object-like records.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Reads a redirect target from common redirect error shapes.
 */
function getRedirectTarget(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return undefined
  }

  return typeof error.url === 'string' ? error.url : undefined
}

/**
 * Detects common not-found error shapes thrown by renderers and routers.
 */
function isNotFoundError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false
  }

  return error.code === 404 || error.status === 404 || error.statusCode === 404
}

/**
 * Extracts literal anchor href values from prerendered HTML.
 */
function extractAnchorHrefs(html: string): string[] {
  const hrefs: string[] = []
  const anchorHrefRE = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi
  let match: RegExpExecArray | null

  while ((match = anchorHrefRE.exec(html))) {
    hrefs.push(match[2])
  }

  return hrefs
}

/**
 * Returns whether an href points outside the generated static site.
 */
function isExternalHref(href: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')
}

/**
 * Removes the configured base prefix from an absolute route path.
 */
function stripBaseFromPath(path: string, base: string): string {
  if (base === '/' || base === './' || base.startsWith('http://') || base.startsWith('https://')) {
    return path
  }

  const normalizedBase = normalizeSsgRoutePath(base)

  if (path === normalizedBase) {
    return '/'
  }

  return path.startsWith(`${normalizedBase}/`) ? path.slice(normalizedBase.length) : path
}

/**
 * Resolves a relative link target from the currently-rendered route path.
 */
function resolveHrefPath(hrefPath: string, fromRoutePath: string): string {
  if (hrefPath.startsWith('/')) {
    return hrefPath
  }

  const routeBase = fromRoutePath === '/' ? '/' : pathPosix.dirname(fromRoutePath)

  return pathPosix.normalize(pathPosix.join(routeBase, hrefPath))
}

/**
 * Converts an anchor href into an SSG route path when it targets a static route.
 */
function hrefToSsgRoutePath(href: string, base: string, fromRoutePath = '/'): string | undefined {
  const trimmed = href.trim()

  if (!trimmed || trimmed.startsWith('#') || isExternalHref(trimmed)) {
    return undefined
  }

  const withoutHash = trimmed.split('#')[0] ?? ''
  const withoutQuery = withoutHash.split('?')[0] ?? ''

  if (!withoutQuery || withoutQuery.startsWith('.')) {
    return undefined
  }

  try {
    const routePath = stripBaseFromPath(resolveHrefPath(withoutQuery, fromRoutePath), base)

    return isStaticSsgRoutePath(routePath) ? normalizeSsgRoutePath(routePath) : undefined
  } catch {
    return undefined
  }
}

/**
 * Finds internal route links in rendered HTML for optional crawl-based prerendering.
 */
function extractSsgRouteLinks(html: string, base: string, fromRoutePath: string): string[] {
  return Array.from(
    new Set(
      extractAnchorHrefs(html)
        .map((href) => hrefToSsgRoutePath(href, base, fromRoutePath))
        .filter((path): path is string => path !== undefined),
    ),
  )
}

/**
 * Creates the JSON report written after prerendering finishes.
 */
function createReport({
  generated,
  manifest,
  manifestFile,
  outDir,
  skipped,
  warnings,
}: {
  generated: PrerenderedSsgRoute[]
  manifest: SsgRouteManifest
  manifestFile: string
  outDir: string
  skipped: SkippedSsgRoute[]
  warnings: SsgGenerationWarning[]
}): SsgGenerationReport {
  return {
    generatedAt: new Date().toISOString(),
    outDir,
    manifestFile,
    routeCount: manifest.routes.length,
    generated,
    skipped,
    warnings,
  }
}

/**
 * Prerenders every route in an SSG manifest into static HTML files.
 *
 * The renderer can use the default HTML-shell mode, a custom route renderer, or
 * a framework-specific renderer such as the Vue adapter.
 */
export async function prerenderSsgRoutes({
  outDir,
  appHtmlFile = 'index.html',
  appShellFile = defaultSsgAppShellFile,
  manifestFile = defaultSsgManifestFile,
  manifest,
  transformManifest,
  exclude,
  concurrency,
  interval,
  crawlLinks = false,
  redirects = 'error',
  notFound = 'error',
  reportFile = defaultSsgReportFile,
  onRouteRendered,
  onPageGenerated,
  afterGenerate,
  renderRoute,
  transformHtml,
  injectRoutePayload,
}: PrerenderSsgRoutesOptions): Promise<PrerenderSsgRoutesResult> {
  const resolvedOutDir = resolve(outDir)
  const resolvedAppHtmlFile = resolveSsgOutDirFile(resolvedOutDir, appHtmlFile, 'SSG app HTML file')
  const resolvedAppShellFile = resolveSsgOutDirFile(
    resolvedOutDir,
    appShellFile,
    'SSG immutable app shell',
  )
  const resolvedManifestFile = resolveSsgOutDirFile(
    resolvedOutDir,
    manifestFile,
    'SSG route manifest',
  )
  const resolvedReportFile =
    reportFile === false
      ? undefined
      : resolveSsgOutDirFile(resolvedOutDir, reportFile, 'SSG generation report')

  if (resolvedAppShellFile === resolvedAppHtmlFile) {
    throw new Error('SSG appShellFile must differ from appHtmlFile so the shell stays immutable.')
  }

  if (
    resolvedAppShellFile === resolvedManifestFile ||
    resolvedAppShellFile === resolvedReportFile
  ) {
    throw new Error('SSG appShellFile must differ from manifestFile and reportFile.')
  }

  const loadedManifest = manifest ?? (await readSsgRouteManifest(resolvedOutDir, manifestFile))
  const rawManifest = (await transformManifest?.(loadedManifest)) ?? loadedManifest
  const resolvedManifest = createSsgRouteManifest(rawManifest.routes, {
    base: rawManifest.base,
    exclude,
  })
  const appHtml = await injectMissingCssAssets(
    await readOrCreateAppShell(resolvedAppHtmlFile, resolvedAppShellFile),
    resolvedOutDir,
    resolvedManifest.base,
  )
  const routes: PrerenderedSsgRoute[] = []
  const skipped: SkippedSsgRoute[] = rawManifest.routes
    .filter((route) => isSsgRouteExcluded(route.path, exclude ?? []))
    .map((route) => ({
      path: route.path,
      reason: 'excluded',
    }))
  const warnings: SsgGenerationWarning[] = []
  const queue = [...resolvedManifest.routes]
  const enqueuedPaths = new Set(queue.map((route) => route.path))
  const maxConcurrency = clampConcurrency(concurrency)
  const batchInterval = clampInterval(interval)

  /**
   * Adds a discovered route to the queue when it is not excluded or already known.
   */
  function enqueueRoute(routeInput: string | SsgRoute): SsgRoute | undefined {
    const route = normalizeSsgRoute(routeInput)

    if (isSsgRouteExcluded(route.path, exclude ?? []) || enqueuedPaths.has(route.path)) {
      return undefined
    }

    enqueuedPaths.add(route.path)
    resolvedManifest.routes.push(route)
    queue.push(route)

    return route
  }

  /**
   * Renders one route, writes its HTML file, and records timing/output metadata.
   */
  async function renderOne(route: SsgRoute): Promise<void> {
    const start = performance.now()
    const routeIndex = resolvedManifest.routes.findIndex((entry) => entry.path === route.path)
    const context = {
      appHtml,
      manifest: resolvedManifest,
      routeIndex,
    }

    try {
      let html = await renderSsgRouteHtml(route, context, {
        renderRoute,
        transformHtml,
        injectRoutePayload,
      })
      const renderedHtml = await onRouteRendered?.(html, route, context)

      if (typeof renderedHtml === 'string') {
        html = renderedHtml
      }

      if (crawlLinks) {
        for (const linkedRoute of extractSsgRouteLinks(html, resolvedManifest.base, route.path)) {
          enqueueRoute(linkedRoute)
        }
      }

      const htmlPath = resolveSsgOutDirFile(
        resolvedOutDir,
        route.htmlFile,
        `Generated HTML for route "${route.path}"`,
      )
      const page: SsgGeneratedPage = {
        route,
        html,
        htmlFile: route.htmlFile,
        filePath: htmlPath,
      }
      const pageUpdate = await onPageGenerated?.(page, context)
      const finalHtml = pageUpdate?.html ?? page.html
      const finalHtmlFile = pageUpdate?.htmlFile ?? page.htmlFile
      const resolvedHtmlFile = resolveSsgOutDirFile(
        resolvedOutDir,
        finalHtmlFile,
        `Generated HTML for route "${route.path}"`,
      )
      const finalFilePath =
        pageUpdate?.filePath === undefined
          ? resolvedHtmlFile
          : resolveSsgOutDirFile(
              resolvedOutDir,
              pageUpdate.filePath,
              `Generated file for route "${route.path}"`,
            )

      if (finalFilePath === resolvedAppShellFile) {
        throw new Error(
          `Generated file for route "${route.path}" cannot overwrite the immutable SSG app shell.`,
        )
      }

      await mkdir(dirname(finalFilePath), { recursive: true })
      await writeFile(finalFilePath, finalHtml)

      routes.push({
        path: route.path,
        htmlFile: finalHtmlFile,
        bytes: Buffer.byteLength(finalHtml),
        milliseconds: Math.round(performance.now() - start),
      })
    } catch (error) {
      const redirectTarget = getRedirectTarget(error)

      if (redirectTarget !== undefined) {
        if (redirects === 'follow') {
          const target = hrefToSsgRoutePath(redirectTarget, resolvedManifest.base, route.path)

          if (target) {
            enqueueRoute(target)
          }

          skipped.push({
            path: route.path,
            reason: 'redirected',
            target: target ?? redirectTarget,
          })
          return
        }

        if (redirects === 'skip') {
          skipped.push({
            path: route.path,
            reason: 'skipped-redirect',
            target: redirectTarget,
          })
          return
        }
      }

      if (isNotFoundError(error) && notFound === 'skip') {
        skipped.push({
          path: route.path,
          reason: 'not-found',
        })
        return
      }

      throw error
    }
  }

  while (queue.length > 0) {
    const batch = queue.splice(0, maxConcurrency)

    await Promise.all(batch.map((route) => renderOne(route)))

    if (queue.length > 0 && batchInterval > 0) {
      await wait(batchInterval)
    }
  }

  await writeFile(resolvedManifestFile, `${JSON.stringify(resolvedManifest, null, 2)}\n`)

  const report = createReport({
    generated: routes,
    manifest: resolvedManifest,
    manifestFile,
    outDir: resolvedOutDir,
    skipped,
    warnings,
  })

  if (resolvedReportFile !== undefined) {
    await writeFile(resolvedReportFile, `${JSON.stringify(report, null, 2)}\n`)
  }

  const result = {
    manifest: resolvedManifest,
    outDir: resolvedOutDir,
    routes,
    skipped,
    warnings,
    report,
  }

  await afterGenerate?.(result)

  return result
}
