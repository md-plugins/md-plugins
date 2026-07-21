/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 */

import { defineInstallScript } from '@quasar/app-vite'
import { existsSync, readFileSync } from 'node:fs'
import semver from 'semver'

type DependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'optionalDependencies'
  | 'peerDependencies'

type PackageJson = Partial<Record<DependencySection, Record<string, string>>>

type QPressPackageJson = {
  version: string
}

const dependencySections: DependencySection[] = [
  'devDependencies',
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
]

const { version: qPressVersion } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as QPressPackageJson
const mdPluginsVersionRange = `^${qPressVersion}`

export const qPressDevDependencies = {
  '@md-plugins/search-ui': mdPluginsVersionRange,
  '@md-plugins/vite-search-plugin': mdPluginsVersionRange,
  '@md-plugins/vite-ssg-plugin': mdPluginsVersionRange,
  '@vue/server-renderer': '^3.5.40',
  mermaid: '^11.16.0',
  shiki: '^4.3.1',
}

/**
 * Reads the consuming app's package.json, returning an empty shape when absent.
 */
function readPackageJson(path: string): PackageJson {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as PackageJson
  } catch {
    return {}
  }
}

/**
 * Finds which package.json dependency section currently owns a package.
 */
function getDependencySection(pkgJson: PackageJson, name: string): DependencySection | undefined {
  return dependencySections.find((section) => pkgJson[section]?.[name] !== undefined)
}

/**
 * Decides whether Q-Press should update an existing dependency range.
 *
 * Comparable ranges are only updated when the desired range is newer. Non-semver
 * ranges such as aliases, file links, and workspace ranges are preserved.
 */
export function shouldUpdateDependency(
  existingRange: string,
  desiredRange: string,
  installedVersion?: string,
): boolean {
  let desiredMinimum: semver.SemVer | null
  let existingMinimum: semver.SemVer | null

  try {
    desiredMinimum = semver.minVersion(desiredRange)
    existingMinimum = semver.minVersion(existingRange)
  } catch {
    return false
  }

  if (desiredMinimum === null || existingMinimum === null) {
    return false
  }

  if (semver.gte(existingMinimum, desiredMinimum)) {
    return false
  }

  if (installedVersion === undefined) {
    return true
  }

  const validInstalledVersion = semver.valid(installedVersion)

  // If the installed version cannot be compared safely, preserve the user's
  // dependency declaration rather than risk replacing it with an older range.
  return validInstalledVersion !== null && semver.lt(validInstalledVersion, desiredMinimum)
}

/**
 * Builds the package.json patch needed for Q-Press runtime/dev dependencies.
 */
function getDependencyPatch(
  pkgJson: PackageJson,
  getInstalledVersion: (name: string) => string | undefined,
): Partial<Record<DependencySection, Record<string, string>>> {
  return Object.entries(qPressDevDependencies).reduce<
    Partial<Record<DependencySection, Record<string, string>>>
  >((patch, [name, desiredRange]) => {
    const existingSection = getDependencySection(pkgJson, name)

    if (existingSection === undefined) {
      patch.devDependencies ??= {}
      patch.devDependencies[name] = desiredRange
      return patch
    }

    const existingRange = pkgJson[existingSection]?.[name]

    if (
      existingRange !== undefined &&
      shouldUpdateDependency(existingRange, desiredRange, getInstalledVersion(name))
    ) {
      patch[existingSection] ??= {}
      patch[existingSection][name] = desiredRange
    }

    return patch
  }, {})
}

export default defineInstallScript(async (api) => {
  api.compatibleWith('quasar', '^2.0.0')
  api.compatibleWith('@quasar/app-vite', '>=3.0.0')

  // project must have pinia installed
  if ((await api.getStorePackageName()) !== 'pinia') {
    console.error('-----------------------------')
    console.error('This extension requires pinia')
    console.error('-----------------------------')
    throw new Error('This extension requires pinia')
  }

  // project must be typescript
  if ((await api.hasTypescript()) !== true) {
    console.error('----------------------------------')
    console.error('This extension requires TypeScript')
    console.error('----------------------------------')
    throw new Error('This extension requires TypeScript')
  }

  api.extendPackageJson({
    ...getDependencyPatch(readPackageJson(api.resolve.app('package.json')), (name) =>
      api.getPackageVersion(name),
    ),
    scripts: {
      'build:ssg': 'quasar prepare && quasar build && qpress ssg',
      'build:ssg:renderer': 'quasar prepare && quasar build -m ssr',
      'check:qpress': 'qpress check',
      'prerender:ssg': 'qpress ssg',
      'preview:ssg': 'quasar serve dist/spa --history',
    },
  })

  const path = api.resolve.src('siteConfig')
  if (existsSync(path)) {
    // this is an update scenario
    console.warn('-------------------------------------')
    console.warn("Update only for 'src/.q-press' folder")
    console.warn('-------------------------------------')
    api.render('./templates/update')
  } else {
    // this is a project initial setup
    console.warn('--------------------------------------------')
    console.warn('Initial setup. Be sure to read the\ndocumentation on the manual set up required.')
    console.warn('--------------------------------------------')
    api.render('./templates/init')
  }
})
