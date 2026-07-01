# @md-plugins/md-plugin-title

[![npm version](https://img.shields.io/npm/v/@md-plugins/md-plugin-title?label=%40md-plugins%2Fmd-plugin-title)](https://www.npmjs.com/package/@md-plugins/md-plugin-title)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/md-plugin-title)](https://www.npmjs.com/package/@md-plugins/md-plugin-title)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/md-plugin-title)](https://www.npmjs.com/package/@md-plugins/md-plugin-title)
[![license](https://img.shields.io/npm/l/@md-plugins/md-plugin-title)](https://www.npmjs.com/package/@md-plugins/md-plugin-title)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A **Markdown-It** plugin that extracts the first `<h1>` title from Markdown content and stores it in the Markdown-It environment (`env`). This is particularly useful for generating page titles dynamically or for metadata extraction in documentation and content management systems.

## Features

- Extracts the first `<h1>` from Markdown content.
- Stores the extracted title in the `title` property of the Markdown-It environment (`env`).
- Provides flexibility to handle scenarios with or without a title.
- Seamlessly integrates into content pipelines for title-based features.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-title
# with bun:
bun add @md-plugins/md-plugin-title
# with Yarn:
yarn add @md-plugins/md-plugin-title
# with npm:
npm install @md-plugins/md-plugin-title
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { titlePlugin } from '@md-plugins/md-plugin-title';
import type { MarkdownItEnv } from '@md-plugins/shared';

const md = new MarkdownIt();
md.use(titlePlugin);

const markdownContent = `
# This is the Page Title

Some content here.
`;

const env: MarkdownItEnv = {};
const renderedOutput = md.render(markdownContent, env);

console.log('Rendered Output:', renderedOutput);
console.log('Extracted Title:', env.title);
```

### Example Output

For the example above, the `env` will contain the following:

```json
{
  "title": "This is the Page Title"
}
```

And the rendered Markdown output will appear as usual:

```html
<h1>This is the Page Title</h1>
<p>Some content here.</p>
```

## Options

The `md-plugin-title` plugin does not currently accept configuration options. It automatically extracts the first `<h1>` element.

## Note

This plugin is not needed when `@md-plugins/md-plugin-frontmatter` already provides the page title metadata your app needs.

## Testing

Run the tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/title/overview) for the latest information.

## Support

If md-plugin-title is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
