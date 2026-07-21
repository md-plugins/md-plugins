import { describe, expect, it } from 'vitest'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Teleport, createSSRApp, h } from 'vue'
import {
  createSsgRouteHtml,
  createSsgRoutePayloadScript,
  injectSsgRoutePayload,
  rebaseSsgHtmlAssetUrls,
} from '../src/html'
import { discoverMarkdownSsgRoutes, markdownFileToRoutePath } from '../src/markdownRoutes'
import { resolveSsgOutDirFile } from '../src/outputPaths'
import { prerenderSsgRoutes } from '../src/prerender'
import {
  createSsgRouteManifest,
  defaultSsgAppShellFile,
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
    expect(normalizeSsgBase('')).toBe('./')
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

  it.each([
    ['/../escaped', 'dot segments'],
    ['/guide/./introduction', 'dot segments'],
    ['/guide\\introduction', 'backslashes'],
    ['/guide/<draft>', 'platform-invalid'],
    ['/guide/trailing.', 'platform-invalid'],
    ['/CON', 'platform-invalid'],
  ])('rejects non-portable route path %s', (routePath, expectedError) => {
    expect(() => normalizeSsgRoutePath(routePath)).toThrow(expectedError)
    expect(isStaticSsgRoutePath(routePath)).toBe(false)
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
    expect(() => routePathToHtmlFile('/packages/:name')).toThrow('platform-invalid')
    expect(() => routePathToHtmlFile('/assets/logo.png')).toThrow('static page path')
  })

  it('creates stable route ids', () => {
    expect(routePathToId('/')).toBe('root')
    expect(routePathToId('/getting-started/introduction')).toBe('getting-started-introduction')
  })

  it('normalizes route objects', () => {
    expect(
      normalizeSsgRoute({
        path: '/packages/qcalendar',
        params: { name: 'qcalendar' },
        meta: { source: 'package' },
        data: { packageName: 'QCalendar' },
      }),
    ).toEqual({
      path: '/packages/qcalendar',
      htmlFile: 'packages/qcalendar/index.html',
      id: 'packages-qcalendar',
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

  it.each(['/packages/:name', '/:catchAll(.*)*', '/assets/logo.png'])(
    'rejects non-static explicit route %s',
    (routePath) => {
      expect(() => createSsgRouteManifest([routePath])).toThrow()
    },
  )

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

describe('SSG output paths', () => {
  it('resolves portable files inside outDir', () => {
    const outDir = join(tmpdir(), 'md-plugins-output')

    expect(resolveSsgOutDirFile(outDir, 'guide/index.html')).toBe(join(outDir, 'guide/index.html'))
  })

  it.each(['../escaped.html', 'guide/../../escaped.html', 'bad\\path.html', 'CON.json'])(
    'rejects output file %s',
    (file) => {
      const outDir = join(tmpdir(), 'md-plugins-output')

      expect(() => resolveSsgOutDirFile(outDir, file)).toThrow()
    },
  )
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
  it('emits an immutable app shell before generating the root route', async () => {
    const emittedAssets: Array<{ fileName: string; source: string }> = []
    const warnings: string[] = []
    const manifest = createSsgRouteManifest(['/'])
    const appHtml =
      '<html><head><title>Docs</title></head><body><div id="q-app"></div></body></html>'
    const bundle = {
      'index.html': {
        type: 'asset',
        fileName: 'index.html',
        source: appHtml,
      },
    }
    const plugin = viteSsgPlugin({ routes: ['/'] })
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
    expect(bundle['index.html'].source).not.toBe(appHtml)
    expect(bundle['index.html'].source).toContain('id="md-plugins-ssg-route"')
    expect(emittedAssets).toEqual([
      {
        fileName: 'q-press-ssg-routes.json',
        source: `${JSON.stringify(manifest, null, 2)}\n`,
      },
      {
        fileName: defaultSsgAppShellFile,
        source: appHtml,
      },
    ])
  })

  it('rebases dot-relative shell assets for nested route files', async () => {
    const emittedAssets: Array<{ fileName: string; source: string }> = []
    const appHtml =
      '<html><head><link rel="stylesheet" href="./assets/app.css"><link rel="icon" href=./favicon.ico><script type="module" src=\'./assets/app.js\'></script></head><body><div id="q-app"></div></body></html>'
    const bundle = {
      'index.html': {
        type: 'asset',
        fileName: 'index.html',
        source: appHtml,
      },
    }
    const plugin = viteSsgPlugin({ routes: ['/', '/guide', '/guide/deep'] })
    const pluginHooks = plugin as unknown as TestViteSsgPlugin

    pluginHooks.configResolved({ base: './' })
    await pluginHooks.buildStart()
    await pluginHooks.generateBundle.call(
      {
        emitFile(asset: { type: 'asset'; fileName: string; source: string }) {
          emittedAssets.push({ fileName: asset.fileName, source: asset.source })
        },
        warn() {},
      },
      {},
      bundle,
    )

    expect(bundle['index.html'].source).toContain('href="./assets/app.css"')
    expect(emittedAssets.find((asset) => asset.fileName === 'guide/index.html')?.source).toContain(
      'href="../assets/app.css"',
    )
    expect(
      emittedAssets.find((asset) => asset.fileName === 'guide/deep/index.html')?.source,
    ).toContain("src='../../assets/app.js'")
    expect(
      emittedAssets.find((asset) => asset.fileName === 'guide/deep/index.html')?.source,
    ).toContain('href=../../favicon.ico')
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

  it.each([
    {
      name: 'double-quoted id',
      attributes: 'type="application/json" id="md-plugins-ssg-route"',
    },
    {
      name: 'single-quoted id',
      attributes: "id='md-plugins-ssg-route' type='application/json'",
    },
    {
      name: 'unquoted id',
      attributes: 'data-route id=md-plugins-ssg-route type=application/json',
    },
  ])('replaces a stale route payload with a $name', ({ attributes }) => {
    const route = createSsgRouteManifest(['/guide']).routes[0]
    const stalePayload = `<script ${attributes}>{"path":"/","htmlFile":"index.html"}</script>`
    const html = injectSsgRoutePayload(`<html><head>${stalePayload}</head></html>`, route)

    expect(html).toContain(createSsgRoutePayloadScript(route))
    expect(html).not.toContain('{"path":"/","htmlFile":"index.html"}')
    expect(html.match(/id="md-plugins-ssg-route"/g)).toHaveLength(1)
  })

  it('collapses duplicate stale route payloads into one current payload', () => {
    const route = createSsgRouteManifest(['/guide']).routes[0]
    const stalePayload =
      '<script type="application/json" id="md-plugins-ssg-route">{"path":"/"}</script>'
    const html = injectSsgRoutePayload(
      `<html><head>${stalePayload}${stalePayload}</head></html>`,
      route,
    )

    expect(html.match(/id="md-plugins-ssg-route"/g)).toHaveLength(1)
    expect(html).toContain(createSsgRoutePayloadScript(route))
  })

  it.each([
    'data-id="md-plugins-ssg-route"',
    'id="md-plugins-ssg-route-preview"',
    'data-example=" id=md-plugins-ssg-route "',
  ])('does not replace a script with a lookalike payload attribute: %s', (attribute) => {
    const route = createSsgRouteManifest(['/guide']).routes[0]
    const unrelatedScript = `<script ${attribute}>{"keep":true}</script>`
    const html = injectSsgRoutePayload(`<html><head>${unrelatedScript}</head></html>`, route)

    expect(html).toContain(unrelatedScript)
    expect(html).toContain(createSsgRoutePayloadScript(route))
  })

  it('rebases only dot-relative asset URLs for nested output files', () => {
    const html =
      '<link href="./assets/app.css"><script src=\'./assets/app.js\'>const example = \'<a href="./unchanged">\'</script><video poster=./assets/poster.jpg></video><object data="./assets/file.pdf"></object><svg><use xlink:href="./assets/icons.svg#check"></use></svg><a href="/absolute">Absolute</a><img src="https://example.com/image.png"><a data-href="./unchanged" data-example=\' href="./unchanged"\'>Data</a><!-- <img src="./unchanged"> -->'

    expect(rebaseSsgHtmlAssetUrls(html, 'guide/deep/index.html', './')).toBe(
      '<link href="../../assets/app.css"><script src=\'../../assets/app.js\'>const example = \'<a href="./unchanged">\'</script><video poster=../../assets/poster.jpg></video><object data="../../assets/file.pdf"></object><svg><use xlink:href="../../assets/icons.svg#check"></use></svg><a href="/absolute">Absolute</a><img src="https://example.com/image.png"><a data-href="./unchanged" data-example=\' href="./unchanged"\'>Data</a><!-- <img src="./unchanged"> -->',
    )
    expect(rebaseSsgHtmlAssetUrls(html, 'index.html', './')).toBe(html)
    expect(rebaseSsgHtmlAssetUrls(html, 'guide/index.html', '/docs')).toBe(html)
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

  it('rebases shell and injected CSS assets for nested routes with a dot-relative base', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-relative-assets-'))
    const manifest = createSsgRouteManifest(['/', '/guide', '/guide/deep'], { base: './' })

    await mkdir(join(outDir, 'assets'), { recursive: true })
    await writeFile(join(outDir, 'assets/main.css'), 'body { color: black; }')
    await writeFile(join(outDir, 'assets/route.css'), '.route { color: blue; }')
    await writeFile(
      join(outDir, 'index.html'),
      '<html><head><link rel="stylesheet" href="./assets/main.css"><script type="module" src="./assets/app.js"></script></head><body><div id="q-app"></div></body></html>',
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

    const rootHtml = await readFile(join(outDir, 'index.html'), 'utf8')
    const guideHtml = await readFile(join(outDir, 'guide/index.html'), 'utf8')
    const deepHtml = await readFile(join(outDir, 'guide/deep/index.html'), 'utf8')

    expect(rootHtml).toContain('href="./assets/main.css"')
    expect(rootHtml).toContain('href="./assets/route.css"')
    expect(guideHtml).toContain('href="../assets/main.css"')
    expect(guideHtml).toContain('href="../assets/route.css"')
    expect(guideHtml).toContain('src="../assets/app.js"')
    expect(deepHtml).toContain('href="../../assets/main.css"')
    expect(deepHtml).toContain('href="../../assets/route.css"')
    expect(deepHtml).toContain('src="../../assets/app.js"')
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

  it('preserves an immutable shell across repeated prerender passes', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-ssg-repeat-'))
    const manifest = createSsgRouteManifest(['/', '/guide'])
    const appShell =
      '<html><head><title>Docs</title></head><body><div id="q-app"></div></body></html>'

    await writeFile(join(outDir, 'index.html'), appShell)
    await writeFile(
      join(outDir, 'q-press-ssg-routes.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    )

    const renderRoute = (route: { path: string }, { appHtml }: { appHtml: string }) =>
      appHtml.replace(
        '<div id="q-app"></div>',
        `<div id="q-app"><main>Rendered ${route.path}</main></div>`,
      )

    await prerenderSsgRoutes({ outDir, renderRoute })

    const firstRootHtml = await readFile(join(outDir, 'index.html'), 'utf8')
    const firstGuideHtml = await readFile(join(outDir, 'guide/index.html'), 'utf8')

    expect(firstRootHtml).toContain('<main>Rendered /</main>')
    expect(firstGuideHtml).toContain('<main>Rendered /guide</main>')
    await expect(readFile(join(outDir, defaultSsgAppShellFile), 'utf8')).resolves.toBe(appShell)

    await prerenderSsgRoutes({ outDir, renderRoute })

    await expect(readFile(join(outDir, 'index.html'), 'utf8')).resolves.toBe(firstRootHtml)
    await expect(readFile(join(outDir, 'guide/index.html'), 'utf8')).resolves.toBe(firstGuideHtml)
    await expect(readFile(join(outDir, defaultSsgAppShellFile), 'utf8')).resolves.toBe(appShell)
  })

  it('prevents generated routes from overwriting the immutable app shell', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-ssg-shell-guard-'))
    const manifest = createSsgRouteManifest(['/guide'])
    const appShell = '<html><body><div id="q-app"></div></body></html>'

    await writeFile(join(outDir, 'index.html'), appShell)

    await expect(
      prerenderSsgRoutes({
        outDir,
        manifest,
        reportFile: false,
        renderRoute: (_route, { appHtml }) => appHtml,
        onPageGenerated() {
          return { htmlFile: defaultSsgAppShellFile }
        },
      }),
    ).rejects.toThrow('cannot overwrite the immutable SSG app shell')

    await expect(readFile(join(outDir, defaultSsgAppShellFile), 'utf8')).resolves.toBe(appShell)

    await expect(
      prerenderSsgRoutes({
        outDir,
        appHtmlFile: 'index.html',
        appShellFile: 'index.html',
        manifest,
        reportFile: false,
        renderRoute: (_route, { appHtml }) => appHtml,
      }),
    ).rejects.toThrow('appShellFile must differ from appHtmlFile')
  })

  it('transforms a loaded manifest before route normalization and rendering', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-ssg-transform-manifest-'))
    const manifest = createSsgRouteManifest(['/'])
    let transformCalls = 0

    await writeFile(
      join(outDir, 'index.html'),
      '<html><head></head><body><div id="q-app"></div></body></html>',
    )
    await writeFile(
      join(outDir, 'q-press-ssg-routes.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    )

    const result = await prerenderSsgRoutes({
      outDir,
      reportFile: false,
      transformManifest(loadedManifest) {
        transformCalls += 1

        return createSsgRouteManifest([...loadedManifest.routes, '/guide'], {
          base: loadedManifest.base,
        })
      },
      renderRoute(route, { appHtml }) {
        return appHtml.replace(
          '<div id="q-app"></div>',
          `<div id="q-app"><main>${route.path}</main></div>`,
        )
      },
    })

    expect(transformCalls).toBe(1)
    expect(result.routes.map((route) => route.path)).toEqual(['/', '/guide'])
    await expect(readFile(join(outDir, 'guide/index.html'), 'utf8')).resolves.toContain(
      '<main>/guide</main>',
    )
  })

  it('persists output paths changed by onPageGenerated in the route manifest', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-ssg-page-output-'))
    const manifest = createSsgRouteManifest(['/guide'])

    await writeFile(
      join(outDir, 'index.html'),
      '<html><head></head><body><div id="q-app"></div></body></html>',
    )

    const result = await prerenderSsgRoutes({
      outDir,
      manifest,
      reportFile: false,
      renderRoute: (_route, { appHtml }) => appHtml,
      onPageGenerated() {
        return { htmlFile: 'guide.html' }
      },
    })
    const persistedManifest = JSON.parse(
      await readFile(join(outDir, 'q-press-ssg-routes.json'), 'utf8'),
    )

    expect(result.manifest.routes[0].htmlFile).toBe('guide.html')
    expect(result.routes[0].htmlFile).toBe('guide.html')
    expect(persistedManifest.routes[0].htmlFile).toBe('guide.html')
    await expect(readFile(join(outDir, 'guide.html'), 'utf8')).resolves.toContain(
      'id="md-plugins-ssg-route"',
    )
  })

  it('rejects every generated file path that resolves outside outDir', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-ssg-containment-'))
    const manifest = createSsgRouteManifest(['/guide'])
    const escapedFileName = `${basename(outDir)}-escaped.html`
    const escapedFile = join(outDir, '..', escapedFileName)

    await writeFile(
      join(outDir, 'index.html'),
      '<html><head></head><body><div id="q-app"></div></body></html>',
    )

    const renderRoute = (_route: unknown, { appHtml }: { appHtml: string }) => appHtml

    await expect(
      prerenderSsgRoutes({
        outDir,
        manifest: {
          base: '/',
          routes: [
            {
              path: `/../${escapedFileName}`,
              htmlFile: `../${escapedFileName}`,
              id: 'escaped',
              meta: {},
              params: {},
            },
          ],
        },
        reportFile: false,
        renderRoute,
      }),
    ).rejects.toThrow('dot segments')

    await expect(
      prerenderSsgRoutes({
        outDir,
        manifest,
        reportFile: false,
        renderRoute,
        onPageGenerated() {
          return { htmlFile: `../${escapedFileName}` }
        },
      }),
    ).rejects.toThrow('inside outDir')

    await expect(
      prerenderSsgRoutes({
        outDir,
        manifest,
        reportFile: false,
        renderRoute,
        onPageGenerated() {
          return { filePath: escapedFile }
        },
      }),
    ).rejects.toThrow('inside outDir')

    await expect(
      prerenderSsgRoutes({
        outDir,
        manifest,
        appShellFile: `../${escapedFileName}`,
        reportFile: false,
        renderRoute,
      }),
    ).rejects.toThrow('inside outDir')

    await expect(
      prerenderSsgRoutes({
        outDir,
        manifest,
        manifestFile: `../${escapedFileName}`,
        reportFile: false,
        renderRoute,
      }),
    ).rejects.toThrow('inside outDir')

    await expect(
      prerenderSsgRoutes({
        outDir,
        manifest,
        reportFile: `../${escapedFileName}`,
        renderRoute,
      }),
    ).rejects.toThrow('inside outDir')

    await expect(readFile(escapedFile, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
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

  it('crawls dot-relative links and follows dot-relative redirects safely', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'md-plugins-relative-crawl-'))
    const manifest = createSsgRouteManifest(['/start', '/guide/current', '/redirect/old'])

    await writeFile(
      join(outDir, 'index.html'),
      '<html><head></head><body><div id="q-app"></div></body></html>',
    )

    const result = await prerenderSsgRoutes({
      outDir,
      manifest,
      reportFile: false,
      crawlLinks: true,
      redirects: 'follow',
      renderRoute(route, { appHtml }) {
        if (route.path === '/redirect/old') {
          throw { url: '../new?from=old#content' }
        }

        const links =
          route.path === '/start'
            ? '<a href="./guide?from=start#top">Guide</a>'
            : route.path === '/guide/current'
              ? '<a href="./advanced">Advanced</a><a href="../api">API</a><a href="./assets/app.js">Asset</a><a href="../CON">Invalid</a><a href="..\\escaped">Backslash</a>'
              : ''

        return appHtml.replace(
          '<div id="q-app"></div>',
          `<div id="q-app"><main>${route.path}${links}</main></div>`,
        )
      },
    })

    expect(result.routes.map((route) => route.path)).toEqual(
      expect.arrayContaining(['/guide', '/guide/advanced', '/api', '/new']),
    )
    expect(result.routes.map((route) => route.path)).not.toEqual(
      expect.arrayContaining(['/guide/assets/app.js', '/CON']),
    )
    expect(result.skipped).toContainEqual({
      path: '/redirect/old',
      reason: 'redirected',
      target: '/new',
    })
    await expect(readFile(join(outDir, 'guide/advanced/index.html'), 'utf8')).resolves.toContain(
      '<main>/guide/advanced</main>',
    )
    await expect(readFile(join(outDir, 'api/index.html'), 'utf8')).resolves.toContain(
      '<main>/api</main>',
    )
    await expect(readFile(join(outDir, 'new/index.html'), 'utf8')).resolves.toContain(
      '<main>/new</main>',
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
      appHtml: '<html><head></head><body><div id=q-app></div></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(navigatedTo).toEqual(['/guide', 'ready'])
    expect(html).toContain('<div id=q-app><main>Rendered /guide from /guide</main></div>')
  })

  it('inserts rendered replacement tokens literally', async () => {
    const manifest = createSsgRouteManifest(['/replacement-tokens'])
    const route = manifest.routes[0]
    const renderedAppHtml = `<main>$&|$1|$2|$\`|$'|$$</main>`
    const renderer = createVueSsgRouteRenderer({
      createApp: () => ({ app: {} }),
      renderToString: () => renderedAppHtml,
    })

    const html = await renderer(route, {
      appHtml:
        '<html><body><div class="app" id="q-app"></div><footer>Footer</footer></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(html).toBe(
      `<html><body><div class="app" id="q-app">${renderedAppHtml}</div><footer>Footer</footer></body></html>`,
    )
  })

  it('captures and injects multiple Teleports rendered by Vue', async () => {
    const manifest = createSsgRouteManifest(['/teleports'])
    const route = manifest.routes[0]
    const renderer = createVueSsgRouteRenderer({
      createApp: () =>
        createSSRApp({
          render() {
            return h('main', [
              h('p', 'App content'),
              h(Teleport, { to: '#modals' }, h('div', { class: 'modal' }, 'Modal content')),
              h(Teleport, { to: '#alerts' }, h('strong', 'Alert content')),
            ])
          },
        }),
    })

    const html = await renderer(route, {
      appHtml:
        '<html><body><div id="q-app"></div><div id="modals"></div><aside id=alerts></aside></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(html).toContain(
      '<main><p>App content</p><!--teleport start--><!--teleport end--><!--teleport start--><!--teleport end--></main>',
    )
    expect(html).toContain(
      '<div id="modals"><!--teleport start anchor--><div class="modal">Modal content</div><!--teleport anchor--></div>',
    )
    expect(html).toContain(
      '<aside id=alerts><!--teleport start anchor--><strong>Alert content</strong><!--teleport anchor--></aside>',
    )
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

  it('injects Teleports after a QPress-style custom shell replacement', async () => {
    const manifest = createSsgRouteManifest(['/custom-teleport'])
    const route = manifest.routes[0]
    const renderer = createVueSsgRouteRenderer({
      createApp: () => ({ app: {}, ssrContext: {} }),
      renderToString(_app, ssrContext) {
        if (ssrContext) {
          ssrContext.teleports = {
            '#modals': '<!--teleport start anchor--><div>Modal</div><!--teleport anchor-->',
          }
        }

        return '<main>QPress content</main>'
      },
      replaceAppHtml(appHtml, renderedAppHtml) {
        return appHtml
          .replace('<!--app-->', renderedAppHtml)
          .replace('<head>', '<head><meta name="qpress" content="ssr">')
      },
    })

    const html = await renderer(route, {
      appHtml: '<html><head></head><body><!--app--><div id=modals></div></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(html).toBe(
      '<html><head><meta name="qpress" content="ssr"></head><body><main>QPress content</main><div id=modals><!--teleport start anchor--><div>Modal</div><!--teleport anchor--></div></body></html>',
    )
  })

  it('runs app and framework callbacks before framework-specific shell replacement', async () => {
    const manifest = createSsgRouteManifest(['/callbacks'])
    const route = manifest.routes[0]
    const calls: string[] = []
    const renderer = createVueSsgRouteRenderer({
      createApp: () => ({
        app: {},
        ssrContext: {
          rendered() {
            calls.push('ssr-context')
          },
        },
        onRendered() {
          calls.push('app')
        },
      }),
      renderToString() {
        calls.push('render')
        return '<main>Callbacks</main>'
      },
      replaceAppHtml(appHtml, renderedAppHtml, _route, _context, appResult) {
        calls.push('replace')
        expect(appResult.ssrContext).toBeDefined()

        return appHtml.replace('<div id=q-app></div>', `<div id=q-app>${renderedAppHtml}</div>`)
      },
    })

    await renderer(route, {
      appHtml: '<html><body><div id=q-app></div></body></html>',
      manifest,
      routeIndex: 0,
    })

    expect(calls).toEqual(['render', 'app', 'ssr-context', 'replace'])
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
