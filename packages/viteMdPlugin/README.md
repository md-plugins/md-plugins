# @md-plugins/vite-md-plugin

[![npm version](https://img.shields.io/npm/v/@md-plugins/vite-md-plugin?label=%40md-plugins%2Fvite-md-plugin)](https://www.npmjs.com/package/@md-plugins/vite-md-plugin)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/vite-md-plugin)](https://www.npmjs.com/package/@md-plugins/vite-md-plugin)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/vite-md-plugin)](https://www.npmjs.com/package/@md-plugins/vite-md-plugin)
[![license](https://img.shields.io/npm/l/@md-plugins/vite-md-plugin)](https://www.npmjs.com/package/@md-plugins/vite-md-plugin)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

See the [documentation](https://md-plugins.netlify.app/vite-plugins/vite-md-plugin/overview) for more details.

An opinionated Vite plugin that transforms Markdown files into Vue Single File Components. It is the Markdown route engine used by Q-Press, and it can also be used directly in Vue/Vite and Quasar apps that own their own layout, navigation, search, and SSG flow.

## Features

- **Markdown to Vue SFC Transformation**: Converts Markdown files into Vue Single File Components.
- **Q-Press-compatible Markdown features**: Supports imports, code blocks, containers, tables, links, frontmatter, titles, and more.
- **Navigation Menu Integration**: Accepts a menu structure for sidebar and route-aware Markdown output.
- **Configurable Markdown Root**: Points the plugin at the Markdown folder your project owns.
- **Direct-use friendly**: Useful without Q-Press when an app wants custom layouts around Markdown pages.

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
# with bun:
bun add @md-plugins/vite-md-plugin
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
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'

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
  import { viteMdPlugin, type MenuItem, type MarkdownOptions } from '@md-plugins/vite-md-plugin'
  import { menu } from './src/assets/menu' // be sure to create this file

  export default defineConfig((ctx) => {
    // ...
    build: {
      vueRouterMode: 'history', // Required for proper hash link handling
      viteVuePluginOptions: {
        include: [/\.(vue|md)$/], // Include Markdown files
      },
      vitePlugins: [
        viteMdPlugin({
          path: ctx.appPaths.srcDir + '/markdown',
          menu: menu as MenuItem[],
          // config: myOptions as MarkdownOptions,
        }),
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
  { name: 'Home', path: '/home' },
  { name: 'About', path: '/about' },
]
```

This menu is passed as a parameter to the plugin and can be used to build a dynamic sidebar or navigation bar in your application.

## Options

The `viteMdPlugin` accepts the following parameters:

| Parameter | Type       | Description                                                                               |
| --------- | ---------- | ----------------------------------------------------------------------------------------- |
| path      | string     | The base path prefix for routing or file resolution.                                      |
| menu      | MenuItem[] | An array representing the navigation menu structure. Each item should have name and path. |

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

## Support

If vite-md-plugin is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
