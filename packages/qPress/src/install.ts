/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 */

import { defineInstallScript } from '@quasar/app-vite'
import { existsSync } from 'node:fs'

export default defineInstallScript(async (api) => {
  api.compatibleWith('quasar', '^2.0.0')
  api.compatibleWith('@quasar/app-vite', '>=3.0.0-beta.39')

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
    dependencies: {
      '@md-plugins/vite-ssg-plugin': '^0.1.0-beta.23',
      '@vue/server-renderer': '^3.5.0',
      mermaid: '^11.15.0',
      shiki: '^4.1.0',
    },
    scripts: {
      'build:ssg': 'quasar prepare && quasar build && qpress-ssg',
      'build:ssg:renderer': 'quasar prepare && quasar build -m ssr',
      'prerender:ssg': 'qpress-ssg',
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
