---
title: Headers Plugin
desc: Headers plugin for Markdown.
---

Welcome to the Headers Plugin documentation! This guide will provide you with an overview of the Headers plugin and its features.

## What is the Headers Plugin?

The Headers Plugin is a powerful tool that enhances the standard header functionality in Markdown. It allows you to extract and format headers, making it easier to create a table of contents and navigate through your documentation.

## Key Features

- **Custom Slugification**: Use a custom slugification function to generate unique IDs for headers.
- **Header Formatting**: Apply custom formatting to header titles.
- **Heading Levels**: Specify which heading levels to extract.
- **Nested Headers**: Optionally allow headers inside nested blocks to be extracted.

## Examples

Here are some examples of what you can achieve with the Headers Plugin:

### Standard Header Extraction

```markup
# Main Title

## Sub Title

### Another Sub Title
```

### Custom Slugification and Formatting

You can apply custom slugification and formatting to headers:

```javascript
import MarkdownIt from 'markdown-it'
import { headersPlugin } from '@md-plugins/md-plugin-headers'

const md = new MarkdownIt()

md.use(headersPlugin, {
  slugify: (str) => str.toLowerCase().replace(/\s+/g, '-'), // Custom slugification
  format: (str) => str.toUpperCase(), // Custom formatting
})

// Now you can use the Headers plugin in your Markdown content
const result = md.render('# Custom Header\n\n## Another Header')
console.log(result)
```

## Name

The official NPM name is `@md-plugins/md-plugin-headers`.

## Installation

You can install the Headers plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-headers
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-headers
<<| bash npm |>>
npm install @md-plugins/md-plugin-headers
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { headersPlugin } from '@md-plugins/md-plugin-headers'

const md = new MarkdownIt()

md.use(headersPlugin, {
  level: [2, 3], // Optional: Specify which heading levels to extract
  slugify: (str) => str.toLowerCase().replace(/\s+/g, '-'), // Optional: Customize slugification
  format: (str) => str.toUpperCase(), // Optional: Customize header formatting
  shouldAllowNested: true, // Optional: Allow headers inside nested blocks
})

// Now you can use the Headers plugin in your Markdown content
const result = md.render('# Main Title\n\n## Sub Title\n\n### Another Sub Title')
console.log(result)
```

### Options

The Headers plugin accepts the following options:

- **slugify**: A custom slugification function. Should use the same slugify function with markdown-it-anchor to ensure the link is matched.
- **format**: A function for formatting header titles.
- **level**: Heading levels to be extracted. Should be a subset of markdown-it-anchor's level option to ensure the slug exists. Default is `[2, 3]`.

- **shouldAllowNested**: Should allow headers inside nested blocks or not. Default is `false`.

## Advanced Configuration

For more advanced configurations, you can combine the Headers plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```javascript
import MarkdownIt from 'markdown-it'
import { headersPlugin } from '@md-plugins/md-plugin-headers'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(headersPlugin, {
  level: [2, 3], // Specify which heading levels to extract
  slugify: (str) => str.toLowerCase().replace(/\s+/g, '-'), // Customize slugification
  format: (str) => str.toUpperCase(), // Customize header formatting
  shouldAllowNested: true, // Allow headers inside nested blocks
})
  .use(markdownItAnchor)
  .use(markdownItToc)

// Now you can use the Headers plugin along with other plugins in your Markdown content
const result = md.render(
  '# Table of Contents\n\n[[toc]]\n\n# Main Title\n\n## Sub Title\n\n### Another Sub Title',
)
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
