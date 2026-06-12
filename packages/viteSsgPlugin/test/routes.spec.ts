import { describe, expect, it } from 'vitest'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSsgRouteHtml } from '../src/html'
import { discoverMarkdownSsgRoutes, markdownFileToRoutePath } from '../src/markdownRoutes'
import { prerenderSsgRoutes } from '../src/prerender'
import {
  createSsgRouteManifest,
  flattenStaticSsgRouterRoutes,
  isSsgRouteExcluded,
  isStaticSsgRoutePath,
  normalizeSsgBase,
  normalizeSsgRoute,
  normalizeSsgRoutePath,
  routePathToHtmlFile,
  routePathToId,
} from '../src/routes'
import { viteSsgPlugin } from '../src/viteSsgPlugin'
import { createVueSsgRouteRenderer, prerenderVueSsgRoutes } from '../src/vueRenderer'

type TestViteSsgPlugin = {
  configResolved(config: { base: string }): void
  buildStart(): Promise<void>
  generateBundle(
    this: {
      emitFile(asset: { type: 'asset'; fileName: string; source: string }): void
      warn(message: string): void
    },
    outputOptions: Record<string, never>,
    bundle: Record<string, unknown>,
  ): Promise<void>
}

describe('SSG route helpers', () => {
  it('normalizes base paths', () => {
    expect(normalizeSsgBase('/')).toBe('/')
    expect(normalizeSsgBase('docs')).toBe('/docs')
    expect(normalizeSsgBase('/docs/')).toBe('/docs')
    expect(normalizeSsgBase('./')).toBe('./')
    expect(normalizeSsgBase('https://docs.example.com/')).toBe('https://docs.example.com')
  })

  it('normalizes route paths', () => {
    expect(normalizeSsgRoutePath('/')).toBe('/')
    expect(normalizeSsgRoutePath('getting-started/introduction')).toBe(
      '/getting-started/introduction',
    )
    expect(normalizeSsgRoutePath('//other//releases/?from=home#top')).toBe('/other/releases')
  })

  it('identifies static route paths', () => {
    expect(isStaticSsgRoutePath('/getting-started')).toBe(true)
    expect(isStaticSsgRoutePath('/packages/:name')).toBe(false)
    expect(isStaticSsgRoutePath('/:catchAll(.*)*')).toBe(false)
    expect(isStaticSsgRoutePath('/assets/logo.png')).toBe(false)
  })

  it('maps route paths to static html files', () => {
    expect(routePathToHtmlFile('/')).toBe('index.html')
    expect(routePathToHtmlFile('/getting-started/introduction')).toBe(
      'getting-started/introduction/index.html',
    )
  })

  it('creates stable route ids', () => {
    expect(routePathToId('/')).toBe('root')
    expect(routePathToId('/getting-started/introduction')).toBe('getting-started-introduction')
  })

  it('normalizes route objects', () => {
    expect(
      normalizeSsgRoute({
        path: '/packages/:name',
        params: { name: 'qcalendar' },
        meta: { source: 'package' },
        data: { packageName: 'QCalendar' },
      }),
    ).toEqual({
      path: '/packages/:name',
      htmlFile: 'packages/:name/index.html',
      id: 'packages-name',
      params: { name: 'qcalendar' },
      meta: { source: 'package' },
      data: { packageName: 'QCalendar' },
    })
  })

  it('creates a route manifest', () => {
    expect(
      createSsgRouteManifest(['/', '/other/releases'], {
        base: '/docs/',
      }),
    ).toEqual({
      base: '/docs',
      routes: [
        {
          path: '/',
          htmlFile: 'index.html',
          id: 'root',
          meta: {},
          params: {},
        },
        {
          path: '/other/releases',
          htmlFile: 'other/releases/index.html',
          id: 'other-releases',
          meta: {},
          params: {},
        },
      ],
    })
  })

  it('excludes route paths from manifests', () => {
    expect(
      createSsgRouteManifest(['/', '/drafts/private', '/admin'], {
        exclude: ['/drafts/private', /^\/admin/],
      }).routes.map((route) => route.path),
    ).toEqual(['/'])

    expect(isSsgRouteExcluded('/admin/users', [/^\/admin/])).toBe(true)
  })

  it('rejects duplicate route paths after normalization', () => {
    expect(() => createSsgRouteManifest(['/other/releases', 'other/releases/'])).toThrow(
      'Duplicate SSG route path: /other/releases',
    )
  })

  it('flattens static Vue Router-style routes', () => {
    expect(
      flattenStaticSsgRouterRoutes(
        [
          {
            path: '/',
            children: [{ path: '' }, { path: 'getting-started' }, { path: 'packages/:name' }],
          },
          { path: '/theme-builder' },
          { path: '/:catchAll(.*)*' },
        ],
        {
          exclude: ['/theme-builder'],
        },
      ),
    ).toEqual(['/', '/getting-started'])
  })
})

describe('Markdown SSG route helpers', () => {
  it('maps markdown files to Q-Press route paths', () => {
    expect(markdownFileToRoutePath('landing-page.md')).toBe('/')
    expect(markdownFileToRoutePath('guides/getting-started.md')).toBe('/guides/getting-started')
    expect(markdownFileToRoutePath('guides/guides.md')).toBe('/guides')
    expect(markdownFileToRoutePath('vite-plugins/index.md')).toBe('/vite-plugins/index')
  })

  it('discovers markdown routes from a folder', () => {
    const root = fileURLToPath(new URL('./fixtures/markdown', import.meta.url))

    expect(
      discoverMarkdownSsgRoutes({
        root,
        exclude: ['drafts/**'],
      }),
    ).toEqual([
      {
        path: '/guides/getting-started',
        meta: {
          source: 'markdown',
          file: 'guides/getting-started.md',
        },
      },
      {
        path: '/guides',
        meta: {
          source: 'markdown',
          file: 'guides/guides.md',
        },
      },
      {
        path: '/',
        meta: {
          source: 'markdown',
          file: 'landing-page.md',
        },
      },
    ])
  })

  it('returns no markdown routes from an empty content folder', async () => {
    const root = await mkdtemp(join(tmpdir(), 'md-plugins-empty-markdown-'))

    expect(discoverMarkdownSsgRoutes({ root })).toEqual([])
  })
})

describe('Vite SSG plugin', () => {
  it('emits an empty manifest without route HTML when no markdown or routes are configured', async () => {
    const emittedAssets: Array<{ fileName: string; source: string }> = []
    const warnings: string[] = []
    const appHtml =
      '<html><head><title>Docs</title></head><body><div id="q-app"></div></body></html>'
    const bundle = {
      'index.html': {
        type: 'asset',
        fileName: 'index.html',
        source: appHtml,
      },
    }
    const plugin = viteSsgPlugin()
    const pluginHooks = plugin as unknown as TestViteSsgPlugin

    pluginHooks.configResolved({
      base: '/',
    })
    await pluginHooks.buildStart()
    await pluginHooks.generateBundle.call(
      {
        emitFile(asset: { type: 'asset'; fileName: string; source: string }) {
          emittedAssets.push({
            fileName: asset.fileName,
            source: asset.source,
          })
        },
        warn(message: string) {
          warnings.push(message)
        },
      },
      {},
      bundle,
    )

    expect(warnings).toEqual([])
    expect(bundle['index.html'].source).toBe(appHtml)
    expect(emittedAssets).toEqual([
      {
        fileName: 'q-press-ssg-routes.json',
        source: `${JSON.stringify({ base: '/', routes: [] }, null, 2)}\n`,
      },
    ])
  })
})

describe('SSG HTML helpers', () => {
  it('injects route payload JSON into the app shell', () => {
    const manifest = createSsgRouteManifest([
      {
        path: '/unsafe',
        data: {
          label: '</script><script>alert("nope")</script>',
        },
      },
    ])
    const route = manifest.routes[0]

    const html = createSsgRouteHtml(route, {
      appHtml: '<html><head><title>Docs</title></head><body><div id="q-app"></div></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(html).toContain('<script type="application/json" id="md-plugins-ssg-route">')
    expect(html).toContain('"path":"/unsafe"')
    expect(html).toContain('\\u003C/script\\u003E')
    expect(html).not.toContain('</script><script>alert')
  })
})

describe('SSG file prerendering', () => {
  it('injects built CSS assets that are missing from the app shell', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-ssg-'))
    const manifest = createSsgRouteManifest(['/'])

    await mkdir(join(outDir, 'assets'), { recursive: true })
    await writeFile(join(outDir, 'assets/main.css'), 'body { color: black; }')
    await writeFile(join(outDir, 'assets/route.css'), '.route { color: blue; }')
    await writeFile(
      join(outDir, 'index.html'),
      '<html><head><link rel="stylesheet" crossorigin href="/assets/main.css"></head><body><div id="q-app"></div></body></html>',
    )
    await writeFile(
      join(outDir, 'q-press-ssg-routes.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    )

    await prerenderSsgRoutes({
      outDir,
      renderRoute(route, { appHtml }) {
        return appHtml.replace(
          '<div id="q-app"></div>',
          `<div id="q-app"><main>${route.path}</main></div>`,
        )
      },
    })

    const html = await readFile(join(outDir, 'index.html'), 'utf8')

    expect(html.match(/href="\/assets\/main\.css"/g)).toHaveLength(1)
    expect(html).toContain('href="/assets/route.css"')
  })

  it('renders route HTML files with a custom async renderer', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-ssg-'))
    const manifest = createSsgRouteManifest(['/', '/guide'])

    await writeFile(
      join(outDir, 'index.html'),
      '<html><head><title>Docs</title></head><body><div id="q-app"></div></body></html>',
    )
    await writeFile(
      join(outDir, 'q-press-ssg-routes.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    )

    const result = await prerenderSsgRoutes({
      outDir,
      async renderRoute(route, { appHtml }) {
        return appHtml.replace(
          '<div id="q-app"></div>',
          `<div id="q-app"><main>Rendered ${route.path}</main></div>`,
        )
      },
      transformHtml(html, route) {
        return html.replace('</head>', `<meta name="ssg-route" content="${route.path}"></head>`)
      },
    })

    await expect(readFile(join(outDir, 'index.html'), 'utf8')).resolves.toContain(
      '<main>Rendered /</main>',
    )
    await expect(readFile(join(outDir, 'guide/index.html'), 'utf8')).resolves.toContain(
      '<main>Rendered /guide</main>',
    )
    await expect(readFile(join(outDir, 'guide/index.html'), 'utf8')).resolves.toContain(
      'id="md-plugins-ssg-route"',
    )
    await expect(readFile(join(outDir, 'guide/index.html'), 'utf8')).resolves.toContain(
      'name="ssg-route" content="/guide"',
    )
    expect(result.routes).toEqual([
      {
        path: '/',
        htmlFile: 'index.html',
        bytes: expect.any(Number),
        milliseconds: expect.any(Number),
      },
      {
        path: '/guide',
        htmlFile: 'guide/index.html',
        bytes: expect.any(Number),
        milliseconds: expect.any(Number),
      },
    ])
  })

  it('supports hooks, route crawling, redirects, skipped 404s, concurrency, and reports', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-ssg-'))
    const manifest = createSsgRouteManifest(['/', '/old-guide', '/missing', '/private'], {
      exclude: ['/private'],
    })
    const renderOrder: string[] = []

    await writeFile(
      join(outDir, 'index.html'),
      '<html><head><title>Docs</title></head><body><div id="q-app"></div></body></html>',
    )
    await writeFile(
      join(outDir, 'q-press-ssg-routes.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    )

    const result = await prerenderSsgRoutes({
      outDir,
      concurrency: 2,
      crawlLinks: true,
      redirects: 'follow',
      notFound: 'skip',
      async renderRoute(route, { appHtml }) {
        renderOrder.push(route.path)

        if (route.path === '/old-guide') {
          throw { url: '/guide/overview' }
        }

        if (route.path === '/missing') {
          throw { code: 404 }
        }

        return appHtml.replace(
          '<div id="q-app"></div>',
          `<div id="q-app"><main>${route.path}<a href="advanced">Advanced</a><a href="https://example.com/nope">External</a></main></div>`,
        )
      },
      onRouteRendered(html, route) {
        return html.replace('</head>', `<meta name="route" content="${route.path}"></head>`)
      },
      onPageGenerated(page) {
        return page.route.path === '/guide/advanced'
          ? {
              html: page.html.replace('Advanced', 'Crawled advanced'),
            }
          : undefined
      },
    })

    expect(renderOrder).toContain('/')
    expect(renderOrder).toContain('/old-guide')
    expect(renderOrder).toContain('/guide/overview')
    expect(renderOrder).toContain('/guide/advanced')
    expect(result.routes.map((route) => route.path)).toContain('/guide/advanced')
    expect(result.skipped).toEqual([
      {
        path: '/old-guide',
        reason: 'redirected',
        target: '/guide/overview',
      },
      {
        path: '/missing',
        reason: 'not-found',
      },
    ])
    await expect(readFile(join(outDir, 'guide/advanced/index.html'), 'utf8')).resolves.toContain(
      'Crawled advanced',
    )
    await expect(readFile(join(outDir, 'q-press-ssg-report.json'), 'utf8')).resolves.toContain(
      '"routeCount"',
    )
  })
})

describe('Vue SSG renderer adapter', () => {
  it('renders a Vue app factory result into the app shell after router navigation', async () => {
    const manifest = createSsgRouteManifest(['/guide'])
    const route = manifest.routes[0]
    const navigatedTo: unknown[] = []
    const renderer = createVueSsgRouteRenderer({
      createApp(currentRoute) {
        return {
          app: {
            routePath: currentRoute.path,
          },
          router: {
            push(location: unknown) {
              navigatedTo.push(location)
            },
            async isReady() {
              navigatedTo.push('ready')
            },
          },
          ssrContext: {
            routePath: currentRoute.path,
          },
        }
      },
      renderToString(app, ssrContext) {
        const renderedApp = app as { routePath: string }

        return `<main>Rendered ${renderedApp.routePath} from ${ssrContext?.routePath}</main>`
      },
    })

    const html = await renderer(route, {
      appHtml: '<html><head></head><body><div id="q-app"></div></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(navigatedTo).toEqual(['/guide', 'ready'])
    expect(html).toContain('<div id="q-app"><main>Rendered /guide from /guide</main></div>')
  })

  it('supports custom shell replacement and rendered fragment transforms', async () => {
    const manifest = createSsgRouteManifest(['/custom'])
    const route = manifest.routes[0]
    const renderer = createVueSsgRouteRenderer({
      createApp: () => ({ app: { name: 'docs' } }),
      renderToString: () => '<main>Docs</main>',
      transformRenderedAppHtml(renderedAppHtml) {
        return `<div data-rendered="true">${renderedAppHtml}</div>`
      },
      replaceAppHtml(appHtml, renderedAppHtml) {
        return appHtml.replace('<!--app-->', renderedAppHtml)
      },
    })

    const html = await renderer(route, {
      appHtml: '<html><body><!--app--></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(html).toContain('<div data-rendered="true"><main>Docs</main></div>')
  })

  it('falls back to router.replace when push is unavailable', async () => {
    const manifest = createSsgRouteManifest(['/replace-only'])
    const route = manifest.routes[0]
    const navigatedTo: unknown[] = []
    const renderer = createVueSsgRouteRenderer({
      createApp: () => ({
        app: {},
        router: {
          replace(location: unknown) {
            navigatedTo.push(location)
          },
        },
      }),
      renderToString: () => '<main>Replace only</main>',
    })

    await renderer(route, {
      appHtml: '<html><body><div id="q-app"></div></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(navigatedTo).toEqual(['/replace-only'])
  })

  it('prerenders Vue-rendered route HTML files after a build', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-vue-ssg-'))
    const manifest = createSsgRouteManifest(['/', '/guide'])

    await writeFile(
      join(outDir, 'index.html'),
      '<html><head></head><body><div id="q-app"></div></body></html>',
    )
    await writeFile(
      join(outDir, 'q-press-ssg-routes.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    )

    const result = await prerenderVueSsgRoutes({
      outDir,
      createApp(route) {
        return {
          app: {
            routePath: route.path,
          },
        }
      },
      renderToString(app) {
        const renderedApp = app as { routePath: string }

        return `<main>Vue rendered ${renderedApp.routePath}</main>`
      },
    })

    await expect(readFile(join(outDir, 'index.html'), 'utf8')).resolves.toContain(
      '<main>Vue rendered /</main>',
    )
    await expect(readFile(join(outDir, 'guide/index.html'), 'utf8')).resolves.toContain(
      '<main>Vue rendered /guide</main>',
    )
    await expect(readFile(join(outDir, 'guide/index.html'), 'utf8')).resolves.toContain(
      'id="md-plugins-ssg-route"',
    )
    expect(result.routes).toHaveLength(2)
  })
})
