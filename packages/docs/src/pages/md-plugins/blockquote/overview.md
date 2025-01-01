---
title: Blockquote Plugin
desc: Blockquote plugin for Markdown.
# related:
#   - md-plugins/codeblocks/overview
#   - md-plugins/containers/overview
#   - md-plugins/frontmatter/overview
#   - md-plugins/headers/overview
#   - md-plugins/image/overview
#   - md-plugins/imports/overview
#   - md-plugins/inline-code/overview
#   - md-plugins/table/overview
#   - md-plugins/link/overview
#   - md-plugins/title/overview
---

Welcome to the Blockquote Plugin documentation! This guide will provide you with an overview of the Blockquote plugin and its features.

## What is the Blockquote Plugin?

The Blockquote Plugin is a powerful tool that enhances the standard blockquote functionality in Markdown. It allows you to create visually appealing and customizable blockquotes that can be used to highlight important information, quotes, or notes in your documentation.

## Key Features

- **Customizable Styles**: Apply custom styles to your blockquotes to match your documentation's theme.
- **Icons and Badges**: Add icons and badges to your blockquotes for better visual representation.
- **Nested Blockquotes**: Support for nested blockquotes to create complex structures.
- **Responsive Design**: Ensure your blockquotes look great on all devices.

## Examples

Here are some examples of what you can achieve with the Blockquote Plugin:

### Standard Blockquote

> This is a standard blockquote.

```markup
> This is a standard blockquote.
```

### Blockquote with Note

> **Note:** This is a blockquote with a note.

```markup
> **Note:** This is a blockquote with a note.
```

### Blockquote with Warning

> **Warning:** This is a blockquote with a warning.

```markup
> **Warning:** This is a blockquote with a warning.
```

### Embedded Blockquote

> This is a blockquote with an embedded blockquote.
>
> > This is an embedded blockquote.

```markup
> This is a blockquote with an embedded blockquote.
>
> > This is an embedded blockquote.
```

### Embedded Plugins

> This is a blockquote with other embedded plugins.
>
> This is an embedded `inlinecode`.
>
> This is an embedded [link](https://md-plugins.netlify.app).
>
> ::: tip
> This is an embedded container.
> :::
>
> ```js
> // This is an embedded codeblock.
> export function containersPlugin(
>   md: MarkdownIt,
>   containers: ContainerDetails[],
>   createContainer: CreateContainerFn,
> ): void {
> ```

````markup
> This is a blockquote with other embedded plugins.
>
> This is an embedded `inlinecode`.
>
> This is an embedded [link](https://md-plugins.netlify.app).
>
> ::: tip
> This is an embedded container.
> :::
>
> ```js
> // This is an embedded codeblock.
> export function containersPlugin(
>   md: MarkdownIt,
>   containers: ContainerDetails[],
>   createContainer: CreateContainerFn,
> ): void {
> ```
````

## Name

The official NPM name is `@md-plugins/md-plugin-blockquote`.

## Installation

You can install the Blockquote plugin using `npm`, `yarn`, or `pnpm`. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-blockquote
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-blockquote
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-blockquote
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { blockquotePlugin } from '@md-plugins/md-plugin-blockquote'

const md = new MarkdownIt()

md.use(blockquotePlugin, {
  blockquoteClass: 'custom-blockquote-class', // Optional: Customize the blockquote class
})

// Now you can use the Blockquote plugin in your Markdown content
const result = md.render('> This is a blockquote with custom styling.')
console.log(result)
```

### Options

The Blockquote plugin accepts the following options:

- **blockquoteClass**: A custom class to apply to blockquote elements. Default is `markdown-blockquote`.

## Advanced Configuration

For more advanced configurations, you can combine the Blockquote plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```js
import MarkdownIt from 'markdown-it'
import { blockquotePlugin } from '@md-plugins/md-plugin-blockquote'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(blockquotePlugin, {
  blockquoteClass: 'custom-blockquote-class', // Custom class for blockquotes
})
  .use(markdownItAnchor)
  .use(markdownItToc)

// Now you can use the Blockquote plugin along with other plugins in your Markdown content
const result = md.render(
  '# Table of Contents\n\n[[toc]]\n\n> This is a blockquote with custom styling.',
)
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
