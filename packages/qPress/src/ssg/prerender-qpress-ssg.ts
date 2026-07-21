import { access } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import vuePlugin from '@vitejs/plugin-vue'
import { quasar as quasarVitePlugin } from '@quasar/vite-plugin'
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'
import {
  createSsgRouteManifest,
  createVueSsgRouteRenderer,
  escapeJsonForHtml,
  flattenStaticSsgRouterRoutes,
  prerenderSsgRoutes,
  replaceSsgMountElement,
} from '@md-plugins/vite-ssg-plugin'
import { renderToString } from '@vue/server-renderer'
import { createServer } from 'vite'
import type {
  PrerenderSsgRoutesResult,
  SsgRouteExclusion,
  SsgRoute,
  SsgRouteInput,
  SsgRouteManifest,
  SsgRouteRenderContext,
  SsgRouteRenderer,
  VueSsgAppFactoryResult,
} from '@md-plugins/vite-ssg-plugin'
import type { MenuItem } from '@md-plugins/vite-md-plugin'
import type { Plugin, ViteDevServer } from 'vite'

type VueRenderTarget = Parameters<typeof renderToString>[0]
type QPressSsgRenderer = 'qpress' | 'quasar-ssr'

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
  concurrency?: number
  crawlLinks?: boolean
  exclude?: SsgRouteExclusion[]
  includeRouterRoutes?: boolean
  interval?: number
  manifestFile?: string
  notFound?: 'error' | 'skip'
  outDir?: string
  redirects?: 'error' | 'follow' | 'skip'
  reportFile?: string | false
  routerRoutesEntry?: string
  ssrDir?: string
  renderer?: QPressSsgRenderer
  srcDir?: string
  ssgAppEntry?: string
}

const defaultAppMountId = 'q-app'
const defaultOutDir = 'dist/spa'
const defaultSsrDir = 'dist/ssr'
const defaultServerEntry = 'server/server-entry.js'
const defaultSrcDir = 'src'
const defaultRouterRoutesEntry = 'router/routes.ts'
const defaultSsgAppEntry = '.q-press/ssg/create-app.ts'

/**
 * Asserts that a required file exists before prerendering continues.
 */
async function assertFile(path: string, message: string): Promise<void> {
  try {
    await access(path)
  } catch {
    throw new Error(message)
  }
}

/**
 * Loads the compiled Quasar SSR server entry for renderer-backed prerendering.
 */
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

/**
 * Checks whether a path is available without throwing.
 */
async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Creates the minimal Quasar SSR context needed to render a route.
 */
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

/**
 * Narrows unknown values to object-like records.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * Normalizes unknown SSR context data into the Q-Press context shape.
 */
function toQPressSsrContext(value: unknown): QPressSsrContext {
  const context = isRecord(value) ? value : {}
  const meta = isRecord(context._meta) ? context._meta : {}
  const req = isRecord(context.req) ? context.req : {}

  return {
    _meta: meta,
    modules: context.modules instanceof Set ? context.modules : new Set<string>(),
    onRendered:
      typeof context.onRendered === 'function'
        ? (context.onRendered as (callback: () => unknown) => void)
        : () => undefined,
    req: {
      headers: isRecord(req.headers) ? (req.headers as Record<string, string>) : {},
      url: typeof req.url === 'string' ? req.url : '',
    },
    res: isRecord(context.res) ? context.res : {},
    ...(Object.hasOwn(context, 'rendered') && typeof context.rendered === 'function'
      ? { rendered: context.rendered as () => unknown }
      : {}),
    ...(Object.hasOwn(context, 'state') ? { state: context.state } : {}),
  }
}

/**
 * Serializes Pinia/SSR state into the HTML shell safely.
 */
function createStateScript(state: unknown): string {
  const payload = escapeJsonForHtml(JSON.stringify(state))

  return `<script>window.__INITIAL_STATE__=${payload};document.currentScript.remove()</script>`
}

/**
 * Injects content immediately after an opening HTML tag when content exists.
 */
function injectAfterOpeningTag(html: string, tag: string, content: string | undefined): string {
  if (!content) {
    return html
  }

  const pattern = new RegExp(`<${tag}([^>]*)>`, 'i')

  return html.replace(pattern, `<${tag}$1>${content}`)
}

/**
 * Injects content immediately before a closing HTML tag when content exists.
 */
function injectBeforeClosingTag(html: string, tag: string, content: string | undefined): string {
  if (!content) {
    return html
  }

  const closeTag = `</${tag}>`

  return html.includes(closeTag)
    ? html.replace(closeTag, `${content}${closeTag}`)
    : `${html}${content}`
}

/**
 * Appends SSR-provided attributes to an opening HTML tag.
 */
function appendOpeningTagAttrs(html: string, tag: string, attrs: string | undefined): string {
  const normalizedAttrs = attrs?.trim()

  if (!normalizedAttrs) {
    return html
  }

  const pattern = new RegExp(`<${tag}([^>]*)>`, 'i')

  return html.replace(pattern, `<${tag}$1 ${normalizedAttrs}>`)
}

/**
 * Merges SSR-provided body classes with any classes already present on `<body>`.
 */
function mergeBodyClasses(html: string, bodyClasses: string | undefined): string {
  if (!bodyClasses) {
    return html
  }

  if (/<body\b[^>]*\bclass=["'][^"']*["'][^>]*>/i.test(html)) {
    return html.replace(/(<body\b[^>]*\bclass=["'])([^"']*)(["'][^>]*>)/i, `$1$2 ${bodyClasses}$3`)
  }

  return html.replace(/<body\b([^>]*)>/i, `<body$1 class="${bodyClasses}">`)
}

/**
 * Applies Quasar SSR meta output and initial state to the built app HTML shell.
 */
function applySsrMeta(
  appHtml: string,
  ssrContext: QPressSsrContext,
  renderedAppHtml: string,
  appMountId: string,
): string {
  const stateScript = ssrContext.state === undefined ? '' : createStateScript(ssrContext.state)
  let html = replaceSsgMountElement(appHtml, renderedAppHtml, appMountId)

  html = appendOpeningTagAttrs(html, 'html', ssrContext._meta.htmlAttrs)
  html = appendOpeningTagAttrs(html, 'body', ssrContext._meta.bodyAttrs)
  html = injectAfterOpeningTag(html, 'head', ssrContext._meta.headTags)
  html = injectBeforeClosingTag(html, 'head', ssrContext._meta.endingHeadTags)
  html = injectAfterOpeningTag(html, 'body', ssrContext._meta.bodyTags)
  html = injectBeforeClosingTag(html, 'body', stateScript)
  html = mergeBodyClasses(html, ssrContext._meta.bodyClasses)

  return html
}

type QPressSsgCreateApp = (
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => Promise<VueSsgAppFactoryResult> | VueSsgAppFactoryResult

/**
 * Adapts a Q-Press app factory to the generic Vue SSG route renderer.
 */
function createQPressVueSsgRouteRenderer(
  createApp: QPressSsgCreateApp,
  appMountId: string,
): SsgRouteRenderer {
  return createVueSsgRouteRenderer({
    createApp,
    renderToString: (app, ssrContext) =>
      renderToString(app as VueRenderTarget, ssrContext as QPressSsrContext | undefined),
    appMountId,
    useRouterReplace: true,
    replaceAppHtml(appHtml, renderedAppHtml, _route, _context, appResult) {
      return applySsrMeta(
        appHtml,
        toQPressSsrContext(appResult.ssrContext),
        renderedAppHtml,
        appMountId,
      )
    },
  })
}

/**
 * Adapts a compiled Quasar SSR server entry to the generic Vue SSG renderer.
 */
function createQuasarSsrRouteRenderer(
  serverEntry: QPressServerEntry,
  appMountId: string,
): SsgRouteRenderer {
  return createQPressVueSsgRouteRenderer(async (route) => {
    const onRenderedList: Array<() => unknown> = []
    const ssrContext = createSsrContext(route, onRenderedList)

    return {
      app: await serverEntry(ssrContext),
      ssrContext,
      async onRendered() {
        for (const callback of onRenderedList) {
          await callback()
        }
      },
    }
  }, appMountId)
}

type QPressSsgCreateAppModule = {
  createQPressSsgApp?: QPressSsgCreateApp
}

type QPressSiteConfigModule = {
  sidebar?: MenuItem[]
}

/**
 * Creates a Node require function rooted at the consuming app.
 */
function createAppRequire(appRoot: string): NodeRequire {
  return createRequire(join(appRoot, 'package.json'))
}

/**
 * Resolves the consuming app's @quasar/app-vite package entry.
 */
function resolveAppViteEntry(appRoot: string): string {
  return createAppRequire(appRoot).resolve('@quasar/app-vite')
}

/**
 * Resolves Quasar's server build for source-mode SSG rendering.
 */
function resolveQuasarServerEntry(appRoot: string): string {
  const quasarPackagePath = createAppRequire(appRoot).resolve('quasar/package.json')

  return join(dirname(quasarPackagePath), 'dist/quasar.server.prod.js')
}

/**
 * Resolves Quasar's client build so it can be aliased to the server build.
 */
function resolveQuasarClientEntry(appRoot: string): string {
  const quasarPackagePath = createAppRequire(appRoot).resolve('quasar/package.json')

  return join(dirname(quasarPackagePath), 'dist/quasar.client.js')
}

/**
 * Creates Vite aliases required to load a Q-Press app source tree in SSR mode.
 */
function createAliasEntries(
  appRoot: string,
  srcDir: string,
): Array<{ find: string | RegExp; replacement: string }> {
  const appViteEntry = resolveAppViteEntry(appRoot)
  const quasarServerEntry = resolveQuasarServerEntry(appRoot)

  return [
    {
      find: '@',
      replacement: srcDir,
    },
    {
      find: /^quasar$/,
      replacement: quasarServerEntry,
    },
    {
      find: /^quasar\/dist\/quasar\.client\.js$/,
      replacement: quasarServerEntry,
    },
    {
      find: /^src\//,
      replacement: `${srcDir}/`,
    },
    {
      find: /^app\//,
      replacement: `${appRoot}/`,
    },
    {
      find: /^#q-app$/,
      replacement: appViteEntry,
    },
  ]
}

/**
 * Forces Quasar client imports to resolve to the server runtime while prerendering.
 */
function createQuasarServerAliasPlugin(appRoot: string): Plugin {
  const quasarServerEntry = resolveQuasarServerEntry(appRoot)
  const quasarClientEntry = resolveQuasarClientEntry(appRoot)

  return {
    name: 'qpress-ssg-quasar-server-alias',
    enforce: 'pre',
    resolveId(source) {
      return source === 'quasar' ||
        source === 'quasar/dist/quasar.client.js' ||
        source === quasarClientEntry
        ? quasarServerEntry
        : undefined
    },
  }
}

/**
 * Detects stylesheet imports that should be ignored by the source SSG server.
 */
function isStyleRequest(source: string): boolean {
  return (
    /(?:\?|&)vue&type=style(?:&|$)/.test(source) ||
    /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss)(?:$|\?)/.test(source)
  )
}

/**
 * Creates a Vite plugin that stubs styles during source-mode SSG rendering.
 */
function createSsgStyleStubPlugin(): Plugin {
  const styleStubId = '\0qpress-ssg-style-stub'

  return {
    name: 'qpress-ssg-style-stub',
    enforce: 'pre',
    load(id) {
      return id === styleStubId ? 'export default ""' : undefined
    },
    resolveId(source) {
      return isStyleRequest(source) ? styleStubId : undefined
    },
  }
}

/**
 * Loads the app's Q-Press sidebar config for Markdown page metadata.
 */
async function loadSiteConfigSidebar(
  viteServer: ViteDevServer,
  srcDir: string,
): Promise<MenuItem[]> {
  const siteConfigPath = join(srcDir, 'siteConfig/index.ts')

  if (!(await pathExists(siteConfigPath))) {
    return []
  }

  const siteConfig = (await viteServer.ssrLoadModule(siteConfigPath)) as QPressSiteConfigModule

  return Array.isArray(siteConfig.sidebar) ? siteConfig.sidebar : []
}

/**
 * Loads static Vue Router route paths that should also be prerendered.
 */
async function loadRouterSsgRoutes(
  viteServer: ViteDevServer,
  routerRoutesEntry: string,
): Promise<string[]> {
  if (!(await pathExists(routerRoutesEntry))) {
    return []
  }

  const routesModule = (await viteServer.ssrLoadModule(routerRoutesEntry)) as {
    default?: unknown
  }

  return Array.isArray(routesModule.default)
    ? flattenStaticSsgRouterRoutes(routesModule.default)
    : []
}

/**
 * Adds discovered router routes to the manifest without duplicating Markdown routes.
 */
function mergeRouterRoutesIntoManifest(
  manifest: SsgRouteManifest,
  routerRoutes: string[],
): SsgRouteManifest {
  const knownRoutePaths = new Set(manifest.routes.map((route) => route.path))
  const routeInputs: SsgRouteInput[] = [
    ...manifest.routes,
    ...routerRoutes.filter((route) => !knownRoutePaths.has(route)),
  ]

  return createSsgRouteManifest(routeInputs, {
    base: manifest.base,
  })
}

/**
 * Creates the temporary Vite SSR server used to render Q-Press source files.
 */
async function createQPressSsgViteServer(appRoot: string, srcDir: string): Promise<ViteDevServer> {
  const markdownRoot = join(srcDir, 'markdown')

  return createServer({
    appType: 'custom',
    configFile: false,
    logLevel: 'error',
    plugins: [
      createQuasarServerAliasPlugin(appRoot),
      createSsgStyleStubPlugin(),
      viteMdPlugin({
        path: markdownRoot,
        menu: [],
      }) as Plugin,
      vuePlugin({
        include: [/\.(vue|md)$/],
      }) as Plugin,
      quasarVitePlugin() as Plugin,
    ],
    resolve: {
      alias: createAliasEntries(appRoot, srcDir),
    },
    server: {
      middlewareMode: true,
    },
    ssr: {
      noExternal: ['quasar'],
    },
    define: {
      __QUASAR_SSR__: 'true',
      __QUASAR_SSR_CLIENT__: 'false',
      __QUASAR_SSR_PWA__: 'false',
      __QUASAR_SSR_SERVER__: 'true',
      'import.meta.env.QUASAR_CLIENT': 'false',
      'import.meta.env.QUASAR_MODE': JSON.stringify('ssg'),
      'import.meta.env.QUASAR_SERVER': 'true',
      'import.meta.env.QUASAR_VUE_ROUTER_BASE': JSON.stringify('/'),
      'import.meta.env.QUASAR_VUE_ROUTER_MODE': JSON.stringify('history'),
    },
  })
}

/**
 * Loads the generated Q-Press SSG app factory from the consuming project.
 */
async function loadQPressSsgCreateApp(
  viteServer: ViteDevServer,
  ssgAppEntry: string,
): Promise<QPressSsgCreateApp> {
  const module = (await viteServer.ssrLoadModule(ssgAppEntry)) as QPressSsgCreateAppModule

  if (typeof module.createQPressSsgApp !== 'function') {
    throw new Error(
      `The Q-Press SSG app entry at ${ssgAppEntry} does not export createQPressSsgApp().`,
    )
  }

  return module.createQPressSsgApp
}

/**
 * Creates the source-mode renderer used by the default qpress-ssg command.
 */
async function createQPressSourceRenderer(
  appRoot: string,
  srcDir: string,
  ssgAppEntry: string,
  appMountId: string,
): Promise<{
  close: () => Promise<void>
  discoverRoutes: (routerRoutesEntry: string) => Promise<string[]>
  renderRoute: SsgRouteRenderer
}> {
  await assertFile(
    ssgAppEntry,
    [
      `Could not find the Q-Press SSG app entry at ${ssgAppEntry}.`,
      'Run the Q-Press update script so src/.q-press/ssg/create-app.ts is available,',
      'or use `qpress-ssg --renderer quasar-ssr` with a built Quasar SSR renderer.',
    ].join(' '),
  )

  const viteServer = await createQPressSsgViteServer(appRoot, srcDir)

  try {
    const sidebar = await loadSiteConfigSidebar(viteServer, srcDir)
    const markdownRoot = join(srcDir, 'markdown')

    // viteMdPlugin stores its transform config in module state; refresh it after
    // loading the app's siteConfig so Markdown pages get the real sidebar metadata.
    viteMdPlugin({
      path: markdownRoot,
      menu: sidebar,
    })

    const createApp = await loadQPressSsgCreateApp(viteServer, ssgAppEntry)

    return {
      close: () => viteServer.close(),
      discoverRoutes: (routerRoutesEntry) => loadRouterSsgRoutes(viteServer, routerRoutesEntry),
      renderRoute: createQPressVueSsgRouteRenderer(createApp, appMountId),
    }
  } catch (error) {
    await viteServer.close()
    throw error
  }
}

/**
 * Prerenders a Q-Press docs app into static route HTML.
 */
export async function prerenderQPressSsg({
  appHtmlFile,
  appMountId = defaultAppMountId,
  concurrency,
  crawlLinks,
  exclude,
  includeRouterRoutes = true,
  interval,
  manifestFile,
  notFound = 'skip',
  outDir = defaultOutDir,
  redirects = 'follow',
  reportFile,
  renderer = 'qpress',
  routerRoutesEntry = defaultRouterRoutesEntry,
  srcDir = defaultSrcDir,
  ssgAppEntry = defaultSsgAppEntry,
  ssrDir = defaultSsrDir,
}: PrerenderQPressSsgOptions = {}): Promise<PrerenderSsgRoutesResult> {
  const resolvedOutDir = resolve(outDir)
  const resolvedSsrDir = resolve(ssrDir)
  const appRoot = resolve()
  const resolvedSrcDir = resolve(srcDir)
  const resolvedSsgAppEntry = resolve(resolvedSrcDir, ssgAppEntry)
  const resolvedRouterRoutesEntry = resolve(resolvedSrcDir, routerRoutesEntry)

  if (renderer === 'qpress') {
    const sourceRenderer = await createQPressSourceRenderer(
      appRoot,
      resolvedSrcDir,
      resolvedSsgAppEntry,
      appMountId,
    )

    try {
      return await prerenderSsgRoutes({
        appHtmlFile,
        concurrency,
        crawlLinks,
        exclude,
        interval,
        manifestFile,
        notFound,
        outDir: resolvedOutDir,
        redirects,
        reportFile,
        renderRoute: sourceRenderer.renderRoute,
        transformManifest: includeRouterRoutes
          ? async (manifest) =>
              mergeRouterRoutesIntoManifest(
                manifest,
                await sourceRenderer.discoverRoutes(resolvedRouterRoutesEntry),
              )
          : undefined,
      })
    } finally {
      await sourceRenderer.close()
    }
  }

  const serverEntry = await loadServerEntry(resolvedSsrDir)

  return prerenderSsgRoutes({
    appHtmlFile,
    concurrency,
    crawlLinks,
    exclude,
    interval,
    manifestFile,
    notFound,
    outDir: resolvedOutDir,
    redirects,
    reportFile,
    renderRoute: createQuasarSsrRouteRenderer(serverEntry, appMountId),
  })
}
