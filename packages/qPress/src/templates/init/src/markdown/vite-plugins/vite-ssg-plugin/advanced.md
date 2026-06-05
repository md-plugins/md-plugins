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

interface SsgRouteObject {
  path: string
  meta?: Record<string, JsonValue | undefined>
  params?: Record<string, JsonPrimitive | undefined>
  data?: JsonValue
}

type SsgRouteInput = string | SsgRouteObject

interface MarkdownSsgRoutesOptions {
  root: string
  include?: string | string[]
  exclude?: string | string[]
  landingPage?: string
}

interface ViteSsgPluginOptions {
  enabled?: boolean
  routes?: SsgRouteInput[] | (() => MaybePromise<SsgRouteInput[]>)
  markdown?: MarkdownSsgRoutesOptions
  base?: string
  emitHtml?: boolean
  appHtmlFile?: string
  renderRoute?: SsgRouteRenderer
  transformHtml?: SsgRouteHtmlTransformer
  injectRoutePayload?: boolean
  manifestFile?: string
  virtualModuleId?: string
}

declare function viteSsgPlugin(options?: ViteSsgPluginOptions): Plugin
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

For Quasar and Q-Press, a post-build prerender step is usually cleaner than trying to boot the full
app inside the Vite plugin hook:

```ts
import { prerenderSsgRoutes } from '@md-plugins/vite-ssg-plugin'

await prerenderSsgRoutes({
  outDir: 'dist/spa',
  async renderRoute(route, { appHtml }) {
    const rendered = await renderMyRoute(route.path)

    return appHtml.replace('<div id="q-app"></div>', `<div id="q-app">${rendered}</div>`)
  },
})
```

The helper reads `q-press-ssg-routes.json`, renders every route, and writes the route HTML files
back into the built output directory.

## Vue / Quasar Renderer Adapter

`prerenderVueSsgRoutes` wraps `prerenderSsgRoutes` with Vue SSR rendering:

```ts
import { prerenderVueSsgRoutes } from '@md-plugins/vite-ssg-plugin'
import { createSsrApp } from './entry-ssr'

await prerenderVueSsgRoutes({
  outDir: 'dist/spa',
  async createApp(route) {
    const { app, router } = await createSsrApp()

    return {
      app,
      router,
      routeLocation: route.path,
      ssrContext: {
        url: route.path,
      },
    }
  },
})
```

This adapter lazy-loads `@vue/server-renderer` only when used. Non-Quasar Vue projects can use it
as long as they can create a fresh SSR-safe app instance for each route.

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
plugin behavior, the documented options, and the eventual Q-Press generated app-factory template;
leave one-off local test wiring out unless it has been promoted into that reusable template.

## Current Gaps

- Q-Press still needs a generated SSR app-factory template so docs projects do not hand-roll
  `createApp` plumbing.
- Dynamic route parameter expansion needs a manifest strategy before generated release pages or
  content-driven routes can be fully automated.
- Live examples need clear opt-in or opt-out rules for SSR-safe rendering and client hydration.
