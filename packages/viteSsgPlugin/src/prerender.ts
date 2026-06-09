import { Buffer } from 'node:buffer'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
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

function joinAssetHref(base: string, file: string): string {
  if (base === './') {
    return `./${file}`
  }

  if (base.startsWith('http://') || base.startsWith('https://')) {
    return `${base.replace(/\/$/, '')}/${file}`
  }

  return `${base === '/' ? '' : base}/${file}`
}

async function collectCssFiles(outDir: string, dir = 'assets'): Promise<string[]> {
  const entries = await readdir(join(outDir, dir), {
    withFileTypes: true,
  }).catch(() => [])
  const files: string[] = []

  for (const entry of entries) {
    const path = `${dir}/${entry.name}`

    if (entry.isDirectory()) {
      files.push(...(await collectCssFiles(outDir, path)))
    } else if (entry.isFile() && path.endsWith('.css')) {
      files.push(path)
    }
  }

  return files.sort()
}

async function injectMissingCssAssets(
  appHtml: string,
  outDir: string,
  base: string,
): Promise<string> {
  const cssFiles = await collectCssFiles(outDir)
  const missingLinks = cssFiles
    .map((file) => joinAssetHref(base, file))
    .filter((href) => !appHtml.includes(`href="${href}"`) && !appHtml.includes(`href=${href}`))
    .map((href) => `<link rel="stylesheet" crossorigin href="${href}">`)

  if (missingLinks.length === 0) {
    return appHtml
  }

  const content = `${missingLinks.join('\n')}\n`

  return appHtml.includes('</head>')
    ? appHtml.replace('</head>', `${content}</head>`)
    : `${content}${appHtml}`
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
  const appHtml = await injectMissingCssAssets(
    await readFile(join(resolvedOutDir, appHtmlFile), 'utf8'),
    resolvedOutDir,
    resolvedManifest.base,
  )
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
