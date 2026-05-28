---
title: Upgrade Guide
desc: Upgrade MD-Plugins and Q-Press to the 0.1.0 beta.
related:
  - quasar-app-extensions/qpress/overview
  - quasar-app-extensions/vite-md-plugin-app-ext/overview
  - vite-plugins/vite-md-plugin/overview
---

The `0.1.0` beta line moves MD-Plugins and Q-Press to the Quasar CLI Vite 3 beta toolchain. It is the right version to use when your Quasar application is being upgraded to `@quasar/app-vite` `>=3.0.0-beta.31`.

::: warning
Q-Press and the Quasar app extensions now target Quasar Vite projects using `@quasar/app-vite` `>=3.0.0-beta.31`. They are not intended for Webpack projects or JavaScript-only Quasar projects.
:::

## Before You Upgrade

- Make sure your app is already on a Quasar Vite setup.
- Upgrade the app to `@quasar/app-vite` `>=3.0.0-beta.31`.
- Use TypeScript in the consuming Quasar project.
- Import `defineConfig` in `quasar.config.ts` directly from `@quasar/app-vite`.
- Use `/// <reference types="@quasar/app-vite/client" />` in `src/env.d.ts`.
- Commit or stash local changes before invoking Q-Press, because the update flow can overwrite files in `src/.q-press`.

## Update Packages

For Q-Press projects, update the app extension package and then invoke it:

```bash
pnpm up @md-plugins/quasar-app-extension-q-press@beta
# or
npm install @md-plugins/quasar-app-extension-q-press@beta
# or
yarn add @md-plugins/quasar-app-extension-q-press@beta
# or
bun add @md-plugins/quasar-app-extension-q-press@beta
```

Then invoke the app extension:

```bash
quasar ext invoke @md-plugins/q-press
```

When prompted, choose `Overwrite All` if you want the generated Q-Press files to match the beta templates.

For direct Vite plugin usage, update the packages you consume:

```bash
pnpm up @md-plugins/vite-md-plugin@beta @md-plugins/vite-examples-plugin@beta
# or
npm install @md-plugins/vite-md-plugin@beta @md-plugins/vite-examples-plugin@beta
# or
yarn add @md-plugins/vite-md-plugin@beta @md-plugins/vite-examples-plugin@beta
# or
bun add @md-plugins/vite-md-plugin@beta @md-plugins/vite-examples-plugin@beta
```

## Remove App-Level Shared Imports

Q-Press applications should not install or import `@md-plugins/shared` directly. The shared package remains part of the MD-Plugins internals, but app-level Q-Press files should use the helpers generated into the app.

If your project has this dependency, remove it from the consuming app:

```bash
pnpm remove @md-plugins/shared
# or
npm uninstall @md-plugins/shared
# or
yarn remove @md-plugins/shared
# or
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

The beta templates include updated example actions for GitHub source links and CodePen playgrounds. If your project keeps customized Q-Press files, compare your copies of these files with the current template:

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
