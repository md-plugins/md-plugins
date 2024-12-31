---
title: Vite Examples Plugin
desc: Vite Examples plugin for enhanced functionality.
---

Welcome to the Vite Examples Plugin documentation! This guide will provide you with an overview of the Vite Examples plugins and their features.

## What is the Vite Examples Plugins?

The Vite Examples Plugin is a powerful tool that enhances the standard Vite functionality by providing custom chunking and example file handling. They integrate seamlessly with Vite to provide a flexible and customizable way to manage your Vite build process.

## Key Features

- **Manual Chunking**: Customize the chunking strategy for your Vite build.
- **Example Handling**: Easily include and manage examples in your Vite project.

## Installation

You can install the Vite Examples plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/vite-examples-plugin
<<| bash yarn |>>
yarn add @md-plugins/vite-examples-plugin
<<| bash pnpm |>>
pnpm add @md-plugins/vite-examples-plugin
```

## Examples

Here are some examples of what you can achieve with the Vite Plugins:

### Manual Chunking

```typescript
const vendorRE = /node_modules[\\/](vue|@vue|quasar|vue-router)[\\/](.*)\.(m?js|css|sass)$/
const exampleRE = /examples:([a-zA-Z0-9]+)$|src[\\/]examples[\\/]([a-zA-Z0-9-]+)/

/**
 * A function to determine the manual chunk name for a given module ID.
 *
 * @param id - The module ID to analyze.
 * @returns A string representing the chunk name or `undefined`.
 */
export function viteManualChunks(id: string): string | undefined {
  if (vendorRE.test(id)) {
    return 'vendor'
  }

  const examplesMatch = exampleRE.exec(id)
  if (examplesMatch !== null) {
    const name = examplesMatch[1] || examplesMatch[2]
    return `e.${name}`
  }

  return undefined
}
```

### Example Handling

```typescript
import type { Plugin } from 'vite'
import { join } from 'node:path'
import { globSync } from 'tinyglobby'

const moduleIdRE = /^examples:/
const resolvedIdPrefix = '\0examples:'

let targetFolder = ''

function devLoad(id: string): string | undefined {
  if (id.startsWith(resolvedIdPrefix)) {
    const query = `'/src/examples/${id.substring(id.indexOf(':') + 1)}/*.vue'`
    return (
      `export const code = import.meta.glob(${query}, { eager: true })` +
      `\nexport const source = import.meta.glob(${query}, { query: '?raw', import: 'default', eager: true })`
    )
  }
  return undefined
}

function prodLoad(id: string): string | undefined {
  if (id.startsWith(resolvedIdPrefix)) {
    const exampleId = id.substring(id.indexOf(':') + 1)
    const files = globSync('*.vue', { cwd: join(targetFolder, exampleId) })

    const importList = files.map((entry) => entry.substring(0, entry.length - 4))
    const importStatements = importList
      .map(
        (entry) =>
          `import ${entry} from 'app/src/examples/${exampleId}/${entry}.vue'` +
          `\nimport Raw${entry} from 'app/src/examples/${exampleId}/${entry}.vue?raw'`,
      )
      .join('\n')

    const exportStatements = importList.map((entry) => `${entry},Raw${entry}`).join(',')

    return importStatements + `\nexport {${exportStatements}}`
  }
  return undefined
}

function vitePlugin(isProd: boolean): Plugin {
  if (!targetFolder) {
    throw new Error('targetFolder is not defined')
  }

  return {
    name: 'markdown-examples',
    enforce: 'pre',

    resolveId(id: string): string | undefined {
      if (moduleIdRE.test(id)) {
        return '\0' + id
      }
      return undefined
    },

    load: isProd ? prodLoad : devLoad,
  }
}

export function viteExamplesPlugin(path: string): (isProd: boolean) => Plugin {
  targetFolder = path

  return vitePlugin
}
```

## Quasar Configuration

To use the Vite Examples plugin with Quasar, you can extend the Vite configuration as follows:

```typescript
import { viteExamplesPlugin, viteManualChunks } from '@md-plugins/vite-examples-plugin'

extendViteConf(viteConf, { isClient }) {
  if (ctx.prod && isClient) {
    viteConf.build = viteConf.build || {}
    viteConf.build.chunkSizeWarningLimit = 650
    viteConf.build.rollupOptions = {
      output: { manualChunks: viteManualChunks },
    }
  }
}

vitePlugins: [
  viteExamplesPlugin(ctx.appPaths.srcDir + '/examples') as unknown as Plugin,
  // other plugins...
]
```

## Vite Configuration

To use the Vite Examples plugin with Vite, you can configure it as follows:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteExamplesPlugin, viteManualChunks } from 'vite-examples-plugin'

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
})
```

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
