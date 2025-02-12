---
title: Vite Markdown Plugin
desc: Vite plugin for transforming Markdown content into Vue Single File Components.
related:
  - vite-plugins/vite-examples-plugin/overview
  - quasar-app-extensions/vite-md-plugin-app-ext/overview
---

Welcome to the Vite Markdown Plugin documentation! This guide will provide you with an overview of the Vite Markdown plugin and its features.

## What is the Vite Markdown Plugin?

The Vite Markdown Plugin is a powerful tool that transforms Markdown content into Vue Single File Components (SFCs). It integrates seamlessly with Vite to provide a flexible and customizable way to handle Markdown files in your Vue projects.

## Key Features

- **Markdown to Vue SFC Transformation**: Converts Markdown files into Vue Single File Components, enabling dynamic content rendering.
- **Navigation Menu Integration**: Supports generating a navigation structure based on your Markdown files.
- **Configurable Path Prefix**: Allows setting a base path for routing or file resolution.
- **Opinionated and Minimal**: Focuses on simplicity, leveraging the power of Vue and Markdown for content-driven applications.

## md-plugins Used

The `viteMdPlugin` is built on top of the following plugins:

| Plugin                              | Description                                                             | Readme                                             | Docs                                     |
| ----------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------- |
| `@md-plugins/md-plugin-codeblocks`  | Enhances code block rendering with syntax highlighting, tabs, and more. | [README](packages/md-plugin-codeblocks/README.md)  | [Docs](/md-plugins/codeblocks/overview)  |
| `@md-plugins/md-plugin-blockquote`  | Adds customizable CSS classes to blockquotes.                           | [README](packages/md-plugin-blockquote/README.md)  | [Docs](/md-plugins/blockquote/overview)  |
| `@md-plugins/md-plugin-headers`     | Extracts and processes headers for generating ToCs or managing headers. | [README](packages/md-plugin-headers/README.md)     | [Docs](/md-plugins/headers/overview)     |
| `@md-plugins/md-plugin-inlinecode`  | Adds a custom class to inline code blocks for styling.                  | [README](packages/md-plugin-inlinecode/README.md)  | [Docs](/md-plugins/inline-code/overview) |
| `@md-plugins/md-plugin-imports`     | Extracts and processes `<script import>` blocks from Markdown.          | [README](packages/md-plugin-imports/README.md)     | [Docs](/md-plugins/imports/overview)     |
| `@md-plugins/md-plugin-link`        | Converts Markdown links into Vue components for SPA-friendly routing.   | [README](packages/md-plugin-link/README.md)        | [Docs](/md-plugins/link/overview)        |
| `@md-plugins/md-plugin-table`       | Adds custom classes and attributes to Markdown tables.                  | [README](packages/md-plugin-table/README.md)       | [Docs](/md-plugins/table/overview)       |
| `@md-plugins/md-plugin-title`       | Extracts the first header in Markdown as the page title.                | [README](packages/md-plugin-title/README.md)       | [Docs](/md-plugins/title/overview)       |
| `@md-plugins/md-plugin-frontmatter` | Extracts and processes frontmatter content from Markdown files.         | [README](packages/md-plugin-frontmatter/README.md) | [Docs](/md-plugins/frontmatter/overview) |
| `@md-plugins/md-plugin-containers`  | Adds custom containers for callouts, warnings, and more.                | [README](packages/md-plugin-containers/README.md)  | [Docs](/md-plugins/containers/overview)  |
| `@md-plugins/shared`                | Shared utilities and types for the plugins.                             | [README](packages/shared/README.md)                | [Docs](/md-plugins/shared/overview)      |

## Installation

You can install the Vite MD plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash pnpm |>>
pnpm add @md-plugins/vite-md-plugin
<<| bash yarn |>>
yarn add @md-plugins/vite-md-plugin
<<| bash npm |>>
npm install @md-plugins/vite-md-plugin
```

## Usage

### Basic Setup with Vite

To use the `viteMdPlugin`, configure it in your Vite project:

```typescript
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

```typescript
import { viteMdPlugin } from '@md-plugins/vite-md-plugin';
import { menu } from './src/assets/menu'; // be sure to create this file

export default defineConfig((ctx) => {
  // ...
```

2. Add the following configuration:

```typescript
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
        // options: myOptions as MarkdownOptions
      },
    ],
    // ...
  ],
},

framework: {
  autoImportVueExtensions: ['vue', 'md'], // Enable auto-import for Markdown extensions
},
```

3. Ensure that your routes and hash links are compatible with Vue Router's history mode.

## Navigation Menu Integration

The `viteMdPlugin` allows you to define a navigation structure that can be updated dynamically based on the Markdown files in your project:

```typescript
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

```typescript
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

## License

This project is licensed under the MIT License. See the LICENSE file for details.
