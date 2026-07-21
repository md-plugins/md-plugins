import type { Plugin, ResolvedConfig } from 'vite'
import { Buffer } from 'node:buffer'
import { renderSsgRouteHtml } from './html'
import { discoverMarkdownSsgRoutes } from './markdownRoutes'
import {
  createSsgRouteManifest,
  defaultSsgAppShellFile,
  defaultSsgManifestFile,
  defaultSsgVirtualModuleId,
} from './routes'
import type { SsgRouteInput, SsgRouteManifest, ViteSsgPluginOptions } from './types'

type BundleAsset = {
  type: 'asset'
  fileName: string
  source: string | Uint8Array
}

type OutputBundle = Record<string, unknown>

/**
 * Narrows a Rollup bundle entry to an asset with string or byte source content.
 */
function isBundleAsset(entry: unknown): entry is BundleAsset {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'type' in entry &&
    entry.type === 'asset' &&
    'fileName' in entry &&
    typeof entry.fileName === 'string' &&
    'source' in entry
  )
}

/**
 * Converts Rollup asset source data into UTF-8 text.
 */
function assetSourceToString(source: string | Uint8Array): string {
  return typeof source === 'string' ? source : Buffer.from(source).toString('utf8')
}

/**
 * Finds the built app shell asset in the generated Vite bundle.
 */
function findHtmlAsset(bundle: OutputBundle, fileName: string): BundleAsset | undefined {
  return Object.values(bundle).find(
    (entry): entry is BundleAsset => isBundleAsset(entry) && entry.fileName === fileName,
  )
}

/**
 * Serializes the manifest exposed through the virtual SSG routes module.
 */
function serializeManifestModule(manifest: SsgRouteManifest): string {
  const serializedManifest = JSON.stringify(manifest, null, 2)

  return [
    `export const ssgRouteManifest = ${serializedManifest}`,
    'export const ssgRoutes = ssgRouteManifest.routes',
    'export default ssgRouteManifest',
    '',
  ].join('\n')
}

/**
 * Resolves configured route inputs and optional Markdown-discovered routes.
 */
async function resolveRouteInputs(
  options: Pick<ViteSsgPluginOptions, 'markdown' | 'routes'>,
): Promise<SsgRouteInput[]> {
  const routeSource = options.routes
  const markdownRoutes = options.markdown ? discoverMarkdownSsgRoutes(options.markdown) : []

  if (!routeSource) {
    return markdownRoutes
  }

  if (typeof routeSource === 'function') {
    return [...markdownRoutes, ...(await routeSource())]
  }

  return [...markdownRoutes, ...routeSource]
}

/**
 * Creates the Vite plugin that emits SSG route manifests and optional route HTML shells.
 */
export function viteSsgPlugin(options: ViteSsgPluginOptions = {}): Plugin {
  const virtualModuleId = options.virtualModuleId ?? defaultSsgVirtualModuleId
  const resolvedVirtualModuleId = `\0${virtualModuleId}`
  let config: ResolvedConfig | undefined
  let manifest: SsgRouteManifest | undefined

  /**
   * Rebuilds the manifest from current route inputs.
   */
  async function refreshManifest(): Promise<SsgRouteManifest> {
    const routes = await resolveRouteInputs(options)
    manifest = createSsgRouteManifest(routes, {
      base: options.base ?? config?.base ?? '/',
      exclude: options.exclude,
    })

    return manifest
  }

  /**
   * Returns the cached manifest or creates it when the virtual module is loaded early.
   */
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

    async generateBundle(_outputOptions, bundle) {
      if (options.enabled === false) {
        return
      }

      const resolvedManifest = await refreshManifest()
      const appHtmlFile = options.appHtmlFile ?? 'index.html'
      const appShellFile = options.appShellFile ?? defaultSsgAppShellFile
      const manifestFile = options.manifestFile ?? defaultSsgManifestFile
      const appHtmlAsset = findHtmlAsset(bundle as OutputBundle, appHtmlFile)

      this.emitFile({
        type: 'asset',
        fileName: manifestFile,
        source: `${JSON.stringify(resolvedManifest, null, 2)}\n`,
      })

      if (options.emitHtml === false) {
        return
      }

      const htmlAsset = appHtmlAsset

      if (!htmlAsset) {
        this.warn(
          `Could not find ${appHtmlFile}; skipped SSG route HTML generation. The route manifest was still emitted.`,
        )
        return
      }

      const appHtml = assetSourceToString(htmlAsset.source)

      if (appShellFile === appHtmlFile || appShellFile === manifestFile) {
        throw new Error(
          'SSG appShellFile must differ from appHtmlFile and manifestFile so the shell stays immutable.',
        )
      }

      this.emitFile({
        type: 'asset',
        fileName: appShellFile,
        source: appHtml,
      })

      for (const [routeIndex, route] of resolvedManifest.routes.entries()) {
        const context = {
          appHtml,
          manifest: resolvedManifest,
          routeIndex,
        }
        const transformedHtml = await renderSsgRouteHtml(route, context, {
          renderRoute: options.renderRoute,
          transformHtml: options.transformHtml,
          injectRoutePayload: options.injectRoutePayload,
        })

        if (route.htmlFile === appHtmlFile) {
          htmlAsset.source = transformedHtml
          continue
        }

        this.emitFile({
          type: 'asset',
          fileName: route.htmlFile,
          source: transformedHtml,
        })
      }
    },
  }
}
