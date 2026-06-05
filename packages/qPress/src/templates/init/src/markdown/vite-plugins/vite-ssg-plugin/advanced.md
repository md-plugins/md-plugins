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

type SsgRouteSource = SsgRouteInput[] | (() => MaybePromise<SsgRouteInput[]>)

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
}

interface PrerenderedSsgRoute {
  path: string
  htmlFile: string
  bytes: number
}

interface PrerenderSsgRoutesResult {
  manifest: SsgRouteManifest
  outDir: string
  routes: PrerenderedSsgRoute[]
}

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

type VueSsgRouteLocationResolver = (
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => unknown

type VueSsgAppHtmlReplacer = (
  appHtml: string,
  renderedAppHtml: string,
  route: SsgRoute,
  context: SsgRouteRenderContext,
) => string

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
declare function prerenderSsgRoutes(
  options: PrerenderSsgRoutesOptions,
): Promise<PrerenderSsgRoutesResult>
declare function createVueSsgRouteRenderer(
  options: VueSsgRouteRendererOptions,
): SsgRouteRenderer
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
      path: '/releases/v0.1.0',
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

`qpress-ssg` reads `q-press-ssg-routes.json`, renders every route with the generated Q-Press SSG app factory, and writes the route HTML files back into the built SPA output directory. Use `pnpm prerender:ssg` when `dist/spa` already exists and only the static prerender pass needs to run again.

Projects that already have a Quasar SSR bundle can opt into that renderer explicitly:

```bash
pnpm build:ssg:renderer
qpress-ssg --renderer quasar-ssr --out-dir dist/spa --ssr-dir dist/ssr
```

## Vue / Quasar Renderer Adapter

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

## Local Proving

It is reasonable to create a local branch or throwaway script that boots a Quasar/Vue SSR app and
feeds it into `prerenderVueSsgRoutes()` while the workflow is still being proven.

That scratch harness should not be committed as finalized docs-site code. Commit the reusable
plugin behavior, the documented options, the generated Q-Press app-factory template, and reusable
runner behavior such as `qpress-ssg`; leave one-off local test wiring out unless it belongs in the
shared tooling.

## Current Gaps

- Dynamic route parameter expansion needs a manifest strategy before generated release pages or
  content-driven routes can be fully automated.
- Live examples need clear opt-in or opt-out rules for SSR-safe rendering and client hydration.
