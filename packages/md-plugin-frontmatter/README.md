# @md-plugins/md-plugin-frontmatter

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
# With npm:
npm install @md-plugins/md-plugin-frontmatter
# Or with Yarn:
yarn add @md-plugins/md-plugin-frontmatter
# Or with pnpm:
pnpm add @md-plugins/md-plugin-frontmatter
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { frontmatterPlugin } from '@md-plugins/md-plugin-frontmatter';

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

const env = {};
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
| renderExcerpt     | boolean | true    | Whether to render the excerpt as HTML. If false, the raw Markdown is extracted as the excerpt. |

## Advanced Usage

### Customizing Frontmatter Parsing

You can customize the behavior of the `gray-matter` library by passing `grayMatterOptions`:

```js
md.use(frontmatterPlugin, {
  grayMatterOptions: {
    delimiters: '+++', // Use "+++" as the frontmatter delimiter
  },
});
```

## Testing

Run the unit tests with `Vitest` to ensure the plugin behaves as expected:

```bash
pnpm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
