# @md-plugins/md-plugin-containers

A **Markdown-It** plugin that provides custom container support for enhanced Markdown rendering. Containers allow you to create stylized blocks with custom rendering logic, ideal for notes, warnings, callouts, and other visual elements.

## Features

- Define custom containers with specific classes or components.
- Add titles to containers for better context (e.g., "Warning", "Note").
- Supports flexible rendering logic for different container types.
- Compatible with Markdown-It environments for additional customization.

## Installation

Install the plugin via your preferred package manager:

```bash
# With npm:
npm install @md-plugins/md-plugin-containers
# Or with Yarn:
yarn add @md-plugins/md-plugin-containers
# Or with pnpm:
pnpm add @md-plugins/md-plugin-containers
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { containersPlugin } from '@md-plugins/md-plugin-containers';

const md = new MarkdownIt();
md.use(containersPlugin, {
  containers: [
    { type: 'note', defaultTitle: 'Note' },
    { type: 'warning', defaultTitle: 'Warning' },
  ],
});

const markdownContent = `
:::note
This is a note.
:::

:::warning
This is a warning!
:::
`;

const renderedOutput = md.render(markdownContent);

console.log('Rendered Output:', renderedOutput);
```

### Example Output

The rendered output will look like this:

```html
<div class="note">
  <p>This is a note.</p>
</div>

<div class="warning">
  <p>This is a warning!</p>
</div>
```

## Options

The `md-plugin-containers` plugin supports the following options:

| Option     | Type                                          | Default | Description                                             |
| ---------- | --------------------------------------------- | ------- | ------------------------------------------------------- |
| containers | Array<{ type: string; defaultTitle: string }> | []      | List of containers with their types and default titles. |
| render     | Function                                      | null    | Custom rendering function for containers.               |

## Defining Custom Containers

You can define custom containers with their own styles or components:

```js
md.use(containersPlugin, {
  containers: [
    { type: 'tip', defaultTitle: 'Tip' },
    { type: 'important', defaultTitle: 'Important' },
  ],
});
```

## Advanced Usage

### Custom Rendering Logic

Override the default rendering logic for containers:

```js
md.use(containersPlugin, {
  containers: [{ type: 'note', defaultTitle: 'Note' }],
  render(tokens, idx) {
    const token = tokens[idx];
    if (token.nesting === 1) {
      // Opening tag
      const title = token.info.trim() || 'Note';
      return `<div class="custom-note"><strong>${title}:</strong>\n`;
    } else {
      // Closing tag
      return `</div>\n`;
    }
  },
});
```

## Adding Titles

Containers can include titles by default or allow custom titles to be specified:

```markdown
:::note Custom Note Title
This is a custom note with a title.
:::
```

Rendered Output:

```html
<div class="note">
  <strong>Custom Note Title</strong>
  <p>This is a custom note with a title.</p>
</div>
```

## Nested Containers

Containers can be nested if your rendering logic supports it:

```markdown
:::note Outer Note
:::warning Inner Warning
Be cautious!
::::::
```

Rendered Output:

```html
<div class="note">
  <p>Outer Note</p>
  <div class="warning">
    <p>Be cautious!</p>
  </div>
</div>
```

## Testing

To run the tests for this plugin, use the following command:

```bash
pnpm test
```

## License

This plugin is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
