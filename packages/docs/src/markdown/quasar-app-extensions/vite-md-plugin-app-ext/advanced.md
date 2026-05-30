---
title: ViteMdPluginAppExt Advanced Topics
desc: Advanced Topics for the ViteMdPluginAppExt.
related:
  - vite-plugins/vite-md-plugin/advanced
  - quasar-app-extensions/qpress/overview
---

The `@md-plugins/quasar-app-extension-vite-md-plugin` app extension is intentionally small. It prepares a Quasar Vite app so Markdown files can be treated like Vue files, but your app still owns the Markdown source folder, menu shape, and `viteMdPlugin` options.

::: tip
If you want a complete documentation site scaffold, use [Q-Press](/quasar-app-extensions/qpress/overview). If you only want Markdown pages inside an existing Quasar app, this app extension is the lighter fit.
:::

## What the App Extension Changes

On every Quasar dev/build run, the app extension extends `quasar.config` with the browser-side settings Markdown pages need:

```ts
build: {
  vueRouterMode: 'history',

  viteVuePluginOptions: {
    include: [/\.(vue|md)$/],
  },
},

framework: {
  autoImportVueExtensions: ['vue', 'md'],
},
```

These settings solve three common problems:

- `vueRouterMode: 'history'` keeps hash links and generated markdown routes predictable.
- `viteVuePluginOptions.include` lets Vue compile `.md` files as Vue single-file components.
- `autoImportVueExtensions` lets route files and component imports resolve `.md` files without always spelling out the extension.

## What You Still Configure

The app extension does not generate your docs shell or menu for you. You still install and configure `@md-plugins/vite-md-plugin` in `quasar.config.ts`.

```ts
import { defineConfig } from '#q-app/wrappers'
import type { Plugin } from 'vite'

import { viteMdPlugin, type MenuItem } from '@md-plugins/vite-md-plugin'
import { sidebar } from './src/siteConfig'

export default defineConfig((ctx) => ({
  build: {
    vitePlugins: [
      [
        viteMdPlugin,
        {
          path: ctx.appPaths.srcDir + '/markdown',
          menu: sidebar as MenuItem[],
          config: {
            html: true,
            linkify: true,
          },
        },
      ] as unknown as Plugin,
    ],
  },
}))
```

For JavaScript projects, remove the `type` imports and casts. The runtime shape is the same.

## Recommended Folder Shape

A simple Quasar app can keep Markdown content and navigation data close together:

```text
src/
  markdown/
    getting-started/
      introduction.md
    guides/
      routing.md
  siteConfig/
    index.ts
```

Then export the menu from `src/siteConfig/index.ts`:

```ts
import type { MenuItem } from '@md-plugins/vite-md-plugin'

export const sidebar: MenuItem[] = [
  {
    name: 'Getting Started',
    children: [{ name: 'Introduction', path: '/getting-started/introduction' }],
  },
  {
    name: 'Guides',
    children: [{ name: 'Routing', path: '/guides/routing' }],
  },
]
```

The `path` values should match the route you expect for the markdown file under the configured Markdown folder.

## Markdown Options

Use the `config` option to tune Markdown-It and the bundled md-plugins.

```ts
viteMdPlugin({
  path: ctx.appPaths.srcDir + '/markdown',
  menu: sidebar,
  config: {
    html: true,
    linkify: true,
    typographer: true,
    codeblocks: {
      defaultLang: 'typescript',
      preClass: 'markdown-code',
    },
    link: {
      externalTarget: '_blank',
      externalRel: 'noopener noreferrer',
    },
  },
})
```

::: warning
Only enable `html: true` for content you trust. Markdown HTML is powerful, but it also means your markdown authors can inject raw HTML.
:::

## Routing Notes

The app extension sets `vueRouterMode` to `history` because Q-Press and the Vite markdown plugin rely on stable URLs and hash anchors. If your app is deployed to static hosting, make sure your host rewrites unknown routes back to `index.html`.

For example, Netlify apps usually need:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## When to Use Q-Press Instead

Choose Q-Press when you want the full docs experience:

- Generated docs layout, header, sidebars, footer, and search.
- Markdown examples and CodePen generation.
- API cards using Quasar-style JSON metadata.
- Themes, release pages, FAQ, and contribution pages.

Choose this app extension when you already have an app shell and only need Markdown files to compile and route cleanly.

## Troubleshooting

- If Markdown imports fail, confirm `viteVuePluginOptions.include` includes `/\.(vue|md)$/`.
- If routes work locally but fail after refresh in production, add a history fallback on your host.
- If Markdown pages render but links do not behave like SPA links, check the `link` plugin options and your generated routes.
- If you recently upgraded Quasar app-vite, run `quasar prepare` so generated Quasar aliases and types are refreshed.
