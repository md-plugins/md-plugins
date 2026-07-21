---
title: Vite SSG Plugin Advanced Topics
desc: Advanced route, renderer, and local proving guidance for the Vite SSG Plugin.
related:
  - vite-plugins/vite-ssg-plugin/overview
  - vite-plugins/vite-examples-plugin/advanced
  - quasar-app-extensions/qpress/advanced
---

The `viteSsgPlugin` is split into small pieces so projects can adopt the parts they need: route
inventory, static shell output, custom HTML rendering, or Vue/Quasar build-time prerendering.

## Type Information

```ts
import type { Plugin } from 'vite'

type MaybePromise<T> = T | Promise<T>

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
type SsgRouteParams = Record<string, JsonPrimitive | undefined>
type SsgRouteMeta = Record<string, JsonValue | undefined>

interface SsgRouteObject {
  path: string
  meta?: SsgRouteMeta
  params?: SsgRouteParams
  data?: JsonValue
}

type SsgRouteInput = string | SsgRouteObject
type SsgRouteExclusion = string | RegExp

interface SsgRoute {
  path: string
  htmlFile: string
  id: string
  meta: SsgRouteMeta
  params: SsgRouteParams
  data?: JsonValue
}

interface SsgRouteManifest {
  base: string
  routes: SsgRoute[]
}

type SsgManifestTransformer = (manifest: SsgRouteManifest) => MaybePromise<SsgRouteManifest | void>

type SsgRouteSource = SsgRouteInput[] | (() => MaybePromise<SsgRouteInput[]>)

interface SsgRouterRouteLike {
  path?: string
  children?: SsgRouterRouteLike[]
}

interface MarkdownSsgRoutesOptions {
  root: string
  include?: string | string[]
  exclude?: string | string[]
  landingPage?: string
}

interface SsgRouteRenderContext {
  appHtml: string
  manifest: SsgRouteManifest
  routeIndex: number
}

type SsgRouteRenderer = (
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<string | undefined>

type SsgRouteHtmlTransformer = (
  html: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<string>

interface SsgRouteHtmlOptions {
  renderRoute?: SsgRouteRenderer
  transformHtml?: SsgRouteHtmlTransformer
  injectRoutePayload?: boolean
}

interface PrerenderSsgRoutesOptions extends SsgRouteHtmlOptions {
  outDir: string
  appHtmlFile?: string
  manifestFile?: string
  manifest?: SsgRouteManifest
  transformManifest?: SsgManifestTransformer
  exclude?: SsgRouteExclusion[]
  concurrency?: number
  interval?: number
  crawlLinks?: boolean
  redirects?: 'error' | 'follow' | 'skip'
  notFound?: 'error' | 'skip'
  reportFile?: string | false
  onRouteRendered?: SsgRouteRenderedHook
  onPageGenerated?: SsgPageGeneratedHook
  afterGenerate?: SsgAfterGenerateHook
}

interface PrerenderedSsgRoute {
  path: string
  htmlFile: string
  bytes: number
  milliseconds?: number
}

interface SkippedSsgRoute {
  path: string
  reason: 'excluded' | 'not-found' | 'redirected' | 'skipped-redirect'
  target?: string
}

interface SsgGenerationWarning {
  path: string
  message: string
}

interface SsgGenerationReport {
  generatedAt: string
  outDir: string
  manifestFile: string
  routeCount: number
  generated: PrerenderedSsgRoute[]
  skipped: SkippedSsgRoute[]
  warnings: SsgGenerationWarning[]
}

interface PrerenderSsgRoutesResult {
  manifest: SsgRouteManifest
  outDir: string
  routes: PrerenderedSsgRoute[]
  skipped: SkippedSsgRoute[]
  warnings: SsgGenerationWarning[]
  report?: SsgGenerationReport
}

interface SsgGeneratedPage {
  route: SsgRoute
  html: string
  htmlFile: string
  filePath: string
}

type SsgRouteRenderedHook = (
  html: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<string | void>

type SsgPageGeneratedHook = (
  page: SsgGeneratedPage,
  context: SsgRouteRenderContext,
) => MaybePromise<Partial<Pick<SsgGeneratedPage, 'html' | 'htmlFile' | 'filePath'>> | void>

type SsgAfterGenerateHook = (
  result: Omit<PrerenderSsgRoutesResult, 'report'> & { report: SsgGenerationReport },
) => MaybePromise<void>

interface VueSsgRouterAdapter {
  push?: (location: unknown) => MaybePromise<unknown>
  replace?: (location: unknown) => MaybePromise<unknown>
  isReady?: () => MaybePromise<unknown>
}

interface VueSsgAppFactoryResult {
  app: unknown
  router?: VueSsgRouterAdapter
  ssrContext?: Record<string, unknown>
  routeLocation?: unknown
  onRendered?: () => MaybePromise<void>
}

type VueSsgAppFactory = (
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<VueSsgAppFactoryResult | unknown>

type VueSsgRenderToString = (
  app: unknown,
  ssrContext?: Record<string, unknown>,
) => MaybePromise<string>

type VueSsgRouteLocationResolver = (route: SsgRoute, context: SsgRouteRenderContext) => unknown

type VueSsgAppHtmlReplacer = (
  appHtml: string,
  renderedAppHtml: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
  appResult: VueSsgAppFactoryResult,
) => MaybePromise<string>

type VueSsgRenderedAppHtmlTransformer = (
  renderedAppHtml: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => MaybePromise<string>

interface VueSsgRouteRendererOptions {
  createApp: VueSsgAppFactory
  renderToString?: VueSsgRenderToString
  appMountId?: string
  routeLocation?: VueSsgRouteLocationResolver
  useRouterReplace?: boolean
  transformRenderedAppHtml?: VueSsgRenderedAppHtmlTransformer
  replaceAppHtml?: VueSsgAppHtmlReplacer
}

interface PrerenderVueSsgRoutesOptions
  extends Omit<PrerenderSsgRoutesOptions, 'renderRoute'>, VueSsgRouteRendererOptions {}

interface ViteSsgPluginOptions {
  enabled?: boolean
  routes?: SsgRouteSource
  exclude?: SsgRouteExclusion[]
  markdown?: MarkdownSsgRoutesOptions
  base?: string
  emitHtml?: boolean
  appHtmlFile?: string
  renderRoute?: SsgRouteHtmlOptions['renderRoute']
  transformHtml?: SsgRouteHtmlOptions['transformHtml']
  injectRoutePayload?: SsgRouteHtmlOptions['injectRoutePayload']
  manifestFile?: string
  virtualModuleId?: string
}

declare function viteSsgPlugin(options?: ViteSsgPluginOptions): Plugin
declare function flattenStaticSsgRouterRoutes(routes: SsgRouterRouteLike[]): string[]
declare function prerenderSsgRoutes(
  options: PrerenderSsgRoutesOptions,
): Promise<PrerenderSsgRoutesResult>
declare function createVueSsgRouteRenderer(options: VueSsgRouteRendererOptions): SsgRouteRenderer
declare function prerenderVueSsgRoutes(
  options: PrerenderVueSsgRoutesOptions,
): Promise<PrerenderSsgRoutesResult>
```

## Route Sources

Explicit routes can be strings or route objects:

```ts
viteSsgPlugin({
  routes: [
    '/',
    {
      path: '/releases/v0-1-0',
      meta: {
        title: 'v0.1.0 Release Notes',
      },
      data: {
        packageName: '@md-plugins/vite-ssg-plugin',
      },
    },
  ],
})
```

The route values are written into the emitted manifest and the virtual module, so keep `meta`,
`params`, and `data` JSON-safe.

Explicit routes must be static, portable page paths. Dot segments, backslashes, dynamic or
catch-all segments, asset-looking filenames, and path segments that are invalid on Windows are
rejected.

## Static Router Route Discovery

Non-Markdown pages can be added from a Vue Router-style route table with
`flattenStaticSsgRouterRoutes()`:

```ts
import { flattenStaticSsgRouterRoutes, viteSsgPlugin } from '@md-plugins/vite-ssg-plugin'
import routes from './src/router/routes'

viteSsgPlugin({
  markdown: {
    root: './src/markdown',
  },
  routes: flattenStaticSsgRouterRoutes(routes),
})
```

The helper keeps static paths and skips parameterized, catch-all, and asset-looking routes. That
means routes such as `/theme-builder` can be generated while `/packages/:name` waits for explicit
parameter expansion.

## Route Exclusions

Use `exclude` when a route should stay out of the manifest or prerender pass:

```ts
viteSsgPlugin({
  routes: ['/', '/drafts/private', '/admin/tools'],
  exclude: ['/drafts/private', /^\/admin/],
})
```

String exclusions are normalized and matched exactly. Regular expressions are tested against the
normalized route path.

## Markdown Discovery

Markdown discovery maps files under `root` to routes:

```ts
viteSsgPlugin({
  markdown: {
    root: './src/markdown',
    include: ['**/*.md'],
    exclude: ['drafts/**'],
    landingPage: 'index.md',
  },
})
```

Markdown routes and explicit routes can be used together. That keeps the common docs pages
automatic while still leaving room for generated release pages, landing pages, or future dynamic
route expansion.

## Static Shell Output

By default, the Vite plugin emits route files from the built app shell:

```ts
viteSsgPlugin({
  markdown: {
    root: './src/markdown',
  },
  injectRoutePayload: true,
})
```

This is useful when a static host needs concrete HTML files for deep links, even if the app still
hydrates like a normal SPA.

Use `emitHtml: false` when a build should only publish the route manifest:

```ts
viteSsgPlugin({
  emitHtml: false,
  routes: ['/', '/guide'],
})
```

## Custom Rendering

Use `renderRoute` when you already have a renderer:

```ts
viteSsgPlugin({
  routes: ['/', '/guide'],
  async renderRoute(route, { appHtml }) {
    const rendered = await renderMyAppAt(route.path)

    return appHtml.replace('<div id="q-app"></div>', `<div id="q-app">${rendered}</div>`)
  },
})
```

Use `transformHtml` for final shell-level changes:

```ts
viteSsgPlugin({
  routes: ['/guide'],
  transformHtml(html, route) {
    return html.replace('<title></title>', `<title>${route.path}</title>`)
  },
})
```

## Post-Build Prerendering

For Q-Press, use the first-class command after building the SPA:

```bash
pnpm build:ssg
```

`qpress ssg` reads `q-press-ssg-routes.json`, renders every route with the generated Q-Press SSG app factory, and writes the route HTML files back into the built SPA output directory. Use `pnpm prerender:ssg` when `dist/spa` already exists and only the static prerender pass needs to run again.

The output directory is configurable. Q-Press defaults to `dist/spa` because that keeps existing
Netlify/static-host workflows simple, but non-Q-Press sites can choose a different output folder.

Projects that already have a Quasar SSR bundle can opt into that renderer explicitly:

```bash
pnpm build:ssg:renderer
qpress ssg --renderer quasar-ssr --out-dir dist/spa --ssr-dir dist/ssr
```

The Q-Press runner also exposes the generic route controls:

```bash
qpress ssg \
  --out-dir dist/spa \
  --crawl-links \
  --exclude /drafts/private \
  --concurrency 4 \
  --interval 250 \
  --report-file q-press-ssg-report.json
```

By default, Q-Press merges static routes from `src/router/routes.ts`, follows renderer redirects,
skips renderer 404s, and writes a JSON generation report. Use `--no-router-routes`,
`--redirects error`, `--not-found error`, or `--no-report` when a project needs stricter behavior.

### Crawling, Redirects, and 404s

`crawlLinks: true` scans rendered HTML for safe internal links and queues any missing static routes.
External links, protocol links, hash-only links, dynamic route params, catch-all routes, and
asset-looking URLs are ignored.

Renderer errors with a string `url` property can be handled as redirects with
`redirects: 'follow'`. Renderer errors with `code`, `status`, or `statusCode` set to `404` can be
skipped with `notFound: 'skip'`. Generic `prerenderSsgRoutes()` stays strict by default, while the
Q-Press runner defaults to following redirects and skipping 404 routes.

### Hooks and Reports

Use hooks when build tooling needs custom output paths, generated assets, or deploy diagnostics:

```ts
await prerenderSsgRoutes({
  outDir: 'dist/spa',
  manifest,
  onRouteRendered(html, route) {
    return html.replace('</head>', `<meta name="ssg-route" content="${route.path}"></head>`)
  },
  onPageGenerated(page) {
    return page.route.path === '/guide'
      ? {
          htmlFile: 'guide.html',
        }
      : undefined
  },
  async afterGenerate(result) {
    console.log(`Generated ${result.routes.length} pages`)
  },
})
```

`transformManifest` runs once after the manifest is loaded and before its routes are normalized. It
lets framework adapters add discovered routes while leaving manifest loading and validation in the
generic prerenderer.

By default, post-build prerendering writes `q-press-ssg-report.json` next to the route manifest. Pass
`reportFile: false` to disable it or pass another filename to keep reports elsewhere inside
`outDir`. Configured and hook-provided file paths are resolved and must remain inside `outDir`.

## Vue / Quasar Renderer Adapter

The default Vue shell replacement accepts quoted or unquoted mount IDs, reordered attributes, and
standard or custom mount elements as emitted by production HTML builds.

The generated Q-Press factory lives at `src/.q-press/ssg/create-app`:

```ts
import { prerenderVueSsgRoutes } from '@md-plugins/vite-ssg-plugin'
import { createQPressSsgApp } from './src/.q-press/ssg/create-app'

await prerenderVueSsgRoutes({
  outDir: 'dist/spa',
  createApp: createQPressSsgApp,
})
```

`createQPressSsgApp` creates a fresh Vue SSR app, installs Quasar with the Q-Press plugins,
resolves the host Pinia store and router, initializes a Quasar-style `ssrContext`, and returns the
shape expected by `prerenderVueSsgRoutes()`.

Non-Q-Press Vue projects can still use `prerenderVueSsgRoutes()` directly as long as they provide
their own fresh SSR-safe app instance for each route.

## SSR and SSG Together

Runtime SSR and SSG are complementary, not mutually exclusive:

- Use runtime SSR when a deployment target can execute a server and needs request-time rendering.
- Use SSG when the output needs to deploy to Netlify or another static host.
- Reuse the same app factory when possible, but keep the prerender command separate from the runtime
  SSR server.
- Keep browser-only examples behind client-only boundaries until docs examples have explicit
  SSR/SSG-safe behavior.

## Browser-Only Examples

Docs examples that touch `window`, `document`, canvas, media APIs, live animations, or clipboard APIs
should be guarded during SSG. Prefer one of these patterns:

- Render static explanatory markup during SSG, then mount the live demo after hydration.
- Gate browser-only work behind `onMounted()`.
- Use a route or component-level flag so the prerenderer can skip pages that are intentionally
  client-only.
- Keep CodePen exports and browser-only examples documented as client-runtime examples, not server
  render requirements.

## Local Proving

It is reasonable to create a local branch or throwaway script that boots a Quasar/Vue SSR app and
feeds it into `prerenderVueSsgRoutes()` while the workflow is still being proven.

That scratch harness should not be committed as finalized docs-site code. Commit the reusable
plugin behavior, the documented options, the generated Q-Press app-factory template, and reusable
runner behavior such as `qpress ssg`; leave one-off local test wiring out unless it belongs in the
shared tooling.

## Current Gaps

- Parameterized dynamic routes still need explicit expansion before they can be generated.
- Browser-only examples need project-level conventions for static fallbacks or client-only opt-outs.
