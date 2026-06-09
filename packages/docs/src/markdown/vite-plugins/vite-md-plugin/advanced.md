---
title: ViteMdPlugin Advanced Topics
desc: ViteMdPlugin advanced topics for Markdown.
related:
  - vite-plugins/vite-examples-plugin/advanced
---

The `viteMdPlugin` is a powerful tool for integrating Markdown processing into your Vite project. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively with both Vite and Quasar with Vite.

### Type Information

```ts
import { Plugin } from 'vite'
import MarkdownIt, { Options } from 'markdown-it'
import { BlockquotePluginOptions } from '@md-plugins/md-plugin-blockquote'
import { CodeblockPluginOptions } from '@md-plugins/md-plugin-codeblocks'
import { FrontmatterPluginOptions } from '@md-plugins/md-plugin-frontmatter'
import { HeadersPluginOptions } from '@md-plugins/md-plugin-headers'
import { ImagePluginOptions } from '@md-plugins/md-plugin-image'
import { InlineCodePluginOptions } from '@md-plugins/md-plugin-inlinecode'
import { LinkPluginOptions } from '@md-plugins/md-plugin-link'
import { MermaidPluginOptions } from '@md-plugins/md-plugin-mermaid'
import { TablePluginOptions } from '@md-plugins/md-plugin-table'

type MarkdownItPlugin = (md: MarkdownIt, ...params: any[]) => void
type MarkdownItPluginEntry = MarkdownItPlugin | [MarkdownItPlugin, ...any[]]

interface MarkdownOptions extends Options {
  html?: boolean
  linkify?: boolean
  typographer?: boolean
  breaks?: boolean
  blockquotePlugin?: BlockquotePluginOptions
  codeblockPlugin?: CodeblockPluginOptions
  frontmatterPlugin?: FrontmatterPluginOptions
  headersPlugin?: HeadersPluginOptions | boolean
  imagePlugin?: ImagePluginOptions
  inlineCodePlugin?: InlineCodePluginOptions
  linkPlugin?: LinkPluginOptions
  mermaidPlugin?: MermaidPluginOptions
  tablePlugin?: TablePluginOptions
  markdownItPlugins?: MarkdownItPluginEntry[]
}

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

interface UserConfig {
  path: string
  menu: MenuItem[]
  config?: MarkdownOptions
}

/**
 * Creates a Vite plugin for processing Markdown files based on the provided user configuration.
 * This function configures and returns a plugin that transforms Markdown content into Vue Single File Components (SFCs).
 *
 * @param userConfig - The configuration object for the Vite Markdown plugin.
 * @param userConfig.path - The base path prefix to be used for routing or file resolution.
 * @param userConfig.menu - An array of MenuItem objects representing the navigation menu structure.
 * @param userConfig.config - Additional configuration options for the Markdown processing.
 * @returns A Vite Plugin object pre-configured with the provided settings for Markdown processing.
 */
declare function viteMdPlugin(userConfig: UserConfig): Plugin

export {
  type FlatMenu,
  type FlatMenuEntry,
  type MarkdownOptions,
  type MenuItem,
  type MenuNode,
  type NavItem,
  type RelatedItem,
  type UserConfig,
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
import { viteMdPlugin, type MenuItem } from '@md-plugins/vite-md-plugin'

const menu = [] // Define your navigation menu structure here
const basePath = '/docs' // Base path prefix

export default defineConfig({
  plugins: [vue(), viteMdPlugin({ path: basePath, menu })],
})
```

### Using Other Markdown-It Plugins

The `viteMdPlugin` already includes the md-plugins used by Q-Press, plus inserted text support for `++text++`. If you need additional Markdown-it syntax, install the plugin and pass it through `config.markdownItPlugins`.

```tabs
<<| bash pnpm |>>
pnpm add markdown-it-mark markdown-it-sub markdown-it-sup markdown-it-footnote
<<| bash bun |>>
bun add markdown-it-mark markdown-it-sub markdown-it-sup markdown-it-footnote
<<| bash yarn |>>
yarn add markdown-it-mark markdown-it-sub markdown-it-sup markdown-it-footnote
<<| bash npm |>>
npm install markdown-it-mark markdown-it-sub markdown-it-sup markdown-it-footnote
```

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItMark from 'markdown-it-mark'
import markdownItSub from 'markdown-it-sub'
import markdownItSup from 'markdown-it-sup'
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'

export default defineConfig({
  plugins: [
    vue(),
    viteMdPlugin({
      path: './src/markdown',
      menu: [],
      config: {
        markdownItPlugins: [
          markdownItMark, // ==highlight==
          markdownItSub, // H~2~O
          markdownItSup, // E=mc^2^
          markdownItFootnote, // footnote references
        ],
      },
    }),
  ],
})
```

If you own a raw MarkdownIt instance instead of using `viteMdPlugin`, wire the plugins directly:

```ts
import MarkdownIt from 'markdown-it'
import markdownItMark from 'markdown-it-mark'

const md = new MarkdownIt()
md.use(markdownItMark)
```

### Quasar Framework Configuration

If you’re using the Quasar Framework with Vite, additional configuration is needed to enable support for `.md` files:

1. Update `quasar.config.(js|ts)`:

```typescript
import { viteMdPlugin, type MenuItem, type MarkdownOptions } from '@md-plugins/vite-md-plugin'
import { menu } from './src/assets/menu' // be sure to create this file

export default defineConfig((ctx) => {
  // ...
  build: {
    vueRouterMode: 'history', // Required for proper hash link handling

    viteVuePluginOptions: {
      include: [/\.(vue|md)$/], // Include Markdown files
    },

    vitePlugins: [
      viteMdPlugin({
        path: ctx.appPaths.srcDir + '/markdown',
        menu: menu as MenuItem[],
        // config: myOptions as MarkdownOptions,
      }),
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

```ts [twoslash]
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

#### `config`

- **Type**: `MarkdownOptions`
- **Description**: Additional configuration options for the Markdown processor and bundled md-plugins.

Use `config.markdownItPlugins` for extra Markdown-it syntax that md-plugins does not bundle by default. Use `config.mermaidPlugin` to customize Mermaid rendering.

```ts
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'
import markdownItMark from 'markdown-it-mark'

viteMdPlugin({
  path: './src/markdown',
  menu: [],
  config: {
    markdownItPlugins: [markdownItMark],
    mermaidPlugin: {
      renderMode: 'component',
      componentName: 'MarkdownMermaid',
    },
  },
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

If you need to change the behavior of `viteMdPlugin`, you can make behavioral changes via the `MarkdownOptions`, or you can create your own Vite plugin and use that instead. Look at the source to see how it can be done.

## Conclusion

The `viteMdPlugin` is a versatile tool for integrating Markdown processing into your Vite project. By customizing the plugins and options, you can tailor the Markdown content to fit your specific needs. Whether you are using Vite or Quasar with Vite, the `viteMdPlugin` provides a flexible and powerful solution for handling Markdown files. Experiment with different configurations and find the one that works best for you.

Happy coding!
