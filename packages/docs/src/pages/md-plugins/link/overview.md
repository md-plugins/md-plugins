---
title: Link Plugin
desc: Link plugin for Markdown.
---

Welcome to the Link Plugin documentation! This guide will provide you with an overview of the Link plugin and its features.

## What is the Link Plugin?

The Link Plugin is a powerful tool that enhances the standard link functionality in Markdown. It allows you to customize the rendering of links, making it easier to manage internal links and add necessary import statements for custom link components.

## Key Features

- **Custom Link Tag**: Use a custom tag for internal links.
- **Custom Link Keyword**: Customize the keyword used for the link destination.
- **Automatic Import Statements**: Automatically add import statements for custom link components.

## Examples

Here are some examples of what you can achieve with the Link Plugin:

### Standard Link

```markup
[Link Text](https://example.com)
```

### Custom Link Tag and Keyword

You can customize the link tag and keyword:

```javascript
import MarkdownIt from 'markdown-it'
import { linkPlugin } from '@md-plugins/md-plugin-link'

const md = new MarkdownIt()

md.use(linkPlugin, {
  linkTag: 'CustomLink', // Optional: Customize the link tag
  linkToKeyword: 'href', // Optional: Customize the link keyword
  pageScript: 'import CustomLink from "src/components/md/CustomLink.vue"', // Optional: Add import statement
})

// Now you can use the Link plugin in your Markdown content
const result = md.render('[Link Text](https://example.com)')
console.log(result)
```

## Name

The official NPM name is `@md-plugins/md-plugin-link`.

## Installation

You can install the Link plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-link
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-link
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-link
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { linkPlugin } from '@md-plugins/md-plugin-link'

const md = new MarkdownIt()

md.use(linkPlugin, {
  linkTag: 'CustomLink', // Optional: Customize the link tag
  linkToKeyword: 'href', // Optional: Customize the link keyword
  pageScript: 'import CustomLink from "src/components/md/CustomLink.vue"', // Optional: Add import statement
})

// Now you can use the Link plugin in your Markdown content
const result = md.render('[Link Text](https://example.com)')
console.log(result)
```

### Options

The Link plugin accepts the following options:

- **linkTag**: The tag for the internal link. Default is `'MarkdownLink'`.
- **linkToKeyword**: The keyword for the internal link destination. Default is `'to'`.
- **pageScript**: Add import statements to the page.

## Advanced Configuration

For more advanced configurations, you can combine the Link plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```javascript
import MarkdownIt from 'markdown-it'
import { linkPlugin } from '@md-plugins/md-plugin-link'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(linkPlugin, {
  linkTag: 'CustomLink', // Customize the link tag
  linkToKeyword: 'href', // Customize the link keyword
  pageScript: 'import CustomLink from "src/components/md/CustomLink.vue"', // Add import statement
})
  .use(markdownItAnchor)
  .use(markdownItToc)

// Now you can use the Link plugin along with other plugins in your Markdown content
const result = md.render(
  '[Link Text](https://example.com)\n\n# Table of Contents\n\n[[toc]]\n\n[Another Link](https://example.com)',
)
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
