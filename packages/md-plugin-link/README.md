# @md-plugins/md-plugin-link

A **Markdown-It** plugin that customizes the rendering of links in Markdown content. This plugin is especially useful for Vue.js applications, where internal links can be replaced with Vue Router components (e.g., `<router-link>`).

## Features

- Replaces standard `<a>` tags with a custom link tag (e.g., `MarkdownLink` or `router-link`) for internal links.
- Adds a customizable attribute (e.g., `to`) for routing.
- Automatically injects import statements for required components into the `pageScripts` property in the Markdown-It environment (`env`).
- Retains external links as standard `<a>` tags.

## Installation

Install the plugin via your preferred package manager:

```bash
# With npm:
npm install @md-plugins/md-plugin-link
# Or with Yarn:
yarn add @md-plugins/md-plugin-link
# Or with pnpm:
pnpm add @md-plugins/md-plugin-link
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
  pageScript: 'import MarkdownLink from "src/.q-press/components/MarkdownLink.vue";',
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
Set(['import MarkdownLink from "src/.q-press/components/MarkdownLink.vue";'])
```

## Options

The `md-plugin-link` plugin supports the following options:

| Option        | Type   | Default                                                                | Description                                                     |
| ------------- | ------ | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| linkTag       | string | 'MarkdownLink'                                                         | Custom tag to use for internal links.                           |
| linkToKeyword | string | 'to'                                                                   | Attribute to use for internal links (e.g., to for router-link). |
| pageScript    | string | 'import MarkdownLink from "src/.q-press/components/MarkdownLink.vue";' | Import statement for required components.                       |

## Testing

Run the tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/link/overview) for the latest information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
