# md-plugin-codeblocks

A **Markdown-It** plugin that enhances code block rendering by providing syntax highlighting, line numbering, and support for advanced features like tabbed code blocks. It integrates with Prism.js for syntax highlighting and allows customization for various use cases.

## Features

- **Syntax Highlighting**: Automatically highlights code blocks using **Prism.js**.
- **Line Numbering**: Optionally adds line numbers to code blocks.
- **Magic Comments**: Supports special comments like `[[! highlight]]`, `[[! add]]`, and `[[! rem]]` for inline code annotations.
- **Tabbed Code Blocks**: Enables the creation of tabbed code blocks for multi-language or multi-file examples.
- **Customizable Components**: Supports custom wrapper and copy button components.
- **Fallback for Unsupported Languages**: Gracefully handles code blocks written in unsupported languages.

## Installation

Install the plugin via your preferred package manager:

```bash
# With npm:
npm install @md-plugins/md-plugin-codeblocks
# Or with Yarn:
yarn add @md-plugins/md-plugin-codeblocks
# Or with pnpm:
pnpm add @md-plugins/md-plugin-codeblocks
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it'
import { codeblocksPlugin } from '@md-plugins/md-plugin-codeblocks'

const md = new MarkdownIt()
md.use(codeblocksPlugin, {
  containerComponent: 'MarkdownPrerender',
  copyButtonComponent: '<MarkdownCopyButton',
  preClass: 'markdown-code',
  pageScripts: [
    "import MarkdownPrerender from 'src/components/md/MarkdownPrerender'",
    "import MarkdownCopyButton from 'src/components/md/MarkdownCopyButton.vue'",
  ],
})
```

## Example Markdown Input

```javascript
console.log('Hello, world!')
```

### Example Output

The rendered output will include syntax-highlighted code wrapped in customizable components:

```html
<markdown-prerender>
  <pre v-pre class="markdown-code language-javascript">
    <code>
      console<span class="token punctuation">.</span>
      <span class="token function">log</span>
      <span class="token punctuation">(</span>
      <span class="token string">'Hello, world!'</span>
      <span class="token punctuation">)</span>
      <span class="token punctuation">;</span>
    </code>
  </pre>
  <markdown-copy-button></markdown-copy-button>
</markdown-prerender>
```

## Options

The `md-plugin-codeblocks` plugin supports the following options:

| Option              | Type   | Default                | Description                                                    |
| ------------------- | ------ | ---------------------- | -------------------------------------------------------------- |
| defaultLang         | string | 'markup'               | Default language for code blocks without a specified language. |
| containerComponent  | string | 'markdown-prerender'   | Custom wrapper component for code blocks.                      |
| copyButtonComponent | string | 'markdown-copy-button' | Custom copy button component.                                  |
| preClass            | string | 'markdown-code'        | CSS class for the `<pre>` element.                             |
| codeClass           | string | ''                     | CSS class for the `<code>` element.                            |
| tabPanelTagName     | string | 'q-tab-panel'          | Tag name for the tab panels.                                   |
| tabPanelTagClass    | string | 'q-pa-none'            | CSS class for the tab panels.                                  |

## Advanced Features

### Line Numbering

The plugin supports magic comments for inline annotations:

```js [numbered]
// All lines will be numbered
console.log('Line 1')
console.log('Line 2')
console.log('Line 3')
```

### Line Highlighting and Annotations

````markup
```js [highlight=2]
console.log('Line 1')
console.log('Line 2') // This line will be highlighted
console.log('Line 3')
```
````

````markup
```js
console.log('Line 1')
console.log('Line 2')
;[[highlight]] // This line will be highlighted
console.log('Line 3')
```
````

````markup
```js [add=2]
console.log('Line 1')
console.log('Line 2') // This line will be accented and prefixed with a '+'
console.log('Line 3')
```
````

````markup
```js [rem=2]
console.log('Line 1')
console.log('Line 2') // This line will be accented and prefixed with a '-'
console.log('Line 3')
```
````

#### Combining Annotations

````markup
```js [numbered highlight=1 rem=2 add=3]
console.log('Line 1') // This line will be highlighted
console.log('Line 2') // This line will be accented and prefixed with a '-'
console.log('Line 3') // This line will be accented and prefixed
```
````

### Using Ranges

Additonally, with the exception of `numbered`, you can use ranges to annotate multiple lines:

```markup
[highlight=1,10-11 add=4,7-9 rem=12-14]
```

### Tabbed Code Blocks

Easily create tabbed interfaces for multiple code examples:

````markup
```tabs
<<|js Tab 1|>>
console.log('Hello from Tab 1');

<<|ts Tab 2|>>
console.log('Hello from Tab 2');
```
````

## Testing

Run the unit tests with `Vitest`:

```bash
pnpm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
