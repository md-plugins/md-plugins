---
title: Upgrade Guide
desc: Upgrade MD-Plugins and Q-Press to the 0.1.0 beta.
related:
  - quasar-app-extensions/qpress/overview
  - quasar-app-extensions/vite-md-plugin-app-ext/overview
  - vite-plugins/vite-md-plugin/overview
---

The `0.1.0` beta line moves MD-Plugins and Q-Press to the Quasar CLI Vite 3 beta toolchain. It is the right version to use when your Quasar application is being upgraded to `@quasar/app-vite` `>=3.0.0-beta.19`.

::: warning
Q-Press and the Quasar app extensions now target Quasar Vite projects using `@quasar/app-vite` `>=3.0.0-beta.19`. They are not intended for Webpack projects or JavaScript-only Quasar projects.
:::

## Before You Upgrade

- Make sure your app is already on a Quasar Vite setup.
- Upgrade the app to `@quasar/app-vite` `>=3.0.0-beta.19`.
- Use TypeScript in the consuming Quasar project.
- Import `defineConfig` in `quasar.config.ts` directly from `@quasar/app-vite`.
- Use `/// <reference types="@quasar/app-vite/client" />` in `src/env.d.ts`.
- Commit or stash local changes before invoking Q-Press, because the update flow can overwrite files in `src/.q-press`.

## Update Packages

For Q-Press projects, update the app extension package and then invoke it:

```bash
pnpm up @md-plugins/quasar-app-extension-q-press@beta
quasar ext invoke @md-plugins/q-press
```

When prompted, choose `Overwrite All` if you want the generated Q-Press files to match the beta templates.

For direct Vite plugin usage, update the packages you consume:

```bash
pnpm up @md-plugins/vite-md-plugin@beta @md-plugins/vite-examples-plugin@beta
```

## File Name Check

Q-Press installs and updates this type shim:

```text
src/q-press.globals.d.ts
```

If your project still references `src/q-press.global.d.ts`, rename the reference to the plural `globals` filename.

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
