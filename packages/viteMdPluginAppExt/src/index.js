/*global console*/
/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

function extendConfig(config) {
  // make sure 'vueRouterMode' has 'history' mode
  if (config.build.vueRouterMode !== 'history') {
    console.log('Changing vueRouterMode to "history" - required for hash links to work correctly')
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

export default function (api) {
  // verify this is a Vite project
  if (!api.hasVite) {
    throw new Error('This extension requires Vite')
  }

  api.compatibleWith('quasar', '^2.0.0')
  api.compatibleWith('@quasar/app-vite', '^2.0.0')

  // here we extend /quasar.config, so we can add some Vite/Vue stuff
  api.extendQuasarConf(extendConfig)
}
