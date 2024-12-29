# @md-plugins/vite-examples-plugin

A Vite plugin that facilitates handling Vue example files in both development and production modes. The plugin allows you to load and transform example components and their raw source code for usage in your application.

## Features

- Supports loading Vue example files dynamically during development.
- Generates import and export statements for Vue example files in production.
- Easily handles raw and compiled component imports.
- Enables seamless integration of example files into your project.

## Installation

Install the plugin via your preferred package manager:

```bash
# npm
npm install @md-plugins/vite-examples-plugin

# yarn
yarn add @md-plugins/vite-examples-plugin

# pnpm
pnpm add @md-plugins/vite-examples-plugin
```

## Usage

### Basic Setup with Vite

To use the `viteExamplesPlugin`, configure it in your Vite project:

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteExamplesPlugin } from '@md-plugin/vite-examples-plugin';

export default defineConfig({
  plugins: [vue(), viteExamplesPlugin('/absolute/path/to/examples')],
});
```

### Manual Chunk Splitting with Vite

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteExamplesPlugin, viteManualChunks } from 'vite-examples-plugin';

export default defineConfig({
  plugins: [vue(), viteExamplesPlugin('/absolute/path/to/examples')],
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks: viteManualChunks,
      },
    },
  },
});
```

## Quasar Framework Configuration

1. Update `quasar.config.(js|ts)`:

```js
import { viteExamplesPlugin } from '@md-plugin/vite-examples-plugin';

export default defineConfig((ctx) => {
  // ...
```

```js
  build: {
    vitePlugins: [
      viteExamplesPlugin(ctx.appPaths.srcDir + '/examples'),
      // ...
    ],
  },
}
```

### Manual Chunk Splitting with Quasar

```js
import {
  viteExamplesPlugin,
  viteManualChunks,
} from '@md-plugins/vite-examples-plugin';
```

```js
  build: {
    extendViteConf(viteConf, { isClient }) {
      if (ctx.prod && isClient) {
        if (!viteConf.build) {
          viteConf.build = {}
        }
        viteConf.build.chunkSizeWarningLimit = 650
        viteConf.build.rollupOptions = {
          output: { manualChunks: viteManualChunks },
        }
      }
    },
  }
```

## How viteManualChunks Works

The `viteManualChunks` function analyzes the module ID and assigns it to a specific chunk:

1. **`Vendor Chunk`**: Files from `node_modules` matching libraries like `vue`, `@vue`, `quasar`, and `vue-router` are assigned to the `vendor` chunk.

2. **`Examples Chunk`**: Example files matching the pattern `examples:<name>` or located in `src/examples/<name>` are grouped into chunks named `e.<name>`.

### Example

Given the following files:

```bash
node_modules/vue/index.js
src/examples/example1/Example1.vue
src/examples/example2/Example2.vue
```

The resulting chunks might look like:

```bash
vendor.js         // Contains Vue, Quasar, Vue Router, etc.
e.example1.js     // Contains Example1.vue
e.example2.js     // Contains Example2.vue
```

This helps facilitate loading and chunking in your application for your examples.

## Example Folder Structure

```bash
src/
  examples/
    example1/
      Example1.vue
    example2/
      Example2.vue
```

## How It Works

The plugin provides two modes of operation based on the environment:

### Development Mode

During development, the plugin uses Vite's `import.meta.glob` to dynamically load Vue example components and their raw source code:

```ts
export const code = import.meta.glob('/src/examples/example1/*.vue', {
  eager: true,
});
export const source = import.meta.glob('/src/examples/example1/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
});
```

### Production Mode

In production, the plugin preloads example components and their raw source code, generating import and export statements:

```ts
import Example1 from 'app/src/examples/example1/Example1.vue';
import RawExample1 from 'app/src/examples/example1/Example1.vue?raw';

export { Example1, RawExample1 };
```

## Development Notes

The plugin is structured with the following components:

1. `devLoad` Function
   Generates dynamic imports for example files during development.

2. `prodLoad` Function
   Creates preloaded import and export statements for example files in production.

3. `vitePlugin` Function
   Constructs the Vite plugin with resolveId and load methods.

4. `viteExamplesPlugin` Function
   Sets the target folder and initializes the plugin.

## Error Handling

If the `targetFolder` is not defined when the plugin is initialized, an error will be thrown:

```ts
throw new Error('targetFolder is not defined');
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
