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

const dependencySections: DependencySection[] = [
  'devDependencies',
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
]

const qPressDevDependencies = {
  '@md-plugins/vite-ssg-plugin': '^0.1.0-rc.1',
  '@vue/server-renderer': '^3.5.0',
  mermaid: '^11.15.0',
  shiki: '^4.1.0',
}

function readPackageJson(path: string): PackageJson {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as PackageJson
  } catch {
    return {}
  }
}

function getDependencySection(pkgJson: PackageJson, name: string): DependencySection | undefined {
  return dependencySections.find((section) => pkgJson[section]?.[name] !== undefined)
}

function shouldUpdateDependency(
  existingRange: string,
  desiredRange: string,
  installedVersion?: string,
): boolean {
  const desiredMinimum = semver.minVersion(desiredRange)

  if (desiredMinimum === null) {
    return false
  }

  const existingMinimum = semver.minVersion(existingRange)

  // Preserve package aliases, file/link/workspace ranges, and other ranges
  // that semver cannot compare safely.
  if (existingMinimum === null) {
    return false
  }

  if (semver.gte(existingMinimum, desiredMinimum)) {
    return false
  }

  if (installedVersion !== undefined && semver.valid(installedVersion) !== null) {
    return semver.lt(installedVersion, desiredMinimum)
  }

  return true
}

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
  api.compatibleWith('@quasar/app-vite', '>=3.0.0-rc.2')

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
      'build:ssg': 'quasar prepare && quasar build && qpress-ssg',
      'build:ssg:renderer': 'quasar prepare && quasar build -m ssr',
      'prerender:ssg': 'qpress-ssg',
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
