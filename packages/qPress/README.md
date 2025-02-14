# Q-Press

The Ultimate Markdown Solution for the Quasar Framework.

See the [documentation](https://md-plugins.netlify.app/quasar-app-extensions/qpress/overview) for more information.

## Features

- **Markdown**
- **Dark Mode**
- **Landing Page**
- **Markdown Layouts**
- **Markdown Components**
- **siteConfig**
- **CSS Themes**
- **Automatic Routing**

## Installation

1. Install the **Q-Press** App-Ext

- `quasar ext add @md-plugins/q-press`
- Here is what gets installed on a **new** install:
  - `src/.q-press`
  - `src/q-press.global.d.ts`
  - `src/components`
  - `src/markdown`
  - `src/examples`
  - `src/siteConfig`
- Here is what gets installed on an **update** install:
  - `src/.q-press`
  - `src/q-press.global.d.ts`

2. Install `markdown-it` and `@types/markdown-it` in your project devDependencies

- `npm i -D markdown-it @types/markdown-it`
- `yarn add -D markdown-it @types/markdown-it`
- `pnpm i -D markdown-it @types/markdown-it`

3. Add `prismjs` to your project dependencies

- `npm i prismjs`
- `yarn add prismjs`
- `pnpm add prismjs`

## Modifications

1. Modify your `src/css/quasar.variables.scss`

- import a Q-Press theme (`default`, `sunrise`, `newspaper`, `tawny`, `mystic`, your own or a 3rd-party theme)
- ```ts
  @import '../.q-press/css/themes/sunrise.scss';
  ```

2. Modify your `src/css/app.scss`

- import Q-Press styles

- ```scss
  @import '../.q-press/css/app.scss';
  @import '../.q-press/css/fonts.scss';
  @import '../.q-press/css/prism-theme.scss';
  ```

3. Modify your `quasar.config.ts`

- ```ts
  import { viteMdPlugin, type MenuItem, type MarkdownOptions } from '@md-plugins/vite-md-plugin'

  export default defineConfig(async (ctx) => {
    // Dynamically import siteConfig
    const siteConfig = await import('./src/siteConfig')
    const { sidebar } = siteConfig
    return {
      build: {
        vitePlugins: [
          // add this plugin
          [
            viteMdPlugin,
            {
              path: ctx.appPaths.srcDir + '/markdown',
              menu: sidebar as MenuItem[],
              // options: myOptions as MarkdownOptions
            },
          ],
          // ...
  ```

4. Modify your `src/routes/routes.ts`

- ```ts
  import type { RouteRecordRaw } from 'vue-router'
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
      path: '/:catchAll(._)_',
      component: () => import('pages/ErrorNotFound.vue'),
    },
  ] as RouteRecordRaw[]

  export default routes
  ```

5. Set up for Dark mode support, update your App.vue

- ```ts
  <template>
    <router-view />
  </template>

  <script setup lang="ts">
    import { useDark } from 'src/.q-press/composables/dark'
    const { initDark } = useDark()
    initDark()
  </script>
  ```

## Running the App

This is a Quasar app, so all you have to do is `quasar dev` and `quasar dev`. You can test it out now and you will have running the `MD-Plugins` web site.

All you need to do now is change the configuration and landing page to make it your own.

## Configuration

### Modify `src/siteConfig/index.ts`

1. Make any appropriate changes to the `siteConfig.ts` file

### Modify `src/components/LandingPage/LandingPage.vue`

1. Update the `LandingPage.vue` file to include your own content

---

## FAQ

Q. I have errors in my `routes.ts` file, what should I do?
A. You can remove the following line: `import type { RouteRecordRaw } from 'vue-router'` and also remove the `type` keyword from the `routes` variable (`: RouteRecordRaw[]`).

Q. I still see an error in my `routes.ts` file, for `_key`, what should I do?
A. In your `eslint.config.js` file, add/replace the following in your rules:

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

Q. Everytime I save a markdown file, `prettier` changes it so that it breaks. How can I prevent this?
A. This is both a `prettier` and `eslint` issue. In `eslint.config.js`, add the following to the top of the file, right after `export default [`:

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

If you don't have a `.prettierignore` file, create one and add the following:

```
# Ignore all Markdown files:
**/*.md
```

---

## Updating

When you update, only the `src/.q-press` folder will be updated as well as the file `src/q-press.global.d.ts`. If you want to re-install everything, just remove the `src/siteConfig` folder.

To make it easier to update, you can use the following command:

```bash
quasar ext invoke @md-plugins/q-press
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/quasar-app-extensions/qpress/overview) for the latest information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
