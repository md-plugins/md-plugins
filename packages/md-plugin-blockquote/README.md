# @md-plugins/md-plugin-blockquote

A **Markdown-It** plugin that enhances blockquote rendering by adding customizable CSS classes. This allows for easier styling and alignment with design systems, enabling more visually appealing and consistent blockquote presentation.

## Features

- Adds customizable CSS classes to `<blockquote>` elements.
- Supports a default class that can be overridden via plugin options.

## Installation

Install the plugin via your preferred package manager:

```bash
# With npm:
npm install @md-plugins/md-plugin-blockquote
# Or with Yarn:
yarn add @md-plugins/md-plugin-blockquote
# Or with pnpm:
pnpm add @md-plugins/md-plugin-blockquote
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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
