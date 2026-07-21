import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { qPressDevDependencies, shouldUpdateDependency } from '../src/install'

describe('Q-Press install dependency updates', () => {
  it('keeps md-plugins dependency ranges aligned with the QPress version', () => {
    const { version } = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { version: string }

    expect(qPressDevDependencies['@md-plugins/search-ui']).toBe(`^${version}`)
    expect(qPressDevDependencies['@md-plugins/vite-search-plugin']).toBe(`^${version}`)
    expect(qPressDevDependencies['@md-plugins/vite-ssg-plugin']).toBe(`^${version}`)
  })

  it('installs current third-party dependency ranges', () => {
    expect(qPressDevDependencies).toMatchObject({
      '@vue/server-renderer': '^3.5.40',
      mermaid: '^11.16.0',
      shiki: '^4.3.1',
    })
  })

  it.each([
    'file:/tmp/md-plugins-vite-ssg-plugin-1.1.0.tgz',
    'link:../../viteSsgPlugin',
    'workspace:*',
    'npm:@md-plugins/vite-ssg-plugin@1.1.0',
  ])('preserves the non-semver dependency range %s', (existingRange) => {
    expect(() => shouldUpdateDependency(existingRange, '^1.1.0', '1.1.0')).not.toThrow()
    expect(shouldUpdateDependency(existingRange, '^1.1.0', '1.1.0')).toBe(false)
  })

  it('updates an older comparable range when the installed version is also old', () => {
    expect(shouldUpdateDependency('^1.0.0', '^1.1.0', '1.0.0')).toBe(true)
  })

  it.each(['1.1.0', '1.2.0', '2.0.0-beta.1'])(
    'preserves an older range when version %s is already installed',
    (installedVersion) => {
      expect(shouldUpdateDependency('^1.0.0', '^1.1.0', installedVersion)).toBe(false)
    },
  )

  it('preserves a newer declared range even when the installed version cannot be read', () => {
    expect(shouldUpdateDependency('^2.0.0', '^1.1.0')).toBe(false)
  })

  it('preserves the dependency when the installed version is not valid semver', () => {
    expect(shouldUpdateDependency('^1.0.0', '^1.1.0', 'custom-build')).toBe(false)
  })
})
