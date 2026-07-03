---
title: Q-Press Quick Start
desc: Build a working Q-Press documentation site in a few steps.
related:
  - quasar-app-extensions/qpress/installation
  - quasar-app-extensions/qpress/site-config
  - quasar-app-extensions/qpress/landing-page
  - quasar-app-extensions/qpress/markdown-features
---

Use this page when you want the short path. See [Installation](/quasar-app-extensions/qpress/installation) when you need the full wiring details.

## Install

Start from an existing Quasar Vite app:

```bash
quasar ext add @md-plugins/q-press
```

Then invoke the extension if you are upgrading or refreshing generated files:

```bash
quasar ext invoke @md-plugins/q-press
```

Q-Press creates a docs shell, starter Markdown pages, example folders, and a project-owned `src/siteConfig` file.

## Add A Page

Create a Markdown file under `src/markdown`:

```txt
src/markdown/getting-started/hello.md
```

The generated route is:

```txt
/getting-started/hello
```

Add the page to `src/siteConfig/index.ts` if it should appear in the visible navigation.

## Add A Live Example

Create a Vue example:

```txt
src/examples/HelloDocs/Basic.vue
```

Set the Markdown page frontmatter:

```yaml
---
title: Hello Docs
desc: A small Q-Press page with one live example.
examples: HelloDocs
---
```

Render the example:

```md
<MarkdownExample title="Basic" file="Basic" />
```

## Configure The Shell

Edit `src/siteConfig/index.ts` for:

- title and description
- public docs URL
- header and sidebar navigation
- footer, social, sponsor, and legal links
- CodePen dependencies for examples
- optional announcements, campaigns, and privacy consent

See [Site Config](/quasar-app-extensions/qpress/site-config) and [Navigation](/quasar-app-extensions/qpress/navigation) for the focused references.

## Customize The Landing Page

Edit `src/markdown/landing-page.md` when you want to change the home page at `/`. Keep the route entry in Markdown, then move larger hero sections, feature grids, or interactive blocks into project-owned Vue components.

Use `meta.fullscreen: true` when the landing page should own the full layout instead of using the normal article shell.

See [Customizing The Landing Page](/quasar-app-extensions/qpress/landing-page) for the route convention, recommended folder structure, and theme guidance.

## Choose A Theme

Import one Q-Press theme in `src/css/quasar.variables.scss`:

```scss
@import '../.q-press/css/themes/sunrise.scss';
```

Then import the generated Q-Press app styles in `src/css/app.scss`:

```scss
@import '../.q-press/css/app.scss';
```

See [Themes](/quasar-app-extensions/qpress/themes) for bundled themes, runtime tokens, and custom theme variables.

## Check And Build

Run the docs-specific checker before release:

```bash
pnpm check:qpress
```

Build the docs as a normal SPA:

```bash
pnpm build
```

Build route-specific static HTML when you want static-host-friendly SSG output:

```bash
pnpm build:ssg
```
