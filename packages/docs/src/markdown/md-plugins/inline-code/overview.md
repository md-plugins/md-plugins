---
title: Inlinecode Plugin
desc: Inlinecode plugin for Markdown.
---

Welcome to the Inlinecode Plugin documentation! This guide will provide you with an overview of the Inlinecode plugin and its features.

## What is the Inlinecode Plugin?

The Inlinecode Plugin is a simple yet powerful tool that enhances the standard inline code functionality in Markdown. It allows you to apply custom CSS classes to inline code blocks, making it easier to style and highlight inline code snippets in your documentation.

## Key Features

- **Custom CSS Class**: Apply a custom CSS class to inline code blocks for consistent styling.
- **Easy Configuration**: Simple and straightforward configuration options.
- **Compatibility**: Works seamlessly with other Markdown-It plugins.

## Examples

Here are some examples of what you can achieve with the Inlinecode Plugin:

### Standard Inline Code

This is an example of `inline code`.

```markup
This is an example of `inline code`.
```

## Name

The official NPM name is `@md-plugins/md-plugin-inlinecode`.

## Installation

You can install the Inlinecode plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-inlinecode
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-inlinecode
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-inlinecode
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { inlinecodePlugin } from '@md-plugins/md-plugin-inlinecode'

const md = new MarkdownIt()

md.use(inlinecodePlugin, {
  inlineCodeClass: 'custom-inline-code', // Optional: Customize the CSS class for inline code
})

// Now you can use the Inlinecode plugin in your Markdown content
const result = md.render('This is an example of `inline code` with a custom class.')
console.log(result)
```

### Options

The Inlinecode plugin accepts the following options:

- **inlineCodeClass**: The CSS class to apply to inline code blocks. Default is `'markdown-token'`.

## Advanced Configuration

For more advanced configurations, you can combine the Inlinecode plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```javascript
import MarkdownIt from 'markdown-it'
import { inlinecodePlugin } from '@md-plugins/md-plugin-inlinecode'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(inlinecodePlugin, {
  inlineCodeClass: 'custom-inline-code', // Customize the CSS class for inline code
})
  .use(markdownItAnchor)
  .use(markdownItToc)

// Now you can use the Inlinecode plugin along with other plugins in your Markdown content
const result = md.render(
  '# Table of Contents\n\n[[toc]]\n\nThis is an example of `inline code` with a custom class.',
)
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!!!
