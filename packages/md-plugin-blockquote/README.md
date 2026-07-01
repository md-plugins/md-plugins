# @md-plugins/md-plugin-blockquote

[![npm version](https://img.shields.io/npm/v/@md-plugins/md-plugin-blockquote?label=%40md-plugins%2Fmd-plugin-blockquote)](https://www.npmjs.com/package/@md-plugins/md-plugin-blockquote)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/md-plugin-blockquote)](https://www.npmjs.com/package/@md-plugins/md-plugin-blockquote)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/md-plugin-blockquote)](https://www.npmjs.com/package/@md-plugins/md-plugin-blockquote)
[![license](https://img.shields.io/npm/l/@md-plugins/md-plugin-blockquote)](https://www.npmjs.com/package/@md-plugins/md-plugin-blockquote)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A **Markdown-It** plugin that enhances blockquote rendering by adding customizable CSS classes. This allows for easier styling and alignment with design systems, enabling more visually appealing and consistent blockquote presentation.

## Features

- Adds customizable CSS classes to `<blockquote>` elements.
- Supports a default class that can be overridden via plugin options.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-blockquote
# with bun:
bun add @md-plugins/md-plugin-blockquote
# with Yarn:
yarn add @md-plugins/md-plugin-blockquote
# with npm:
npm install @md-plugins/md-plugin-blockquote
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it'
import { blockquotePlugin } from 'md-plugin-blockquote'

const md = new MarkdownIt()
md.use(blockquotePlugin, {
  blockquoteClass: 'custom-blockquote',
})

const markdownContent = `
> This is a blockquote.
`

const renderedOutput = md.render(markdownContent)

console.log('Rendered Output:', renderedOutput)
```

### Example Output

The rendered output will include the specified CSS class:

```html
<blockquote class="custom-blockquote">
  <p>This is a blockquote.</p>
</blockquote>
```

## Options

The `md-plugin-blockquote` plugin supports the following options:

| Option          | Type   | Default               | Description                        |
| --------------- | ------ | --------------------- | ---------------------------------- |
| blockquoteClass | string | 'markdown-blockquote' | CSS class to apply to blockquotes. |

## Testing

To run the tests, use the following command:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/blockquote/overview) for the latest information.

## Support

If md-plugin-blockquote is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
