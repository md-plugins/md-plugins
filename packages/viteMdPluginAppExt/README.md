# viteMdPluginAppExt

The `viteMdPluginAppExt` is a Quasar App Extension that integrates the `viteMdPlugin` into your Quasar project. This extension allows you to use Markdown files as Vue components, enabling a seamless integration of Markdown content into your Quasar application.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Overview

The `viteMdPluginAppExt` extension provides a convenient way to use Markdown files in your Quasar project. It leverages the `viteMdPlugin` to transform Markdown content into Vue components, allowing you to write and manage content in Markdown while benefiting from the power of Vue and Quasar.

This App-Extension (app-ext) is for convenience only. For more granular control, you can use the `viteMdPlugin` directly in your Vite configuration. For more information, refer to the [viteMdPlugin documentation](https://github.com/md-plugins/md-plugins/tree/dev/packages/viteMdPlugin).

> Current beta release: `0.1.0-beta.20`.
>
> This app extension currently targets Quasar Vite projects using `@quasar/app-vite` `>=3.0.0-beta.33`.

## Installation

To install the `viteMdPluginAppExt` extension, use the following command:

```bash
quasar ext add @md-plugins/vite-md-plugin
```

## What It Does

The `viteMdPluginAppExt` extension does the following:

- Integrates the `viteMdPlugin` into your Quasar project.
- Allows you to use Markdown files as Vue components.
- Provides a convenient way to manage and render Markdown content in your Quasar application.
- Provides `quasar.config` changes so you don't have to manage the small things. Here is what it changes:

```javascript
build: {
  vueRouterMode: 'history', // Required for proper hash link handling
  viteVuePluginOptions.include: [/\.(vue|md)$/], // Include Markdown files
},
framework: {
  framework.autoImportVueExtensions: ['md', 'vue'], // Include Markdown files
}
```

## Usage

After installing the extension, you need to configure it in your Quasar project. Here are the steps to get started:

1. **Import `viteMdPlugin`:**

   Update your `quasar.config.js` or `quasar.config.ts` to include the `@md-plugins/vite-md-plugin` package:

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
        viteMdPlugin({
          path: ctx.appPaths.srcDir + '/markdown',
          menu: sidebar as MenuItem[],
        }),
        // ...
```

## Configuration

The `viteMdPluginAppExt` extension can be customized through various options. Here are some of the key configuration options:

- **`vueRouterMode`**: Set to `'history'` for proper hash link handling.
- **`viteVuePluginOptions.include`**: Include Markdown files for Vite to transpile.
- **`framework.autoImportVueExtensions`**: Enable auto-import for Markdown extensions.

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/quasar-app-extensions/vite-md-plugin-app-ext/overview) for the latest information.

## Support

If quasar-app-extension-vite-md-plugin is useful in your workflow and you want to support ongoing maintenance:

GitHub Sponsors: https://github.com/sponsors/hawkeye64
PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
