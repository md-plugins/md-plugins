---
title: Codeblocks Plugin Advanced Topics
desc: Codeblocks plugin advanced topics for Markdown.
---

## Codeblocks Plugin

The `codeblocks` plugin enhances code block rendering in your Markdown content. This section will cover the CSS used by the plugin, how you can customize the output with your own CSS, and the available options for configuring the plugin.

### Default CSS

By default, the `codeblocks` plugin uses the `.markdown-code` CSS class to `<pre>` blocks. You can add this class in your CSS to customize the appearance of code blocks.

```css
.markdown-code {
  font-size: 14px;
  padding: 1em;
  margin: 0;
  border: 1px solid #dfe2e5;
  color: #e6e6e6;
  background-color: #121212;
  border-radius: inherit;
  overflow: auto;
  border-color: rgba(255, 255, 255, 0.28);
}

.markdown-code code {
  display: block;
  padding: 16px;
  width: fit-content;
  min-width: 100%;
  font-size: 14px;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
  line-height: 1.5em;
  tab-size: 2;
  text-align: left;
  white-space: pre;
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  hyphens: none;
  color: inherit;
  background-color: inherit;
  border-radius: inherit;
}
```

### Customizing the CSS

You can customize the appearance of code blocks by overriding the default CSS class. Here are some examples of how you can customize the code blocks:

#### Example 1: Customizing the Border Color

```css
.markdown-code {
  border-color: #3498db; /* Change the border color to blue */
}
```

#### Example 2: Adding a Background Image

```css
.markdown-code {
  background-image: url('path/to/your/image.png');
  background-size: cover;
  background-repeat: no-repeat;
}
```

#### Example 3: Changing the Font Style

```css
.markdown-code code {
  font-family: 'Courier New', Courier, monospace; /* Change the font style */
}
```

### Plugin Options

The `codeblocks` plugin provides several options for customization. Here are the available options and their descriptions:

#### `defaultLang`

- **Type**: `string`
- **Default**: `'markup'`
- **Description**: The default language to use if none is detected.

#### `containerComponent`

- **Type**: `string`
- **Default**: `'markdown-prerender'`
- **Description**: The component used to wrap code blocks.

#### `copyButtonComponent`

- **Type**: `string`
- **Default**: `'markdown-copy-button'`
- **Description**: The component used to render the copy button.

#### `tabPanelTagName`

- **Type**: `string`
- **Default**: `'q-tab-panel'`
- **Description**: The component name for the tab panels.

#### `tabPanelTagClass`

- **Type**: `string`
- **Default**: `'q-pa-none'`
- **Description**: The class(es) to be used with the tab panels.

#### `linePrefixClass`

- **Type**: `string`
- **Default**: `'line-'`
- **Description**: The prefix to be used for magic classes. The 3 magic classes are `add`, `rem`, and `highlight`. Classes in your code are then prefixed with this prefix. The final class names would be: `line-add`, `line-rem`, `line-highlight`.

#### `preClass`

- **Type**: `string`
- **Default**: `'markdown-code'`
- **Description**: The class to be used for the `<pre>` tag.

#### `codeClass`

- **Type**: `string`
- **Default**: `''`
- **Description**: The class to be used for the `<code>` tag (ok to be empty).

#### `pageScripts`

- **Type**: `string[]`
- **Description**: An array of page scripts to be included.

#### `langList`

- **Type**: `Array<{ name: string; aliases?: string; customCopy?: boolean }>`
- **Description**: Optional Prism languages configuration array. This allows you to override or add custom language definitions. Each item can have a `name`, optional `aliases`, and `customCopy` boolean.

### Conclusion

By customizing the CSS classes and using the available plugin options, you can tailor the appearance and behavior of code blocks to match the style of your project. Experiment with different styles and configurations to find the one that works best for you.

Happy coding!
