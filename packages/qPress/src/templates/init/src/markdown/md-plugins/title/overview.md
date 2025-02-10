---
title: Title Plugin
desc: Title plugin for Markdown.
---

Welcome to the Title Plugin documentation! This guide will provide you with an overview of the Title plugin and its features.

## What is the Title Plugin?

The Title Plugin is a powerful tool that enhances the standard Markdown functionality by allowing you to extract and manage the title of your Markdown content. It integrates seamlessly with Markdown-It to provide a flexible and customizable way to handle titles in your Markdown files.

## Key Features

- **Title Extraction**: Automatically extract the title from the first `h1` heading in your Markdown content.
- **Environment Integration**: Store the extracted title in the Markdown-It environment for easy access.

## Examples

Here are some examples of what you can achieve with the Title Plugin:

### Standard Title Extraction

```markup
# My Document Title

This is the content of my document.
```

## Environment Variables

When using the Title plugin, the following variables are set in the env object:

- **title**: The extracted title from the first h1 heading in the Markdown content.
- **heading**: A boolean indicating whether a title was extracted.

## Name

The official NPM name is `@md-plugins/md-plugin-title`.

## Installation

You can install the Title plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-title
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-title
<<| bash npm |>>
npm install @md-plugins/md-plugin-title
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { titlePlugin } from '@md-plugins/md-plugin-title'

const md = new MarkdownIt()

md.use(titlePlugin)

// Now you can use the Title plugin in your Markdown content
const result = md.render('# My Document Title\n\nThis is the content of my document.')
console.log(result)
```

### Options

The Title plugin does not accept any options.

## Advanced Configuration

For more advanced configurations, you can combine the Title plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```javascript
import MarkdownIt from 'markdown-it'
import { titlePlugin } from '@md-plugins/md-plugin-title'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(titlePlugin).use(markdownItAnchor).use(markdownItToc)

// Now you can use the Title plugin along with other plugins in your Markdown content
const result = md.render(
  '# My Document Title\n\n# Table of Contents\n\n[[toc]]\n\nThis is the content of my document.',
)
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
