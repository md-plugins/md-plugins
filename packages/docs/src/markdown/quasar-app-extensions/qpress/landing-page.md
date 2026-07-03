---
title: Customizing The Landing Page
desc: Replace or tune the Q-Press home page without fighting the generated docs shell.
related:
  - quasar-app-extensions/qpress/quick-start
  - quasar-app-extensions/qpress/overview
  - quasar-app-extensions/qpress/themes
scope:
  landingTree:
    l: src
    c:
      - l: markdown
        c:
          - l: landing-page.md
      - l: components
        c:
          - l: LandingHero.vue
          - l: LandingFeatureGrid.vue
      - l: css
        c:
          - l: app.scss
          - l: quasar.variables.scss
      - l: public
        e: Optional static images, favicons, or downloadable assets.
---

The Q-Press landing page is the route mounted at `/`. It is intentionally project-owned, so you can make it a product home page, docs portal, package overview, or a quiet index page without editing generated `src/.q-press` files.

## Route File

Create or edit:

```txt
src/markdown/landing-page.md
```

Q-Press treats `landing-page.md` as the site root:

```txt
src/markdown/landing-page.md
  -> /
```

Use `meta.fullscreen` when the page should own the full viewport instead of using the standard article width, table of contents, or page footer.

```yaml
---
title: My Docs
desc: Documentation and examples for my package.
meta:
  fullscreen: true
---
```

## Recommended Structure

Keep the route in Markdown, but move complex layout into Vue components:

<MarkdownTree :def="scope.landingTree" />

This gives content authors an obvious page entry point while keeping responsive layout, animation, images, and stateful behavior in Vue files where they are easier to maintain.

```md
---
title: My Docs
desc: Documentation and examples for my package.
meta:
  fullscreen: true
---

<LandingHero />
<LandingFeatureGrid />
```

## Content Choices

| Use Markdown for                            | Use Vue components for                                    |
| ------------------------------------------- | --------------------------------------------------------- |
| Page metadata, headings, short prose, links | Hero layout, responsive grids, custom cards, rich visuals |
| Simple callouts or code snippets            | Interactive demos, animation, state, or computed content  |
| `MarkdownCardLink` groups                   | Branded sections that need custom spacing or imagery      |

Avoid editing generated layout files for landing-page changes. Keep the page in `src/markdown`, reusable sections in `src/components`, and route-specific styles in project-owned CSS or component-scoped styles.

## Navigation Links

Because the landing page route is `/`, link to it directly from Site Config:

```ts
const gettingStartedMenu = {
  name: 'Getting Started',
  children: [
    { name: 'Home', path: '/' },
    { name: 'Introduction', path: '/getting-started/introduction' },
  ],
}
```

Do not add `landing-page` to visible URLs. The filename is only the source convention.

## Theme And Assets

Landing pages often use the same theme tokens as the rest of Q-Press:

- use `src/css/quasar.variables.scss` for brand colors and bundled Q-Press theme imports
- use runtime `--qpress-*` variables when a local section needs token-aware styling
- store project assets in `src/assets` when they are imported by Vue, or `public` when they should be copied as static files
- keep hero images real, inspectable, and responsive

See [Themes](/quasar-app-extensions/qpress/themes) for the generated tokens used by Q-Press surfaces and landing-page atmosphere.

## Checks

Run the Q-Press checker after changing landing-page routes or links:

```bash
pnpm check:qpress
```

The checker validates Markdown routes, related links, navigation paths, and common Q-Press authoring mistakes. It also helps catch stale links when a landing page is renamed, moved, or replaced.
