# Markdown Plugins Monorepo (md-plugins)

<p align="center">
<a href="https://github.com/md-plugins/md-plugins">
  <img src="https://raw.githubusercontent.com/md-plugins/md-plugins/refs/heads/main/media/markdown-1024x1024.png" alt="md-plugins - Markdown-it, Vite, and Quasar documentation tooling" width="300" style="border-radius: 50%;">
</a>
<br>
A collection of Markdown-it plugins, Vite plugins, and Quasar app extensions for Vue/Vite content workflows, static docs output, and Q-Press documentation sites.
</p>

<p><strong>Markdown-it! Plugins</strong></p>

![@md-plugins/md-plugin-blockquote](https://img.shields.io/npm/v/@md-plugins/md-plugin-blockquote?label=@md-plugins/md-plugin-blockquote)
![@md-plugins/md-plugin-codeblocks](https://img.shields.io/npm/v/@md-plugins/md-plugin-codeblocks?label=@md-plugins/md-plugin-codeblocks)
![@md-plugins/md-plugin-containers](https://img.shields.io/npm/v/@md-plugins/md-plugin-containers?label=@md-plugins/md-plugin-containers)
![@md-plugins/md-plugin-frontmatter](https://img.shields.io/npm/v/@md-plugins/md-plugin-frontmatter?label=@md-plugins/md-plugin-frontmatter)
![@md-plugins/md-plugin-headers](https://img.shields.io/npm/v/@md-plugins/md-plugin-headers?label=@md-plugins/md-plugin-headers)
![@md-plugins/md-plugin-image](https://img.shields.io/npm/v/@md-plugins/md-plugin-image?label=@md-plugins/md-plugin-image)
![@md-plugins/md-plugin-imports](https://img.shields.io/npm/v/@md-plugins/md-plugin-imports?label=@md-plugins/md-plugin-imports)
![@md-plugins/md-plugin-inlinecode](https://img.shields.io/npm/v/@md-plugins/md-plugin-inlinecode?label=@md-plugins/md-plugin-inlinecode)
![@md-plugins/md-plugin-link](https://img.shields.io/npm/v/@md-plugins/md-plugin-link?label=@md-plugins/md-plugin-link)
![@md-plugins/md-plugin-mermaid](https://img.shields.io/npm/v/@md-plugins/md-plugin-mermaid?label=@md-plugins/md-plugin-mermaid)
![@md-plugins/md-plugin-steps](https://img.shields.io/npm/v/@md-plugins/md-plugin-steps?label=@md-plugins/md-plugin-steps)
![@md-plugins/md-plugin-table](https://img.shields.io/npm/v/@md-plugins/md-plugin-table?label=@md-plugins/md-plugin-table)
![@md-plugins/md-plugin-title](https://img.shields.io/npm/v/@md-plugins/md-plugin-title?label=@md-plugins/md-plugin-title)
![@md-plugins/shared](https://img.shields.io/npm/v/@md-plugins/shared?label=@md-plugins/shared)

<p><strong>Vite Plugins</strong></p>

![@md-plugins/vite-md-plugin](https://img.shields.io/npm/v/@md-plugins/vite-md-plugin?label=@md-plugins/vite-md-plugin)
![@md-plugins/vite-examples-plugin](https://img.shields.io/npm/v/@md-plugins/vite-examples-plugin?label=@md-plugins/vite-examples-plugin)
![@md-plugins/vite-ssg-plugin](https://img.shields.io/npm/v/@md-plugins/vite-ssg-plugin?label=@md-plugins/vite-ssg-plugin)
![@md-plugins/vite-search-plugin](https://img.shields.io/npm/v/@md-plugins/vite-search-plugin?label=@md-plugins/vite-search-plugin)

<p><strong>Search UI</strong></p>

![@md-plugins/search-ui](https://img.shields.io/npm/v/@md-plugins/search-ui?label=@md-plugins/search-ui)

<p><strong>Quasar App Extensions</strong></p>

![@md-plugins/quasar-app-extension-vite-md-plugin](https://img.shields.io/npm/v/@md-plugins/quasar-app-extension-vite-md-plugin?label=@md-plugins/quasar-app-extension-vite-md-plugin)
![@md-plugins/quasar-app-extension-q-press](https://img.shields.io/npm/v/@md-plugins/quasar-app-extension-q-press?label=@md-plugins/quasar-app-extension-q-press)

---

[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/md-plugins/md-plugins)]()
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/md-plugins/md-plugins)]()
[![Netlify Status](https://api.netlify.com/api/v1/badges/850bdc62-254a-464f-98cd-90e823f257d2/deploy-status)](https://app.netlify.com/projects/md-plugins/deploys)

[![npm](https://img.shields.io/npm/dt/@md-plugins/quasar-app-extension-q-press)](https://www.npmjs.com/package/@md-plugins/quasar-app-extension-q-press)
![@md-plugins/quasar-app-extension-q-press](https://img.shields.io/npm/dm/@md-plugins/quasar-app-extension-q-press)

<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A collection of **Markdown-It plugins** and utilities designed for enhanced Markdown processing. This monorepo contains various plugins for handling specific Markdown features.

A collection of **Vite plugins** for transforming Markdown into Vue Single File Components (SFCs), handling raw example source, generating static documentation output, and producing search indexes.

A collection of **App Extensions** for Quasar Framework, providing enhanced Markdown support for Quasar applications, including **Q-Press**. The **Q-Press** App Extension is a powerful tool for Quasar developers that simplifies the integration of Markdown content into Quasar applications. It leverages the capabilities of Vite and various Markdown plugins to transform Markdown files into Vue components, enabling a seamless and efficient workflow for content management. Q-Press also uses the SSG and search Vite plugins to generate route manifests, static HTML output, and static-host-friendly search indexes for documentation sites.

Inspired by [Quasar Framework](https://quasar.dev) documentation and [mdit-vue](https://github.com/mdit-vue/mdit-vue), this project aims to provide a comprehensive set of tools for working with Markdown content.

## Overview

This monorepo provides:

- Plugins to enhance Markdown rendering with features like blockquotes, inline code, tables, headers, and more.
- A Vite plugin for seamless integration of Markdown into Vue projects.
- A Vite plugin for handling raw SFC content.
- A Vite SSG plugin for route manifests, static HTML shells, and optional prerendered output.
- A Vite search plugin for static JSON, Meilisearch-ready, Algolia-ready, and custom search index output.
- A framework-agnostic `<md-search>` Web Component for searchable docs UI.
- Shared utilities for common processing tasks.

## Table of Contents

- [Current Release](#current-release)
- [Structure](#structure)
- [Plugins](#plugins)
- [Installation](#installation)
- [Development](#development)
- [License](#license)

## Current Release

The current release-candidate line in this repository is `0.1.0-rc.10`. Packages in this line publish to npm under the `latest` dist-tag while Quasar app-vite is in its release-candidate window.

The `0.1.0` release-candidate line supports direct Markdown-it and Vite plugin usage in Vue/Vite projects, including Markdown transforms, live example source loading, optional SSG route output, static search index generation, and a framework-agnostic search UI. The Quasar app extensions in this repo target Quasar Vite projects using `@quasar/app-vite` `>=3.0.0-rc.3`. Repository development and CI use Node.js `>=22.13` and `pnpm@11.8.0`.

```bash
pnpm add @md-plugins/vite-md-plugin
pnpm add @md-plugins/md-plugin-steps
pnpm add @md-plugins/vite-ssg-plugin
pnpm add @md-plugins/search-ui
pnpm add -D @md-plugins/vite-search-plugin
pnpm add @md-plugins/quasar-app-extension-q-press

bun add @md-plugins/vite-md-plugin
bun add @md-plugins/md-plugin-steps
bun add @md-plugins/vite-ssg-plugin
bun add @md-plugins/search-ui
bun add -d @md-plugins/vite-search-plugin
bun add @md-plugins/quasar-app-extension-q-press
```

## Structure

This is a pnpm workspace mono-repo. You cannot use npm for building.

- [/md-plugin-\*](packages) - standalone Markdown-it plugin packages
- [/vite-md-plugin](packages/viteMdPlugin) - Vite Markdown-to-Vue SFC plugin
- [/vite-examples-plugin](packages/viteExamplesPlugin) - Vite examples/source loader plugin
- [/vite-ssg-plugin](packages/viteSsgPlugin) - Vite SSG route manifest and prerender plugin
- [/vite-search-plugin](packages/viteSearchPlugin) - Vite Markdown search index plugin with adapter output
- [/search-ui](packages/searchUi) - framework-agnostic search UI Web Component
- [/q-press](packages/qPress) - Quasar app extension for Q-Press documentation sites
- [/docs](packages/docs) - Q-Press documentation site with docs, demos, and examples
- [live demo](https://md-plugins.netlify.app/) - **live Q-Press docs, demos, and examples**

## Plugins

| Plugin                                            | Description                                                                                                          | Readme                                             |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `@md-plugins/md-plugin-imports`                   | Extracts and processes `<script import>` blocks from Markdown.                                                       | [README](packages/md-plugin-imports/README.md)     |
| `@md-plugins/md-plugin-codeblocks`                | Enhances code block rendering with syntax highlighting, tabs, and more.                                              | [README](packages/md-plugin-codeblocks/README.md)  |
| `@md-plugins/md-plugin-blockquote`                | Adds customizable CSS classes to blockquotes.                                                                        | [README](packages/md-plugin-blockquote/README.md)  |
| `@md-plugins/md-plugin-headers`                   | Extracts and processes headers for generating ToCs or managing headers.                                              | [README](packages/md-plugin-headers/README.md)     |
| `@md-plugins/md-plugin-inlinecode`                | Adds a custom class to inline code blocks for styling.                                                               | [README](packages/md-plugin-inlinecode/README.md)  |
| `@md-plugins/md-plugin-link`                      | Converts Markdown links into Vue components for SPA-friendly routing.                                                | [README](packages/md-plugin-link/README.md)        |
| `@md-plugins/md-plugin-mermaid`                   | Renders Mermaid fenced code blocks as diagrams.                                                                      | [README](packages/md-plugin-mermaid/README.md)     |
| `@md-plugins/md-plugin-steps`                     | Renders wizard-like numbered steps for tutorials, migrations, and install flows.                                     | [README](packages/md-plugin-steps/README.md)       |
| `@md-plugins/md-plugin-table`                     | Adds custom classes and attributes to Markdown tables.                                                               | [README](packages/md-plugin-table/README.md)       |
| `@md-plugins/md-plugin-title`                     | Extracts the first header in Markdown as the page title.                                                             | [README](packages/md-plugin-title/README.md)       |
| `@md-plugins/md-plugin-frontmatter`               | Extracts and processes frontmatter content from Markdown files.                                                      | [README](packages/md-plugin-frontmatter/README.md) |
| `@md-plugins/md-plugin-containers`                | Adds custom containers for callouts, warnings, and more.                                                             | [README](packages/md-plugin-containers/README.md)  |
| `@md-plugins/shared`                              | Shared utilities and types for the plugins.                                                                          | [README](packages/shared/README.md)                |
| `@md-plugins/vite-md-plugin`                      | Vite plugin for transforming Markdown into Vue SFCs.                                                                 | [README](packages/viteMdPlugin/README.md)          |
| `@md-plugins/vite-examples-plugin`                | Vite plugin for loading and transforming example components and their raw source code for usage in your application. | [README](packages/viteExamplesPlugin/README.md)    |
| `@md-plugins/vite-ssg-plugin`                     | Vite plugin for generating route manifests, static HTML shells, and optional prerendered SSG output.                 | [README](packages/viteSsgPlugin/README.md)         |
| `@md-plugins/vite-search-plugin`                  | Vite plugin for generating static JSON, Meilisearch-ready, Algolia-ready, or custom search index output.             | [README](packages/viteSearchPlugin/README.md)      |
| `@md-plugins/search-ui`                           | Framework-agnostic search UI Web Component for static JSON and custom search providers.                              | [README](packages/searchUi/README.md)              |
| `@md-plugins/quasar-app-extension-vite-md-plugin` | Quasar app extension for enhanced Markdown support in Quasar Applications.                                           | [README](packages/viteMdPluginAppExt/README.md)    |
| `@md-plugins/quasar-app-extension-q-press`        | Markdown documentation tooling for Quasar and Vite applications.                                                     | [README](packages/qPress/README.md)                |

## Installation

Clone the repository and use `pnpm` to install dependencies:

```bash
git clone https://github.com/md-plugins/md-plugins.git
cd md-plugins
pnpm install
```

This repository is currently developed with Node.js `>=22.13`, CI runs on Node.js 24, and local tooling uses `pnpm@11.8.0`.

## Development

### Building Packages

Build all packages and the SSG documentation output in the monorepo:

```bash
pnpm build
```

### Q-Press Template Notes

Q-Press generated files have a source-of-truth flow that is easy to miss. The package build script at `packages/qPress/scripts/build.js` copies `packages/docs/src/.q-press` into both Q-Press template folders:

- `packages/qPress/src/templates/init/src/_q-press`
- `packages/qPress/src/templates/update/src/_q-press`

When fixing generated Q-Press components, update `packages/docs/src/.q-press` first, then run `pnpm --filter @md-plugins/quasar-app-extension-q-press build` or `pnpm build:packages` so the init and update templates are regenerated from the same source. If only one template copy is edited, the next Q-Press build can overwrite the change.

### Running Tests

Each package includes unit tests. To run all tests across the monorepo:

```bash
pnpm test
```

### Linting

Ensure code quality across all packages:

```bash
pnpm lint
```

## Contributing

We welcome contributions! Please open an issue or submit a pull request with your proposed changes.

## Support

If md-plugins is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
