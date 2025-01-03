---
title: Blockquote Plugin Advanced Topics
desc: Blockquote plugin advanced topics for Markdown.
---

## Blockquote Plugin

The `blockquote` plugin allows you to add customizable CSS classes to blockquotes in your Markdown content. This section will cover the CSS used by the plugin and how you can customize the output with your own CSS.

### Type Information

```ts
import { PluginWithOptions } from 'markdown-it'

interface BlockquotePluginOptions {
  /**
   * The class for the blockquote
   *
   * @default 'markdown-blockquote'
   */
  blockquoteClass?: string
}

declare const blockquotePlugin: PluginWithOptions<BlockquotePluginOptions>

export { type BlockquotePluginOptions, blockquotePlugin }
```

### Default CSS

By default, the `blockquote` plugin applies the `.markdown-blockquote` CSS class to blockquotes. You can add this class in your CSS to customize the appearance of blockquotes.

```css
.markdown-blockquote {
  font-size: 16px;
  padding: 1em;
  margin: 1em 0;
  border-left: 4px solid #dfe2e5;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.markdown-blockquote > p,
.markdown-blockquote > ul {
  margin-bottom: 0;
}
```

### Customizing the CSS

You can customize the appearance of blockquotes by overriding the default CSS class. Here are some examples of how you can customize the blockquotes:

#### Example 1: Customizing the Border Color

```css
.markdown-blockquote {
  border-left-color: #3498db; /* Change the border color to blue */
}
```

#### Example 2: Adding a Background Image

```css
.markdown-blockquote {
  background-image: url('path/to/your/image.png');
  background-size: cover;
  background-repeat: no-repeat;
}
```

#### Example 3: Changing the Font Style

```css
.markdown-blockquote {
  font-family: 'Courier New', Courier, monospace; /* Change the font style */
}
```

### Conclusion

By customizing the CSS classes and creating different skins, you can tailor the appearance of blockquotes to match the style of your project. Experiment with different styles and find the one that works best for you.

Happy coding!
