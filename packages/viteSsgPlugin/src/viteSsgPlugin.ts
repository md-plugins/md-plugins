import type { Plugin, ResolvedConfig } from 'vite'
import { createSsgRouteManifest, defaultSsgManifestFile, defaultSsgVirtualModuleId } from './routes'
import type { SsgRouteInput, SsgRouteManifest, ViteSsgPluginOptions } from './types'

function serializeManifestModule(manifest: SsgRouteManifest): string {
  const serializedManifest = JSON.stringify(manifest, null, 2)

  return [
    `export const ssgRouteManifest = ${serializedManifest}`,
    'export const ssgRoutes = ssgRouteManifest.routes',
    'export default ssgRouteManifest',
    '',
  ].join('\n')
}

async function resolveRouteInputs(
  routeSource: ViteSsgPluginOptions['routes'],
): Promise<SsgRouteInput[]> {
  if (!routeSource) {
    return []
  }

  if (typeof routeSource === 'function') {
    return routeSource()
  }

  return routeSource
}

export function viteSsgPlugin(options: ViteSsgPluginOptions = {}): Plugin {
  const virtualModuleId = options.virtualModuleId ?? defaultSsgVirtualModuleId
  const resolvedVirtualModuleId = `\0${virtualModuleId}`
  let config: ResolvedConfig | undefined
  let manifest: SsgRouteManifest | undefined

  async function refreshManifest(): Promise<SsgRouteManifest> {
    const routes = await resolveRouteInputs(options.routes)
    manifest = createSsgRouteManifest(routes, {
      base: options.base ?? config?.base ?? '/',
    })

    return manifest
  }

  async function getManifest(): Promise<SsgRouteManifest> {
    return manifest ?? refreshManifest()
  }

  return {
    name: '@md-plugins/vite-ssg-plugin',
    enforce: 'post',

    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    async buildStart() {
      await refreshManifest()
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

      return serializeManifestModule(await getManifest())
    },

    async generateBundle() {
      if (options.enabled === false) {
        return
      }

      const resolvedManifest = await refreshManifest()

      this.emitFile({
        type: 'asset',
        fileName: options.manifestFile ?? defaultSsgManifestFile,
        source: `${JSON.stringify(resolvedManifest, null, 2)}\n`,
      })
    },
  }
}
