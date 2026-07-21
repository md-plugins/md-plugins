import { createRequire } from 'node:module'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createSsgRouteManifest } from '@md-plugins/vite-ssg-plugin'
import { prerenderQPressSsg } from '../src/ssg/prerender-qpress-ssg'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Returns all meta elements with a matching name or property value.
 */
function findMetaElements(html: string, name: string): string[] {
  const elements = html.match(/<meta\b[^>]*>/gi) ?? []
  const identityRE = new RegExp(`(?:name|property)=["']${name.replace(':', '\\:')}["']`, 'i')

  return elements.filter((element) => identityRE.test(element))
}

describe('Q-Press SSG prerendering', () => {
  it('reconciles route SSR metadata with the built SPA shell for every route', async () => {
    const testRoot = await mkdtemp(join(packageRoot, '.qpress-ssg-meta-'))
    const outDir = join(testRoot, 'spa')
    const ssrDir = join(testRoot, 'ssr')
    const serverDir = join(ssrDir, 'server')
    const manifest = createSsgRouteManifest(['/', '/guide'])
    const serverRendererEntry = createRequire(import.meta.url).resolve('@vue/server-renderer')
    const vueEntry = createRequire(serverRendererEntry).resolve('vue')

    try {
      await mkdir(serverDir, { recursive: true })
      await mkdir(outDir, { recursive: true })
      await writeFile(
        join(outDir, 'index.html'),
        [
          '<!doctype html><html><head>',
          '<title>SPA shell title</title>',
          '<meta name="description" content="SPA shell description">',
          '<meta name="twitter:site" content="@docs">',
          '<meta name="twitter:title" content="SPA shell Twitter title">',
          '<meta name="twitter:description" content="SPA shell Twitter description">',
          '<meta property="og:title" content="SPA shell Open Graph title">',
          '<meta property="og:description" content="SPA shell Open Graph description">',
          '<meta property="og:url" content="https://docs.example.com/reference/">',
          '<link rel="canonical" href="https://docs.example.com/reference/">',
          '</head><body><div id="q-app"></div></body></html>',
        ].join(''),
      )
      await writeFile(
        join(outDir, 'q-press-ssg-routes.json'),
        `${JSON.stringify(manifest, null, 2)}\n`,
      )
      await writeFile(
        join(serverDir, 'server-entry.js'),
        [
          `import vue from ${JSON.stringify(pathToFileURL(vueEntry).href)}`,
          'const { h } = vue',
          'export default function render(ssrContext) {',
          "  const isRoot = ssrContext.req.url === '/'",
          "  const title = isRoot ? 'Reference home | Docs' : 'Guide | Docs'",
          "  const description = isRoot ? 'Reference home description' : 'Guide description'",
          '  ssrContext._meta.headTags = `<title>${title}</title>` +',
          '    `<meta name="description" content="${description}" data-qmeta="description">` +',
          '    `<meta name="twitter:title" content="${title}" data-qmeta="twitterTitle">` +',
          '    `<meta name="twitter:description" content="${description}" data-qmeta="twitterDesc">` +',
          '    `<meta name="og:title" content="${title}" data-qmeta="ogTitle">` +',
          '    `<meta name="og:description" content="${description}" data-qmeta="ogDesc">`',
          "  return h('main', { id: 'route-content' }, title)",
          '}',
        ].join('\n'),
      )

      await prerenderQPressSsg({
        outDir,
        reportFile: false,
        renderer: 'quasar-ssr',
        ssrDir,
      })

      const rootHtml = await readFile(join(outDir, 'index.html'), 'utf8')
      const guideHtml = await readFile(join(outDir, 'guide/index.html'), 'utf8')

      expect(rootHtml.match(/<title\b/gi)).toHaveLength(1)
      expect(rootHtml).toContain('<title>Reference home | Docs</title>')
      expect(rootHtml).toContain('href="https://docs.example.com/reference/"')
      expect(findMetaElements(rootHtml, 'og:url')[0]).toContain(
        'content="https://docs.example.com/reference/"',
      )

      expect(guideHtml.match(/<title\b/gi)).toHaveLength(1)
      expect(guideHtml).toContain('<title>Guide | Docs</title>')
      expect(guideHtml).not.toContain('SPA shell title')
      expect(guideHtml).toContain('href="https://docs.example.com/reference/guide"')
      expect(findMetaElements(guideHtml, 'og:url')[0]).toContain(
        'content="https://docs.example.com/reference/guide"',
      )

      for (const name of [
        'description',
        'twitter:title',
        'twitter:description',
        'og:title',
        'og:description',
      ]) {
        expect(findMetaElements(rootHtml, name)).toHaveLength(1)
        expect(findMetaElements(guideHtml, name)).toHaveLength(1)
      }

      expect(guideHtml).toContain('content="Guide description" data-qmeta="description"')
      expect(findMetaElements(guideHtml, 'twitter:site')).toHaveLength(1)
      expect(guideHtml).toContain('<main id="route-content">Guide | Docs</main>')
    } finally {
      await rm(testRoot, { force: true, recursive: true })
    }
  })
})
