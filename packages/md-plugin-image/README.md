# @md-plugins/md-plugin-image

[![npm version](https://img.shields.io/npm/v/@md-plugins/md-plugin-image?label=%40md-plugins%2Fmd-plugin-image)](https://www.npmjs.com/package/@md-plugins/md-plugin-image)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/md-plugin-image)](https://www.npmjs.com/package/@md-plugins/md-plugin-image)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/md-plugin-image)](https://www.npmjs.com/package/@md-plugins/md-plugin-image)
[![license](https://img.shields.io/npm/l/@md-plugins/md-plugin-image)](https://www.npmjs.com/package/@md-plugins/md-plugin-image)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A **Markdown-It** plugin that enhances image rendering by adding customizable CSS classes. This allows for consistent styling and seamless integration into design systems, making it easy to apply specific layouts or effects to images.

## Features

- Adds a customizable CSS class to `<img>` elements.
- Supports a default class that can be overridden via plugin options.
- Enhances image styling and layout consistency.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-image
# with bun:
bun add @md-plugins/md-plugin-image
# with Yarn:
yarn add @md-plugins/md-plugin-image
# with npm:
npm install @md-plugins/md-plugin-image
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it'
import { imagePlugin } from '@md-plugins/md-plugin-image'

const md = new MarkdownIt()
md.use(imagePlugin, {
  imageClass: 'custom-image-class',
})

const markdownContent = `
![Alt text](example.jpg)
`

const renderedOutput = md.render(markdownContent)

console.log('Rendered Output:', renderedOutput)
```

### Example Output

The rendered output will include the specified CSS class:

```html
<img src="example.jpg" alt="Alt text" class="custom-image-class" />
```

## Options

The `md-plugin-image` plugin supports the following options:

| Option     | Type   | Default          | Description                            |
| ---------- | ------ | ---------------- | -------------------------------------- |
| imageClass | string | 'markdown-image' | CSS class to apply to all `<img>` tags |

## Testing

Run the tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/image/overview) for the latest information.

## Support

If md-plugin-image is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
