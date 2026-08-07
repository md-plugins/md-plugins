---
title: Upgrade Guide
desc: Upgrade MD-Plugins and Q-Press to the 2.0 stable line.
keys: Other
related:
  - quasar-app-extensions/qpress/overview
  - quasar-app-extensions/qpress/site-config
  - vite-plugins/vite-search-plugin/overview
  - vite-plugins/vite-search-plugin/search-ui
  - quasar-app-extensions/vite-md-plugin-app-ext/overview
  - vite-plugins/vite-md-plugin/overview
---

The `2.0.0` stable line is the recommended MD-Plugins and Q-Press baseline for Quasar CLI Vite projects. The Quasar app extensions, including Q-Press, target Quasar applications using `@quasar/app-vite` `>=3.0.0`.

## Markdown-it 15

MD-Plugins 2 requires Markdown-it 15. If your project installs Markdown-it directly, update it and remove the separate DefinitelyTyped package because Markdown-it now bundles its declarations:

```bash
pnpm up markdown-it@^15
pnpm remove @types/markdown-it
```

Markdown-it 15 no longer exports package-internal paths such as `markdown-it/lib/token.mjs` or `markdown-it/lib/renderer.mjs`. Import public runtime values and types from `markdown-it` instead:

```ts
import type { MarkdownIt, Renderer, Token } from 'markdown-it'
```

Custom plugins that import Markdown-it internals must be upgraded before they are used with this release. Markdown-it 15 also upgrades linkify-it and changes some URL parsing boundaries, including Unicode punctuation and authenticated URLs. The Vite Markdown plugin preserves its previous bare-domain linkification by default; set `linkifyOptions: { fuzzyLink: false }` to adopt Markdown-it 15's default. Applications that depend on exact generated HTML should review representative Markdown output.

::: warning
Q-Press and the Quasar app extension packages now target Quasar Vite projects using `@quasar/app-vite` `>=3.0.0`. They are not intended for Webpack projects or JavaScript-only Quasar projects.
:::

::: tip
The core Markdown-it plugins and direct Vite plugins are not Quasar-only. You can use packages such as `@md-plugins/vite-md-plugin`, `@md-plugins/vite-examples-plugin`, and the individual `@md-plugins/md-plugin-*` packages in Vue/Vite projects without installing a Quasar app extension.
:::

## Before You Upgrade

- For Q-Press or the Quasar app extensions, make sure your app is already on a Quasar Vite setup.
- For Q-Press or the Quasar app extensions, upgrade the app to `@quasar/app-vite` `>=3.0.0`.
- Use TypeScript in the consuming Quasar project when using the Quasar app extensions.
- Import `defineConfig` in `quasar.config.ts` from the generated `#q-app` alias.
- Use `/// <reference types="@quasar/app-vite/client" />` in `src/env.d.ts`.
- Commit or stash local changes before invoking Q-Press, because the update flow can overwrite files in `src/.q-press`.

## Update Packages

For Q-Press projects, update the app extension package and then invoke it:

```tabs
<<| bash pnpm |>>
pnpm up @md-plugins/quasar-app-extension-q-press
<<| bash npm |>>
npm install @md-plugins/quasar-app-extension-q-press
<<| bash yarn |>>
yarn add @md-plugins/quasar-app-extension-q-press
<<| bash bun |>>
bun add @md-plugins/quasar-app-extension-q-press
```

Then invoke the app extension:

```bash
quasar ext invoke @md-plugins/q-press
```

When prompted, choose `Overwrite All` if you want the generated Q-Press files to match the stable templates.

## Add Search To Existing Q-Press Sites

New Q-Press projects include static docs search automatically. Existing Q-Press sites need the new search dependencies, Vite plugin setup, generated search layout, and adjusted header breakpoints.

The safest upgrade path is to update and invoke Q-Press, then choose `Overwrite All` so the generated shell files are refreshed together:

```bash
quasar ext invoke @md-plugins/q-press
```

If your project carries local edits in generated Q-Press files and you cannot overwrite everything, compare your project against the current generated versions of these files:

- `src/.q-press/layouts/MarkdownHeader.vue`
- `src/.q-press/layouts/MarkdownSearch.vue`
- `src/siteConfig/index.ts`
- `quasar.config.ts`

Install the search packages if they were not added during the invoke step:

```tabs
<<| bash pnpm |>>
pnpm add -D @md-plugins/search-ui @md-plugins/vite-search-plugin
<<| bash npm |>>
npm install -D @md-plugins/search-ui @md-plugins/vite-search-plugin
<<| bash yarn |>>
yarn add -D @md-plugins/search-ui @md-plugins/vite-search-plugin
<<| bash bun |>>
bun add -D @md-plugins/search-ui @md-plugins/vite-search-plugin
```

Add the search plugin to `quasar.config.ts` so the production build emits a static index:

```ts
import { viteSearchPlugin } from '@md-plugins/vite-search-plugin'

// inside build.vitePlugins
viteSearchPlugin({
  markdown: {
    root: ctx.appPaths.srcDir + '/markdown',
    // Optional: keep generated test pages, drafts, or private docs out of search.
    // exclude: ['__*.md', 'drafts/**'],
  },
})
```

The generated Q-Press search layout fetches the static index from:

```txt
/search/search-index.json
```

After building, open that URL in the browser to confirm the index is available. Static hosts such as Netlify can serve this file directly; no search server is required for the default JSON search adapter.

### Header Breakpoints After Adding Search

The search control uses header space, so existing menu breakpoints usually need to move. The goal is not to hide the whole navigation early. Keep the top-level menu container visible, give each top-level menu item its own `mq`, and let the `More` menu show only the items that no longer fit.

For example, this site uses progressively larger breakpoints so the header shows as many top-level items as possible:

```ts
const gettingStartedMenu = {
  name: 'Getting Started',
  mq: 470,
  // children...
}

const mdPluginsMenu = {
  name: 'MD Plugins',
  mq: 860,
  // children...
}

const vitePluginsMenu = {
  name: 'Vite Plugins',
  mq: 1000,
  // children...
}

const quasarAppExtsMenu = {
  name: 'Quasar App Extensions',
  mq: 1330,
  // children...
}

const otherMenu = {
  name: 'Other',
  mq: 1400,
  // children...
}

export const links = {
  secondaryHeaderLinks: [
    gettingStartedMenu,
    mdPluginsMenu,
    vitePluginsMenu,
    quasarAppExtsMenu,
    otherMenu,
  ],
  moreLinks: [gettingStartedMenu, mdPluginsMenu, vitePluginsMenu, quasarAppExtsMenu, otherMenu],
}
```

When you add new breakpoint values, also add them to the generated `$mq-list` in `src/.q-press/layouts/MarkdownHeader.vue` so the matching `gt-*` and `lt-*` utility classes exist:

```scss
$mq-list: 470, 860, 1000, 1330, 1400;

@each $query in $mq-list {
  @media (min-width: #{$query}px) {
    .lt-#{$query} {
      display: none;
    }
  }

  @media (max-width: #{$query - 1}px) {
    .gt-#{$query} {
      display: none;
    }
  }
}
```

After changing breakpoints, resize the docs site around each `mq` value. At wide widths such as `1400px`, users should still see multiple top-level menu groups, not just `More`. At narrow phone widths, the search should collapse to an icon trigger and the `More` menu should keep hidden sections reachable.

For direct Vite plugin usage, update the packages you consume:

```tabs
<<| bash pnpm |>>
pnpm up @md-plugins/vite-md-plugin @md-plugins/vite-examples-plugin
<<| bash npm |>>
npm install @md-plugins/vite-md-plugin @md-plugins/vite-examples-plugin
<<| bash yarn |>>
yarn add @md-plugins/vite-md-plugin @md-plugins/vite-examples-plugin
<<| bash bun |>>
bun add @md-plugins/vite-md-plugin @md-plugins/vite-examples-plugin
```

## Remove App-Level Shared Imports

Q-Press applications should not install or import `@md-plugins/shared` directly. The shared package remains part of the MD-Plugins internals, but app-level Q-Press files should use the helpers generated into the app.

If your project has this dependency, remove it from the consuming app:

```tabs
<<| bash pnpm |>>
pnpm remove @md-plugins/shared
<<| bash npm |>>
npm uninstall @md-plugins/shared
<<| bash yarn |>>
yarn remove @md-plugins/shared
<<| bash bun |>>
bun remove @md-plugins/shared
```

If you have customized generated files and cannot choose `Overwrite All`, update copied Q-Press files that import `slugify` from `@md-plugins/shared`.

Use the local helper from `src/.q-press/components/markdown-utils.ts` instead:

```ts
import { slugify } from './markdown-utils'
```

For files outside `src/.q-press/components`, import from the generated helper path used by that file. For example:

```ts
import { slugify } from '@/.q-press/components/markdown-utils'
```

or:

```ts
import { slugify } from '../.q-press/components/markdown-utils'
```

## Q-Press Type Globals

Q-Press now provides its shared Markdown, menu and `ImportMeta` globals directly from the app extension package. After upgrading to this release line and running `quasar prepare`, projects no longer need to keep a local `src/q-press.globals.d.ts` file.

If you still see type errors for `TocMenuItem`, `MenuItem`, `MarkdownModule`, `import.meta.glob` or Quasar `import.meta.env` values, run:

```bash
quasar prepare
```

Then make sure the app is using the updated `@md-plugins/quasar-app-extension-q-press` package.

## Environment Variable Changes

Quasar CLI Vite 3 exposes runtime flags through `import.meta.env`. If you copied older Q-Press internals into your own code, update them:

| Old pattern                   | New pattern                              |
| ----------------------------- | ---------------------------------------- |
| `process.env.CLIENT`          | `import.meta.env.QUASAR_CLIENT`          |
| `process.env.SERVER`          | `import.meta.env.QUASAR_SERVER`          |
| `process.env.DEV`             | `import.meta.env.QUASAR_DEV`             |
| `process.env.PROD`            | `import.meta.env.QUASAR_PROD`            |
| `process.env.VUE_ROUTER_MODE` | `import.meta.env.QUASAR_VUE_ROUTER_MODE` |
| `process.env.VUE_ROUTER_BASE` | `import.meta.env.QUASAR_VUE_ROUTER_BASE` |

Q-Press also uses `QCLI_*` values for Quasar CLI provided build-time values, such as search index and filesystem paths.

## Example Action Updates

The stable templates include updated example actions for GitHub source links and CodePen playgrounds. If your project keeps customized Q-Press files, compare your copies of these files with the current template:

- `src/.q-press/components/MarkdownExample.vue`
- `src/.q-press/components/MarkdownCodepen.vue`
- `src/.q-press/components/markdown-utils.ts`
- `src/siteConfig/index.ts`

Set `siteConfig.githubSourceRootSrc` when the source-view link should point at generated example files instead of edit links. Configure `siteConfig.codepen` when examples need external CSS, JavaScript, setup code, package globals or a project-specific `titleSuffix`.

## Vite Plugin Configuration

`viteMdPlugin` should be configured with an options object:

```ts
import { viteMdPlugin, type MenuItem } from '@md-plugins/vite-md-plugin'

vitePlugins: [
  viteMdPlugin({
    path: ctx.appPaths.srcDir + '/markdown',
    menu: sidebar as MenuItem[],
  }),
]
```

## Verify The Upgrade

Run these checks in the consuming app:

```bash
pnpm install
quasar prepare
quasar build
```

If you use linting or formatting, run those checks after invoking Q-Press so any regenerated files are included.
