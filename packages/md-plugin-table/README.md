# @md-plugins/md-plugin-table

A **Markdown-It** plugin that customizes the rendering of tables in Markdown. This plugin allows developers to style and structure tables with additional attributes, making them more visually appealing and compatible with design systems.

## Features

- Adds customizable CSS classes to `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>` elements.
- Supports custom attributes for `<table>` elements.
- Replaces the default `<table>` tag with a configurable custom tag (e.g., `q-markup-table`).
- Flexible configuration for adapting to different frameworks or design systems like Quasar.

## Installation

Install the plugin via your preferred package manager:

```bash
# With npm:
npm install @md-plugins/md-plugin-table
# Or with Yarn:
yarn add @md-plugins/md-plugin-table
# Or with pnpm:
pnpm add @md-plugins/md-plugin-table
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { tablePlugin } from '@md-plugins/md-plugin-table';

const md = new MarkdownIt();
md.use(tablePlugin, {
  tableClass: 'custom-table-class',
  tableToken: 'custom-table-tag',
  tableAttributes: [
    [':wrap-cells', 'true'],
    [':flat', 'true'],
  ],
});

const markdownContent = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

const renderedOutput = md.render(markdownContent);

console.log('Rendered Output:', renderedOutput);
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

| Option           | Type   | Default               | Description                                        |
| ---------------- | ------ | --------------------- | -------------------------------------------------- |
| tableClass       | string | 'markdown-page-table' | CSS class for the `<table>` or custom tag.         |
| tableToken       | string | 'q-markup-table'      | Tag name to replace the default `<table>` tag.     |
| tableAttributes  | Array  | []                    | Array of attribute name-value pairs for the table. |
| tableHeaderClass | string | 'text-left'           | CSS class for `<th>` elements.                     |
| tableRowClass    | string | ''                    | CSS class for `<tr>` elements.                     |
| tableCellClass   | string | ''                    | CSS class for `<td>` elements.                     |

## Advanced Usage

### Custom Styling

Apply custom styling to tables by defining your own classes:

```js
md.use(tablePlugin, {
  tableClass: 'custom-table',
  tableHeaderClass: 'custom-header',
  tableRowClass: 'custom-row',
  tableCellClass: 'custom-cell',
});
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
});
```

Rendered output:

```html
<q-markup-table class="markdown-page-table" :bordered="true" :flat="true">
  ...
</q-markup-table>
```

## Testing

Run the unit tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
