import { describe, expect, it } from 'vitest'
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createAlgoliaAdapter,
  createMeilisearchAdapter,
  createSearchIndex,
  createSearchUrl,
  markdownFileToSearchRoutePath,
  viteSearchPlugin,
} from '../src'

type TestViteSearchPlugin = {
  configResolved(config: { base: string }): void
  buildStart(): Promise<void>
  load(id: string): Promise<string | undefined>
  resolveId(id: string): string | undefined
  generateBundle(this: {
    emitFile(asset: { type: 'asset'; fileName: string; source: string | Uint8Array }): void
  }): Promise<void>
}

async function createMarkdownFixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'md-plugins-search-'))

  await mkdir(join(root, 'guide'), { recursive: true })
  await mkdir(join(root, 'drafts'), { recursive: true })

  await writeFile(
    join(root, 'landing-page.md'),
    `---
title: Home
desc: Welcome to the docs.
tags:
  - start
  - docs
---

# Getting Started

This page introduces the docs.

## Install

Run the install command.
`,
  )

  await writeFile(
    join(root, 'guide', 'advanced.md'),
    `---
title: Advanced Guide
keys: adapters search
overline: Guide
---

# Advanced

Adapter output can target hosted search.
`,
  )

  await writeFile(
    join(root, 'drafts', 'private.md'),
    `---
title: Private
search: false
---

# Hidden

This should not be indexed.
`,
  )

  return root
}

describe('search route helpers', () => {
  it('maps markdown files to Q-Press style route paths', () => {
    expect(markdownFileToSearchRoutePath('landing-page.md')).toBe('/')
    expect(markdownFileToSearchRoutePath('guide/getting-started.md')).toBe('/guide/getting-started')
    expect(markdownFileToSearchRoutePath('guide/guide.md')).toBe('/guide')
  })

  it('joins absolute URL bases without damaging protocol separators', () => {
    expect(createSearchUrl('https://docs.example.com/base/', '/guide', '/intro')).toBe(
      'https://docs.example.com/base/guide/intro',
    )
  })
})

describe('search index generation', () => {
  it('creates normalized records from markdown files', async () => {
    const root = await createMarkdownFixture()
    const index = await createSearchIndex({
      base: '/docs/',
      markdown: {
        root,
      },
    })

    expect(index.records.some((record) => record.title === 'Private')).toBe(false)
    expect(index.recordCount).toBe(index.records.length)
    expect(index.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'page',
          title: 'Home',
          content: 'Welcome to the docs.',
          url: '/docs',
          tags: ['start', 'docs'],
        }),
        expect.objectContaining({
          type: 'heading',
          title: 'Home',
          content: 'Install',
          url: '/docs#install',
          hierarchy: ['Getting Started', 'Install'],
        }),
        expect.objectContaining({
          type: 'content',
          title: 'Advanced Guide',
          content: 'Adapter output can target hosted search.',
          url: '/docs/guide/advanced#advanced',
          tags: ['adapters', 'search'],
          meta: {
            overline: 'Guide',
          },
        }),
      ]),
    )
  })

  it('supports route prefixes', async () => {
    const root = await createMarkdownFixture()
    const index = await createSearchIndex({
      markdown: {
        root,
        routeBase: '/content',
      },
    })

    expect(
      index.records.find((record) => record.type === 'page' && record.title === 'Home')?.url,
    ).toBe('/content')
  })
})

describe('viteSearchPlugin', () => {
  it('emits configured adapter outputs', async () => {
    const root = await createMarkdownFixture()
    const emittedAssets: Array<{ fileName: string; source: string | Uint8Array }> = []
    const plugin = viteSearchPlugin({
      markdown: {
        root,
      },
      adapters: ['json', createMeilisearchAdapter({ indexUid: 'docs' }), createAlgoliaAdapter()],
    })
    const pluginHooks = plugin as unknown as TestViteSearchPlugin

    pluginHooks.configResolved({
      base: '/',
    })

    await pluginHooks.buildStart()

    expect(pluginHooks.resolveId('virtual:md-plugins/search-index')).toBe(
      '\0virtual:md-plugins/search-index',
    )

    const virtualModule = await pluginHooks.load('\0virtual:md-plugins/search-index')
    expect(virtualModule).toContain('export const searchIndex')

    await pluginHooks.generateBundle.call({
      emitFile(asset) {
        emittedAssets.push(asset)
      },
    })

    expect(emittedAssets.map((asset) => asset.fileName).sort()).toEqual([
      'search/algolia.json',
      'search/meilisearch.json',
      'search/search-index.json',
    ])

    const meilisearchAsset = emittedAssets.find(
      (asset) => asset.fileName === 'search/meilisearch.json',
    )
    const meilisearchPayload = JSON.parse(String(meilisearchAsset?.source))

    expect(meilisearchPayload).toEqual(
      expect.objectContaining({
        indexUid: 'docs',
        primaryKey: 'id',
      }),
    )
    expect(meilisearchPayload.documents.length).toBeGreaterThan(0)
  })

  it('supports custom adapters', async () => {
    const root = await createMarkdownFixture()
    const emittedAssets: Array<{ fileName: string; source: string | Uint8Array }> = []
    const plugin = viteSearchPlugin({
      markdown: {
        root,
      },
      adapters: [
        {
          name: 'urls',
          transform(records) {
            return {
              fileName: 'search/urls.json',
              source: JSON.stringify(records.map((record) => record.url)),
            }
          },
        },
      ],
    })
    const pluginHooks = plugin as unknown as TestViteSearchPlugin

    pluginHooks.configResolved({
      base: '/',
    })
    await pluginHooks.buildStart()
    await pluginHooks.generateBundle.call({
      emitFile(asset) {
        emittedAssets.push(asset)
      },
    })

    const urls = JSON.parse(String(emittedAssets[0]?.source))
    expect(urls).toContain('/')
    expect(emittedAssets[0]?.fileName).toBe('search/urls.json')
  })

  it('can consume the generated static JSON from disk', async () => {
    const root = await createMarkdownFixture()
    const index = await createSearchIndex({
      markdown: {
        root,
      },
    })
    const outFile = join(root, 'search-index.json')

    await writeFile(outFile, JSON.stringify(index, null, 2))

    const consumed = JSON.parse(await readFile(outFile, 'utf8'))
    expect(consumed.records.length).toBe(index.records.length)
  })
})
