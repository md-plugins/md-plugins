---
title: Image Plugin Advanced Topics
desc: Image plugin advanced topics for Markdown.
---

## Image Plugin

The `image` plugin allows you to add custom classes to images and ensure that the `alt` attribute is properly set in your Markdown content. It also allows you to provide a `width` and a `height`. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### Type Information

```ts
import MarkdownIt from 'markdown-it'

declare const imagePlugin: (
  md: MarkdownIt,
  {
    imageClass,
  }?: {
    imageClass?: string | undefined
  },
) => void

interface ImagePluginOptions {
  /**
   * The class for the image
   *
   * @default 'markdown-image'
   */
  imageClass?: string
}

export { type ImagePluginOptions, imagePlugin }
```

### How It Works

The `image` plugin processes image tokens in your Markdown content, adding custom classes and ensuring that the `alt` attribute is properly set as well as setting the `width` and `height` attributes if set inside the `alt text` area of the image markdown. This helps improve the accessibility and styling of images in your Markdown content.

### Default Behavior

By default, the `image` plugin adds the `markdown-image` class to all images and sets the `alt` attribute to the image's content if it is not already set. It also allows you to specify the `width` and `height` of the displayed image. Here is an example of a Markdown file with images:

```markdown
![Alt text](path/to/image.jpg)

![Another image](path/to/another-image.png)

![Alt text width="200" height="200"](path/to/image.jpg)
```

### Plugin Options

The `image` plugin provides an option for customization. Here is the available option and its description:

#### imageClass

- **Type**: `string`
- **Default**: `'markdown-image'`
- **Description**: The class to be added to all images.

### Example Configuration

Here is an example of how you can configure the `image` plugin with custom options:

```typescript
import MarkdownIt from 'markdown-it'
import { imagePlugin } from '@md-plugins/md-plugin-image'

const md = new MarkdownIt()

md.use(imagePlugin, {
  imageClass: 'custom-image-class',
})
```

### Customizing the CSS

You can customize the appearance of images by overriding the default CSS class. Here are some examples of how you can customize the images:

#### Example 1: Customizing the Border

```css
.custom-image-class {
  border: 2px solid #3498db; /* Add a blue border to images */
}
```

#### Example 2: Adding a Shadow

```css
.custom-image-class {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Add a shadow to images */
}
```

#### Example 3: Changing the Size

```css
.custom-image-class {
  width: 100%;
  max-width: 600px; /* Set a maximum width for images */
}
```

### Handling the `alt`, `width`, and `height` Attributes

The `image` plugin ensures that the `alt` attribute is properly set for all images. If the `alt` attribute is not present or is empty, the plugin sets it to the image's content. Additionally, the plugin allows you to specify the `width` and `height` attributes within the `alt` text. These attributes are extracted and applied to the image element, and then removed from the `alt` text. This helps improve the accessibility and styling of your Markdown content.

### Conclusion

The `image` plugin is a powerful tool for adding custom classes to images and ensuring that the `alt`, `width`, and `height` attributes are properly set in your Markdown content. By customizing the class and CSS, you can tailor the appearance of images to match the style of your project. Experiment with different configurations and find the one that works best for you.

Happy coding!
