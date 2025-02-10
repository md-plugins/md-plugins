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
# with pnpm:
pnpm add @md-plugins/md-plugin-containers
# with Yarn:
yarn add @md-plugins/md-plugin-containers
# with npm:
npm install @md-plugins/md-plugin-containers
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it'
import { containersPlugin } from '@md-plugins/md-plugin-containers'
import container from 'markdown-it-container'
import type {
  ContainerDetails,
  CreateContainerFn,
  Container,
  ContainerOptions,
} from '@md-plugins/md-plugin-containers'

const md = new MarkdownIt()

  const containers: ContainerDetails[] = [
    { type: 'tip', defaultTitle: 'TIP' },
    { type: 'warning', defaultTitle: 'WARNING' },
    { type: 'danger', defaultTitle: 'WARNING' },
    { type: 'details', defaultTitle: 'Details' },
  ]

const createContainer: CreateContainerFn = (
  container: Container,
  containerType: string,
  defaultTitle: string,
  md: MarkdownIt,
): [Container, string, ContainerOptions] => {
  const containerTypeLen = containerType.length

  return [
    container,
    containerType,
    {
      render(tokens: Token[], idx: number): string {
        const token = tokens[idx]
        if (!token) {
          return ''
        }

        // Get the title from token info or use defaultTitle
        const rawTitle = token.info.trim().slice(containerTypeLen).trim() || defaultTitle

        // Process the title as inline markdown
        const titleHtml = md ? md.renderInline(rawTitle) : rawTitle

        if (containerType === 'details') {
          return token.nesting === 1
            ? `<details class="markdown-note markdown-note--${containerType}"><summary class="markdown-note__title">${titleHtml}</summary>\n`
            : '</details>\n'
        }

        return token.nesting === 1
          ? `<div class="markdown-note markdown-note--${containerType}"><p class="markdown-note__title">${titleHtml}</p>\n`
          : '</div>\n'
      },
    },
  ]
}

md.use(containersPlugin, containers, createContainer)

const markdownContent = `
::: tip
This is a tip.
:::

::: warning
This is a warning!
:::
`

const renderedOutput = md.render(markdownContent)

console.log('Rendered Output:', renderedOutput)
```

### Example Output

The rendered output will look like this:

```html
<div class="markdown-note markdown-note--tip">
  <p class="markdown-note__title">TIP</p>
  <p>This is a tip container.</p>
</div>

<div class="markdown-note markdown-note--warning">
  <p class="markdown-note__title">WARNING</p>
  <p>This is a warning container.</p>
</div>
```

## Options

The `md-plugin-containers` plugin supports the following options:

| Option       | Type                                          | Default | Description                                             |
| ------------ | --------------------------------------------- | ------- | ------------------------------------------------------- |
| containers   | Array<{ type: string; defaultTitle: string }> | []      | List of containers with their types and default titles. |
| render       | Function                                      | null    | Custom rendering function for containers.               |
| defaultTitle | string                                        | null    | Default title for containers.                           |
| md           | MarkdownIt                                    | null    | Markdown-It instance for rendering.                     |

## Defining Custom Containers

You can define custom containers with their own styles or components:

```js
function createContainer(container, containerType, defaultTitle, md) {
  const containerTypeLen = containerType.length

  return [
    container,
    containerType,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        const rawTitle = token.info.trim().slice(containerTypeLen).trim() || defaultTitle

        // Process the title as inline markdown
        const titleHtml = md ? md.renderInline(rawTitle) : rawTitle

        if (containerType === 'details') {
          return token.nesting === 1
            ? `<details class="markdown-note markdown-note--${containerType}"><summary class="markdown-note__title">${titleHtml}</summary>\n`
            : '</details>\n'
        }

        return token.nesting === 1
          ? `<div class="markdown-note markdown-note--${containerType}"><p class="markdown-note__title">${titleHtml}</p>\n`
          : '</div>\n'
      },
    },
  ]
}
```

## Adding Titles

Containers can include titles by default or allow custom titles to be specified:

```markup
::: note Custom Note Title
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

```markup
::: note Outer Note
::: warning Inner Warning
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

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/containers/overview) for the latest information.

## License

This plugin is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
