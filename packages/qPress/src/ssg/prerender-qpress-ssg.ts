import { access, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import vuePlugin from '@vitejs/plugin-vue'
import { quasar as quasarVitePlugin } from '@quasar/vite-plugin'
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'
import { escapeJsonForHtml, prerenderSsgRoutes } from '@md-plugins/vite-ssg-plugin'
import { renderToString } from '@vue/server-renderer'
import { createServer } from 'vite'
import type {
  PrerenderSsgRoutesResult,
  SsgRoute,
  SsgRouteRenderContext,
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
  manifestFile?: string
  outDir?: string
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
const defaultSsgAppEntry = '.q-press/ssg/create-app.ts'

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

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

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

async function runRenderedCallbacks(appResult: VueSsgAppFactoryResult): Promise<void> {
  await appResult.onRendered?.()

  const ssrContext = appResult.ssrContext

  if (isRecord(ssrContext) && typeof ssrContext.rendered === 'function') {
    await ssrContext.rendered()
  }
}

async function pushRouterLocation(
  appResult: VueSsgAppFactoryResult,
  route: SsgRoute,
): Promise<void> {
  const router = appResult.router

  if (!router) {
    return
  }

  const location = appResult.routeLocation ?? route.path
  const navigate = router.replace ?? router.push

  if (navigate) {
    await navigate.call(router, location)
  }

  await router.isReady?.()
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

type QPressSsgCreateApp = (
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => Promise<VueSsgAppFactoryResult> | VueSsgAppFactoryResult

type QPressSsgCreateAppModule = {
  createQPressSsgApp?: QPressSsgCreateApp
}

type QPressSiteConfigModule = {
  sidebar?: MenuItem[]
}

function createAppRequire(appRoot: string): NodeRequire {
  return createRequire(join(appRoot, 'package.json'))
}

function resolveAppViteEntry(appRoot: string): string {
  return createAppRequire(appRoot).resolve('@quasar/app-vite')
}

function resolveQuasarServerEntry(appRoot: string): string {
  const quasarPackagePath = createAppRequire(appRoot).resolve('quasar/package.json')

  return join(dirname(quasarPackagePath), 'dist/quasar.server.prod.js')
}

function resolveQuasarClientEntry(appRoot: string): string {
  const quasarPackagePath = createAppRequire(appRoot).resolve('quasar/package.json')

  return join(dirname(quasarPackagePath), 'dist/quasar.client.js')
}

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

function isStyleRequest(source: string): boolean {
  return (
    /(?:\?|&)vue&type=style(?:&|$)/.test(source) ||
    /\.(?:css|less|sass|scss|styl|stylus|pcss|postcss)(?:$|\?)/.test(source)
  )
}

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

async function createQPressSourceRenderer(
  appRoot: string,
  srcDir: string,
  ssgAppEntry: string,
  appMountId: string,
): Promise<{
  close: () => Promise<void>
  renderRoute: (route: SsgRoute, context: SsgRouteRenderContext) => Promise<string>
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
      async renderRoute(route, context) {
        const appResult = await createApp(route, context)

        await pushRouterLocation(appResult, route)

        const renderedAppHtml = await renderToString(
          appResult.app as VueRenderTarget,
          appResult.ssrContext,
        )

        await runRenderedCallbacks(appResult)

        return applySsrMeta(
          context.appHtml,
          toQPressSsrContext(appResult.ssrContext),
          renderedAppHtml,
          appMountId,
        )
      },
    }
  } catch (error) {
    await viteServer.close()
    throw error
  }
}

export async function prerenderQPressSsg({
  appHtmlFile,
  appMountId = defaultAppMountId,
  manifestFile,
  outDir = defaultOutDir,
  renderer = 'qpress',
  srcDir = defaultSrcDir,
  ssgAppEntry = defaultSsgAppEntry,
  ssrDir = defaultSsrDir,
}: PrerenderQPressSsgOptions = {}): Promise<PrerenderSsgRoutesResult> {
  const resolvedOutDir = resolve(outDir)
  const resolvedSsrDir = resolve(ssrDir)
  const appRoot = resolve()
  const resolvedSrcDir = resolve(srcDir)
  const resolvedSsgAppEntry = resolve(resolvedSrcDir, ssgAppEntry)

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

  // Warm the shell read early so missing appHtmlFile errors happen before route rendering starts.
  await readFile(join(resolvedOutDir, appHtmlFile ?? 'index.html'), 'utf8')

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
        manifestFile,
        outDir: resolvedOutDir,
        renderRoute: sourceRenderer.renderRoute,
      })
    } finally {
      await sourceRenderer.close()
    }
  }

  const serverEntry = await loadServerEntry(resolvedSsrDir)

  return prerenderSsgRoutes({
    appHtmlFile,
    manifestFile,
    outDir: resolvedOutDir,
    renderRoute: (route, context) =>
      renderRouteWithQuasarSsr(route, context, serverEntry, appMountId),
  })
}
