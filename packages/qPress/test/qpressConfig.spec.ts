import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadQPressCliConfig } from '../src/bin/qpress-config.js'

/**
 * Creates a temporary project root for qpress config tests.
 */
async function createProject(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'qpress-config-'))
}

describe('qpress config', () => {
  it('discovers qpress.config.json from the project root', async () => {
    const root = await createProject()

    try {
      await writeFile(
        join(root, 'qpress.config.json'),
        JSON.stringify({
          check: {
            allowedRoutes: ['/theme-builder'],
            ignoreFiles: ['__*.md'],
          },
        }),
      )

      const config = await loadQPressCliConfig({ cwd: root })

      expect(config.check?.allowedRoutes).toEqual(['/theme-builder'])
      expect(config.check?.ignoreFiles).toEqual(['__*.md'])
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('loads an explicit JavaScript config file', async () => {
    const root = await createProject()

    try {
      await writeFile(
        join(root, 'docs-qpress.config.mjs'),
        `export default {
  check: {
    failOnWarnings: true,
    siteConfigDir: 'docsConfig',
  },
}
`,
      )

      const config = await loadQPressCliConfig({
        configFile: 'docs-qpress.config.mjs',
        cwd: root,
      })

      expect(config.check?.failOnWarnings).toBe(true)
      expect(config.check?.siteConfigDir).toBe('docsConfig')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('returns an empty config when config loading is disabled', async () => {
    const root = await createProject()

    try {
      await writeFile(
        join(root, 'qpress.config.json'),
        JSON.stringify({
          check: {
            failOnWarnings: true,
          },
        }),
      )

      const config = await loadQPressCliConfig({ cwd: root, loadConfig: false })

      expect(config).toEqual({})
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })
})
