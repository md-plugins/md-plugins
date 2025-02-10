# @md-plugins/md-plugin-image

A **Markdown-It** plugin that enhances image rendering by adding customizable CSS classes. This allows for consistent styling and seamless integration into design systems, making it easy to apply specific layouts or effects to images.

## Features

- Adds a customizable CSS class to `<img>` elements.
- Supports a default class that can be overridden via plugin options.
- Enhances image styling and layout consistency.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-image
# with Yarn:
yarn add @md-plugins/md-plugin-image
# with npm:
npm install @md-plugins/md-plugin-image
```

## Usage

### Basic Setup

```js
import MarkdownIt from 'markdown-it'
import { imagePlugin } from '@md-plugins/md-plugin-image'

const md = new MarkdownIt()
md.use(imagePlugin, {
  imageClass: 'custom-image-class',
})

const markdownContent = `
![Alt text](example.jpg)
`

const renderedOutput = md.render(markdownContent)

console.log('Rendered Output:', renderedOutput)
```

### Example Output

The rendered output will include the specified CSS class:

```html
<img src="example.jpg" alt="Alt text" class="custom-image-class" />
```

## Options

The `md-plugin-image` plugin supports the following options:

| Option     | Type   | Default          | Description                            |
| ---------- | ------ | ---------------- | -------------------------------------- |
| imageClass | string | 'markdown-image' | CSS class to apply to all `<img>` tags |

## Testing

Run the tests to ensure the plugin behaves as expected:

```bash
pnpm test
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/image/overview) for the latest information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
