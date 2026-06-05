import { access, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { escapeJsonForHtml, prerenderSsgRoutes } from '@md-plugins/vite-ssg-plugin'
import { renderToString } from '@vue/server-renderer'
import type {
  PrerenderSsgRoutesResult,
  SsgRoute,
  SsgRouteRenderContext,
} from '@md-plugins/vite-ssg-plugin'

type VueRenderTarget = Parameters<typeof renderToString>[0]

type QPressSsrMeta = {
  bodyAttrs?: string
  bodyClasses?: string
  bodyTags?: string
  endingHeadTags?: string
  headTags?: string
  htmlAttrs?: string
  runtimePageContent?: string
}

type QPressSsrContext = {
  _meta: QPressSsrMeta
  modules: Set<string>
  onRendered: (callback: () => unknown) => void
  rendered?: () => unknown
  req: {
    headers: Record<string, string>
    url: string
  }
  res: Record<string, unknown>
  state?: unknown
}

type QPressServerEntry = (
  ssrContext: QPressSsrContext,
) => Promise<VueRenderTarget> | VueRenderTarget

export interface PrerenderQPressSsgOptions {
  appHtmlFile?: string
  appMountId?: string
  manifestFile?: string
  outDir?: string
  ssrDir?: string
}

const defaultAppMountId = 'q-app'
const defaultOutDir = 'dist/spa'
const defaultSsrDir = 'dist/ssr'
const defaultServerEntry = 'server/server-entry.js'

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function assertFile(path: string, message: string): Promise<void> {
  try {
    await access(path)
  } catch {
    throw new Error(message)
  }
}

async function loadServerEntry(ssrDir: string): Promise<QPressServerEntry> {
  const serverEntryPath = join(ssrDir, defaultServerEntry)

  await assertFile(
    serverEntryPath,
    [
      `Could not find the Quasar SSR renderer at ${serverEntryPath}.`,
      'Build the renderer first with `pnpm build:ssg:renderer`.',
      'If this is the first SSR build for the app, run `quasar mode add ssr` once and then rebuild.',
    ].join(' '),
  )

  const module = (await import(pathToFileURL(serverEntryPath).href)) as {
    default?: QPressServerEntry
  }

  if (typeof module.default !== 'function') {
    throw new Error(
      `The Quasar SSR renderer at ${serverEntryPath} does not export a default render function.`,
    )
  }

  return module.default
}

function createSsrContext(route: SsgRoute, onRenderedList: Array<() => unknown>): QPressSsrContext {
  return {
    _meta: {
      bodyAttrs: '',
      bodyClasses: '',
      bodyTags: '',
      endingHeadTags: '',
      headTags: '',
      htmlAttrs: '',
      runtimePageContent: '',
    },
    modules: new Set(),
    onRendered(callback) {
      onRenderedList.push(callback)
    },
    req: {
      headers: {},
      url: route.path,
    },
    res: {},
  }
}

function createStateScript(state: unknown): string {
  const payload = escapeJsonForHtml(JSON.stringify(state))

  return `<script>window.__INITIAL_STATE__=${payload};document.currentScript.remove()</script>`
}

function injectAfterOpeningTag(html: string, tag: string, content: string | undefined): string {
  if (!content) {
    return html
  }

  const pattern = new RegExp(`<${tag}([^>]*)>`, 'i')

  return html.replace(pattern, `<${tag}$1>${content}`)
}

function injectBeforeClosingTag(html: string, tag: string, content: string | undefined): string {
  if (!content) {
    return html
  }

  const closeTag = `</${tag}>`

  return html.includes(closeTag)
    ? html.replace(closeTag, `${content}${closeTag}`)
    : `${html}${content}`
}

function appendOpeningTagAttrs(html: string, tag: string, attrs: string | undefined): string {
  const normalizedAttrs = attrs?.trim()

  if (!normalizedAttrs) {
    return html
  }

  const pattern = new RegExp(`<${tag}([^>]*)>`, 'i')

  return html.replace(pattern, `<${tag}$1 ${normalizedAttrs}>`)
}

function mergeBodyClasses(html: string, bodyClasses: string | undefined): string {
  if (!bodyClasses) {
    return html
  }

  if (/<body\b[^>]*\bclass=["'][^"']*["'][^>]*>/i.test(html)) {
    return html.replace(/(<body\b[^>]*\bclass=["'])([^"']*)(["'][^>]*>)/i, `$1$2 ${bodyClasses}$3`)
  }

  return html.replace(/<body\b([^>]*)>/i, `<body$1 class="${bodyClasses}">`)
}

function replaceMountElement(appHtml: string, renderedAppHtml: string, appMountId: string): string {
  const mountId = escapeRegExp(appMountId)
  const mountElementRE = new RegExp(
    `<([a-zA-Z][\\w:-]*)([^>]*\\bid=["']?${mountId}["']?[^>]*)>\\s*</\\1>`,
  )

  if (!mountElementRE.test(appHtml)) {
    throw new Error(`Could not find empty app mount element with id "${appMountId}".`)
  }

  return appHtml.replace(mountElementRE, `<$1$2>${renderedAppHtml}</$1>`)
}

function applySsrMeta(
  appHtml: string,
  ssrContext: QPressSsrContext,
  renderedAppHtml: string,
  appMountId: string,
): string {
  const stateScript = ssrContext.state === undefined ? '' : createStateScript(ssrContext.state)
  let html = replaceMountElement(appHtml, renderedAppHtml, appMountId)

  html = appendOpeningTagAttrs(html, 'html', ssrContext._meta.htmlAttrs)
  html = appendOpeningTagAttrs(html, 'body', ssrContext._meta.bodyAttrs)
  html = injectAfterOpeningTag(html, 'head', ssrContext._meta.headTags)
  html = injectBeforeClosingTag(html, 'head', ssrContext._meta.endingHeadTags)
  html = injectAfterOpeningTag(html, 'body', ssrContext._meta.bodyTags)
  html = injectBeforeClosingTag(html, 'body', stateScript)
  html = mergeBodyClasses(html, ssrContext._meta.bodyClasses)

  return html
}

async function renderRouteWithQuasarSsr(
  route: SsgRoute,
  context: SsgRouteRenderContext,
  serverEntry: QPressServerEntry,
  appMountId: string,
): Promise<string> {
  const onRenderedList: Array<() => unknown> = []
  const ssrContext = createSsrContext(route, onRenderedList)
  const renderFn = await serverEntry(ssrContext)
  const renderedAppHtml = await renderToString(renderFn, ssrContext)

  for (const callback of onRenderedList) {
    await callback()
  }

  await ssrContext.rendered?.()

  return applySsrMeta(context.appHtml, ssrContext, renderedAppHtml, appMountId)
}

export async function prerenderQPressSsg({
  appHtmlFile,
  appMountId = defaultAppMountId,
  manifestFile,
  outDir = defaultOutDir,
  ssrDir = defaultSsrDir,
}: PrerenderQPressSsgOptions = {}): Promise<PrerenderSsgRoutesResult> {
  const resolvedOutDir = resolve(outDir)
  const resolvedSsrDir = resolve(ssrDir)

  await assertFile(
    join(resolvedOutDir, appHtmlFile ?? 'index.html'),
    `Could not find a built SPA shell in ${resolvedOutDir}. Run \`quasar build\` first.`,
  )

  if (manifestFile !== undefined) {
    await assertFile(
      join(resolvedOutDir, manifestFile),
      `Could not find the SSG route manifest ${manifestFile} in ${resolvedOutDir}.`,
    )
  }

  if (manifestFile === undefined) {
    const fallbackManifest = join(resolvedOutDir, 'q-press-ssg-routes.json')

    await assertFile(
      fallbackManifest,
      `Could not find q-press-ssg-routes.json in ${resolvedOutDir}. Make sure viteSsgPlugin is enabled for the SPA build.`,
    )
  }

  const serverEntry = await loadServerEntry(resolvedSsrDir)

  // Warm the shell read early so missing appHtmlFile errors happen before route rendering starts.
  await readFile(join(resolvedOutDir, appHtmlFile ?? 'index.html'), 'utf8')

  return prerenderSsgRoutes({
    appHtmlFile,
    manifestFile,
    outDir: resolvedOutDir,
    renderRoute: (route, context) =>
      renderRouteWithQuasarSsr(route, context, serverEntry, appMountId),
  })
}
