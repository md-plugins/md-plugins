---
title: Link Plugin Advanced Topics
desc: Link plugin advanced topics for Markdown.
---

## Link Plugin

The `link` plugin allows you to customize the rendering of links in your Markdown content by replacing the default `<a>` tags with custom components. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### Type Information

```ts
import { PluginWithOptions } from 'markdown-it'

interface LinkPluginOptions {
  /**
   * The tag for the internal link
   *
   * @default 'MarkdownLink'
   */
  linkTag?: string
  /**
   * The "to" keyword" for the internal link
   *
   * @default 'to'
   */
  linkToKeyword?: string
  /**
   * add import statements to the page.
   *
   */
  pageScript?: string
}

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * An array of page script (import statements) to be included for tags.
     */
    pageScripts?: Set<string>
  }
}

declare const linkPlugin: PluginWithOptions<LinkPluginOptions>

export { type LinkPluginOptions, linkPlugin }
```

### How It Works

The `link` plugin processes link tokens in your Markdown content, replacing the default `<a>` tags with custom components. This helps improve the styling and functionality of links in your Markdown content.

### Default Behavior

By default, the `link` plugin replaces `<a>` tags with a custom `MarkdownLink` component and sets the `to` attribute for navigation. Here is an example of a Markdown file with links:

[Link to Google](https://www.google.com)

[Link to another page](/another-page)

```markdown
[Link to Google](https://www.google.com)

[Link to another page](/another-page)
```

### Plugin Options

The `link` plugin provides several options for customization. Here are the available options and their descriptions:

#### linkTag

- **Type**: `string`
- **Default**: `'MarkdownLink'`
- **Description**: The custom component to replace the `<a>` tag.

#### linkToKeyword

- **Type**: `string`
- **Default**: `'to'`
- **Description**: The attribute to use for the link destination.

#### pageScript

- **Type**: `string`
- **Default**: `'import MarkdownLink from "src/components/md/MarkdownLink.vue"'`
- **Description**: The script to import the custom link component.

### Example Configuration

Here is an example of how you can configure the `link` plugin with custom options:

```typescript
import MarkdownIt from 'markdown-it'
import { linkPlugin } from '@md-plugins/md-plugin-link'

const md = new MarkdownIt()

md.use(linkPlugin, {
  linkTag: 'CustomLink',
  linkToKeyword: 'href',
  pageScript: 'import CustomLink from "src/components/CustomLink.vue"',
})
```

### Customizing the CSS

You can customize the appearance of links by overriding the default CSS class. Here are some examples of how you can customize the links:

#### Default CSS

By default, the `link` plugin applies the following CSS class to links. You can add this class in your CSS to customize the appearance of links.

```scss
markdown-link {
  color: #00bfff;
  text-decoration: none;
  border-bottom: 1px dotted currentColor;
  outline: 0;
  transition: color 0.28s ease-in-out;
}
```

#### Example 1: Customizing the Hover Effect

```css
markdown-link:hover {
  color: #ff6347; /* Change the color on hover */
}
```

#### Example 2: Adding a Background Color

```css
markdown-link {
  background-color: #f0f0f0; /* Add a background color */
  padding: 2px 4px;
}
```

#### Example 3: Changing the Font Style

```css
markdown-link {
  font-family: 'Courier New', Courier, monospace; /* Change the font style */
}
```

### Handling the pageScript

The `link` plugin ensures that the custom component script is properly imported. If the `pageScript` option is set, the plugin adds the script to the `env.pageScripts` set. This helps manage the dependencies of your Markdown content.

### Conclusion

The `link` plugin is a powerful tool for customizing the rendering of links in your Markdown content. By customizing the component, attributes, and CSS, you can tailor the appearance and functionality of links to match the style of your project. Experiment with different configurations and find the one that works best for you.

Happy coding!
