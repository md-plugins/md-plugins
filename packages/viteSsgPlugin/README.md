# @md-plugins/vite-ssg-plugin

Early static-site-generation infrastructure for Q-Press and md-plugins documentation sites.

This package currently focuses on route inventory:

- Normalize static route declarations.
- Generate a route manifest during Vite builds.
- Expose the same manifest through a virtual module.

It does not render static HTML yet. That work should build on top of this route manifest foundation once Q-Press route generation, dynamic routes, examples, and hydration rules are defined.

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

## Virtual Module

Client or build tooling can import the generated manifest:

```ts
import ssgRouteManifest, { ssgRoutes } from 'virtual:md-plugins/ssg-routes'
```

## Next Steps

- Add Q-Press route discovery.
- Add dynamic-route parameter expansion.
- Define static HTML rendering and hydration behavior.
- Define how browser-only examples opt out of prerendering.
