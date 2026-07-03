---
title: Q-Press Search
desc: Configure and validate the generated Q-Press static search experience.
related:
  - vite-plugins/vite-search-plugin/overview
  - vite-plugins/vite-search-plugin/search-ui
  - quasar-app-extensions/qpress/cli
---

Q-Press installs `@md-plugins/vite-search-plugin` and `@md-plugins/search-ui` so docs sites get a static search index without running a server-side search service.

## How Search Works

During a production build, the Vite search plugin scans Markdown content and emits:

```txt
search/search-index.json
```

The generated Q-Press shell renders that index through `MarkdownSearch.vue`, which wraps the framework-agnostic `<md-search>` component from `@md-plugins/search-ui`.

## What Gets Indexed

Search records are built from Markdown routes and page content. The search index is meant for docs pages, headings, body text, and enough route metadata to send users to the right page.

API JSON, generated route metadata, and custom Vue pages can be connected to search as separate follow-up work, but the normal Q-Press workflow starts with Markdown content.

## Configuration

Most Q-Press projects use the generated search wiring. Use the lower-level [viteSearchPlugin](/vite-plugins/vite-search-plugin/overview) docs when you need custom records, adapters, ranking experiments, or a standalone Vue/Vite search flow outside Q-Press.

## Validation

Run Q-Press checks before release:

```bash
pnpm check:qpress
```

The checker validates route links and page metadata before the search index is generated, which catches many search-quality problems early.

## When To Customize

Customize search only after the default index is not enough. Good reasons include:

- large docs sites that need split indexes
- product docs that need package or version facets
- generated API docs that need richer search records
- route groups that should be excluded from search
- custom ranking or snippet rules

Keep the default search path for small and medium docs sites. It stays static-host friendly and requires no server infrastructure.
