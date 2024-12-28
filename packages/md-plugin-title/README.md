# @md-plugins/md-plugin-title

A **Markdown-It** plugin that extracts the first `<h1>` title from Markdown content and stores it in the Markdown-It environment (`env`). This is particularly useful for generating page titles dynamically or for metadata extraction in documentation and content management systems.

## Features

- Extracts the first `<h1>` from Markdown content.
- Stores the extracted title in the `title` property of the Markdown-It environment (`env`).
- Provides flexibility to handle scenarios with or without a title.
- Seamlessly integrates into content pipelines for title-based features.

## Installation

Install the plugin via your preferred package manager:

```bash
# With npm:
npm install @md-plugins/md-plugin-title
# Or with Yarn:
yarn add @md-plugins/md-plugin-title
# Or with pnpm:
pnpm add @md-plugins/md-plugin-title
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { titlePlugin } from '@md-plugins/md-plugin-title';

const md = new MarkdownIt();
md.use(titlePlugin);

const markdownContent = `
# This is the Page Title

Some content here.
`;

const env = {};
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

This plugin is not needed is using the `@md-plugins/md-plugin-frontmatter` plugin.

## Testing

Run the tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
