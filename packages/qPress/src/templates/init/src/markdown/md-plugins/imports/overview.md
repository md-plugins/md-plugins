---
title: Imports Plugin
desc: Imports plugin for Markdown.
---

Welcome to the Imports Plugin documentation! This guide will provide you with an overview of the Imports plugin and its features.

## What is the Imports Plugin?

The Imports Plugin is a powerful tool that enhances the standard Markdown functionality by allowing you to extract and manage script imports directly from your Markdown content. It integrates seamlessly with Markdown-It to provide a flexible and customizable way to handle script imports in your Markdown files.

## Why Use the Imports Plugin?

When working with Markdown content, especially in a dynamic environment like a documentation site or a static site generator, you might need to include specific scripts for certain pages. The Imports Plugin allows you to define these script imports directly within your Markdown files, making it easier to manage dependencies and ensure that the necessary scripts are included when rendering the content.

## Key Features

- **Script Extraction**: Extract script imports from your Markdown content.
- **Environment Integration**: Store extracted scripts in the Markdown-It environment for easy access.
- **Flexible Management**: Manage script imports directly within your Markdown files.

## Examples

::: warning
We can't put the examples in the docs proper because they will otherwise be parsed. We have to use `$lt;script import&gt;` and `&lt;/script&gt;` to avoid parsing. In this case, we have to put the examples in blockquotes.
:::

Here are some examples of what you can achieve with the Imports Plugin:

### Standard Script Import

> &lt;script import&gt;
> import SomeLibrary from 'some-library'
> &lt;/script&gt;

## Name

The official NPM name is `@md-plugins/md-plugin-imports`.

## Installation

You can install the Imports plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-imports
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-imports
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-imports
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

> import MarkdownIt from 'markdown-it'
> import { importsPlugin } from '@md-plugins/md-plugin-imports'
> //
> const md = new MarkdownIt()
> //
> md.use(importsPlugin)
> //
> // Now you can use the Imports plugin in your Markdown content
> const result = md.render('&lt;script import&gt;\nimport SomeLibrary from "some-library"\n&lt;/script&gt;\n\n# My Document\n\nThis is the content of my document.')
> console.log(result)

### Options

The Imports plugin does not accept any options.

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
