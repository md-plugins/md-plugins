# @md-plugins/vite-ssg-plugin

[![npm version](https://img.shields.io/npm/v/@md-plugins/vite-ssg-plugin?label=%40md-plugins%2Fvite-ssg-plugin)](https://www.npmjs.com/package/@md-plugins/vite-ssg-plugin)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/vite-ssg-plugin)](https://www.npmjs.com/package/@md-plugins/vite-ssg-plugin)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/vite-ssg-plugin)](https://www.npmjs.com/package/@md-plugins/vite-ssg-plugin)
[![license](https://img.shields.io/npm/l/@md-plugins/vite-ssg-plugin)](https://www.npmjs.com/package/@md-plugins/vite-ssg-plugin)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

Static-site-generation infrastructure for Q-Press and md-plugins documentation sites. It discovers known routes, emits route manifests, writes static route HTML, and can prerender Vue/Quasar output after the normal build.

This package currently focuses on route inventory and static route output:

- Normalize static route declarations.
- Discover Q-Press Markdown routes from a `src/markdown` folder.
- Flatten static Vue Router route records for non-Markdown pages.
- Exclude routes from manifests or prerender passes.
- Generate a route manifest during Vite builds.
- Expose the same manifest through a virtual module.
- Emit route-specific HTML files from the built app shell so static hosts can serve deep
  links without relying on a SPA fallback rewrite.
- Accept a custom per-route renderer when a project is ready to generate fully prerendered
  route HTML.
- Crawl safe internal links, follow redirects, skip 404s, and write generation reports during
  post-build prerendering when those behaviors are enabled.

By default, generated route HTML uses the built `index.html` app shell. That makes the output
usable on Netlify or other static hosts today. Q-Press projects can use `qpress ssg` for
first-class Vue/Quasar build-time prerendering without enabling Quasar SSR mode.

## Why SSG?

SSG turns known routes into static HTML at build time. A direct visit or browser refresh can receive
the route's own `index.html` file, then the Vue/Quasar client bundle hydrates the page and normal
SPA navigation takes over.

That gives docs sites a useful middle ground: static hosting without a runtime SSR server, but with
route-specific HTML, meta tags, headings, and body content in the first response. This can help SEO,
indexing crawlers, and social link previews because they no longer need to depend entirely on
client-side JavaScript rendering. SSG does not guarantee search ranking improvements by itself; it
simply makes the route content easier to read earlier and more reliably.

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

To include static Vue Router routes:

```ts
import { flattenStaticSsgRouterRoutes, viteSsgPlugin } from '@md-plugins/vite-ssg-plugin'
import routes from './src/router/routes'

export default {
  plugins: [
    viteSsgPlugin({
      markdown: {
        root: './src/markdown',
      },
      routes: flattenStaticSsgRouterRoutes(routes),
      exclude: ['/drafts/private', /^\/admin/],
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

Explicit routes must be static, portable page paths. Dot segments, backslashes, dynamic or
catch-all segments, asset-looking filenames, and path segments that are invalid on Windows are
rejected.

## Route HTML

When Vite emits `index.html`, this plugin creates matching route HTML files such as:

```txt
index.html
getting-started/introduction/index.html
other/releases/index.html
q-press-ssg-shell.html
q-press-ssg-routes.json
```

Each generated page receives a small JSON payload:

```html
<script type="application/json" id="md-plugins-ssg-route">
  ...
</script>
```

That payload helps future hydration or diagnostics know which static route was generated.
If an input shell or custom renderer already contains the payload script, its stale JSON is
replaced so the generated page always identifies the current route.

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
  concurrency: 4,
  crawlLinks: true,
  redirects: 'follow',
  notFound: 'skip',
  async renderRoute(route, { appHtml }) {
    const renderedAppHtml = await renderMyAppAt(route.path)

    return appHtml.replace('<div id="q-app"></div>', `<div id="q-app">${renderedAppHtml}</div>`)
  },
})
```

The helper reads `q-press-ssg-routes.json`, renders every route, and writes each route's
`index.html` file. The Vite plugin preserves the unmodified SPA shell as
`q-press-ssg-shell.html`, and the prerenderer always reads that immutable copy rather than a
generated root page. If the Vite plugin did not emit the artifact, the first prerender pass creates
it from `appHtmlFile`. This makes repeated prerender commands deterministic without rebuilding the
SPA. The renderer can be a Vue SSR renderer, a Quasar SSR adapter, or any project-specific static
renderer.

The output directory is configurable. Q-Press defaults to `dist/spa` because that keeps existing
static-host deployments simple, but non-Q-Press projects can use another output folder.

By default, post-build prerendering writes `q-press-ssg-report.json`. Pass `reportFile: false` to
disable reports, or provide hooks such as `onRouteRendered`, `onPageGenerated`, and `afterGenerate`
for custom output. Configured and hook-provided file paths must resolve inside `outDir`.
The shell artifact can be renamed with `appShellFile`, but it must differ from the app HTML,
manifest, report, and generated route files.

Framework adapters can use `transformManifest` to add discovered routes after the manifest is
loaded while leaving file loading and route validation in the generic prerenderer.

## Vue / Quasar Build-Time Rendering

For Q-Press apps, run the generated Q-Press command after a normal SPA build:

```bash
pnpm build:ssg
pnpm preview:ssg
```

Projects that already have a Quasar SSR bundle can opt into that renderer with
`qpress ssg --renderer quasar-ssr`, but it is not required for the default Q-Press SSG flow.

For lower-level Vue or Quasar apps, `createVueSsgRouteRenderer` adapts a per-route SSR app factory
into the generic `renderRoute` hook. This uses Vue's server renderer at build time only; the
published output can still be deployed as static files on Netlify or any other static host.
The default shell replacement supports quoted or unquoted mount IDs, reordered attributes, and
standard or custom mount elements. Vue SSR Teleports are also preserved and injected after either
the default replacement or a framework-provided replacement such as Q-Press metadata handling.
Use simple `#id` Teleport targets backed by dedicated empty elements in the built app shell;
unsupported, missing, and non-empty targets fail prerendering instead of dropping their content.

```ts
import { prerenderVueSsgRoutes } from '@md-plugins/vite-ssg-plugin'
import { createQPressSsgApp } from './src/.q-press/ssg/create-app'

await prerenderVueSsgRoutes({
  outDir: 'dist/spa',
  createApp: createQPressSsgApp,
})
```

Q-Press generates `src/.q-press/ssg/create-app` and `src/.q-press/ssg/prerender`, and `qpress ssg` uses that app factory for the common docs-site flow. Non-Q-Press projects can still provide their own app factory. Vue SSR dependencies are optional until this adapter is used. Projects that already build a Quasar SSR bundle can opt into that path with `qpress ssg --renderer quasar-ssr`.

## Local SSR / SSG Proving

It is reasonable to create a local branch or throwaway script that boots a Quasar/Vue SSR app and
feeds it into `prerenderVueSsgRoutes()` while the workflow is still being proven.

That scratch harness should not be committed as finalized docs-site code. Commit the reusable
plugin behavior, the documented options, the generated Q-Press app-factory template, and reusable
runner behavior such as `qpress ssg`; leave one-off local test wiring out unless it belongs in the
shared tooling.

## Virtual Module

Client or build tooling can import the generated manifest:

```ts
import ssgRouteManifest, { ssgRoutes } from 'virtual:md-plugins/ssg-routes'
```

## Next Steps

- Add dynamic-route parameter expansion.
- Define project conventions for browser-only examples and lazy client hydration.
