# @md-plugins/md-plugin-table

[![npm version](https://img.shields.io/npm/v/@md-plugins/md-plugin-table?label=%40md-plugins%2Fmd-plugin-table)](https://www.npmjs.com/package/@md-plugins/md-plugin-table)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/md-plugin-table)](https://www.npmjs.com/package/@md-plugins/md-plugin-table)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/md-plugin-table)](https://www.npmjs.com/package/@md-plugins/md-plugin-table)
[![license](https://img.shields.io/npm/l/@md-plugins/md-plugin-table)](https://www.npmjs.com/package/@md-plugins/md-plugin-table)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A **Markdown-It** plugin that customizes the rendering of tables in Markdown. This plugin allows developers to style and structure tables with additional attributes, making them more visually appealing and compatible with design systems.

## Features

- Adds customizable CSS classes to `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` elements.
- Supports custom attributes for `<table>` elements.
- Replaces the default `<table>` tag with a configurable custom tag (e.g., `q-markup-table`).
- Flexible configuration for adapting to different frameworks or design systems like Quasar.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-table
# with bun:
bun add @md-plugins/md-plugin-table
# with Yarn:
yarn add @md-plugins/md-plugin-table
# with npm:
npm install @md-plugins/md-plugin-table
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it'
import { tablePlugin } from '@md-plugins/md-plugin-table'

const md = new MarkdownIt()
md.use(tablePlugin, {
  tableClass: 'custom-table-class',
  tableToken: 'custom-table-tag',
  tableAttributes: [
    [':wrap-cells', 'true'],
    [':flat', 'true'],
  ],
})

const markdownContent = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`

const renderedOutput = md.render(markdownContent)

console.log('Rendered Output:', renderedOutput)
```

### Example Output

For the example above, the plugin produces the following output:

```html
<custom-table-tag class="custom-table-class" :wrap-cells="true" :flat="true">
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
    <tr>
      <td>Cell 3</td>
      <td>Cell 4</td>
    </tr>
  </tbody>
</custom-table-tag>
```

## Options

The `md-plugin-table` plugin supports the following options:

| Option           | Type   | Default          | Description                                        |
| ---------------- | ------ | ---------------- | -------------------------------------------------- |
| tableClass       | string | 'markdown-table' | CSS class for the `<table>` or custom tag.         |
| tableToken       | string | 'q-markup-table' | Tag name to replace the default `<table>` tag.     |
| tableAttributes  | Array  | []               | Array of attribute name-value pairs for the table. |
| tableHeaderClass | string | 'text-left'      | CSS class for `<th>` elements.                     |
| tableRowClass    | string | ''               | CSS class for `<tr>` elements.                     |
| tableCellClass   | string | ''               | CSS class for `<td>` elements.                     |

## Advanced Usage

### Custom Styling

Apply custom styling to tables by defining your own classes:

```js
md.use(tablePlugin, {
  tableClass: 'custom-table',
  tableHeaderClass: 'custom-header',
  tableRowClass: 'custom-row',
  tableCellClass: 'custom-cell',
})
```

Renered output:

```html
<q-markup-table class="custom-table">
  <thead>
    <tr class="custom-row">
      <th class="custom-header">Header 1</th>
      <th class="custom-header">Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr class="custom-row">
      <td class="custom-cell">Cell 1</td>
      <td class="custom-cell">Cell 2</td>
    </tr>
  </tbody>
</q-markup-table>
```

### Custom Attributes

Add attributes for frameworks like Quasar:

```js
md.use(tablePlugin, {
  tableAttributes: [
    [':bordered', 'true'],
    [':flat', 'true'],
  ],
})
```

Rendered output:

```html
<q-markup-table class="markdown-table" :bordered="true" :flat="true"> ... </q-markup-table>
```

## Testing

Run the unit tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/table/overview) for the latest information.

## Support

If md-plugin-table is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
