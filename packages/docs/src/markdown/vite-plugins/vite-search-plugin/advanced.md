---
title: Vite Search Plugin Advanced Topics
desc: Advanced adapter, frontmatter, virtual module, and deployment guidance for the Vite Search Plugin.
related:
  - vite-plugins/vite-search-plugin/overview
  - vite-plugins/vite-search-plugin/search-ui
  - vite-plugins/vite-ssg-plugin/advanced
  - quasar-app-extensions/qpress/ssg
---

The Vite Search Plugin is split into small pieces: Markdown discovery, normalized records, adapter
output, and a virtual module. Projects can use the default behavior or build their own pipeline on
top of the same records.

## Type Information

```ts
import type { Plugin, ResolvedConfig } from 'vite'

type MaybePromise<T> = T | Promise<T>

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

type SearchRecordType = 'page' | 'heading' | 'content'

interface SearchRecordSource {
  file: string
  relativeFile: string
}

interface SearchRecord {
  id: string
  type: SearchRecordType
  title: string
  content: string
  url: string
  path: string
  anchor?: string
  section?: string
  hierarchy: string[]
  tags: string[]
  source: SearchRecordSource
  meta?: Record<string, JsonValue>
}

interface SearchIndex {
  generatedAt: string
  recordCount: number
  records: SearchRecord[]
}

interface SearchFrontmatterOptions {
  titleFields?: string[]
  descriptionFields?: string[]
  tagFields?: string[]
  searchField?: string
  metaFields?: string[]
}

interface MarkdownSearchOptions {
  root: string
  include?: string | string[]
  exclude?: string | string[]
  landingPage?: string
  routeBase?: string
  frontmatter?: SearchFrontmatterOptions
  headingRecords?: boolean
  contentRecords?: boolean
  minContentLength?: number
}

interface CreateSearchIndexOptions {
  markdown?: MarkdownSearchOptions | MarkdownSearchOptions[]
  base?: string
}

interface SearchAdapterOutput {
  fileName: string
  source: string | Uint8Array
}

interface SearchAdapterContext {
  config?: ResolvedConfig
  index: SearchIndex
  options: ViteSearchPluginOptions
}

interface SearchAdapter {
  name: string
  transform: (
    records: SearchRecord[],
    context: SearchAdapterContext,
  ) => MaybePromise<SearchAdapterOutput | SearchAdapterOutput[] | void>
}

type SearchAdapterName = 'json' | 'meilisearch' | 'algolia'
type SearchAdapterInput = SearchAdapterName | SearchAdapter

interface JsonSearchAdapterOptions {
  fileName?: string
  pretty?: boolean
  recordsOnly?: boolean
}

interface MeilisearchAdapterOptions {
  fileName?: string
  pretty?: boolean
  indexUid?: string
  primaryKey?: string
}

interface AlgoliaAdapterOptions {
  fileName?: string
  pretty?: boolean
}

interface ViteSearchPluginOptions extends CreateSearchIndexOptions {
  enabled?: boolean
  virtualModuleId?: string
  adapters?: SearchAdapterInput[]
}

declare function viteSearchPlugin(options?: ViteSearchPluginOptions): Plugin
declare function createSearchIndex(options?: CreateSearchIndexOptions): Promise<SearchIndex>
declare function createJsonSearchAdapter(options?: JsonSearchAdapterOptions): SearchAdapter
declare function createMeilisearchAdapter(options?: MeilisearchAdapterOptions): SearchAdapter
declare function createAlgoliaAdapter(options?: AlgoliaAdapterOptions): SearchAdapter
```

## Normalized Records

The plugin emits three record types:

- `page`: one record per indexed page, usually using frontmatter `desc` as content.
- `heading`: one record per heading, useful for jumping directly to a section.
- `content`: text grouped under the current heading.

Each record includes both a route path and a URL:

```json
{
  "id": "guide-install-heading-2",
  "type": "heading",
  "title": "Installation",
  "content": "Configure Vite",
  "url": "/guide/install#configure-vite",
  "path": "/guide/install",
  "anchor": "configure-vite",
  "section": "Configure Vite",
  "hierarchy": ["Installation", "Configure Vite"],
  "tags": ["vite", "install"],
  "source": {
    "file": "/absolute/path/src/markdown/guide/install.md",
    "relativeFile": "guide/install.md"
  }
}
```

The adapter layer receives these records and can reshape them without reparsing Markdown.

## Multiple Markdown Roots

Use multiple roots when a docs site combines product docs, package docs, and generated pages:

```ts
viteSearchPlugin({
  markdown: [
    {
      root: './src/markdown',
    },
    {
      root: './src/packages',
      routeBase: '/packages',
      exclude: ['drafts/**'],
    },
  ],
})
```

Each Markdown source can have its own include/exclude rules, route base, frontmatter fields, and
record controls.

## Frontmatter Controls

Projects can customize which frontmatter fields are used:

```ts
viteSearchPlugin({
  markdown: {
    root: './src/markdown',
    frontmatter: {
      titleFields: ['title', 'heading'],
      descriptionFields: ['desc', 'description', 'summary'],
      tagFields: ['tags', 'keys', 'keywords', 'topics'],
      searchField: 'indexed',
      metaFields: ['badge', 'overline', 'packageName'],
    },
  },
})
```

With that configuration, a page can opt out with `indexed: false` instead of `search: false`.

## Record Granularity

Disable heading or content records when a project wants a smaller index:

```ts
viteSearchPlugin({
  markdown: {
    root: './src/markdown',
    headingRecords: false,
    minContentLength: 24,
  },
})
```

Use `contentRecords: false` when a project only needs page and heading matches.

## Static JSON Adapter

The default adapter emits the complete index:

```ts
import { createJsonSearchAdapter, viteSearchPlugin } from '@md-plugins/vite-search-plugin'

viteSearchPlugin({
  markdown: {
    root: './src/markdown',
  },
  adapters: [
    createJsonSearchAdapter({
      fileName: 'search/search-index.json',
      pretty: true,
    }),
  ],
})
```

Set `recordsOnly: true` if a consuming search library expects an array:

```ts
createJsonSearchAdapter({
  fileName: 'search/records.json',
  recordsOnly: true,
})
```

## Meilisearch Adapter

The Meilisearch adapter emits upload-ready documents:

```ts
import { createMeilisearchAdapter } from '@md-plugins/vite-search-plugin'

createMeilisearchAdapter({
  indexUid: 'docs',
  primaryKey: 'id',
  fileName: 'search/meilisearch.json',
})
```

The generated file can be uploaded from CI or a Netlify build hook with an admin key. The browser
should only receive a search-only key.

```ts
import { readFile } from 'node:fs/promises'

const payload = JSON.parse(await readFile('dist/search/meilisearch.json', 'utf8'))

await fetch(`${process.env.MEILI_HOST}/indexes/${payload.indexUid}/documents`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.MEILI_ADMIN_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload.documents),
})
```

## Algolia Adapter

The Algolia adapter emits records with `objectID`, `url`, `content`, and a DocSearch-like
`hierarchy` object:

```ts
import { createAlgoliaAdapter } from '@md-plugins/vite-search-plugin'

createAlgoliaAdapter({
  fileName: 'search/algolia.json',
})
```

Upload should happen in a trusted deploy step:

```ts
import { readFile } from 'node:fs/promises'
import algoliasearch from 'algoliasearch'

const records = JSON.parse(await readFile('dist/search/algolia.json', 'utf8'))
const client = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_KEY!)
const index = client.initIndex('docs')

await index.replaceAllObjects(records)
```

## Custom Adapters

Adapters are intentionally small. They receive normalized records and return one or more emitted
assets:

```ts
import { viteSearchPlugin, type SearchAdapter } from '@md-plugins/vite-search-plugin'

const sitemapSearchAdapter: SearchAdapter = {
  name: 'sitemap-search',
  transform(records) {
    const urls = records.filter((record) => record.type === 'page').map((record) => record.url)

    return {
      fileName: 'search/page-urls.json',
      source: JSON.stringify(urls, null, 2),
    }
  },
}

viteSearchPlugin({
  markdown: {
    root: './src/markdown',
  },
  adapters: [sitemapSearchAdapter],
})
```

A custom adapter is also the right place to produce Pagefind input, a FlexSearch document list, a
serverless-function payload, or private search metadata.

## Virtual Module

The virtual module can be customized:

```ts
viteSearchPlugin({
  markdown: {
    root: './src/markdown',
  },
  virtualModuleId: 'virtual:docs/search',
})
```

Then import it from application code:

```ts
import searchIndex, { searchRecords } from 'virtual:docs/search'
```

For large documentation sites, prefer the emitted JSON asset so the search payload can be cached and
loaded only when the user opens search.

## Static Hosting Versus Search Servers

Static JSON output does not need a server. The generated asset is served with the rest of the built
site, so it works on Netlify, GitHub Pages, Cloudflare Pages, and similar hosts.

Meilisearch and Algolia output still require a hosted search service at runtime. The plugin only
creates the upload data. That keeps md-plugins provider-neutral and keeps service credentials in a
trusted CI or deploy environment.
