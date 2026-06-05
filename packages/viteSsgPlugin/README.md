# @md-plugins/vite-ssg-plugin

Static-site-generation infrastructure for Q-Press and md-plugins documentation sites.

This package currently focuses on route inventory and static route output:

- Normalize static route declarations.
- Discover Q-Press Markdown routes from a `src/markdown` folder.
- Generate a route manifest during Vite builds.
- Expose the same manifest through a virtual module.
- Emit route-specific HTML files from the built app shell so static hosts can serve deep
  links without relying on a SPA fallback rewrite.
- Accept a custom per-route renderer when a project is ready to generate fully prerendered
  route HTML.

By default, generated route HTML uses the built `index.html` app shell. That makes the output
usable on Netlify or other static hosts today. Q-Press projects can use `qpress-ssg` for
first-class Vue/Quasar build-time prerendering when a Quasar SSR renderer is available.

## Usage

```ts
import { viteSsgPlugin } from '@md-plugins/vite-ssg-plugin'

export default {
  plugins: [
    viteSsgPlugin({
      routes: ['/', '/getting-started/introduction', '/other/releases'],
    }),
  ],
}
```

For Q-Press-style Markdown docs:

```ts
import { viteSsgPlugin } from '@md-plugins/vite-ssg-plugin'

export default {
  plugins: [
    viteSsgPlugin({
      markdown: {
        root: './src/markdown',
      },
    }),
  ],
}
```

The plugin emits `q-press-ssg-routes.json` by default:

```json
{
  "base": "/",
  "routes": [
    {
      "path": "/",
      "htmlFile": "index.html",
      "id": "root",
      "meta": {},
      "params": {}
    }
  ]
}
```

Route `meta`, `params`, and `data` values should stay JSON-safe because they are written
directly into the emitted manifest and the virtual module.

## Route HTML

When Vite emits `index.html`, this plugin creates matching route HTML files such as:

```txt
index.html
getting-started/introduction/index.html
other/releases/index.html
q-press-ssg-routes.json
```

Each generated page receives a small JSON payload:

```html
<script type="application/json" id="md-plugins-ssg-route">
  ...
</script>
```

That payload helps future hydration or diagnostics know which static route was generated.

Projects that need fully prerendered content can provide `renderRoute`:

```ts
viteSsgPlugin({
  routes: ['/', '/guide'],
  async renderRoute(route, { appHtml }) {
    return appHtml.replace('<div id="q-app"></div>', `<div id="q-app">${route.path}</div>`)
  },
})
```

## Post-Build Prerendering

When a project has a renderer available outside the Vite build, use `prerenderSsgRoutes`.
This is the intended bridge for SSR-quality output:

```ts
import { prerenderSsgRoutes } from '@md-plugins/vite-ssg-plugin'

await prerenderSsgRoutes({
  outDir: 'dist/spa',
  async renderRoute(route, { appHtml }) {
    const renderedAppHtml = await renderMyAppAt(route.path)

    return appHtml.replace('<div id="q-app"></div>', `<div id="q-app">${renderedAppHtml}</div>`)
  },
})
```

The helper reads `q-press-ssg-routes.json`, renders every route, and writes each route's
`index.html` file. The renderer can be a Vue SSR renderer, a Quasar SSR adapter, or any
project-specific static renderer.

## Vue / Quasar Build-Time Rendering

For Q-Press apps, build the Quasar SSR renderer and then run the generated Q-Press command:

```bash
pnpm build:ssg:renderer
pnpm build:ssg
```

For lower-level Vue or Quasar apps, `createVueSsgRouteRenderer` adapts a per-route SSR app factory
into the generic `renderRoute` hook. This uses Vue's server renderer at build time only; the
published output can still be deployed as static files on Netlify or any other static host.

```ts
import { prerenderVueSsgRoutes } from '@md-plugins/vite-ssg-plugin'
import { createQPressSsgApp } from './src/.q-press/ssg/create-app'

await prerenderVueSsgRoutes({
  outDir: 'dist/spa',
  createApp: createQPressSsgApp,
})
```

Q-Press generates `src/.q-press/ssg/create-app` and `src/.q-press/ssg/prerender`, and the
`qpress-ssg` binary consumes Quasar's built SSR `server-entry.js` for the common docs-site flow.
Non-Q-Press projects can still provide their own app factory. Vue SSR dependencies are optional
until this adapter is used.

## Local SSR / SSG Proving

It is reasonable to create a local branch or throwaway script that boots a Quasar/Vue SSR app and
feeds it into `prerenderVueSsgRoutes()` while the workflow is still being proven.

That scratch harness should not be committed as finalized docs-site code. Commit the reusable
plugin behavior, the documented options, the generated Q-Press app-factory template, and reusable
runner behavior such as `qpress-ssg`; leave one-off local test wiring out unless it belongs in the
shared tooling.

## Virtual Module

Client or build tooling can import the generated manifest:

```ts
import ssgRouteManifest, { ssgRoutes } from 'virtual:md-plugins/ssg-routes'
```

## Next Steps

- Add dynamic-route parameter expansion.
- Define lazy client hydration behavior for examples and browser-only components.
- Define how browser-only examples opt out of prerendering.
