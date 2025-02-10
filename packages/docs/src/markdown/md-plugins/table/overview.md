---
title: Table Plugin
desc: Table plugin for Markdown.
---

Welcome to the Table Plugin documentation! This guide will provide you with an overview of the Table plugin and its features.

## What is the Table Plugin?

The Table Plugin is a powerful tool that enhances the standard table functionality in Markdown. It allows you to customize the rendering of tables, making it easier to apply consistent styles and attributes to tables in your documentation.

## Key Features

- **Custom Table Class**: Apply a custom CSS class to tables.
- **Custom Header Class**: Apply a custom CSS class to table headers.
- **Custom Row and Cell Classes**: Apply custom CSS classes to table rows and cells.
- **Custom Table Token**: Replace the default table tag with a custom token.
- **Custom Table Attributes**: Add custom attributes to tables.

## Examples

Here are some examples of what you can achieve with the Table Plugin:

### Standard Table

| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |

```markup
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
```

### Right-aligned Columns

| Header 1 | Header 2 | Header 3 |
| -------: | -------: | -------: |
|   Cell 1 |   Cell 2 |   Cell 3 |

```markup
| Header 1 | Header 2 | Header 3 |
| -------: | -------: | -------: |
|   Cell 1 |   Cell 2 |   Cell 3 |
```

### Cenetered-aligned Columns

| Header 1 | Header 2 | Header 3 |
| :------: | :------: | :------: |
|  Cell 1  |  Cell 2  |  Cell 3  |

```markup
| Header 1 | Header 2 | Header 3 |
| :------: | :------: | :------: |
|  Cell 1  |  Cell 2  |  Cell 3  |
```

### Left-aligned Columns (default)

| Header 1 | Header 2 | Header 3 |
| :------- | :------- | :------- |
| Cell 1   | Cell 2   | Cell 3   |

```markup
| Header 1 | Header 2 | Header 3 |
| :------- | :------- | :------- |
| Cell 1   | Cell 2   | Cell 3   |
```

### Custom Table Class and Attributes

You can customize the table class and attributes:

```javascript
import MarkdownIt from 'markdown-it'
import { tablePlugin } from '@md-plugins/md-plugin-table'

const md = new MarkdownIt()

md.use(tablePlugin, {
  tableClass: 'custom-table-class', // Optional: Customize the table class
  tableHeaderClass: 'custom-header-class', // Optional: Customize the table header class
  tableRowClass: 'custom-row-class', // Optional: Customize the table row class
  tableCellClass: 'custom-cell-class', // Optional: Customize the table cell class
  tableToken: 'custom-table-token', // Optional: Customize the table token
  tableAttributes: [['data-custom-attr', 'value']], // Optional: Add custom attributes
})

// Now you can use the Table plugin in your Markdown content
const result = md.render(
  '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |',
)
console.log(result)
```

## Name

The official NPM name is `@md-plugins/md-plugin-table`.

## Installation

You can install the Table plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-table
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-table
<<| bash npm |>>
npm install @md-plugins/md-plugin-table
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

```javascript
import MarkdownIt from 'markdown-it'
import { tablePlugin } from '@md-plugins/md-plugin-table'

const md = new MarkdownIt()

md.use(tablePlugin, {
  tableClass: 'custom-table-class', // Optional: Customize the table class
  tableHeaderClass: 'custom-header-class', // Optional: Customize the table header class
  tableRowClass: 'custom-row-class', // Optional: Customize the table row class
  tableCellClass: 'custom-cell-class', // Optional: Customize the table cell class
  tableToken: 'custom-table-token', // Optional: Customize the table token
  tableAttributes: [['data-custom-attr', 'value']], // Optional: Add custom attributes
})

// Now you can use the Table plugin in your Markdown content
const result = md.render(
  '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |',
)
console.log(result)
```

### Options

The Table plugin accepts the following options:

- **tableClass**: The class for the table. Default is `'markdown-table'`.
- **tableHeaderClass**: The class for the table header. Default is `'text-left'`.
- **tableRowClass**: The class for the table row. Default is `''`.
- **tableCellClass**: The class for the table cell. Default is `''`.
- **tableToken**: The token for the table. Default is `'q-markup-table'`.
- **tableAttributes**: The attributes for the table. Default is `[ [':wrap-cells', 'true'],[':flat', 'true'],[':bordered', 'true'] ]`.

## Advanced Configuration

For more advanced configurations, you can combine the Table plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

```javascript
import MarkdownIt from 'markdown-it'
import { tablePlugin } from '@md-plugins/md-plugin-table'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(tablePlugin, {
  tableClass: 'custom-table-class', // Customize the table class
  tableHeaderClass: 'custom-header-class', // Customize the table header class
  tableRowClass: 'custom-row-class', // Customize the table row class
  tableCellClass: 'custom-cell-class', // Customize the table cell class
  tableToken: 'custom-table-token', // Customize the table token
  tableAttributes: [['data-custom-attr', 'value']], // Add custom attributes
})
  .use(markdownItAnchor)
  .use(markdownItToc)

// Now you can use the Table plugin along with other plugins in your Markdown content
const result = md.render(
  '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |\n\n# Table of Contents\n\n[[toc]]\n\n| Header 3 | Header 4 |\n| -------- | -------- |\n| Cell 3   | Cell 4   |',
)
console.log(result)
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
