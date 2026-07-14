# @md-plugins/quasar-app-extension-vite-md-plugin

[![npm version](https://img.shields.io/npm/v/@md-plugins/quasar-app-extension-vite-md-plugin?label=%40md-plugins%2Fquasar-app-extension-vite-md-plugin)](https://www.npmjs.com/package/@md-plugins/quasar-app-extension-vite-md-plugin)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/quasar-app-extension-vite-md-plugin)](https://www.npmjs.com/package/@md-plugins/quasar-app-extension-vite-md-plugin)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/quasar-app-extension-vite-md-plugin)](https://www.npmjs.com/package/@md-plugins/quasar-app-extension-vite-md-plugin)
[![license](https://img.shields.io/npm/l/@md-plugins/quasar-app-extension-vite-md-plugin)](https://www.npmjs.com/package/@md-plugins/quasar-app-extension-vite-md-plugin)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

This Quasar App Extension wires `@md-plugins/vite-md-plugin` into a Quasar Vite app so Markdown files can be compiled as Vue pages. It is the lightweight Markdown route option when you want the Markdown transform without the full Q-Press documentation shell.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Overview

The extension adds the Markdown-to-Vue transform, configures Quasar to compile `.md` files, and gives content-heavy Quasar apps a smaller path than adopting Q-Press. Use it for custom docs, content pages, release notes, or internal knowledge-base routes where your app owns the layout and navigation.

This App Extension is for convenience only. For more granular control, use `viteMdPlugin` directly in your Vite configuration. For the full generated docs-site experience, use Q-Press instead. For more information, refer to the [viteMdPlugin documentation](https://github.com/md-plugins/md-plugins/tree/dev/packages/viteMdPlugin).

> Current stable release: `1.1.0`.
>
> This app extension currently targets Quasar Vite projects using `@quasar/app-vite` `>=3.0.0`.

## Installation

To install the extension, use the following command:

```bash
quasar ext add @md-plugins/vite-md-plugin
```

## What It Does

The extension does the following:

- Integrates `viteMdPlugin` into your Quasar project.
- Allows you to use Markdown files as Vue page components.
- Configures Quasar to compile `.md` files beside Vue SFCs.
- Leaves layout, routing, navigation, search, and SSG decisions in your app.
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

The extension can be customized through the underlying Vite and Quasar configuration. Here are some of the key configuration options:

- **`vueRouterMode`**: Set to `'history'` for proper hash link handling.
- **`viteVuePluginOptions.include`**: Include Markdown files for Vite to transpile.
- **`framework.autoImportVueExtensions`**: Enable auto-import for Markdown extensions.

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/quasar-app-extensions/vite-md-plugin-app-ext/overview) for the latest information.

## Support

If quasar-app-extension-vite-md-plugin is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
