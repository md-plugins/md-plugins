---
title: Image Plugin
desc: Image plugin for Markdown.
---

Welcome to the Image Plugin documentation! This guide will provide you with an overview of the Image plugin and its features.

## What is the Image Plugin?

The Image Plugin is a simple yet powerful tool that enhances the standard image functionality in Markdown. It allows you to apply custom CSS classes to images, making it easier to style and manage images in your documentation.

## Key Features

- **Custom CSS Class**: Apply a custom CSS class to images for consistent styling.
- **Automatic Alt Text**: Automatically set the `alt` attribute for images based on their content.

## Examples

Here are some examples of what you can achieve with the Image Plugin:

### Standard Image

```markup
![Alt text](image.jpg)
```

### Image with Custom Class

You can apply a custom CSS class to images:

```javascript
import MarkdownIt from 'markdown-it'
import { imagePlugin } from '@md-plugins/md-plugin-image'

const md = new MarkdownIt()

md.use(imagePlugin, {
  imageClass: 'custom-image-class', // Optional: Customize the CSS class for images
})

// Now you can use the Image plugin in your Markdown content
const result = md.render('![Alt text](image.jpg)')
console.log(result)
```

## Name

The official NPM name is `@md-plugins/md-plugin-image`.

## Installation

You can install the Image plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-image
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-image
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-image
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { imagePlugin } from '@md-plugins/md-plugin-image'

const md = new MarkdownIt()

md.use(imagePlugin, {
  imageClass: 'custom-image-class', // Optional: Customize the CSS class for images
})

// Now you can use the Image plugin in your Markdown content
const result = md.render('![Alt text](image.jpg)')
console.log(result)
```

### Options

The Image plugin accepts the following options:

- **imageClass**: The CSS class to apply to images. Default is `markdown-image`.

## Advanced Configuration

For more advanced configurations, you can combine the Image plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```javascript
import MarkdownIt from 'markdown-it'
import { imagePlugin } from '@md-plugins/md-plugin-image'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(imagePlugin, {
  imageClass: 'custom-image-class', // Customize the CSS class for images
})
  .use(markdownItAnchor)
  .use(markdownItToc)

// Now you can use the Image plugin along with other plugins in your Markdown content
const result = md.render('# Table of Contents\n\n[[toc]]\n\n![Alt text](image.jpg)')
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
