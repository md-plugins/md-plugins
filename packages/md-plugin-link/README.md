# @md-plugins/md-plugin-link

[![npm version](https://img.shields.io/npm/v/@md-plugins/md-plugin-link?label=%40md-plugins%2Fmd-plugin-link)](https://www.npmjs.com/package/@md-plugins/md-plugin-link)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/md-plugin-link)](https://www.npmjs.com/package/@md-plugins/md-plugin-link)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/md-plugin-link)](https://www.npmjs.com/package/@md-plugins/md-plugin-link)
[![license](https://img.shields.io/npm/l/@md-plugins/md-plugin-link)](https://www.npmjs.com/package/@md-plugins/md-plugin-link)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A **Markdown-It** plugin that customizes the rendering of links in Markdown content. This plugin is especially useful for Vue.js applications, where internal links can be replaced with Vue Router components (e.g., `<router-link>`).

## Features

- Replaces standard `<a>` tags with a custom link tag (e.g., `MarkdownLink` or `router-link`) for internal links.
- Adds a customizable attribute (e.g., `to`) for routing.
- Automatically injects import statements for required components into the `pageScripts` property in the Markdown-It environment (`env`).
- Retains external links as standard `<a>` tags.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-link
# with bun:
bun add @md-plugins/md-plugin-link
# with Yarn:
yarn add @md-plugins/md-plugin-link
# with npm:
npm install @md-plugins/md-plugin-link
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { linkPlugin } from '@md-plugins/md-plugin-link';
import type { MarkdownItEnv } from '@md-plugins/shared';

const md = new MarkdownIt();
md.use(linkPlugin, {
  linkTag: 'MarkdownLink', // Custom link tag (e.g., Vue Router component)
  linkToKeyword: 'to', // Attribute to use for internal links
  pageScript: 'import MarkdownLink from "@/.q-press/components/MarkdownLink.vue";',
});

const markdownContent = `
[Internal Link](/internal-page)
[External Link](https://example.com)
`;

const env: MarkdownItEnv = {};
const renderedOutput = md.render(markdownContent, env);

console.log('Rendered Output:', renderedOutput);
console.log('Page Scripts:', Array.from(env.pageScripts || []));
```

### Example Output

For the example above, the plugin produces the following output:

```html
<p>
  <MarkdownLink to="/internal-page">Internal Link</MarkdownLink>
  <a href="https://example.com">External Link</a>
</p>
```

Additionally, the `pageScripts` property in the `env` object will contain:

```js
Set(['import MarkdownLink from "@/.q-press/components/MarkdownLink.vue";'])
```

## Options

The `md-plugin-link` plugin supports the following options:

| Option        | Type   | Default                                                              | Description                                                     |
| ------------- | ------ | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| linkTag       | string | 'MarkdownLink'                                                       | Custom tag to use for internal links.                           |
| linkToKeyword | string | 'to'                                                                 | Attribute to use for internal links (e.g., to for router-link). |
| pageScript    | string | 'import MarkdownLink from "@/.q-press/components/MarkdownLink.vue";' | Import statement for required components.                       |

## Testing

Run the tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/link/overview) for the latest information.

## Support

If md-plugin-link is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
