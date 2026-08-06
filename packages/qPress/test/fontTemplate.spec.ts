import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getQPressFontPreloadTags, montserratNormalFontUrl } from '../src/vite/font-preload'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(packageRoot, '../..')

const fontStylePaths = [
  'packages/docs/src/.q-press/css/fonts.scss',
  'packages/qPress/src/templates/init/src/_q-press/css/fonts.scss',
  'packages/qPress/src/templates/update/src/_q-press/css/fonts.scss',
  'packages/qPress/dist/templates/init/src/_q-press/css/fonts.scss',
  'packages/qPress/dist/templates/update/src/_q-press/css/fonts.scss',
]

function readExisting(relativePath: string): [string, string] | undefined {
  const absolutePath = resolve(repoRoot, relativePath)

  return existsSync(absolutePath) ? [relativePath, readFileSync(absolutePath, 'utf8')] : undefined
}

describe('Q-Press font templates', () => {
  it('keeps generated and packaged font styles in sync', () => {
    const styles = fontStylePaths.map(readExisting).filter((entry) => entry !== undefined)

    expect(styles.length).toBeGreaterThan(0)

    const [, expectedSource] = styles[0]

    for (const [relativePath, source] of styles) {
      expect(source, relativePath).toBe(expectedSource)
    }
  })

  it('uses one variable Montserrat face per style without duplicating Quasar Extras fonts', () => {
    const source = readExisting(fontStylePaths[0])?.[1] ?? ''

    expect(source.match(/@font-face/g)).toHaveLength(2)
    expect(source).toContain('font-weight: 300 900')
    expect(source).toContain('font-display: swap')
    expect(source).not.toContain("font-family: 'Roboto'")
    expect(source).not.toContain("font-family: 'Material Icons'")
  })

  it('preloads the normal Montserrat variable font before the docs shell mounts', () => {
    expect(getQPressFontPreloadTags()).toEqual([
      {
        tag: 'link',
        attrs: {
          rel: 'preconnect',
          href: 'https://cdn.quasar.dev',
          crossorigin: '',
        },
        injectTo: 'head-prepend',
      },
      {
        tag: 'link',
        attrs: {
          rel: 'preload',
          href: montserratNormalFontUrl,
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
        injectTo: 'head-prepend',
      },
    ])
  })
})
