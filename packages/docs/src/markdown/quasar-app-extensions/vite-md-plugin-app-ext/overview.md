---
title: ViteMdPluginAppExt App Extension
desc: Overview of the ViteMdPluginAppExt for Quasar.
related:
  - vite-plugins/vite-md-plugin/overview
  - quasar-app-extensions/qpress/overview
---

The `viteMdPluginAppExt` is a [Quasar App Extension](https://quasar.dev/app-extensions/introduction) that integrates the `viteMdPlugin` into your Quasar project. This extension allows you to use Markdown files as Vue components, enabling a seamless integration of Markdown content into your Quasar application.

## Key Features

- **Markdown as Vue Components**: Transform Markdown files into Vue components, allowing you to write and manage content in Markdown while leveraging the power of Vue and Quasar.
- **Automatic Configuration**: Automatically configures your Quasar project to handle Markdown files, reducing the need for manual setup.
- **Seamless Integration**: Integrates with Quasar's build system and Vue Router, ensuring smooth navigation and rendering of Markdown content.
- **Customizable**: Provides options to customize the integration, allowing you to tailor the behavior to your specific needs.

## How It Works

The `viteMdPluginAppExt` extension leverages the `viteMdPlugin` to transform Markdown content into Vue components. It automatically updates your Quasar configuration to include the necessary settings for handling Markdown files.

### Automatic Configuration

When you install and configure the `viteMdPluginAppExt` extension, it makes the following changes to your Quasar configuration:

- **Vue Router Mode**: Sets the `vueRouterMode` to `'history'` to ensure proper hash link handling.
- **Vite Plugin Options**: Includes Markdown files in the `viteVuePluginOptions.include` array to ensure they are transpiled correctly.
- **Auto Import Extensions**: Adds `'md'` and `'vue'` to the `framework.autoImportVueExtensions` array to enable auto-import for Markdown extensions.

### Example Configuration

Here is an example of how the `viteMdPluginAppExt` extension updates your Quasar configuration:

```javascript
build: {
  vueRouterMode: 'history', // Required for proper hash link handling
  viteVuePluginOptions.include: [/\.(vue|md)$/], // Include Markdown files
},
framework: {
  framework.autoImportVueExtensions: ['md', 'vue'], // Include Markdown files
}
```

## Installation

To install the `viteMdPluginAppExt` extension, use the following command:

```bash
pnpm add @md-plugins/vite-md-plugin-app-ext
```

## Usage

After installing the extension, you need to configure it in your Quasar project. Here are the steps to get started:

1. **Import `@md-plugins/vite-md-plugin`:**

   Update your `quasar.config.js` or `quasar.config.ts` to include the `@md-plugins/vite-md-plugin` extension:

   ```js
   import { viteMdPlugin, type MenuItem } from '@md-plugins/vite-md-plugin'
   ```

2. **Import Your Sidebar Menu:**

   ```js
   import siteConfig from './src/siteConfig'
   const { sidebar } = siteConfig
   ```

3. **Add the `viteMdPlugin` to the `vitePlugins` array:**

   ```js
   vitePlugins: [
     viteMdPlugin(ctx.appPaths.srcDir + '/markdown', sidebar as MenuItem[]),
     // ...
   ]
   ```

## MenuItem Interface

The `MenuItem` interface defines the structure of the sidebar menu items. It includes the following properties:

```ts
interface MenuItem {
  name: string
  path?: string
  icon?: string
  iconColor?: string
  rightIcon?: string
  rightIconColor?: string
  badge?: string
  children?: MenuItem[] | undefined
  external?: boolean
  expanded?: boolean
}
```

## Conclusion

The `viteMdPluginAppExt` extension provides a convenient way to integrate Markdown content into your Quasar project. By transforming Markdown files into Vue components and automatically configuring your project, it simplifies the process of managing and rendering Markdown content. Whether you're building a documentation site, a blog, or any other content-rich application, the `viteMdPluginAppExt` extension offers a powerful and flexible solution.

Happy coding!
