# @md-plugins/vite-examples-plugin

[![npm version](https://img.shields.io/npm/v/@md-plugins/vite-examples-plugin?label=%40md-plugins%2Fvite-examples-plugin)](https://www.npmjs.com/package/@md-plugins/vite-examples-plugin)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/vite-examples-plugin)](https://www.npmjs.com/package/@md-plugins/vite-examples-plugin)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/vite-examples-plugin)](https://www.npmjs.com/package/@md-plugins/vite-examples-plugin)
[![license](https://img.shields.io/npm/l/@md-plugins/vite-examples-plugin)](https://www.npmjs.com/package/@md-plugins/vite-examples-plugin)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A Vite plugin for documentation examples. It loads Vue example components and their raw source so docs pages can render a live demo, show the source code, and export the same example to CodePen-style sandboxes.

## Features

- Loads Vue example files dynamically during development.
- Generates stable example imports for production builds.
- Provides both compiled components and raw source strings.
- Supports Q-Press `MarkdownExample` usage and direct Vue/Vite documentation sites.
- Includes manual chunk helpers for keeping example bundles organized.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm
pnpm add @md-plugins/vite-examples-plugin
# with bun
bun add @md-plugins/vite-examples-plugin
# with yarn
yarn add @md-plugins/vite-examples-plugin
# with npm
npm install @md-plugins/vite-examples-plugin
```

## Usage

### Basic Setup with Vite

To use the `viteExamplesPlugin`, configure it in your Vite project:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteExamplesPlugin, viteManualChunks } from '@md-plugins/vite-examples-plugin'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [
      vue(),
      viteExamplesPlugin({ isProd: isProduction, path: '/absolute/path/to/examples' }),
    ],
  }
})
```

### Manual Chunk Splitting with Vite

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteExamplesPlugin, viteManualChunks } from '@md-plugins/vite-examples-plugin'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [
      vue(),
      viteExamplesPlugin({ isProd: isProduction, path: '/absolute/path/to/examples' }),
    ],
    build: {
      chunkSizeWarningLimit: 650,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: (moduleId) => viteManualChunks(moduleId) ?? null,
              },
            ],
          },
        },
      },
    },
  },
})
```

## Quasar Framework Configuration

1. Update `quasar.config.(js|ts)`:

```js
import { viteExamplesPlugin } from '@md-plugins/vite-examples-plugin'

export default defineConfig((ctx) => {
  // ...
```

```js
  build: {
    vitePlugins: [
      viteExamplesPlugin({ isProd: ctx.isProd, path: ctx.appPaths.srcDir + '/examples' }),
      // ...
    ],
  },
}
```

### Manual Chunk Splitting with Quasar

```js
import { viteExamplesPlugin, viteManualChunks } from '@md-plugins/vite-examples-plugin'
```

```js
  build: {
    extendViteConf(viteConf, { isClient }) {
      if (ctx.prod && isClient) {
        viteConf.build = viteConf.build || {}
        viteConf.build.chunkSizeWarningLimit = 650
        viteConf.build.rolldownOptions = viteConf.build.rolldownOptions || {}
        viteConf.build.rolldownOptions.output = viteConf.build.rolldownOptions.output || {}
        viteConf.build.rolldownOptions.output.codeSplitting = {
          groups: [
            {
              name: (moduleId) => viteManualChunks(moduleId) ?? null,
            },
          ],
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
})
export const source = import.meta.glob('/src/examples/example1/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})
```

### Production Mode

In production, the plugin preloads example components and their raw source code, generating import and export statements:

```ts
import Example1 from '@/examples/example1/Example1.vue'
import RawExample1 from '@/examples/example1/Example1.vue?raw'

export { Example1, RawExample1 }
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
throw new Error('targetFolder is not defined')
```

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/vite-plugins/vite-examples-plugin/overview) for the latest information.

## Support

If vite-examples-plugin is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
