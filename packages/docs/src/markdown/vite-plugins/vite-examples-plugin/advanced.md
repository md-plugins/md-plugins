---
title: ViteExamplesPlugin Advanced Topics
desc: ViteExamplesPlugin advanced topics for Vite.
related:
  - vite-plugins/vite-md-plugin/advanced
---

## ViteExamplesPlugin

The `viteExamplesPlugin` is a powerful tool for integrating example code snippets and demos into your Vite project. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively with both Vite and Quasar with Vite.

### Type Information

```ts
import { Plugin } from 'vite'

/**
 * Creates a Vite plugin for handling Markdown examples.
 *
 * This function sets up the target folder for example files and returns a function
 * that creates the actual Vite plugin. The returned plugin resolves and loads
 * example code based on the production or development environment.
 *
 * @param isProd - A boolean indicating whether the Vite build is in production mode.
 *                 This parameter determines whether the plugin will use the `prodLoad` or `devLoad` function for loading example code.
 *
 * @param path - The path to the directory containing the example files.
 *               This path will be used as the target folder for resolving examples.
 *               The `targetFolder` variable is set to this value before creating the Vite plugin.
 *
 * @returns A function that creates a Vite plugin.
 *          The returned function takes a boolean parameter `isProd` and returns a Vite plugin object.
 *          The plugin object has a `name`, `enforce`, `resolveId`, and `load` property.
 *          The `resolveId` property resolves module IDs starting with "examples:" and returns a resolved ID.
 *          The `load` property loads example code based on the production or development environment.
 */
declare function viteExamplesPlugin({ isProd, path }: { isProd: boolean; path: string }): Plugin

/**
 * A function to determine the manual chunk name for a given module ID.
 *
 * @param id - The module ID to analyze.
 * @returns A string representing the chunk name or `undefined`.
 */
declare function viteManualChunks(id: string): string | undefined

export { viteExamplesPlugin, viteManualChunks }
```

### How It Works

The `viteExamplesPlugin` processes example code snippets and demos in your Vite project, transforming them into interactive components. It supports various features to enhance the development and presentation of example code.

### Plugin Options

The `viteExamplesPlugin` provides several options for customization. Here are the available options and their descriptions:

#### `isProd`

- **Type**: `boolean`
- **Description**: A flag indicating whether the build is for production. This parameter determines whether the plugin will use the `prodLoad` or `devLoad` function for loading example code.

#### `path`

- **Type**: `string`
- **Description**: The absolute path to the directory containing example code snippets and demos.

### Vite Configuration

Here is an example of how you can configure the `viteExamplesPlugin` with custom options:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteExamplesPlugin } from 'vite-examples-plugin'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [
      vue(),
      viteExamplesPlugin({ isProd: isProduction, path: '/absolute/path/to/examples' }),
    ],
    build: {
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vite'],
          },
        },
      },
    },
  }
})
```

### Quasar Framework Configuration

If you’re using the Quasar Framework with Vite, additional configuration is needed to enable support for example code snippets and demos:

1. **Update `quasar.config.(js|ts)`**:

```typescript
import { viteExamplesPlugin } from 'vite-examples-plugin'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    build: {
      vueRouterMode: 'history', // Required for proper hash link handling

      viteVuePluginOptions: {
        include: [/\.(vue|md)$/], // Include Markdown files
      },

      vitePlugins: [
        viteExamplesPlugin({ isProd: isProduction, path: '/absolute/path/to/examples' }),
        // ...
      ],
    },

    framework: {
      autoImportVueExtensions: ['vue', 'md'], // Enable auto-import for Markdown extensions
    },
  }
})
```

2. **Ensure that your routes and hash links are compatible with Vue Router's history mode.**

### Conclusion

The `viteExamplesPlugin` is a versatile tool for integrating example code snippets and demos into your Vite project. By customizing the plugin options, including the `isProd` flag, you can tailor the behavior of the plugin to fit your specific needs. Whether you are using Vite or Quasar with Vite, the `viteExamplesPlugin` provides a flexible and powerful solution for handling example code. Experiment with different configurations and find the one that works best for you.

Happy coding!
