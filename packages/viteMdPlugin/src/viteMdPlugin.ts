import type { Plugin, ViteDevServer, ModuleNode } from 'vite'
import type { MenuItem, UserConfig } from './types'
import { mdParse } from './md-parse'

// Regex to match markdown files
const mdRE = /\.md$/

let globalMenu: MenuItem[] = []
let globalPrefix: string = ''

/**
 * Transforms markdown content into Vue Single File Component (SFC) format.
 *
 * @param code - The markdown content to be transformed.
 * @param id - The identifier (typically the file path) of the markdown file.
 * @returns The transformed Vue SFC content as a string, or null if the file is not a markdown file.
 * @throws Will throw an error if the markdown transformation process fails.
 */
function transform(code: string, id: string): string | null {
  if (!mdRE.test(id)) return null

  try {
    const result = mdParse(code, id, globalPrefix, globalMenu)
    return result.code
  } catch (err) {
    console.error(`Error processing Markdown file: ${id}`, err)
    throw new Error(
      `Markdown transform failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

function hotUpdate({
  file,
  server,
  modules,
  timestamp,
}: {
  file: string
  server: ViteDevServer
  modules: Array<any>
  timestamp: number
}) {
  if (mdRE.test(file)) {
    const invalidatedModules = new Set<ModuleNode>()
    for (const mod of modules) {
      server.moduleGraph.invalidateModule(mod, invalidatedModules, timestamp, true)
    }
    server.ws.send({
      type: 'full-reload',
      path: file,
    })
  }
  return []
}

/**
 * A Vite plugin object that transforms Markdown content into Vue Single File Components (SFCs).
 * This plugin is configured with a path prefix and a navigation menu structure.
 */
const mdPlugins: Plugin = {
  name: '@md-plugins/vite-md-plugin',
  enforce: 'pre',

  transform,

  hotUpdate,
}

/**
 * Creates a Vite plugin for processing Markdown files.
 * This plugin transforms Markdown content into Vue Single File Components (SFCs).
 *
 * @param path - The base path prefix to be used for routing or file resolution.
 * @param menu - An array of MenuItem objects representing the navigation menu structure.
 * @returns A Vite plugin object with pre-configured settings for Markdown processing.
 */
function viteMdPlugin2(path: string, menu: MenuItem[]): Plugin {
  globalMenu = menu
  globalPrefix = path

  return mdPlugins
}

/**
 * Creates a Vite plugin for processing Markdown files based on the provided user configuration.
 * This function configures and returns a plugin that transforms Markdown content into Vue Single File Components (SFCs).
 *
 * @param userConfig - The configuration object for the Vite Markdown plugin.
 * @param userConfig.path - The base path prefix to be used for routing or file resolution.
 * @param userConfig.menu - An array of MenuItem objects representing the navigation menu structure.
 * @returns A Vite Plugin object pre-configured with the provided settings for Markdown processing.
 */
export function viteMdPlugin(userConfig: UserConfig): Plugin {
  return viteMdPlugin2(userConfig.path, userConfig.menu)
}
