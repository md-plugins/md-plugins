---
title: Q-Press Installation
desc: Install Q-Press and wire the generated docs shell into a Quasar Vite app.
related:
  - quasar-app-extensions/qpress/quick-start
  - quasar-app-extensions/qpress/overview
  - quasar-app-extensions/qpress/cli
---

## Requirements

Q-Press currently expects:

- Quasar CLI Vite with `@quasar/app-vite` `>=3.0.0`
- TypeScript project support
- Vue Router from the Quasar Vite app template
- `markdown-it`

Q-Press is not intended for Webpack-era Quasar projects or JavaScript-only Quasar apps.

## Install The App Extension

Install Q-Press into an existing Quasar app:

```bash
quasar ext add @md-plugins/q-press
```

When updating an existing project, refresh the generated shell:

```bash
quasar ext invoke @md-plugins/q-press
```

Choose `Overwrite All` when you want generated `src/.q-press` files to match the current templates.

## What Gets Installed

New installs create:

- `src/.q-press`
- `src/components`
- `src/markdown`
- `src/examples`
- `src/siteConfig`

Update installs refresh only:

- `src/.q-press`

Keep project-specific changes in project-owned folders such as `src/markdown`, `src/examples`, `src/components`, `src/siteConfig`, and `src/css`.

## Required Dependencies

Install `markdown-it` and its types:

```tabs
<<| bash pnpm |>>
pnpm i -D markdown-it
<<| bash bun |>>
bun add -d markdown-it
<<| bash yarn |>>
yarn add -D markdown-it
<<| bash npm |>>
npm i -D markdown-it
```

Q-Press adds `mermaid`, `shiki`, `@md-plugins/search-ui`, `@md-plugins/vite-search-plugin`, `@md-plugins/vite-ssg-plugin`, and `@vue/server-renderer` to your project dev dependencies when invoked. If you are wiring generated files manually, add them yourself:

```tabs
<<| bash pnpm |>>
pnpm add -D mermaid shiki @md-plugins/search-ui @md-plugins/vite-search-plugin @md-plugins/vite-ssg-plugin @vue/server-renderer
<<| bash bun |>>
bun add -d mermaid shiki @md-plugins/search-ui @md-plugins/vite-search-plugin @md-plugins/vite-ssg-plugin @vue/server-renderer
<<| bash yarn |>>
yarn add -D mermaid shiki @md-plugins/search-ui @md-plugins/vite-search-plugin @md-plugins/vite-ssg-plugin @vue/server-renderer
<<| bash npm |>>
npm i -D mermaid shiki @md-plugins/search-ui @md-plugins/vite-search-plugin @md-plugins/vite-ssg-plugin @vue/server-renderer
```

## TypeScript Config

Quasar CLI Vite 3 generates a `tsconfig.json` with JSON module support. If you are migrating an older app, run:

```bash
quasar prepare
```

This refreshes generated TypeScript files before linting, typechecking, and IDE integration.

## Styles

Import one Q-Press theme in `src/css/quasar.variables.scss` or `src/css/quasar.variables.sass`:

```scss
@import '../.q-press/css/themes/sunrise.scss';
```

Import Q-Press styles in `src/css/app.scss`:

```scss
@import '../.q-press/css/app.scss';
```

See [Themes](/quasar-app-extensions/qpress/themes) for bundled themes and runtime tokens.

## Quasar Config

Add the Markdown plugin to your Quasar Vite config:

```ts [maxheight=400px]
import { defineConfig } from '#q-app'
import type { Plugin } from 'vite'
import { viteMdPlugin, type MenuItem, type MarkdownOptions } from '@md-plugins/vite-md-plugin'

export default defineConfig(async (ctx) => {
  const siteConfig = await import('./src/siteConfig')
  const { sidebar } = siteConfig.default

  return {
    build: {
      vitePlugins: [
        [
          viteMdPlugin,
          {
            path: ctx.appPaths.srcDir + '/markdown',
            menu: sidebar as MenuItem[],
            // options: myOptions as MarkdownOptions
          },
        ],
      ],
    },
  }
})
```

## Router Setup

`src/router/routes.ts` should keep custom Vue routes plus the generated Q-Press layout and not-found records:

```ts [maxheight=400px]
import { createQPressLayoutRoute, createQPressNotFoundRoute } from '@/.q-press/router/routes'

const routes = [
  // Keep custom Vue routes here.
  createQPressLayoutRoute(),
  createQPressNotFoundRoute(),
]

export default routes
```

`src/router/index.ts` should install Markdown routes from the generated route manifest:

```ts [maxheight=400px]
import { defineRouter } from '#q-app'
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router'
import { installQPressRoutes } from '@/.q-press/router/routes'
import { qpressRouteManifest } from '@/markdown/listing'
import routes from './routes'

export default defineRouter(() => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  })

  installQPressRoutes(router, qpressRouteManifest)

  return router
})
```

## Dark Mode

Update `App.vue`:

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
import { useDark } from '@/.q-press/composables/dark'

const { initDark } = useDark()

initDark()
</script>
```

## Meta Tags

Meta setup is optional, but recommended for social previews and SSR/SSG output. Add Quasar's `Meta` plugin to `quasar.config.ts`, then use the generated helper in `App.vue`:

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
import { useMeta } from 'quasar'
import getMeta from '@/.q-press/assets/get-meta'

useMeta({
  title: 'MD-Plugins for Vite, Vue, and Quasar',
  titleTemplate: (title) => `${title} | MD-Plugins`,
  meta: getMeta(
    'MD-Plugins - Markdown tooling for Vite, Vue, and Quasar',
    'MD-Plugins provides Markdown-it plugins, Vite plugins, and Quasar app extensions for Vue/Vite content workflows, Q-Press docs sites, and SSG-ready documentation.',
  ),
})
</script>
```

## Updating

When updating, Q-Press refreshes only `src/.q-press`. If you want a clean generated shell, run:

```bash
quasar ext invoke @md-plugins/q-press
```

Then review the refreshed generated files and keep project-specific docs, examples, theme overrides, and navigation in project-owned folders.
