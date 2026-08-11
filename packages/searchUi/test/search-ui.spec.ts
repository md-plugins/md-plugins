// @vitest-environment happy-dom
/// <reference lib="dom" />

import { describe, expect, it } from 'vitest'
import {
  createJsonSearchProvider,
  createStaticSearchProvider,
  searchRecords,
} from '../src/providers'
import { createSearchSnippet } from '../src/text'
import { defineMdSearchElement, type MdSearchElement } from '../src/element'
import type { SearchIndex, SearchRecord } from '../src/types'

const records: SearchRecord[] = [
  {
    id: 'intro-page',
    type: 'page',
    title: 'Introduction',
    content: 'Welcome to the docs.',
    url: '/getting-started/introduction',
    path: '/getting-started/introduction',
    hierarchy: [],
    tags: ['getting-started'],
    source: {
      file: '/docs/introduction.md',
      relativeFile: 'introduction.md',
    },
  },
  {
    id: 'search-heading',
    type: 'heading',
    title: 'Vite Search Plugin',
    section: 'Static Search',
    content: 'Static Search',
    url: '/vite-plugins/vite-search-plugin/overview#static-search',
    path: '/vite-plugins/vite-search-plugin/overview',
    anchor: 'static-search',
    hierarchy: ['Vite Search Plugin', 'Static Search'],
    tags: ['search', 'vite'],
    source: {
      file: '/docs/search.md',
      relativeFile: 'search.md',
    },
  },
  {
    id: 'search-content',
    type: 'content',
    title: 'Vite Search Plugin',
    section: 'Hosted Search Output',
    content: 'Generate Meilisearch and Algolia upload payloads from the same records.',
    url: '/vite-plugins/vite-search-plugin/overview#hosted-search-output',
    path: '/vite-plugins/vite-search-plugin/overview',
    anchor: 'hosted-search-output',
    hierarchy: ['Vite Search Plugin', 'Hosted Search Output'],
    tags: ['algolia', 'meilisearch'],
    source: {
      file: '/docs/search.md',
      relativeFile: 'search.md',
    },
  },
]

const duplicateRecords: SearchRecord[] = [
  {
    id: 'ssg-heading',
    type: 'heading',
    title: 'How SSG Works',
    section: 'How SSG Works',
    content: 'How SSG Works',
    url: '/vite-plugins/vite-ssg-plugin/overview#how-ssg-works',
    path: '/vite-plugins/vite-ssg-plugin/overview',
    anchor: 'how-ssg-works',
    hierarchy: ['Vite SSG Plugin', 'How SSG Works'],
    tags: ['ssg'],
    source: {
      file: '/docs/vite-ssg.md',
      relativeFile: 'vite-ssg.md',
    },
  },
  {
    id: 'ssg-content',
    type: 'content',
    title: 'Vite SSG Plugin',
    section: 'How SSG Works',
    content:
      'SSG produces static files that can be deployed to static hosts and served without a runtime server.',
    url: '/vite-plugins/vite-ssg-plugin/overview#how-ssg-works',
    path: '/vite-plugins/vite-ssg-plugin/overview',
    anchor: 'how-ssg-works',
    hierarchy: ['Vite SSG Plugin', 'How SSG Works'],
    tags: ['ssg'],
    source: {
      file: '/docs/vite-ssg.md',
      relativeFile: 'vite-ssg.md',
    },
  },
]

describe('search-ui providers', () => {
  it('scores title and section matches before content matches', () => {
    const results = searchRecords(records, 'static search')

    expect(results[0]?.id).toBe('search-heading')
    expect(results[0]?.section).toBe('Static Search')
  })

  it('requires every query term to match a record', () => {
    const results = searchRecords(records, 'algolia upload')

    expect(results).toHaveLength(1)
    expect(results[0]?.id).toBe('search-content')
  })

  it('collapses heading and content records that point to the same URL by default', () => {
    const results = searchRecords(duplicateRecords, 'how ssg')

    expect(results).toHaveLength(1)
    expect(results[0]?.id).toBe('ssg-content')
  })

  it('can show duplicate records when requested', () => {
    const results = searchRecords(duplicateRecords, 'how ssg', {
      collapseDuplicateResults: false,
    })

    expect(results.map((result) => result.id)).toEqual(['ssg-heading', 'ssg-content'])
  })

  it('creates a static provider from records', async () => {
    const provider = createStaticSearchProvider(records)
    const results = await Promise.resolve(provider.search('introduction'))

    expect(results).toMatchObject([
      {
        id: 'intro-page',
      },
    ])
  })

  it('loads a JSON search index through a fetcher once', async () => {
    const index: SearchIndex = {
      generatedAt: '2026-06-18T00:00:00.000Z',
      recordCount: records.length,
      records,
    }
    let callCount = 0
    const provider = createJsonSearchProvider({
      src: '/search/search-index.json',
      fetcher: async () => {
        callCount++
        return new Response(JSON.stringify(index))
      },
    })

    await provider.search('vite')
    await provider.search('meilisearch')

    expect(callCount).toBe(1)
  })

  it('reports a helpful error when the index response is not JSON', async () => {
    const provider = createJsonSearchProvider({
      src: '/search/search-index.json',
      fetcher: async () =>
        new Response('<!DOCTYPE html><html><body>SPA fallback</body></html>', {
          headers: {
            'content-type': 'text/html',
          },
        }),
    })

    await expect(provider.search('vite')).rejects.toThrow(
      'Unable to parse search index JSON from /search/search-index.json',
    )
  })

  it('creates readable snippets from markdown-like content', () => {
    expect(
      createSearchSnippet(
        'The `containers` plugin supports **custom containers** and [links](https://example.com).',
        ['containers'],
        120,
      ),
    ).toBe('The containers plugin supports custom containers and links.')
  })
})

describe('search-ui accessibility', () => {
  it('keeps modal focus contained and restores it when closed', () => {
    const previousButton = document.createElement('button')
    defineMdSearchElement('md-search-test')
    const search = document.createElement('md-search-test') as MdSearchElement
    document.body.append(previousButton, search)
    previousButton.focus()

    search.open()

    const input = search.shadowRoot?.querySelector<HTMLInputElement>('[part="input"]')
    const closeButton = search.shadowRoot?.querySelector<HTMLButtonElement>('[part="close-button"]')

    expect(input?.hasAttribute('aria-controls')).toBe(false)

    input?.focus()
    input?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }))
    expect(search.shadowRoot?.activeElement).toBe(closeButton)

    closeButton?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    expect(document.activeElement).toBe(previousButton)

    search.remove()
    previousButton.remove()
  })
})
