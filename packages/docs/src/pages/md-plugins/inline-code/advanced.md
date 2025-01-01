---
title: Inline Code Plugin Advanced Topics
desc: Inline code plugin advanced topics for Markdown.
---

## Inline Code Plugin

The `inlinecode` plugin allows you to add custom classes to inline code elements in your Markdown content. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### How It Works

The `inlinecode` plugin processes inline code tokens in your Markdown content, adding custom classes to them. This helps improve the styling and accessibility of inline code elements in your Markdown content.

### Default Behavior

By default, the `inlinecode` plugin adds the `markdown-token` class to all inline code elements. Here is an example of a Markdown file with inline code:

Here is some `inline code` in a sentence.

::: tip
Here is some `inline code` in a container.
:::

```markdown
Here is some `inline code` in a sentence.

::: tip
Here is some `inline code` in a container.
:::
```

### Default CSS

By default, the `inlinecode` plugin applies the following CSS class to inline code elements. You can add this class in your CSS to customize the appearance of inline code elements.

```scss
.markdown-token {
  display: inline-block;
  padding: 4px 6px;
  font-size: 16px;
  line-height: 16px;
  border-radius: 4px;
  font-family: inherit;
  color: #00bfff;
  vertical-align: baseline;
  border: 1px solid currentColor;
}
```

### Plugin Options

The `inlinecode` plugin provides an option for customization. Here is the available option and its description:

#### `inlineCodeClass`

- **Type**: `string`
- **Default**: `'markdown-token'`
- **Description**: The class to be added to all inline code elements.

### Example Configuration

Here is an example of how you can configure the `inlinecode` plugin with custom options:

```typescript
import MarkdownIt from 'markdown-it'
import { inlinecodePlugin } from '@md-plugins/md-plugin-inlinecode'

const md = new MarkdownIt()

md.use(inlinecodePlugin, {
  inlineCodeClass: 'custom-inline-code-class',
})
```

### Customizing the CSS

You can customize the appearance of inline code elements by overriding the default CSS class. Here are some examples of how you can customize the inline code elements:

#### Example 1: Customizing the Background Color

```css
.custom-inline-code-class {
  background-color: #f0f0f0; /* Change the background color */
}
```

#### Example 2: Adding a Border

```css
.custom-inline-code-class {
  border: 1px solid #dfe2e5; /* Add a border to inline code */
}
```

#### Example 3: Changing the Font Style

```css
.custom-inline-code-class {
  font-family: 'Courier New', Courier, monospace; /* Change the font style */
}
```

### Handling the `class` Attribute

The `inlinecode` plugin ensures that the `class` attribute is properly set for all inline code elements. If the `class` attribute is not present or is empty, the plugin sets it to the specified class. This helps improve the styling and accessibility of your Markdown content.

### Conclusion

The `inlinecode` plugin is a powerful tool for adding custom classes to inline code elements in your Markdown content. By customizing the class and CSS, you can tailor the appearance of inline code elements to match the style of your project. Experiment with different configurations and find the one that works best for you.

Happy coding!
