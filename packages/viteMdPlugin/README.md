# @md-plugins/viteMdPlugin

See the [documentation](https://md-plugins.netlify.app/vite-plugins/vite-md-plugin/overview) for more details.

An **opinionated Vite plugin** that transforms Markdown files into Vue Single File Components (SFCs). This plugin integrates Markdown processing directly into your Vite-based Vue project, enabling seamless Markdown-to-Vue workflows.

## Features

- **Markdown to Vue SFC Transformation**: Converts Markdown files into Vue Single File Components, enabling dynamic content rendering.
- **Navigation Menu Integration**: Supports generating a navigation structure based on your Markdown files.
- **Configurable Path Prefix**: Allows setting a base path for routing or file resolution.
- **Opinionated and Minimal**: Focuses on simplicity, leveraging the power of Vue and Markdown for content-driven applications.

## md-plugins Used

The `viteMdPlugin` is built on top of the following plugins:

| Plugin                              | Description                                                             | Readme                                             |
| ----------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| `@md-plugins/md-plugin-imports`     | Extracts and processes `<script import>` blocks from Markdown.          | [README](packages/md-plugin-imports/README.md)     |
| `@md-plugins/md-plugin-codeblocks`  | Enhances code block rendering with syntax highlighting, tabs, and more. | [README](packages/md-plugin-codeblocks/README.md)  |
| `@md-plugins/md-plugin-blockquote`  | Adds customizable CSS classes to blockquotes.                           | [README](packages/md-plugin-blockquote/README.md)  |
| `@md-plugins/md-plugin-headers`     | Extracts and processes headers for generating ToCs or managing headers. | [README](packages/md-plugin-headers/README.md)     |
| `@md-plugins/md-plugin-inlinecode`  | Adds a custom class to inline code blocks for styling.                  | [README](packages/md-plugin-inlinecode/README.md)  |
| `@md-plugins/md-plugin-link`        | Converts Markdown links into Vue components for SPA-friendly routing.   | [README](packages/md-plugin-link/README.md)        |
| `@md-plugins/md-plugin-table`       | Adds custom classes and attributes to Markdown tables.                  | [README](packages/md-plugin-table/README.md)       |
| `@md-plugins/md-plugin-title`       | Extracts the first header in Markdown as the page title.                | [README](packages/md-plugin-title/README.md)       |
| `@md-plugins/md-plugin-frontmatter` | Extracts and processes frontmatter content from Markdown files.         | [README](packages/md-plugin-frontmatter/README.md) |
| `@md-plugins/md-plugin-containers`  | Adds custom containers for callouts, warnings, and more.                | [README](packages/md-plugin-containers/README.md)  |
| `@md-plugins/shared`                | Shared utilities and types for the plugins.                             | [README](packages/shared/README.md)                |

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/vite-md-plugin
# with Yarn:
yarn add @md-plugins/vite-md-plugin
# with npm:
npm install @md-plugins/vite-md-plugin
```

## Usage

### Basic Setup with Vite

To use the `viteMdPlugin`, configure it in your Vite project:

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMdPlugin } from 'vite-md-plugin'

const menu = [] // Define your navigation menu structure here
const basePath = '/docs' // Base path prefix

export default defineConfig({
  plugins: [vue(), viteMdPlugin({ path: basePath, menu })],
})
```

## Quasar Framework Configuration

If you’re using the Quasar Framework, additional configuration is needed to enable support for `.md` files:

1. Update `quasar.config.(js|ts)`:

- ```js
      import { viteMdPlugin } from '@md-plugins/vite-md-plugin'
      import { menu } from './src/.q-press/assets/menu' // be sure to create this file

      export default defineConfig((ctx) => {
      // ...
      build: {
        vueRouterMode: 'history', // Required for proper hash link handling
        viteVuePluginOptions: {
          include: [/\.(vue|md)$/], // Include Markdown files
        },
       vitePlugins: [
         [
          viteMdPlugin,
          {
           path: ctx.appPaths.srcDir + '/markdown',
            menu: sidebar as MenuItem[],
          },
        ],
        // ...
        ],
      },
      framework: {
        autoImportVueExtensions: ['vue', 'md'], // Enable auto-import for Markdown extensions
      },
  ```

2. Ensure that your routes and hash links are compatible with Vue Router's history mode.

## Navigation Menu Integration

The `viteMdPlugin` allows you to define a navigation structure that can be updated dynamically based on the Markdown files in your project:

```js
const menu = [
  { title: 'Home', path: '/home' },
  { title: 'About', path: '/about' },
]
```

This menu is passed as a parameter to the plugin and can be used to build a dynamic sidebar or navigation bar in your application.

## Options

The `viteMdPlugin` accepts the following parameters:

| Parameter | Type       | Description                                                                                |
| --------- | ---------- | ------------------------------------------------------------------------------------------ |
| path      | string     | The base path prefix for routing or file resolution.                                       |
| menu      | MenuItem[] | An array representing the navigation menu structure. Each item should have title and path. |

## MenuItem Type

The `menu` parameter should conform to the following structure:

```ts
export interface MenuItem {
  name: string
  path?: string
  icon?: string
  iconColor?: string
  rightIcon?: string
  rightIconColor?: string
  badge?: string
  children?: MenuItem[]
  external?: boolean
  expanded?: boolean
}
```

## Testing

To run the tests for this plugin, use the following command:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/vite-plugins/vite-md-plugin/overview) for the latest information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
