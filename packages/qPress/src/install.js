/*global console*/
/**
 * Quasar App Extension install script
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/install-api
 */

import fse from 'fs-extra'

export default async function (api) {
  // verify this is a Vite project
  if (!api.hasVite) {
    throw new Error('This extension requires Vite')
  }

  api.compatibleWith('quasar', '^2.0.0')
  api.compatibleWith('@quasar/app-vite', '^2.0.0')

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

  const path = api.resolve.src('siteConfig')
  if (fse.pathExistsSync(path)) {
    // this is an update scenario
    console.log('-------------------------------------')
    console.log("Update only for 'src/.q-press' folder")
    console.log('-------------------------------------')
    api.render('./templates/update')
  } else {
    // this is a project initial setup
    console.log('--------------------------------------------')
    console.log('Initial setup. Be sure to read the\ndocumentation on the manual set up required.')
    console.log('--------------------------------------------')
    api.render('./templates/init')
  }
}
