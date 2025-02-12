---
title: Containers Plugin Advanced Topics
desc: Containers plugin advanced topics for Markdown.
---

## Containers Plugin

The `containers` plugin allows you to add custom containers for callouts, warnings, and more in your Markdown content. This section will cover the CSS used by the plugin, how you can customize the output with your own CSS, and the available options for configuring the plugin.

### Type Information

```ts
import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token.mjs'
import container from 'markdown-it-container'

type Container = typeof container
type CreateContainerFn = (
  container: Container,
  type: string,
  defaultTitle: string,
  md: MarkdownIt,
) => [Container, string, any?]
interface ContainerDetails {
  type: string
  defaultTitle: string
}
interface ContainerOptions {
  render(tokens: Token[], idx: number): string
}

/**
 * Adds container support to a MarkdownIt instance.
 *
 * This function applies custom container plugins to the MarkdownIt parser.
 *
 * @param md - The MarkdownIt instance to which the container plugins will be added.
 * @param containers - An array of ContainerDetails objects, each specifying a container type and its default title.
 * @param createContainer - A function that creates and returns the container plugin configuration.
 *
 * @example
 * const containers: ContainerDetails[] = [
 *   { type: 'warning', defaultTitle: 'Warning' },
 *   { type: 'tip', defaultTitle: 'Tip' },
 *   { type: 'details', defaultTitle: 'Details' },
 * ];
 *
 * function createContainer(
 *   container: Container,
 *   containerType: string,
 *   defaultTitle: string
 *   md: MarkdownIt,
 * ): [Container, string, ContainerOptions] {
 *   const containerTypeLen = containerType.length;
 *
 *   return [
 *     container,
 *     containerType,
 *     {
 *       render(tokens: Token[], idx: number): string {
 *         const token = tokens[idx];
 *         // Get the title from token info or use defaultTitle
 *         const rawTitle = token.info.trim().slice(containerTypeLen).trim() || defaultTitle
 *
 *         // Process the title as inline markdown
 *         const titleHtml = md ? md.renderInline(rawTitle) : rawTitle
 *
 *         if (containerType === 'details') {
 *           return token.nesting === 1
 *             ? `<details class="markdown-note markdown-note--${containerType}"><summary class="markdown-note__title">${titleHtml}</summary>\n`
 *             : '</details>\n';
 *         }
 *
 *         return token.nesting === 1
 *           ? `<div class="markdown-note markdown-note--${containerType}"><p class="markdown-note__title">${titleHtml}</p>\n`
 *           : '</div>\n';
 *       },
 *     },
 *   ];
 * }
 *
 */
declare function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void

export {
  type Container,
  type ContainerDetails,
  type ContainerOptions,
  type CreateContainerFn,
  containersPlugin,
}
```

### Default CSS

By default, the `containers` plugin applies specific CSS classes to different types of containers. You can add these classes in your CSS to customize the appearance of containers.

::: tip
The following classes are in SCSS format.
:::

```scss
.markdown-note {
  font-size: $font-size;
  border-radius: $generic-border-radius;
  margin: 16px 0;
  padding: 16px;
  border-width: 1px;
  border-style: solid;

  > p,
  > ul {
    margin-bottom: 0;
  }

  &:not(.markdown-note--tip, .markdown-note--warning, .markdown-note--danger) {
    color: $brand-light-text;
    background-color: $brand-light-bg;
    border-color: $separator-color;
    // .markdown-note__title,
    .markdown-link,
    .markdown-token {
      color: $brand-primary;
    }
    .markdown-token {
      border-color: $brand-primary;
    }
    & strong {
      font-weight: 700;
      color: scale-color($brand-light-text, $lightness: 90%);
    }
  }

  &--tip {
    color: scale-color($positive, $lightness: -40%) !important;
    background-color: scale-color($positive, $lightness: 85%);
    border-color: $positive;
    .markdown-note__title,
    .markdown-link,
    .markdown-token {
      color: scale-color($positive, $lightness: -40%);
    }
    .markdown-token {
      border-color: scale-color($positive, $lightness: -40%);
    }
    & strong {
      font-weight: 700;
      color: scale-color($positive, $lightness: 90%);
    }
  }

  &--warning {
    color: scale-color($warning, $lightness: -40%);
    background-color: scale-color($warning, $lightness: 85%);
    border-color: scale-color($warning, $lightness: -30%);
    .markdown-note__title,
    .markdown-link,
    .markdown-token {
      color: scale-color($warning, $lightness: -40%);
    }
    .markdown-token {
      border-color: scale-color($warning, $lightness: -40%);
    }
    & strong {
      font-weight: 700;
      color: scale-color($warning, $lightness: 90%);
    }
  }

  &--danger {
    color: scale-color($negative, $lightness: -40%);
    background-color: scale-color($negative, $lightness: 90%);
    border-color: $negative;
    .markdown-note__title,
    .markdown-link,
    .markdown-token {
      color: $negative;
    }
    .markdown-token {
      border-color: $negative;
    }

    & strong {
      font-weight: 700;
      color: scale-color($negative, $lightness: 90%);
    }
  }

  &--details {
    .markdown-note__title {
      cursor: pointer;
      display: list-item;
    }

    &:not([open]) > .markdown-note__title {
      padding-bottom: 0;
    }
  }

  &__title {
    font-weight: 700;
    letter-spacing: $letter-spacing-brand;
    padding-bottom: 8px;
  }
}
```

### Customizing the CSS

You can customize the appearance of containers by overriding the default CSS classes. Here are some examples of how you can customize the containers:

#### Example 1: Customizing the Border Color

```css
.markdown-note--tip {
  border-color: #3498db; /* Change the border color to blue */
}
```

#### Example 2: Adding a Background Image

```css
.markdown-note {
  background-image: url('path/to/your/image.png');
  background-size: cover;
  background-repeat: no-repeat;
}
```

#### Example 3: Changing the Font Style

```css
.markdown-note__title {
  font-family: 'Courier New', Courier, monospace; /* Change the font style */
}
```

### Plugin Options

The `containers` plugin provides several options for customization. Here are the available options and their descriptions:

#### `type`

- **Type**: `string`
- **Description**: The type of the container (e.g., 'tip', 'warning', 'danger', 'details').

#### `defaultTitle`

- **Type**: `string`
- **Description**: The default title to use if no specific title is provided in the Markdown.

#### `render`

- **Type**: `function`
- **Description**: A custom render function to define how the container should be rendered.

### Example Configuration

Here is an example of how you can configure the `containers` plugin with custom options:

```typescript
import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import { containersPlugin } from '@md-plugins/md-plugin-containers'
import type {
  ContainerDetails,
  CreateContainerFn,
  Container,
  ContainerOptions,
} from '@md-plugins/md-plugin-containers'

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

const containers: ContainerDetails[] = [
  { type: 'tip', defaultTitle: 'TIP' },
  { type: 'warning', defaultTitle: 'WARNING' },
  { type: 'danger', defaultTitle: 'WARNING' },
  { type: 'details', defaultTitle: 'Details' },
]

const md = new MarkdownIt()
md.use(containersPlugin, containers, createContainer)
```

### Conclusion

By customizing the CSS classes and using the available plugin options, you can tailor the appearance and behavior of containers to match the style of your project. Experiment with different styles and configurations to find the one that works best for you.

Happy coding!
