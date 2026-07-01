# md-plugins Docs

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

This package contains the Q-Press documentation site for the md-plugins monorepo. It is both the public docs site and the source of truth for generated Q-Press shell files that downstream Quasar docs sites receive.

The site demonstrates the Markdown-it plugins, Vite Markdown pipeline, examples plugin, SSG helpers, static search output, Q-Press layouts, generated API pages, route validation, and the `@md-plugins/search-ui` custom element.

## Development

From the repository root:

```bash
pnpm install
pnpm --filter mdplugins_docs dev
```

## Build

Build the SPA docs output:

```bash
pnpm --filter mdplugins_docs build
```

Build and prerender the static Q-Press output:

```bash
pnpm --filter mdplugins_docs build:ssg
```

Both builds emit `search/search-index.json`, which is consumed by the generated `MarkdownSearch.vue` wrapper and the `<md-search>` custom element.

## Generated Q-Press Files

The docs app is the source of truth for generated Q-Press shell files under `src/.q-press`. The Q-Press package build copies those files into both template folders:

- `packages/qPress/src/templates/init/src/_q-press`
- `packages/qPress/src/templates/update/src/_q-press`

When fixing generated Q-Press behavior, edit `packages/docs/src/.q-press` first and rebuild Q-Press so the init and update templates stay aligned.

## Checks

Useful docs checks:

```bash
pnpm --filter mdplugins_docs check:qpress
pnpm --filter mdplugins_docs check-types
pnpm --filter mdplugins_docs format:check
pnpm --filter mdplugins_docs lint
```
