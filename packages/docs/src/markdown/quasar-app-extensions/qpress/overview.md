---
title: Q-Press
desc: Q-Press App-Extension for Quasar.
---

The Q-Press App Extension is a powerful tool for Quasar developers that simplifies the integration of Markdown content into Quasar applications. It leverages the capabilities of Vite and various Markdown plugins to transform Markdown files into Vue components, enabling a seamless and efficient workflow for content management.

::: warning
Q-Press is for Quasar Vite projects at this time. Typescript processing is also required. Do not use if you are using Webpack or have a Javascript-only project.
:::

::: tip
This website is built with **Q-Press**! When you install the App-Extension, you will be able have this website up and running in minutes. Later, you can make adjustments to the `src/siteConfig` and add your own markdown files in the `src/markdown` folder to make it your own.
:::

## Key Features

- **Markdown as Vue Components**: Transform Markdown files into Vue components, allowing you to write and manage content in Markdown while leveraging the power of Vue and Quasar.
- **Automatic Configuration**: Automatically configures your Quasar project to handle Markdown files, reducing the need for manual setup.
- **Seamless Integration**: Integrates with Quasar's build system and Vue Router, ensuring smooth navigation and rendering of Markdown content.
- **Customizable**: Provides options to customize the integration, allowing you to tailor the behavior to your specific needs.
- **Hot Module Replacement (HMR)**: Supports HMR for Markdown files, enabling a smooth development experience with instant updates.

## Installation

To install the Q-Press App Extension, use the following command on your existing Quasar project:

```bash
quasar ext add @md-plugins/q-press
```

### What Gets Installed

- **New Install:**
  - `src/.q-press`
  - `src/q-press.global.d.ts`
  - `src/components`
  - `src/markdown`
  - `src/examples`
  - `src/siteConfig`
- **Update Install:**
  - `src/.q-press`
  - `src/q-press.global.d.ts`

### Additional Dependencies

1. **Install `markdown-it` and `@types/markdown-it` in your project devDependencies:**

```tabs
<<| bash npm |>>
npm i -D markdown-it @types/markdown-it
<<| bash yarn |>>
yarn add -D markdown-it @types/markdown-it
<<| bash pnpm |>>
pnpm i -D markdown-it @types/markdown-it
```

2. **Add `prismjs` to your project dependencies:**

```tabs
<<| bash npm |>>
npm i prismjs
<<| bash yarn |>>
yarn add prismjs
<<| bash pnpm |>>
pnpm i prismjs
```

## Configuration

### Modify `src/css/quasar.variables.scss`

Import a Q-Press theme (`default`, `sunrise`, `newspaper`, `tawny`, `mystic`, your own or a 3rd-party theme):

```scss
@import '../.q-press/css/themes/sunrise.scss';
```

### Modify `src/css/app.scss`

Import Q-Press styles:

```scss
@import '../.q-press/css/app.scss';
@import '../.q-press/css/fonts.scss';
@import '../.q-press/css/prism-theme.scss';
```

### Modify `quasar.config.ts`

```typescript
import { defineConfig } from '#q-app/wrappers'
import type { Plugin } from 'vite'
import { viteMdPlugin, type MenuItem } from '@md-plugins/vite-md-plugin'

export default defineConfig(async (ctx) => {
  // Dynamically import siteConfig
  const siteConfig = await import('./src/siteConfig')
  const { sidebar } = siteConfig.default

  return {
    build: {
      vitePlugins: [
        // add this plugin
        [
          viteMdPlugin,
          {
            path: ctx.appPaths.srcDir + '/markdown',
            menu: sidebar as MenuItem[],
          },
        ],
        // other plugins...
      ],
    },
  }
})
```

### Modify `src/routes/routes.ts`

```typescript
import mdPageList from 'src/markdown/listing'

const routes = [
  {
    path: '/',
    component: () => import('src/.q-press/layouts/MarkdownLayout.vue'),
    children: [
      // Include the Landing Page route first
      ...Object.entries(mdPageList)
        .filter(([key]) => key.includes('landing-page.md'))
        .map(([_key, component]) => ({
          path: '',
          name: 'Landing Page',
          component,
          meta: { fullscreen: true, dark: true },
        })),

      // Now include all other routes, excluding the landing-page
      ...Object.keys(mdPageList)
        .filter((key) => !key.includes('landing-page.md')) // Exclude duplicates
        .map((key) => {
          const acc = {
            path: '',
            component: mdPageList[key],
          }

          if (acc.path === '') {
            // Remove '.md' from the end of the filename
            const parts = key.substring(1, key.length - 3).split('/')
            const len = parts.length
            const path = parts[len - 2] === parts[len - 1] ? parts.slice(0, len - 1) : parts

            acc.path = path.join('/')
          }

          return acc
        }),
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
```

### Set Up for Dark Mode

Update your `App.vue`:

```ts
<template>
  <router-view />
</template>

<script setup lang="ts">
  import { useDark } from 'src/.q-press/composables/dark'
  const { initDark } = useDark()
  initDark()
</script>
```

## FAQ

:::details Q. I have errors in my`routes.ts` file, what should I do?

**A.** You can remove the following line: `import type { RouteRecordRaw } from 'vue-router'` and also remove the `type` keyword from the `routes` variable (`: RouteRecordRaw[]`).
:::

:::details Q. I still see an error in my `routes.ts` file, for `_key`, what should I do?

**A.** In your `eslint.config.js` file, add/replace the following in your rules:

```js
'@typescript-eslint/no-unused-vars': [
  'error',
  {
    argsIgnorePattern: '^_',
    ignoreRestSiblings: true,
    varsIgnorePattern: '^_',
  },
],
```

:::

:::details Q. Every time I save a markdown file, `prettier` changes it so that it breaks. How can I prevent this?

**A.** This is both a `prettier` and `eslint` issue. In `eslint.config.js`, add the following to the top of the file, right after `export default [`:

```js
{
  /**
   * Ignore the following files.
   * Please note that pluginQuasar.configs.recommended() already ignores
   * the "node_modules" folder for you (and all other Quasar project
   * relevant folders and files).
   *
   * ESLint requires "ignores" key to be the only one in this object
   */
  ignores: ['eslint.config.js', '**/*.md', 'dist/**/*', 'node_modules'],
},
```

If you don't have a `.prettierignore` file, create one in the root of your project and add the following:

```bash
- Ignore all Markdown files:
\*_/_.md
```

:::

## Updating

When you update, only the `src/.q-press` folder will be updated as well as the file `src/q-press.global.d.ts`. If you want to re-install everything, just remove the `src/siteConfig` folder.

To make it easier to update, you can use the following command:

```bash
quasar ext invoke @md-plugins/q-press
```

Then select the `Overwrite All` option.

---

Happy coding!
