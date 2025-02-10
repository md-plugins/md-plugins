# @md-plugins/md-plugin-inlinecode

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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
