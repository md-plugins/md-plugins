import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(packageRoot, '../..')
const menuTemplatePaths = [
  'packages/docs/src/.q-press/layouts/MarkdownHeaderMenu.ts',
  'packages/qPress/src/templates/init/src/_q-press/layouts/MarkdownHeaderMenu.ts',
  'packages/qPress/src/templates/update/src/_q-press/layouts/MarkdownHeaderMenu.ts',
  'packages/qPress/dist/templates/init/src/_q-press/layouts/MarkdownHeaderMenu.ts',
  'packages/qPress/dist/templates/update/src/_q-press/layouts/MarkdownHeaderMenu.ts',
]

describe('Q-Press menu templates', () => {
  it('keeps generated menu semantics in sync with Quasar menu behavior', () => {
    for (const relativePath of menuTemplatePaths) {
      const absolutePath = resolve(repoRoot, relativePath)

      if (existsSync(absolutePath)) {
        expect(readFileSync(absolutePath, 'utf8'), relativePath).toContain(
          "h(QList, { dense: true, padding: true, role: 'menu' }",
        )
      }
    }
  })
})
