---
title: Containers Plugin
desc: Containers plugin for Markdown.
---

Welcome to the Containers Plugin documentation! This guide will provide you with an overview of the Containers plugin and its features.

## What is the Containers Plugin?

The Containers Plugin is a powerful tool that enhances the standard Markdown functionality by allowing you to create custom containers for different types of content blocks. It integrates seamlessly with Markdown-It to provide a flexible and customizable way to handle containers in your Markdown files.

## Key Features

- **Custom Containers**: Create custom containers for different types of content blocks like tips, warnings, and details.
- **Default Titles**: Specify default titles for containers if no specific title is provided in the Markdown.
- **Flexible Configuration**: Use a custom function to create and configure containers.

## Examples

Here are some examples of what you can achieve with the Containers Plugin:

### Standard Container

::: tip
This is a tip container.
:::

```markup
::: tip
This is a tip container.
:::
```

::: warning
This is a warning container.
:::

```markup
::: warning
This is a warning container.
:::
```

::: danger
This is a danger container.
:::

```markup
::: danger
This is a danger container.
:::
```

::: details
This is a details container.
:::

```markup
::: details
This is a details container.
:::
```

### Container with Custom Title

::: warning Custom Warning Title
This is a warning container with a custom title.
:::

```markup
::: warning Custom Warning Title
This is a warning container with a custom title.
:::
```

## Name

The official NPM name is `@md-plugins/md-plugin-containers`.

## Installation

You can install the Containers plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-containers
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-containers
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-containers
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { containersPlugin } from '@md-plugins/md-plugin-containers'
import container from 'markdown-it-container'

const md = new MarkdownIt()

const containers = [
  { type: 'warning', defaultTitle: 'Warning' },
  { type: 'tip', defaultTitle: 'Tip' },
  { type: 'details', defaultTitle: 'Details' },
]

function createContainer(container, containerType, defaultTitle) {
  const containerTypeLen = containerType.length

  return [
    container,
    containerType,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        const title = token.info.trim().slice(containerTypeLen).trim() || defaultTitle

        if (containerType === 'details') {
          return token.nesting === 1
            ? `<details class="markdown-note markdown-note--${containerType}"><summary class="markdown-note__title">${title}</summary>\n`
            : '</details>\n'
        }

        return token.nesting === 1
          ? `<div class="markdown-note markdown-note--${containerType}"><p class="markdown-note__title">${title}</p>\n`
          : '</div>\n'
      },
    },
  ]
}

md.use(containersPlugin, containers, createContainer)

// Now you can use the Containers plugin in your Markdown content
const result = md.render('::: tip\nThis is a tip container.\n:::')
console.log(result)
```

### Options

The Containers plugin accepts the following options:

- **containers**: An array of `ContainerDetails` objects, each specifying a container type and its default title.
- **createContainer**: A function that creates and returns the container plugin configuration.

## Advanced Configuration

For more advanced configurations, you can combine the Containers plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```javascript
import MarkdownIt from 'markdown-it'
import { containersPlugin } from '@md-plugins/md-plugin-containers'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'
import container from 'markdown-it-container'

const md = new MarkdownIt()

const containers = [
  { type: 'warning', defaultTitle: 'Warning' },
  { type: 'tip', defaultTitle: 'Tip' },
  { type: 'details', defaultTitle: 'Details' },
]

function createContainer(container, containerType, defaultTitle) {
  const containerTypeLen = containerType.length

  return [
    container,
    containerType,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        const title = token.info.trim().slice(containerTypeLen).trim() || defaultTitle

        if (containerType === 'details') {
          return token.nesting === 1
            ? `<details class="markdown-note markdown-note--${containerType}"><summary class="markdown-note__title">${title}</summary>\n`
            : '</details>\n'
        }

        return token.nesting === 1
          ? `<div class="markdown-note markdown-note--${containerType}"><p class="markdown-note__title">${title}</p>\n`
          : '</div>\n'
      },
    },
  ]
}

md.use(containersPlugin, containers, createContainer).use(markdownItAnchor).use(markdownItToc)

// Now you can use the Containers plugin along with other plugins in your Markdown content
const result = md.render(
  '::: tip\nThis is a tip container.\n:::\n\n# Table of Contents\n\n[[toc]]\n\n::: warning Custom Warning Title\nThis is a warning container with a custom title.\n:::',
)
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
