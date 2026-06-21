#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const binDir = dirname(fileURLToPath(import.meta.url))
const cliPath = resolve(binDir, '../dist/bin/qpress.js')

if (!existsSync(cliPath)) {
  process.stderr.write(
    'qpress has not been built yet. Run `pnpm build:packages` before invoking this command.\n',
  )
  process.exit(1)
}

await import(pathToFileURL(cliPath).href)
