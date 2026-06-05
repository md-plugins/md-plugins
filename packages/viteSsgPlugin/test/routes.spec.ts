import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import { createSsgRouteHtml } from '../src/html'
import { discoverMarkdownSsgRoutes, markdownFileToRoutePath } from '../src/markdownRoutes'
import {
  createSsgRouteManifest,
  normalizeSsgBase,
  normalizeSsgRoute,
  normalizeSsgRoutePath,
  routePathToHtmlFile,
  routePathToId,
} from '../src/routes'

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

  it('rejects duplicate route paths after normalization', () => {
    expect(() => createSsgRouteManifest(['/other/releases', 'other/releases/'])).toThrow(
      'Duplicate SSG route path: /other/releases',
    )
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
