import { describe, expect, it } from 'vitest'
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
