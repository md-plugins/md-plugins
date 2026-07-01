# @md-plugins/md-plugin-mermaid

[![npm version](https://img.shields.io/npm/v/@md-plugins/md-plugin-mermaid?label=%40md-plugins%2Fmd-plugin-mermaid)](https://www.npmjs.com/package/@md-plugins/md-plugin-mermaid)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/md-plugin-mermaid)](https://www.npmjs.com/package/@md-plugins/md-plugin-mermaid)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/md-plugin-mermaid)](https://www.npmjs.com/package/@md-plugins/md-plugin-mermaid)
[![license](https://img.shields.io/npm/l/@md-plugins/md-plugin-mermaid)](https://www.npmjs.com/package/@md-plugins/md-plugin-mermaid)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A **Markdown-It** plugin that renders Mermaid fenced code blocks. It is designed for Q-Press and Vue-based Markdown pages, while still allowing plain MarkdownIt users to render Mermaid-compatible `<pre>` blocks.

## Features

- Converts `mermaid` and `mmd` fenced code blocks into a configurable component.
- Passes fence class metadata through to the rendered component or `<pre>` element.
- Adds page import statements for Q-Press generated Vue pages.
- Supports a plain `<pre class="mermaid">` render mode for custom MarkdownIt pipelines.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-mermaid
# with bun:
bun add @md-plugins/md-plugin-mermaid
# with Yarn:
yarn add @md-plugins/md-plugin-mermaid
# with npm:
npm install @md-plugins/md-plugin-mermaid
```

If you render Mermaid in the browser, install Mermaid in the consuming app:

```bash
pnpm add mermaid
```

## Usage

### Q-Press or Vue Component Mode

```ts
import MarkdownIt from 'markdown-it'
import { mermaidPlugin } from '@md-plugins/md-plugin-mermaid'

const md = new MarkdownIt()
md.use(mermaidPlugin, {
  componentName: 'MarkdownMermaid',
})
```

### Raw MarkdownIt Mode

```ts
import MarkdownIt from 'markdown-it'
import { mermaidPlugin } from '@md-plugins/md-plugin-mermaid'

const md = new MarkdownIt()
md.use(mermaidPlugin, {
  renderMode: 'pre',
})
```

Then initialize Mermaid in your application after the HTML is mounted.

## Markdown

````markdown
```mermaid
graph TD
  A[Write Markdown] --> B[Render Diagram]
```
````

Use Markdown fence classes when a diagram needs responsive presentation or custom styling:

````markdown
```mermaid {.desktop-diagram}
flowchart LR
  A --> B
```

```mermaid {.mobile-diagram}
flowchart TD
  A --> B
```
````

## Options

| Option        | Type                 | Default                  | Description                                     |
| ------------- | -------------------- | ------------------------ | ----------------------------------------------- |
| languages     | string[]             | `['mermaid', 'mmd']`     | Fence languages treated as Mermaid diagrams.    |
| renderMode    | 'component' \| 'pre' | `'component'`            | Output mode for Mermaid diagrams.               |
| componentName | string               | `'MarkdownMermaid'`      | Component used in component mode.               |
| codeProp      | string               | `'code'`                 | Component prop that receives Mermaid source.    |
| preClass      | string               | `'mermaid'`              | CSS class used in pre mode.                     |
| pageScripts   | string[]             | Q-Press component import | Page imports added to generated Vue components. |

## Support

If md-plugin-mermaid is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
