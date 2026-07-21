export type MaybePromise<T> = T | Promise<T>

export type JsonPrimitive = string | number | boolean | null

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export type SsgRouteParams = Record<string, JsonPrimitive | undefined>

export type SsgRouteMeta = Record<string, JsonValue | undefined>

export interface SsgRouteObject {
  path: string
  meta?: SsgRouteMeta
  params?: SsgRouteParams
  data?: JsonValue
}

export type SsgRouteInput = string | SsgRouteObject

export interface SsgRoute {
  path: string
  htmlFile: string
  id: string
  meta: SsgRouteMeta
  params: SsgRouteParams
  data?: JsonValue
}

export interface SsgRouteManifest {
  base: string
  routes: SsgRoute[]
}

export type SsgManifestTransformer = (
  manifest: SsgRouteManifest,
) => MaybePromise<SsgRouteManifest | void>

export type SsgRouteSource = SsgRouteInput[] | (() => MaybePromise<SsgRouteInput[]>)

export type SsgRouteExclusion = string | RegExp

export interface MarkdownSsgRoutesOptions {
  /**
   * Directory containing Markdown pages.
   */
  root: string

  /**
   * Glob pattern or patterns to include.
   */
  include?: string | string[]

  /**
   * Glob pattern or patterns to exclude.
   */
  exclude?: string | string[]

  /**
   * Markdown file that should map to the site root.
   */
  landingPage?: string
}

export interface SsgRouteRenderContext {
  appHtml: string
  manifest: SsgRouteManifest
  routeIndex: number
}

export type SsgRouteRenderer = (
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<string | undefined>

export type SsgRouteHtmlTransformer = (
  html: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<string>

export interface SsgRouteHtmlOptions {
  /**
   * Optional per-route HTML renderer. Returning undefined falls back to the app shell.
   */
  renderRoute?: SsgRouteRenderer

  /**
   * Optional per-route HTML transform after rendering or app-shell fallback.
   */
  transformHtml?: SsgRouteHtmlTransformer

  /**
   * Injects a JSON payload for the current SSG route into generated HTML.
   */
  injectRoutePayload?: boolean
}

export interface PrerenderSsgRoutesOptions extends SsgRouteHtmlOptions {
  /**
   * Built output directory containing the app shell and route manifest.
   */
  outDir: string

  /**
   * Built HTML file used as the app shell. Defaults to index.html.
   */
  appHtmlFile?: string

  /**
   * Build asset path for the generated route manifest.
   */
  manifestFile?: string

  /**
   * Manifest to use instead of reading one from disk.
   */
  manifest?: SsgRouteManifest

  /**
   * Optional manifest transform after loading and before normalization.
   */
  transformManifest?: SsgManifestTransformer

  /**
   * Routes to skip while prerendering. String values are matched after route
   * normalization; RegExp values are tested against normalized route paths.
   */
  exclude?: SsgRouteExclusion[]

  /**
   * Number of routes to prerender at the same time. Defaults to 1.
   */
  concurrency?: number

  /**
   * Milliseconds to wait between prerender batches. Defaults to 0.
   */
  interval?: number

  /**
   * Crawl rendered HTML for safe internal links and enqueue missing routes.
   * Defaults to false.
   */
  crawlLinks?: boolean

  /**
   * Redirect behavior for renderer errors with a string `url` property.
   * Defaults to error to preserve strict generic behavior.
   */
  redirects?: 'error' | 'follow' | 'skip'

  /**
   * Not-found behavior for renderer errors with code/status/statusCode 404.
   * Defaults to error to preserve strict generic behavior.
   */
  notFound?: 'error' | 'skip'

  /**
   * Optional JSON report file written inside outDir. Defaults to
   * q-press-ssg-report.json. Pass false to disable report output.
   */
  reportFile?: string | false

  /**
   * Hook after a route is rendered and transformed, before crawling and writing.
   */
  onRouteRendered?: SsgRouteRenderedHook

  /**
   * Hook before a generated page is written. Can adjust html and output path.
   */
  onPageGenerated?: SsgPageGeneratedHook

  /**
   * Hook after all routes have completed and the report has been assembled.
   */
  afterGenerate?: SsgAfterGenerateHook
}

export interface PrerenderedSsgRoute {
  path: string
  htmlFile: string
  bytes: number
  milliseconds?: number
}

export interface SkippedSsgRoute {
  path: string
  reason: 'excluded' | 'not-found' | 'redirected' | 'skipped-redirect'
  target?: string
}

export interface SsgGenerationWarning {
  path: string
  message: string
}

export interface SsgGenerationReport {
  generatedAt: string
  outDir: string
  manifestFile: string
  routeCount: number
  generated: PrerenderedSsgRoute[]
  skipped: SkippedSsgRoute[]
  warnings: SsgGenerationWarning[]
}

export interface PrerenderSsgRoutesResult {
  manifest: SsgRouteManifest
  outDir: string
  routes: PrerenderedSsgRoute[]
  skipped: SkippedSsgRoute[]
  warnings: SsgGenerationWarning[]
  report?: SsgGenerationReport
}

export interface SsgGeneratedPage {
  route: SsgRoute
  html: string
  htmlFile: string
  filePath: string
}

export type SsgRouteRenderedHook = (
  html: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<string | void>

export type SsgPageGeneratedHook = (
  page: SsgGeneratedPage,
  context: SsgRouteRenderContext,
) => MaybePromise<Partial<Pick<SsgGeneratedPage, 'html' | 'htmlFile' | 'filePath'>> | void>

export type SsgAfterGenerateHook = (
  result: Omit<PrerenderSsgRoutesResult, 'report'> & { report: SsgGenerationReport },
) => MaybePromise<void>

export interface VueSsgRouterAdapter {
  push?: (location: unknown) => MaybePromise<unknown>
  replace?: (location: unknown) => MaybePromise<unknown>
  isReady?: () => MaybePromise<unknown>
}

export interface VueSsgAppFactoryResult {
  app: unknown
  router?: VueSsgRouterAdapter
  ssrContext?: Record<string, unknown>
  routeLocation?: unknown
  onRendered?: () => MaybePromise<void>
}

export type VueSsgAppFactory = (
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<VueSsgAppFactoryResult | unknown>

export type VueSsgRenderToString = (
  app: unknown,
  ssrContext?: Record<string, unknown>,
) => MaybePromise<string>

export type VueSsgRouteLocationResolver = (
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => unknown

export type VueSsgAppHtmlReplacer = (
  appHtml: string,
  renderedAppHtml: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
  appResult: VueSsgAppFactoryResult,
) => MaybePromise<string>

export type VueSsgRenderedAppHtmlTransformer = (
  renderedAppHtml: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<string>

export interface VueSsgRouteRendererOptions {
  /**
   * Creates a fresh Vue/Quasar SSR app instance for each route.
   */
  createApp: VueSsgAppFactory

  /**
   * Optional renderer. Defaults to lazy-loading @vue/server-renderer when used.
   */
  renderToString?: VueSsgRenderToString

  /**
   * DOM id for the app mount element in the built shell. Defaults to q-app.
   */
  appMountId?: string

  /**
   * Route location pushed into the returned router before rendering.
   */
  routeLocation?: VueSsgRouteLocationResolver

  /**
   * Use router.replace instead of router.push when both are available.
   */
  useRouterReplace?: boolean

  /**
   * Optional transform for the SSR-rendered app fragment before shell insertion.
   */
  transformRenderedAppHtml?: VueSsgRenderedAppHtmlTransformer

  /**
   * Optional full shell replacer for projects with a custom app placeholder.
   */
  replaceAppHtml?: VueSsgAppHtmlReplacer
}

export interface PrerenderVueSsgRoutesOptions
  extends Omit<PrerenderSsgRoutesOptions, 'renderRoute'>, VueSsgRouteRendererOptions {}

export interface ViteSsgPluginOptions {
  /**
   * Enables manifest emission. The virtual module remains available either way.
   */
  enabled?: boolean

  /**
   * Static route declarations or a function that resolves them.
   */
  routes?: SsgRouteSource

  /**
   * Routes to exclude from the generated manifest.
   */
  exclude?: SsgRouteExclusion[]

  /**
   * Optional Markdown route discovery. This can be combined with explicit routes.
   */
  markdown?: MarkdownSsgRoutesOptions

  /**
   * Base path used by the generated route manifest.
   * Falls back to Vite's resolved base.
   */
  base?: string

  /**
   * Emits static HTML files for each route. Defaults to true.
   */
  emitHtml?: boolean

  /**
   * Built HTML file used as the app shell. Defaults to index.html.
   */
  appHtmlFile?: string

  /**
   * Optional per-route HTML renderer/transform behavior.
   */
  renderRoute?: SsgRouteHtmlOptions['renderRoute']
  transformHtml?: SsgRouteHtmlOptions['transformHtml']
  injectRoutePayload?: SsgRouteHtmlOptions['injectRoutePayload']

  /**
   * Build asset path for the generated route manifest.
   */
  manifestFile?: string

  /**
   * Virtual module id used to import the generated route manifest.
   */
  virtualModuleId?: string
}
