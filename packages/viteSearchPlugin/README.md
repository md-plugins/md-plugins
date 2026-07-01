# @md-plugins/vite-search-plugin

[![npm version](https://img.shields.io/npm/v/@md-plugins/vite-search-plugin?label=%40md-plugins%2Fvite-search-plugin)](https://www.npmjs.com/package/@md-plugins/vite-search-plugin)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/vite-search-plugin)](https://www.npmjs.com/package/@md-plugins/vite-search-plugin)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/vite-search-plugin)](https://www.npmjs.com/package/@md-plugins/vite-search-plugin)
[![license](https://img.shields.io/npm/l/@md-plugins/vite-search-plugin)](https://www.npmjs.com/package/@md-plugins/vite-search-plugin)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A Vite plugin that generates search index data for Markdown and Q-Press documentation sites. It is the build-time half of the md-plugins search story; pair it with `@md-plugins/search-ui` for the static in-browser search UI.

The plugin is intentionally adapter-based: it produces normalized records once, then emits one or
more output formats that can be consumed by static search clients, hosted search services, or a
custom upload step.

## Why

Documentation sites often need search, but not every site needs the same runtime model.

- Static hosts such as Netlify can serve generated JSON assets without a search server.
- Meilisearch and Algolia can use generated upload-ready records when a hosted search backend is
  preferred.
- Custom adapters can transform the same source records into project-specific assets.

## Install

```bash
pnpm add -D @md-plugins/vite-search-plugin
```

## Basic Usage

```ts
import { defineConfig } from 'vite'
import { viteSearchPlugin } from '@md-plugins/vite-search-plugin'

export default defineConfig({
  plugins: [
    viteSearchPlugin({
      markdown: {
        root: './src/markdown',
      },
    }),
  ],
})
```

By default, the plugin emits:

```txt
search/search-index.json
```

That JSON file can be fetched by a client-side search component on a static host.

## Multiple Outputs

```ts
import {
  createAlgoliaAdapter,
  createMeilisearchAdapter,
  viteSearchPlugin,
} from '@md-plugins/vite-search-plugin'

viteSearchPlugin({
  markdown: {
    root: './src/markdown',
  },
  adapters: [
    'json',
    createMeilisearchAdapter({
      indexUid: 'docs',
      fileName: 'search/meilisearch.json',
    }),
    createAlgoliaAdapter({
      fileName: 'search/algolia.json',
    }),
  ],
})
```

The Meilisearch and Algolia adapters emit upload-ready JSON. They do not contact those services
directly, so API keys stay out of the browser and out of the Vite build unless a project chooses to
add a separate deploy step.

## Custom Adapter

```ts
import { viteSearchPlugin, type SearchAdapter } from '@md-plugins/vite-search-plugin'

const customAdapter: SearchAdapter = {
  name: 'custom-search',
  transform(records) {
    return {
      fileName: 'search/custom-records.json',
      source: JSON.stringify(
        records.map((record) => record.url),
        null,
        2,
      ),
    }
  },
}

viteSearchPlugin({
  markdown: {
    root: './src/markdown',
  },
  adapters: [customAdapter],
})
```

## Virtual Module

Application code can also import the generated index:

```ts
import searchIndex, { searchRecords } from 'virtual:md-plugins/search-index'
```

## Frontmatter

Pages can opt out of indexing:

```md
---
title: Private Draft
search: false
---
```

The plugin reads these fields by default:

- `title` for page titles
- `desc` or `description` for page summaries
- `tags`, `keys`, or `keywords` for tags/search keywords
- `badge` and `overline` as copied metadata

## Q-Press Routes

Markdown file paths use the same route convention as Q-Press SSG:

- `landing-page.md` becomes `/`
- `guide/getting-started.md` becomes `/guide/getting-started`
- `guide/guide.md` becomes `/guide`

Use `routeBase` when the Markdown files should live under a route prefix:

```ts
viteSearchPlugin({
  markdown: {
    root: './src/markdown',
    routeBase: '/docs',
  },
})
```
