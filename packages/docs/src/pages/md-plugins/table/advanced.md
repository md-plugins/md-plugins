---
title: Table Plugin Advanced Topics
desc: Table plugin advanced topics for Markdown.
---

## Table Plugin

The `table` plugin allows you to customize the rendering of tables in your Markdown content by adding custom classes and attributes. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### How It Works

The `table` plugin processes table tokens in your Markdown content, adding custom classes and attributes to them. This helps improve the styling and functionality of tables in your Markdown content.

### Default Behavior

By default, the `table` plugin adds the `markdown-table` class to all tables and applies additional classes and attributes as specified. Here is an example of a Markdown file with a table:

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |

```markdown
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
```

### Plugin Options

The `table` plugin provides several options for customization. Here are the available options and their descriptions:

#### tableClass

- **Type**: `string`
- **Default**: `'markdown-table'`
- **Description**: The class to be added to all tables.

#### tableHeaderClass

- **Type**: `string`
- **Default**: `'text-left'`
- **Description**: The class to be added to table headers (`<th>` elements).

#### tableRowClass

- **Type**: `string`
- **Default**: `''`
- **Description**: The class to be added to table rows (`<tr>` elements).

#### tableCellClass

- **Type**: `string`
- **Default**: `''`
- **Description**: The class to be added to table cells (`<td>` elements).

#### tableToken

- **Type**: `string`
- **Default**: `'q-markup-table'`
- **Description**: The custom token to replace the default table tag.

#### tableAttributes

- **Type**: `Array<[string, string]>`
- **Default**: `[]`
- **Description**: Additional attributes to be added to the table.

### Example Configuration

Here is an example of how you can configure the `table` plugin with custom options:

```typescript
import MarkdownIt from 'markdown-it'
import { tablePlugin } from '@md-plugins/md-plugin-table'

const md = new MarkdownIt()

md.use(tablePlugin, {
  tableClass: 'custom-table-class',
  tableHeaderClass: 'custom-header-class',
  tableRowClass: 'custom-row-class',
  tableCellClass: 'custom-cell-class',
  tableToken: 'custom-table-token',
  tableAttributes: [['data-custom', 'value']],
})
```

### Customizing the CSS

You can customize the appearance of tables by overriding the default CSS class. Here are some examples of how you can customize the tables:

#### Default CSS

By default, the `table` plugin applies the following CSS class to tables. You can add this class in your CSS to customize the appearance of tables.

```scss
.markdown-table {
  width: fit-content;
  max-width: 100%;
}
```

#### Example 1: Customizing the Border

```css
.custom-table-class {
  border: 1px solid #dfe2e5; /* Add a border to tables */
}
```

#### Example 2: Adding a Background Color

```css
.custom-table-class {
  background-color: #f0f0f0; /* Add a background color to tables */
}
```

#### Example 3: Changing the Font Style

```css
.custom-table-class {
  font-family: 'Courier New', Courier, monospace; /* Change the font style */
}
```

### Handling the tableAttributes

The `table` plugin allows you to add custom attributes to tables. Here is an example of how to add a custom data attribute to tables:

```typescript
md.use(tablePlugin, {
  tableAttributes: [['data-custom', 'value']],
})
```

### Conclusion

The `table` plugin is a powerful tool for customizing the rendering of tables in your Markdown content. By customizing the classes, attributes, and CSS, you can tailor the appearance and functionality of tables to match the style of your project. Experiment with different configurations and find the one that works best for you.

Happy coding!
