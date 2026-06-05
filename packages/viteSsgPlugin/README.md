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
usable on Netlify or other static hosts today. Full Vue SSR prerendering should build on the
`renderRoute` hook once Q-Press route generation, dynamic routes, examples, and hydration rules
are defined.

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

## Virtual Module

Client or build tooling can import the generated manifest:

```ts
import ssgRouteManifest, { ssgRoutes } from 'virtual:md-plugins/ssg-routes'
```

## Next Steps

- Add dynamic-route parameter expansion.
- Add full Vue route rendering for SSR-quality HTML.
- Define lazy client hydration behavior for examples and browser-only components.
- Define how browser-only examples opt out of prerendering.
