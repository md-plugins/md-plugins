/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import { defineIndexScript } from '@quasar/app-vite'

/**
 * Extends Quasar config so Markdown files can be imported as Vue components.
 *
 * This legacy app-extension runner keeps Markdown routing behavior aligned with
 * the standalone Vite Markdown plugin.
 */
function extendConfig(config) {
  // make sure 'vueRouterMode' has 'history' mode
  if (config.build.vueRouterMode !== 'history') {
    console.warn('Changing vueRouterMode to "history" - required for hash links to work correctly')
    config.build.vueRouterMode = 'history'
  }

  // let Vite know to transpile md files
  config.build.viteVuePluginOptions.include = config.build.viteVuePluginOptions.include || []
  config.build.viteVuePluginOptions.include.push(/\.(vue|md)$/)

  // let Vue know to auto import md files
  const extensions = new Set(config.framework.autoImportVueExtensions || [])
  extensions.add('md')
  extensions.add('vue')
  config.framework.autoImportVueExtensions = Array.from(extensions)
}

export default defineIndexScript((api) => {
  api.compatibleWith('quasar', '^2.0.0')
  api.compatibleWith('@quasar/app-vite', '>=3.0.0')

  // here we extend /quasar.config, so we can add some Vite/Vue stuff
  api.extendQuasarConf(extendConfig)
})
