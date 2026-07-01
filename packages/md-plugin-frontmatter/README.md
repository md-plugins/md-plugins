# @md-plugins/md-plugin-frontmatter

[![npm version](https://img.shields.io/npm/v/@md-plugins/md-plugin-frontmatter?label=%40md-plugins%2Fmd-plugin-frontmatter)](https://www.npmjs.com/package/@md-plugins/md-plugin-frontmatter)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/md-plugin-frontmatter)](https://www.npmjs.com/package/@md-plugins/md-plugin-frontmatter)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/md-plugin-frontmatter)](https://www.npmjs.com/package/@md-plugins/md-plugin-frontmatter)
[![license](https://img.shields.io/npm/l/@md-plugins/md-plugin-frontmatter)](https://www.npmjs.com/package/@md-plugins/md-plugin-frontmatter)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A **Markdown-It** plugin that extracts and processes frontmatter from Markdown content. Frontmatter is commonly used for metadata such as titles, authors, and dates, making this plugin essential for static site generators, documentation tools, and content management systems.

## Features

- Extracts frontmatter from Markdown files.
- Supports rendering the frontmatter as raw Markdown or HTML.
- Compatible with various frontmatter syntaxes (YAML, JSON, TOML) via the `gray-matter` library.
- Stores extracted frontmatter in the `frontmatter` property of the Markdown-It environment (`env`).
- Optionally renders an excerpt from the Markdown content.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-frontmatter
# with bun:
bun add @md-plugins/md-plugin-frontmatter
# with Yarn:
yarn add @md-plugins/md-plugin-frontmatter
# with npm:
npm install @md-plugins/md-plugin-frontmatter
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { frontmatterPlugin } from '@md-plugins/md-plugin-frontmatter';
import type { MarkdownItEnv } from '@md-plugins/shared';

const md = new MarkdownIt();
md.use(frontmatterPlugin, {
  renderExcerpt: true,
});

const markdownContent = `
---
title: Frontmatter Example
author: Jane Doe
date: 2024-01-01
---

# Main Content

This is the main content of the Markdown file.
`;

const env: MarkdownItEnv = {};
const renderedOutput = md.render(markdownContent, env);

console.log('Rendered Output:', renderedOutput);
console.log('Extracted Frontmatter:', env.frontmatter);
console.log('Extracted Excerpt:', env.excerpt);
```

### Example Output

For the example above, the `env` will contain:

```json
{
  "frontmatter": {
    "title": "Frontmatter Example",
    "author": "Jane Doe",
    "date": "2024-01-01"
  },
  "excerpt": "<p>This is the main content of the Markdown file.</p>"
}
```

## Options

The `md-plugin-frontmatter` plugin supports the following options:

| Option            | Type    | Default | Description                                                                                    |
| ----------------- | ------- | ------- | ---------------------------------------------------------------------------------------------- |
| grayMatterOptions | object  | {}      | Options for the gray-matter library. Refer to the gray-matter documentation.                   |
| renderExcerpt     | boolean | false   | Whether to render the excerpt as HTML. If false, the raw Markdown is extracted as the excerpt. |

## Advanced Usage

### Customizing Frontmatter Parsing

You can customize the behavior of the `gray-matter` library by passing `grayMatterOptions`:

```js
md.use(frontmatterPlugin, {
  grayMatterOptions: {
    delimiters: '+++', // Use "+++" as the frontmatter delimiter
  },
})
```

## Testing

Run the unit tests with `Vitest` to ensure the plugin behaves as expected:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/frontmatter/overview) for the latest information.

## Support

If md-plugin-frontmatter is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
