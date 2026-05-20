/**
 * Quasar App Extension index/runner script
 * (runs on each dev/build)
 *
 * Docs: https://quasar.dev/app-extensions/development-guide/index-api
 */

import { defineIndexScript } from '@quasar/app-vite'

// import fse from 'fs-extra'
// import { viteMdPlugin } from '@md-plugins/vite-md-plugin'

type ViteAliasEntry = {
  find: string | RegExp
  replacement: string
}

type ViteAlias = readonly ViteAliasEntry[] | Record<string, string>

type ViteConfigWithAlias = {
  resolve?: {
    alias?: ViteAlias
  }
}

function normalizeAlias(alias: ViteAlias | undefined): ViteAliasEntry[] {
  if (Array.isArray(alias)) {
    return [...alias]
  }

  return Object.entries(alias ?? {}).map(([find, replacement]) => ({
    find,
    replacement,
  }))
}

function addQuasarSourceAlias(viteConf: ViteConfigWithAlias, appDir: string): void {
  const alias = normalizeAlias(viteConf.resolve?.alias)

  viteConf.resolve ??= {}
  viteConf.resolve.alias = [
    ...alias,
    {
      find: /^quasar\/src\/(.*)$/,
      replacement: `${appDir.replace(/\\/g, '/')}/node_modules/quasar/src/$1`,
    },
  ]
}

export default defineIndexScript((api) => {
  // verify this is a Vite project
  if (!api.hasVite) {
    throw new Error('This extension requires Vite')
  }

  api.compatibleWith('quasar', '^2.0.0')
  api.compatibleWith('@quasar/app-vite', '>=3.0.0-beta.14')

  // here we extend /quasar.config, so we can add some Vite/Vue stuff
  api.extendQuasarConf(async (config) => {
    config.build ??= {}
    config.build.viteVuePluginOptions ??= {}
    config.framework ??= {}

    // make sure 'vueRouterMode' has 'history' mode
    if (config.build.vueRouterMode !== 'history') {
      console.warn(
        'Changing vueRouterMode to "history" - required for hash links to work correctly',
      )
      config.build.vueRouterMode = 'history'
    }

    // let Vite know to transpile md files
    const include = config.build.viteVuePluginOptions.include
    if (Array.isArray(include)) {
      include.push(/\.(vue|md)$/)
    } else if (include !== void 0) {
      config.build.viteVuePluginOptions.include = [include, /\.(vue|md)$/]
    } else {
      config.build.viteVuePluginOptions.include = [/\.(vue|md)$/]
    }

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
    //   const { sidebar } = siteConfig.default || siteConfig

    //   // add vite-md-plugin to quasar.config.js
    //   config.vite.plugins.push(viteMdPlugin({ path: markdownPath, menu: sidebar }))
    // }
  })

  api.extendViteConf((viteConf, _invoke, aeApi) => {
    addQuasarSourceAlias(viteConf, aeApi.appDir)
  })
})
