/*global console*/
/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import fse from 'fs-extra'
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'

async function extendConfig(config, api) {
  // console.log('config', config)
  // console.log('api', api)

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

  // add the appropriate plugins
  const plugins = new Set(config.framework.plugins || [])
  plugins.add('Cookies')
  plugins.add('Dark')
  plugins.add('Meta')
  plugins.add('Notify')
  config.framework.plugins = Array.from(plugins)

  // const markdownPath = api.resolve.src('markdown')
  // const path = api.resolve.src('siteConfig')
  // if (fse.pathExistsSync(path) && fse.pathExistsSync(markdownPath)) {
  //   const siteConfig = await import(path)
  //   const { sidebar } = siteConfig

  //   // viteMdPlugin(ctx.appPaths.srcDir + '/markdown', sidebar as MenuItem[]),
  //   // add vite-md-plugin to quiasar.config.js
  //   config.vite.plugins.push([viteMdPlugin, { path: markdownPath, menu: sidebar }])
  // }
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
