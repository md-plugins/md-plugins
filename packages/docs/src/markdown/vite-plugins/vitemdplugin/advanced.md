---
title: ViteMdPlugin Advanced Topics
desc: ViteMdPlugin advanced topics for Markdown.
related:
  - vite-plugins/viteexamplesplugin/advanced
---

The `viteMdPlugin` is a powerful tool for integrating Markdown processing into your Vite project. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively with both Vite and Quasar with Vite.

### Type Information

```ts
import { Plugin } from 'vite'

interface MenuItem {
  name: string
  path?: string
  icon?: string
  iconColor?: string
  rightIcon?: string
  rightIconColor?: string
  badge?: string
  children?: MenuItem[] | undefined
  external?: boolean
  expanded?: boolean
}

interface MenuNode {
  name: string
  path?: string
  external?: boolean
  children?: MenuNode[]
}

interface FlatMenuEntry {
  name: string
  category: string | null
  path: string
  prev?: FlatMenuEntry
  next?: FlatMenuEntry
}

type FlatMenu = Record<string, FlatMenuEntry>

interface NavItem extends FlatMenuEntry {
  classes: string
}

interface RelatedItem {
  name: string
  category: string
  path: string
}

/**
 * Creates a Vite plugin for processing Markdown files.
 * This plugin transforms Markdown content into Vue Single File Components (SFCs).
 *
 * @param path - The base path prefix to be used for routing or file resolution.
 * @param menu - An array of MenuItem objects representing the navigation menu structure.
 * @returns A Vite plugin object with pre-configured settings for Markdown processing.
 */
declare function viteMdPlugin(path: string, menu: MenuItem[]): Plugin

export {
  type FlatMenu,
  type FlatMenuEntry,
  type MenuItem,
  type MenuNode,
  type NavItem,
  type RelatedItem,
  viteMdPlugin,
}
```

### How It Works

The `viteMdPlugin` processes Markdown files in your Vite project, transforming them into Vue Single File Components (SFCs). It supports various plugins to enhance the Markdown content, such as handling frontmatter, headers, containers, code blocks, and more.

### Default Behavior

By default, the `viteMdPlugin` processes Markdown files and applies the configured plugins to enhance the content. Here is an example of a basic configuration:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'

const menu = [] // Define your navigation menu structure here
const basePath = '/docs' // Base path prefix

export default defineConfig({
  plugins: [vue(), viteMdPlugin(basePath, menu)],
})
```

### Quasar Framework Configuration

If you’re using the Quasar Framework with Vite, additional configuration is needed to enable support for `.md` files:

1. Update `quasar.config.(js|ts)`:

```typescript
import { viteMdPlugin } from '@md-plugins/vite-md-plugin';
import { menu } from './src/assets/menu'; // be sure to create this file

export default defineConfig((ctx) => {
  // ...
  build: {
    vueRouterMode: 'history', // Required for proper hash link handling

    viteVuePluginOptions: {
      include: [/\.(vue|md)$/], // Include Markdown files
    },

    vitePlugins: [
      viteMdPlugin(ctx.appPaths.srcDir + '/markdown', menu),
      // ...
    ],
  },

  framework: {
    autoImportVueExtensions: ['vue', 'md'], // Enable auto-import for Markdown extensions
  },
})
```

2. Ensure that your routes and hash links are compatible with Vue Router's history mode.

### Navigation Menu Integration

The `viteMdPlugin` allows you to define a navigation structure that can be updated dynamically based on the Markdown files in your project:

```typescript
const menu = [
  { title: 'Home', path: '/home' },
  { title: 'About', path: '/about' },
]
```

This menu is passed as a parameter to the plugin and can be used to build a dynamic sidebar or navigation bar in your application.

### Plugin Options

The `viteMdPlugin` provides several options for customization. Here are the available options and their descriptions:

#### `path`

- **Type**: `string`
- **Description**: The base path prefix to be used for routing or file resolution.

#### `menu`

- **Type**: `MenuItem[]`
- **Description**: An array of `MenuItem` objects representing the navigation menu structure.

```ts
export interface MenuItem {
  name: string
  path?: string
  icon?: string
  iconColor?: string
  rightIcon?: string
  rightIconColor?: string
  badge?: string
  children?: MenuItem[] | undefined
  external?: boolean
  expanded?: boolean
}
```

### Example Configuration

Here is an example of how you can configure the `viteMdPlugin` with custom options:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'

const menu = [
  { title: 'Home', path: '/' },
  { title: 'Guide', path: '/guide/' },
  { title: 'API', path: '/api/' },
]
const basePath = '/docs'

export default defineConfig({
  plugins: [vue(), viteMdPlugin(basePath, menu)],
})
```

### Using the Plugin

Once the `viteMdPlugin` is configured, you can use it to process Markdown files in your Vite project. Here is an example of a Markdown file:

```markdown
---
title: My Awesome Post
date: 2023-10-01
tags: [vite, markdown, plugin]
---

# My Awesome Post

This is the content of my awesome post.
```

When you build your project, the `viteMdPlugin` will process this Markdown file and generate a Vue Single File Component (SFC) that can be used in your application.

## Advanced

If you need to change the behavior of `viteMdPlugin`, you can create your own Vite plugin and use that instead. Look at the source to see how it can be done.

## Conclusion

The `viteMdPlugin` is a versatile tool for integrating Markdown processing into your Vite project. By customizing the plugins and options, you can tailor the Markdown content to fit your specific needs. Whether you are using Vite or Quasar with Vite, the `viteMdPlugin` provides a flexible and powerful solution for handling Markdown files. Experiment with different configurations and find the one that works best for you.

Happy coding!
