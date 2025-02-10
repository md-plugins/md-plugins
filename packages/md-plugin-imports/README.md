# @md-plugins/md-plugin-imports

A **Markdown-It** plugin that extracts and stores `<script import>` blocks from Markdown content. This is useful for managing page-level imports in environments where Markdown is rendered dynamically, such as in Vue.js applications.

The imports are stored in the `pageScripts` property of the Markdown-It environment (`env`). During post-processing the array if imports (Set) can be used to inject the required scripts into the Vue SFC.

## Features

- Extracts `<script import>` blocks from Markdown content.
- Stores the extracted imports in the `pageScripts` property of the Markdown-It environment (`env`).
- Cleans the `<script import>` blocks from the rendered output, leaving the rest of the Markdown intact.
- Handles multiple `<script import>` blocks gracefully.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-imports
# with Yarn:
yarn add @md-plugins/md-plugin-imports
# with npm:
npm install @md-plugins/md-plugin-imports
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { importsPlugin } from '@md-plugins/md-plugin-imports';
import type { MarkdownItEnv } from '@md-plugins/shared';

const md = new MarkdownIt();
md.use(importsPlugin);

const markdownContent = `
<script import>
import A from './A.vue';
import B from './B.vue';
</script>

# Header

Some content here.
`;

const env: MarkdownItEnv = {};
const renderedOutput = md.render(markdownContent, env);

console.log('Rendered Output:', renderedOutput);
console.log('Page Scripts:', env.pageScripts);
```

### Options

The `md-plugin-imports` plugin does not currently accept options. All `<script import>` blocks are processed by default.

### Script Block Syntax

The plugin recognizes `<script import>` blocks in the following format:

```markup
<script import>
import A from './A.vue';
import B from './B.vue';
</script>
```

### Notes

- Script blocks should start with `<script import>` and end with `</script>`.
- The plugin trims and parses the contents of the block line-by-line.

## Advanced Usage

### Multiple Script Blocks

The plugin supports multiple `<script import>` blocks in a single Markdown file:

```markup
<script import>
import A from './A.vue';
</script>

# Header

<script import>
import B from './B.vue';
</script>
```

Both `import A from './A.vue';` and `import B from './B.vue';` will be added to the pageScripts set. Internally, a `Set` is used to ensure uniqueness.

## Frontmatter Compatibility

The plugin does not interfere with frontmatter or other Markdown content:

```markup
---
title: Frontmatter Example
---

<script import>
import C from './C.vue';
</script>

# Header

Some content here.
```

The plugin processes the `<script import>` block while leaving the frontmatter intact.

## Testing

Run the unit tests with `Vitest`:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/imports/overview) for the latest information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
