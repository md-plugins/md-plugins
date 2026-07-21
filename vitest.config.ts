import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@md-plugins\/vite-md-plugin$/,
        replacement: path.resolve(root, './packages/viteMdPlugin/src/index.ts'),
      },
      {
        find: /^@md-plugins\/vite-ssg-plugin$/,
        replacement: path.resolve(root, './packages/viteSsgPlugin/src/index.ts'),
      },
      {
        find: /^@md-plugins\/([^/]*)$/,
        replacement: path.resolve(root, './packages/$1/src/index.ts'),
      },
    ],
  },
  test: {
    coverage: {
      include: ['packages/*/src/**/*.ts'],
      provider: 'istanbul',
      reporter: ['clover', 'json', 'lcov', 'text'],
    },
  },
})
