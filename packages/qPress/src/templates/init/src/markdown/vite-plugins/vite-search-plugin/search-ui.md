---
title: Vite Search Plugin Search UI
desc: Add the framework-agnostic md-plugins search component to static JSON, Meilisearch, Algolia, or custom search providers.
related:
  - vite-plugins/vite-search-plugin/overview
  - vite-plugins/vite-search-plugin/advanced
  - quasar-app-extensions/qpress/overview
---

The `@md-plugins/search-ui` package provides a small front-end search component for search indexes
created by `@md-plugins/vite-search-plugin`.

It is intentionally framework-agnostic. The default UI is a Web Component, so it can be used from
plain HTML, Vue, Quasar, React, Svelte, Astro, or any other framework that can render a custom
element.

## Install

```tabs
<<| bash [icon=pnpm] pnpm |>>
pnpm add @md-plugins/search-ui
<<| bash [icon=bun] bun |>>
bun add @md-plugins/search-ui
<<| bash [icon=yarn] yarn |>>
yarn add @md-plugins/search-ui
<<| bash [icon=npm] npm |>>
npm install @md-plugins/search-ui
```

## Static JSON Search

Register the custom element once in your app:

```ts
import { defineMdSearchElement } from '@md-plugins/search-ui'

defineMdSearchElement()
```

Then render the component and point it at the generated JSON file:

```html
<md-search src="/search/search-index.json"></md-search>
```

The component loads the JSON once, searches locally in the browser, and opens matching results.
This works on Netlify, GitHub Pages, Cloudflare Pages, and other static hosts without a server.

## Duplicate Results

Generated indexes can include both a `heading` record and a nearby `content` record for the same
URL. The UI collapses those duplicates by default so users see the useful content snippet instead
of two nearly identical rows.

Use `show-duplicate-results` when you want to inspect the raw records:

```html
<md-search src="/search/search-index.json" show-duplicate-results></md-search>
```

Custom providers receive the same preference through `options.collapseDuplicateResults`.

## Q-Press Integration

Q-Press wires this up for generated docs sites:

- `@md-plugins/vite-search-plugin` emits `search/search-index.json` during the Vite build.
- `@md-plugins/search-ui` powers the header search control.
- The generated `MarkdownSearch.vue` wrapper handles Vue Router navigation for selected results.
- The component inherits Q-Press theme variables so light and dark themes can style it.

If you are maintaining generated Q-Press files manually, make sure your docs app installs both
packages and includes `viteSearchPlugin()` in the Vite plugin list.

## Customizing The Look

The Web Component supports light and dark modes. By default it follows `prefers-color-scheme`. Use
the `theme` attribute when your application owns the active theme:

```html
<md-search src="/search/search-index.json" theme="dark"></md-search>
```

Use `theme="light"` to force light mode. Site CSS variables can still override either theme.

The Web Component uses Shadow DOM, CSS custom properties, and `part` attributes. Start with CSS
variables for broad theme alignment:

```css
md-search {
  --md-search-accent: #1976d2;
  --md-search-trigger-bg: #f3f7ff;
  --md-search-trigger-border: #aac5f7;
  --md-search-trigger-color: #102033;
  --md-search-surface: white;
  --md-search-surface-raised: #f7f9fc;
  --md-search-text: #102033;
  --md-search-muted: #637083;
  --md-search-border: #d8e0ee;
  --md-search-radius: 16px;
}
```

Use `part` selectors for targeted overrides:

```css
md-search::part(dialog) {
  box-shadow: 0 24px 80px rgb(0 0 0 / 24%);
}

md-search::part(result) {
  border-radius: 12px;
}
```

The most useful parts are:

- `trigger`: the visible search button.
- `trigger-icon`: the search icon inside the trigger.
- `trigger-label`: the search label inside the trigger.
- `keyboard-shortcut`: the shortcut hint inside the trigger.
- `backdrop`: the modal backdrop.
- `dialog`: the search panel.
- `input`: the search field.
- `list`: the results list.
- `result`: each result row.
- `result-title`: the title area inside a result.
- `result-snippet`: the result excerpt.

## Accessibility

The default UI includes keyboard and screen-reader support:

- `Ctrl+K` / `Cmd+K` opens search by default.
- `Escape` closes the dialog.
- `ArrowUp` and `ArrowDown` move through results.
- `Enter` selects the active result.
- The panel uses `role="dialog"` and `aria-modal`.
- The input exposes combobox/listbox relationships through ARIA attributes.
- Result rows use `role="option"` and update the active descendant.

Use `search-label` to provide a project-specific input label:

```html
<md-search src="/search/search-index.json" search-label="Search product documentation"></md-search>
```

## Programmatic Mounting

Framework wrappers can mount the component without placing a custom element directly in a template:

```ts
import { createSearch } from '@md-plugins/search-ui'

createSearch({
  target: document.querySelector('#search')!,
  src: '/search/search-index.json',
  placeholder: 'Search docs...',
  triggerLabel: 'Search docs',
  panelTitle: 'Search documentation',
})
```

## Custom Providers

The default component can also use a custom provider. This is the adapter seam for Algolia,
Meilisearch, a serverless search endpoint, or another search service:

```ts
import { createSearch } from '@md-plugins/search-ui'

createSearch({
  target: document.querySelector('#search')!,
  provider: {
    async search(query, options) {
      const response = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({
          q: query,
          limit: options?.limit,
          collapseDuplicateResults: options?.collapseDuplicateResults,
        }),
      })

      return response.json()
    },
  },
})
```

Custom providers should return normalized `SearchResult[]` objects. This keeps the UI independent
from the search service.
