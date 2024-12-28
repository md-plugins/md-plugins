# @md-plugins/viteMdPlugin

An **opinionated Vite plugin** that transforms Markdown files into Vue Single File Components (SFCs). This plugin integrates Markdown processing directly into your Vite-based Vue project, enabling seamless Markdown-to-Vue workflows.

## Features

- **Markdown to Vue SFC Transformation**: Converts Markdown files into Vue Single File Components, enabling dynamic content rendering.
- **Navigation Menu Integration**: Supports generating a navigation structure based on your Markdown files.
- **Configurable Path Prefix**: Allows setting a base path for routing or file resolution.
- **Opinionated and Minimal**: Focuses on simplicity, leveraging the power of Vue and Markdown for content-driven applications.

## Installation

Install the plugin via your preferred package manager:

```bash
# With npm:
npm install @md-plugins/vite-md-plugin
# Or with Yarn:
yarn add @md-plugins/vite-md-plugin
# Or with pnpm:
pnpm add @md-plugins/vite-md-plugin
```

## Usage

### Basic Setup with Vite

To use the `viteMdPlugin`, configure it in your Vite project:

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteMdPlugin } from 'vite-md-plugin';

const menu = []; // Define your navigation menu structure here
const basePath = '/docs'; // Base path prefix

export default defineConfig({
  plugins: [vue(), viteMdPlugin(basePath, menu)],
});
```

## Quasar Framework Configuration

If you’re using the Quasar Framework, additional configuration is needed to enable support for `.md` files:

1. Update `quasar.config.(js|ts)`:

```js
build: {
  vueRouterMode: 'history', // Required for proper hash link handling

  viteVuePluginOptions: {
    include: [/\.(vue|md)$/], // Include Markdown files
  },
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
];
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
  name: string;
  path?: string;
  icon?: string;
  iconColor?: string;
  rightIcon?: string;
  rightIconColor?: string;
  badge?: string;
  children?: MenuItem[];
  external?: boolean;
  expanded?: boolean;
}
```

## Testing

To run the tests for this plugin, use the following command:

```bash
pnpm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
