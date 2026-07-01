# @md-plugins/md-plugin-inlinecode

[![npm version](https://img.shields.io/npm/v/@md-plugins/md-plugin-inlinecode?label=%40md-plugins%2Fmd-plugin-inlinecode)](https://www.npmjs.com/package/@md-plugins/md-plugin-inlinecode)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/md-plugin-inlinecode)](https://www.npmjs.com/package/@md-plugins/md-plugin-inlinecode)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/md-plugin-inlinecode)](https://www.npmjs.com/package/@md-plugins/md-plugin-inlinecode)
[![license](https://img.shields.io/npm/l/@md-plugins/md-plugin-inlinecode)](https://www.npmjs.com/package/@md-plugins/md-plugin-inlinecode)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A **Markdown-It** plugin that enhances inline code rendering by adding customizable CSS classes. This allows for better styling and alignment with design systems, making inline code blocks visually distinct and consistent.

## Features

- Adds a customizable CSS class to inline `<code>` elements.
- Supports a default class that can be overridden via plugin options.
- Enhances the appearance of inline code for better readability and emphasis.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-inlinecode
# with bun:
bun add @md-plugins/md-plugin-inlinecode
# with Yarn:
yarn add @md-plugins/md-plugin-inlinecode
# with npm:
npm install @md-plugins/md-plugin-inlinecode
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it'
import { inlinecodePlugin } from '@md-plugins/md-plugin-inlinecode'

const md = new MarkdownIt()
md.use(inlinecodePlugin, {
  inlineCodeClass: 'custom-inline-code-class',
})

const markdownContent = `
Here is some \`inline code\` in a sentence.
`

const renderedOutput = md.render(markdownContent)

console.log('Rendered Output:', renderedOutput)
```

### Example Output

The rendered output will include the specified CSS class:

```html
<p>Here is some <code class="custom-inline-code-class">inline code</code> in a sentence.</p>
```

## Options

The `md-plugin-inlinecode` plugin supports the following options:

| Option          | Type   | Default          | Description                                 |
| --------------- | ------ | ---------------- | ------------------------------------------- |
| inlineCodeClass | string | 'markdown-token' | CSS class to apply to inline `<code>` tags. |

## Testing

Run the tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/inline-code/overview) for the latest information.

## Support

If md-plugin-inlinecode is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
