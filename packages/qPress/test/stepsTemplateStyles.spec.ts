import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(packageRoot, '../..')

const appStylePaths = [
  'packages/qPress/src/templates/init/src/_q-press/css/app.scss',
  'packages/qPress/src/templates/update/src/_q-press/css/app.scss',
  'packages/docs/src/.q-press/css/app.scss',
  'packages/qPress/dist/templates/init/src/_q-press/css/app.scss',
  'packages/qPress/dist/templates/update/src/_q-press/css/app.scss',
]

const themePaths = [
  'packages/qPress/src/templates/init/src/_q-press/css/themes',
  'packages/qPress/src/templates/update/src/_q-press/css/themes',
  'packages/docs/src/.q-press/css/themes',
  'packages/qPress/dist/templates/init/src/_q-press/css/themes',
  'packages/qPress/dist/templates/update/src/_q-press/css/themes',
]

const themeFiles = [
  'default.scss',
  'evergreen.scss',
  'mystic.scss',
  'newspaper.scss',
  'sunrise.scss',
  'tawny.scss',
]

function readExisting(relativePath: string): string | undefined {
  const absolutePath = resolve(repoRoot, relativePath)

  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : undefined
}

function getBetween(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start)
  const endIndex = source.indexOf(end, startIndex)

  expect(startIndex, `Missing start marker: ${start}`).toBeGreaterThanOrEqual(0)
  expect(endIndex, `Missing end marker: ${end}`).toBeGreaterThan(startIndex)

  return source.slice(startIndex, endIndex).trim()
}

function getStepsStyle(source: string): string {
  return getBetween(source, '.markdown-steps {', '.markdown-heading {')
}

function getDarkStepsStyle(source: string): string {
  return getBetween(source, '  .markdown-step {', '  .markdown-h2 {')
}

function getStepThemeVariables(source: string): string {
  return source
    .split('\n')
    .filter((line) => line.startsWith('$steps-'))
    .join('\n')
    .trim()
}

describe('Q-Press steps template styles', () => {
  it('keeps generated and packaged step layout styles in sync', () => {
    const styles = appStylePaths
      .map((relativePath) => [relativePath, readExisting(relativePath)] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] !== undefined)

    expect(styles.length).toBeGreaterThan(0)

    const [, expectedSource] = styles[0]
    const expectedSteps = getStepsStyle(expectedSource)
    const expectedDarkSteps = getDarkStepsStyle(expectedSource)

    for (const [relativePath, source] of styles) {
      expect(getStepsStyle(source), `${relativePath} light steps block`).toBe(expectedSteps)
      expect(getDarkStepsStyle(source), `${relativePath} dark steps block`).toBe(expectedDarkSteps)
    }
  })

  it('keeps generated and packaged step theme variables in sync', () => {
    for (const themeFile of themeFiles) {
      const themes = themePaths
        .map((relativePath) => {
          const themePath = `${relativePath}/${themeFile}`

          return [themePath, readExisting(themePath)] as const
        })
        .filter((entry): entry is readonly [string, string] => entry[1] !== undefined)

      expect(themes.length).toBeGreaterThan(0)

      const [, expectedSource] = themes[0]
      const expectedVariables = getStepThemeVariables(expectedSource)

      for (const [themePath, source] of themes) {
        expect(getStepThemeVariables(source), `${themePath} step variables`).toBe(expectedVariables)
      }
    }
  })
})
