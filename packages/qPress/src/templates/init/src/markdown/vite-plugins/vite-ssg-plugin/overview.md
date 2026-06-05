---
title: Vite SSG Plugin
desc: Vite plugin for static route inventory and SSG output for md-plugins and Q-Press documentation sites.
related:
  - vite-plugins/vite-ssg-plugin/advanced
  - vite-plugins/vite-md-plugin/overview
  - quasar-app-extensions/qpress/overview
---

The Vite SSG Plugin gives md-plugins and Q-Press projects a route manifest and static route
output without forcing every docs site to boot as one monolithic SPA for every deep link.

It starts with a safe baseline: inventory the routes, emit `q-press-ssg-routes.json`, and create
route-specific `index.html` files from the built app shell. Projects can stop there for static-host
deep links, or add a renderer when they are ready for full Vue/Quasar HTML prerendering.

## Key Features

- **Route inventory**: Normalize explicit routes or discover Markdown pages from a Q-Press-style
  `src/markdown` folder.
- **Static route files**: Emit `index.html` files for known routes so static hosts can serve deep
  links without depending on a catch-all SPA rewrite.
- **Route payloads**: Inject a small JSON route payload for diagnostics and future hydration
  behavior.
- **Renderer bridge**: Accept a custom renderer or use the Vue/Quasar build-time adapter for
  SSR-quality static HTML.
- **Optional output**: Disable emitted output when a project only wants the virtual manifest or when
  SSG is not enabled for a build.

## Installation

```tabs
<<| bash pnpm |>>
pnpm add @md-plugins/vite-ssg-plugin
<<| bash bun |>>
bun add @md-plugins/vite-ssg-plugin
<<| bash yarn |>>
yarn add @md-plugins/vite-ssg-plugin
<<| bash npm |>>
npm install @md-plugins/vite-ssg-plugin
```

## Basic Vite Setup

Use explicit routes when your app owns the route list:

```ts
import { defineConfig } from 'vite'
import { viteSsgPlugin } from '@md-plugins/vite-ssg-plugin'

export default defineConfig({
  plugins: [
    viteSsgPlugin({
      routes: ['/', '/getting-started/introduction', '/other/releases'],
    }),
  ],
})
```

The build output includes the route manifest plus one static HTML file per route:

```txt
dist/
  index.html
  getting-started/
    introduction/
      index.html
  other/
    releases/
      index.html
  q-press-ssg-routes.json
```

## Markdown Route Discovery

For Q-Press-style docs, let the plugin derive routes from Markdown files:

```ts
import { defineConfig } from 'vite'
import { viteSsgPlugin } from '@md-plugins/vite-ssg-plugin'

export default defineConfig({
  plugins: [
    viteSsgPlugin({
      markdown: {
        root: './src/markdown',
      },
    }),
  ],
})
```

The route discovery is intentionally plain. It maps Markdown files to static routes and can be
combined with explicit route declarations when a site has generated pages, release pages, or other
non-Markdown routes.

## Quasar / Q-Press Setup

In a Quasar docs app, add the plugin to the Vite plugin list used by the client build:

```ts
import { viteSsgPlugin } from '@md-plugins/vite-ssg-plugin'

export default defineConfig((ctx) => ({
  build: {
    vitePlugins: [
      viteSsgPlugin({
        markdown: {
          root: `${ctx.appPaths.srcDir}/markdown`,
        },
      }),
    ],
  },
}))
```

This produces static route files from the normal built shell. That is useful on Netlify and other
static hosts even before a full SSR renderer is wired in.

## Build-Time Vue Rendering

When a Q-Press project is ready to prerender actual Vue/Quasar HTML, use the generated scripts:

```bash
pnpm build:ssg:renderer
pnpm build:ssg
pnpm prerender:ssg
```

`build:ssg:renderer` builds Quasar's SSR renderer, and `qpress-ssg` uses that renderer to write
static HTML back into `dist/spa`. This uses Vue SSR at build time only. The deployed output can
still be plain static files.

Projects that need more control can import `createQPressSsgApp` from `src/.q-press/ssg/create-app` and pass it to `prerenderVueSsgRoutes()` directly.

## Optional by Design

SSG output is opt-in at the project level. If a site has runtime SSR enabled, this plugin does not
replace that server. Instead, it can share route inventory and, when desired, run a build-time
prerender pass for selected static routes.

For builds that should not emit SSG assets, pass `enabled: false` or gate the plugin with your own
environment flag.
