# @md-plugins/md-plugin-headers

A **Markdown-It** plugin that extracts and processes headers from Markdown content. This plugin is ideal for generating Table of Contents (ToC) or managing headers for documentation and static sites.

**NOTE:** When using with `vue-router` be sure to use `history` mode and not `hash` mode otherwise your hash links will not work as expected.

## Features

- Extracts headers based on specified levels (e.g., `h1`, `h2`, `h3`).
- Supports custom slugification for header IDs.
- Allows custom formatting for header titles.
- Provides nested structure for headers (e.g., hierarchical ToC generation).
- Compatible with Markdown-It environments for additional flexibility.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-headers
# with Yarn:
yarn add @md-plugins/md-plugin-headers
# with npm:
npm install @md-plugins/md-plugin-headers
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it';
import { headersPlugin } from '@md-plugins/md-plugin-headers';
import type { MarkdownItEnv } from '@md-plugins/shared';

const md = new MarkdownIt();
md.use(headersPlugin, {
  level: [1, 2, 3], // Extract h1, h2, and h3 headers
  slugify: (str) => str.toLowerCase().replace(/\s+/g, '-'),
  format: (title) => title.toUpperCase(),
});

const markdownContent = `
# Header 1

## Subheader 1.1

### Subheader 1.1.1
`;

const env: MarkdownItEnv = {};
const renderedOutput = md.render(markdownContent, env);

console.log('Rendered Output:', renderedOutput);
console.log('Extracted Headers:', env.toc);
```

### Example Output

The plugin processes headers and stores them in the `toc` property of the Markdown-It environment (`env`):

```json
[
  {
    "level": 1,
    "title": "HEADER 1",
    "id": "header-1",
    "link": "#header-1",
    "children": [
      {
        "level": 2,
        "title": "SUBHEADER 1.1",
        "id": "subheader-1-1",
        "link": "#subheader-1-1",
        "children": [
          {
            "level": 3,
            "title": "SUBHEADER 1.1.1",
            "id": "subheader-1-1-1",
            "link": "#subheader-1-1-1",
            "children": []
          }
        ]
      }
    ]
  }
]
```

## Options

The `md-plugin-headers` plugin supports the following options:

| Option            | Type     | Default      | Description                                                          |
| ----------------- | -------- | ------------ | -------------------------------------------------------------------- |
| level             | number[] | [2, 3]       | Heading levels to extract (e.g., [2, 3] for h2, h3).                 |
| slugify           | function | (str) => str | Function to generate slugs for header IDs.                           |
| format            | function | (str) => str | Function to format header titles.                                    |
| shouldAllowNested | boolean  | false        | Whether to allow headers inside nested blocks (e.g., lists, quotes). |

## Advanced Usage

### Generating a Table of Contents (ToC)

With the `toc` property in `env`, you can build a ToC dynamically:

```js
function generateToC(toc) {
  const list = toc
    .map((item) => {
      const children = item.children ? `<ul>${generateToC(item.children)}</ul>` : ''
      return `<li><a href="${item.link}">${item.title}</a>${children}</li>`
    })
    .join('')
  return `<ul>${list}</ul>`
}

const tocHtml = generateToC(env.toc)
console.log('Generated ToC:', tocHtml)
```

### Custom Slugify Function

You can use your own slugification logic for header IDs:

```js
md.use(headersPlugin, {
  slugify: (str) => encodeURIComponent(str.replace(/\s+/g, '_')),
})
```

Whatever you use on the backend, should be the same logic on the frontend for slugification so that they match when using hash links.

### Nested Headers

Enable nested headers to include headers inside blockquotes or lists:

```js
md.use(headersPlugin, {
  shouldAllowNested: true,
})
```

## Testing

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/headers/overview) for the latest information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
