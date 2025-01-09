---
title: Frontmatter Plugin
desc: Frontmatter plugin for Markdown.
---

Welcome to the Frontmatter Plugin documentation! This guide will provide you with an overview of the Frontmatter plugin and its features.

## What is the Frontmatter Plugin?

The Frontmatter Plugin is a powerful tool that enhances the standard Markdown functionality by allowing you to extract and process frontmatter and excerpts. It integrates seamlessly with Markdown-It to provide a flexible and customizable way to handle frontmatter in your Markdown files.

## Key Features

- **Frontmatter Extraction**: Extract frontmatter data from your Markdown files.
- **Excerpt Rendering**: Optionally render excerpts from the frontmatter.
- **Customizable Options**: Use custom options for the gray-matter library.

## Examples

Here are some examples of what you can achieve with the Frontmatter Plugin:

### Standard Frontmatter

```markup
---
title: My Document
author: John Doe
date: 2023-10-01
---

# My Document

This is the content of my document.
```

### Frontmatter with Excerpt

```markup
---
title: My Document
author: John Doe
date: 2023-10-01
excerpt: This is a short summary of my document.
---

# My Document

This is the content of my document.
```

## Name

The official NPM name is `@md-plugins/md-plugin-frontmatter`.

## Installation

You can install the Frontmatter plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-frontmatter
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-frontmatter
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-frontmatter
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { frontmatterPlugin } from '@md-plugins/md-plugin-frontmatter'

const md = new MarkdownIt()

md.use(frontmatterPlugin, {
  grayMatterOptions: {
    excerpt: true, // Enable excerpt extraction
  },
  renderExcerpt: true, // Optional: Render the excerpt
})

// Now you can use the Frontmatter plugin in your Markdown content
const result = md.render(
  '---\ntitle: My Document\nauthor: John Doe\ndate: 2023-10-01\nexcerpt: This is a short summary of my document.\n---\n\n# My Document\n\nThis is the content of my document.',
)
console.log(result)
```

### Options

The Frontmatter plugin accepts the following options:

- **grayMatterOptions**: Options for the gray-matter library. See [gray-matter options](https://github.com/jonschlinkert/gray-matter#options) for more details.
- **renderExcerpt**: Render the excerpt or not. Default is `true`.

## Advanced Configuration

For more advanced configurations, you can combine the Frontmatter plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```javascript
import MarkdownIt from 'markdown-it'
import { frontmatterPlugin } from '@md-plugins/md-plugin-frontmatter'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(frontmatterPlugin, {
  grayMatterOptions: {
    excerpt: true, // Enable excerpt extraction
  },
  renderExcerpt: true, // Render the excerpt
})
  .use(markdownItAnchor)
  .use(markdownItToc)

// Now you can use the Frontmatter plugin along with other plugins in your Markdown content
const result = md.render(
  '---\ntitle: My Document\nauthor: John Doe\ndate: 2023-10-01\nexcerpt: This is a short summary of my document.\n---\n\n# Table of Contents\n\n[[toc]]\n\n# My Document\n\nThis is the content of my document.',
)
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
