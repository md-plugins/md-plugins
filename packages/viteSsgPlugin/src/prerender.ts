import { Buffer } from 'node:buffer'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { defaultSsgManifestFile } from './routes'
import { renderSsgRouteHtml } from './html'
import type {
  PrerenderSsgRoutesOptions,
  PrerenderSsgRoutesResult,
  PrerenderedSsgRoute,
  SsgRouteManifest,
} from './types'

async function readSsgRouteManifest(
  outDir: string,
  manifestFile: string,
): Promise<SsgRouteManifest> {
  const manifestJson = await readFile(join(outDir, manifestFile), 'utf8')

  return JSON.parse(manifestJson) as SsgRouteManifest
}

export async function prerenderSsgRoutes({
  outDir,
  appHtmlFile = 'index.html',
  manifestFile = defaultSsgManifestFile,
  manifest,
  renderRoute,
  transformHtml,
  injectRoutePayload,
}: PrerenderSsgRoutesOptions): Promise<PrerenderSsgRoutesResult> {
  const resolvedOutDir = resolve(outDir)
  const resolvedManifest = manifest ?? (await readSsgRouteManifest(resolvedOutDir, manifestFile))
  const appHtml = await readFile(join(resolvedOutDir, appHtmlFile), 'utf8')
  const routes: PrerenderedSsgRoute[] = []

  for (const [routeIndex, route] of resolvedManifest.routes.entries()) {
    const html = await renderSsgRouteHtml(
      route,
      {
        appHtml,
        manifest: resolvedManifest,
        routeIndex,
      },
      {
        renderRoute,
        transformHtml,
        injectRoutePayload,
      },
    )
    const htmlPath = join(resolvedOutDir, route.htmlFile)

    await mkdir(dirname(htmlPath), { recursive: true })
    await writeFile(htmlPath, html)

    routes.push({
      path: route.path,
      htmlFile: route.htmlFile,
      bytes: Buffer.byteLength(html),
    })
  }

  return {
    manifest: resolvedManifest,
    outDir: resolvedOutDir,
    routes,
  }
}
