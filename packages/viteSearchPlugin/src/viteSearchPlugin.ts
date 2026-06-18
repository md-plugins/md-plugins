import type { Plugin, ResolvedConfig } from 'vite'
import { createSearchIndex } from './markdown'
import { normalizeSearchAdapters } from './adapters'
import type { SearchIndex, ViteSearchPluginOptions } from './types'

export const defaultSearchVirtualModuleId = 'virtual:md-plugins/search-index'

/**
 * Serializes the search index exposed through the virtual search module.
 */
function serializeSearchModule(index: SearchIndex): string {
  const serializedIndex = JSON.stringify(index, null, 2)

  return [
    `export const searchIndex = ${serializedIndex}`,
    'export const searchRecords = searchIndex.records',
    'export default searchIndex',
    '',
  ].join('\n')
}

/**
 * Creates the Vite plugin that emits Markdown search index assets.
 */
export function viteSearchPlugin(options: ViteSearchPluginOptions = {}): Plugin {
  const virtualModuleId = options.virtualModuleId ?? defaultSearchVirtualModuleId
  const resolvedVirtualModuleId = `\0${virtualModuleId}`
  let config: ResolvedConfig | undefined
  let index: SearchIndex | undefined

  async function refreshIndex(): Promise<SearchIndex> {
    index = await createSearchIndex({
      ...options,
      base: options.base ?? config?.base ?? '/',
    })

    return index
  }

  async function getIndex(): Promise<SearchIndex> {
    return index ?? refreshIndex()
  }

  return {
    name: '@md-plugins/vite-search-plugin',
    enforce: 'post',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async buildStart() {
      await refreshIndex()
    },

    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }

      return undefined
    },

    async load(id) {
      if (id !== resolvedVirtualModuleId) {
        return undefined
      }

      return serializeSearchModule(await getIndex())
    },

    async generateBundle() {
      if (options.enabled === false) {
        return
      }

      const resolvedIndex = await refreshIndex()
      const adapters = normalizeSearchAdapters(options.adapters)
      const context = {
        config,
        index: resolvedIndex,
        options,
      }

      for (const adapter of adapters) {
        const outputs = await adapter.transform(resolvedIndex.records, context)

        if (outputs === undefined) {
          continue
        }

        const normalizedOutputs = Array.isArray(outputs) ? outputs : [outputs]

        for (const output of normalizedOutputs) {
          this.emitFile({
            type: 'asset',
            fileName: output.fileName,
            source: output.source,
          })
        }
      }
    },
  }
}
