# Q-Press

Markdown documentation tooling for Quasar and Vite applications.

See the [documentation](https://md-plugins.netlify.app/quasar-app-extensions/qpress/overview) for more information.

> Current release candidate: `0.1.0-rc.4`.
>
> Q-Press currently targets Quasar Vite projects using `@quasar/app-vite` `>=3.0.0-rc.3`. TypeScript processing is required.

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
  - `src/components`
  - `src/markdown`
  - `src/examples`
  - `src/siteConfig`
- Here is what gets installed on an **update** install:
  - `src/.q-press`

2. Install `markdown-it` and `@types/markdown-it` in your project devDependencies

- `npm i -D markdown-it @types/markdown-it`
- `yarn add -D markdown-it @types/markdown-it`
- `pnpm i -D markdown-it @types/markdown-it`
- `bun add -d markdown-it @types/markdown-it`

3. Q-Press adds its docs build helpers to your project devDependencies when invoked. If you are wiring the generated files manually, add them yourself:

- `npm i -D mermaid shiki @md-plugins/vite-ssg-plugin @vue/server-renderer`
- `yarn add -D mermaid shiki @md-plugins/vite-ssg-plugin @vue/server-renderer`
- `pnpm add -D mermaid shiki @md-plugins/vite-ssg-plugin @vue/server-renderer`
- `bun add -d mermaid shiki @md-plugins/vite-ssg-plugin @vue/server-renderer`

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
  ```

3. Modify your `quasar.config.ts`

- ```ts
  import { viteMdPlugin, type MenuItem, type MarkdownOptions } from '@md-plugins/vite-md-plugin'

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
              // options: myOptions as MarkdownOptions
            },
          ],
          // ...
  ```

4. Modify your `src/routes/routes.ts`

- ```ts
  import type { RouteRecordRaw } from 'vue-router'
  import mdPageList from '@/markdown/listing'
  const routes = [
    {
      path: '/',
      component: () => import('@/.q-press/layouts/MarkdownLayout.vue'),
      children: [
        // Include the Landing Page route first
        ...Object.entries(mdPageList)
          .filter(([key]) => key.includes('landing-page.md'))
          .map(([, component]) => ({
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
      component: () => import('@/pages/ErrorNotFound.vue'),
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
    import { useDark } from '@/.q-press/composables/dark'
    const { initDark } = useDark()
    initDark()
  </script>
  ```

## Running the App

This is a Quasar app, so all you have to do is run `quasar dev`. You can test it out now and you will have the `MD-Plugins` web site running.

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

Q. Every time I save a Markdown file, the formatter changes syntax that Q-Press needs. How can I prevent this?
A. Current Q-Press projects use `oxfmt` for repository formatting. Use `pnpm format` and `pnpm format:check` as the source of truth for Markdown formatting.

If your editor formats Markdown differently on save, configure it to use the workspace formatter or disable format-on-save for Markdown in that project. A project-level VS Code setting is usually enough:

```json
{
  "[markdown]": {
    "editor.formatOnSave": false
  }
}
```

---

## Updating

When you update, only the `src/.q-press` folder will be updated. If you want to re-install everything, just remove the `src/siteConfig` folder.

To make it easier to update, you can use the following command:

```bash
quasar ext invoke @md-plugins/q-press
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/quasar-app-extensions/qpress/overview) for the latest information.

## Support

If Q-Press is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
