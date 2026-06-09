# Markdown Plugins Monorepo (md-plugins)

<p align="center">
<a href="https://github.com/md-plugins/md-plugins">
  <img src="https://raw.githubusercontent.com/md-plugins/md-plugins/refs/heads/main/media/markdown-1024x1024.png" alt="md-plugins - Markdown-it, Vite, and Quasar documentation tooling" width="300" style="border-radius: 50%;">
</a>
<br>
A collection of Markdown-it plugins, Vite plugins, and Quasar app extensions for Vue/Vite content workflows, static docs output, and Q-Press documentation sites.
</p>

<p><strong>Markdown-it! Plugins</strong></p>

![@md-plugins/md-plugin-blockquote](https://img.shields.io/npm/v/@md-plugins/md-plugin-blockquote/beta?label=@md-plugins/md-plugin-blockquote@beta)
![@md-plugins/md-plugin-codeblocks](https://img.shields.io/npm/v/@md-plugins/md-plugin-codeblocks/beta?label=@md-plugins/md-plugin-codeblocks@beta)
![@md-plugins/md-plugin-containers](https://img.shields.io/npm/v/@md-plugins/md-plugin-containers/beta?label=@md-plugins/md-plugin-containers@beta)
![@md-plugins/md-plugin-frontmatter](https://img.shields.io/npm/v/@md-plugins/md-plugin-frontmatter/beta?label=@md-plugins/md-plugin-frontmatter@beta)
![@md-plugins/md-plugin-headers](https://img.shields.io/npm/v/@md-plugins/md-plugin-headers/beta?label=@md-plugins/md-plugin-headers@beta)
![@md-plugins/md-plugin-image](https://img.shields.io/npm/v/@md-plugins/md-plugin-image/beta?label=@md-plugins/md-plugin-image@beta)
![@md-plugins/md-plugin-imports](https://img.shields.io/npm/v/@md-plugins/md-plugin-imports/beta?label=@md-plugins/md-plugin-imports@beta)
![@md-plugins/md-plugin-inlinecode](https://img.shields.io/npm/v/@md-plugins/md-plugin-inlinecode/beta?label=@md-plugins/md-plugin-inlinecode@beta)
![@md-plugins/md-plugin-link](https://img.shields.io/npm/v/@md-plugins/md-plugin-link/beta?label=@md-plugins/md-plugin-link@beta)
![@md-plugins/md-plugin-mermaid](https://img.shields.io/npm/v/@md-plugins/md-plugin-mermaid/beta?label=@md-plugins/md-plugin-mermaid@beta)
![@md-plugins/md-plugin-table](https://img.shields.io/npm/v/@md-plugins/md-plugin-table/beta?label=@md-plugins/md-plugin-table@beta)
![@md-plugins/md-plugin-title](https://img.shields.io/npm/v/@md-plugins/md-plugin-title/beta?label=@md-plugins/md-plugin-title@beta)
![@md-plugins/shared](https://img.shields.io/npm/v/@md-plugins/shared/beta?label=@md-plugins/shared@beta)

<p><strong>Vite Plugins</strong></p>

![@md-plugins/vite-md-plugin](https://img.shields.io/npm/v/@md-plugins/vite-md-plugin/beta?label=@md-plugins/vite-md-plugin@beta)
![@md-plugins/vite-examples-plugin](https://img.shields.io/npm/v/@md-plugins/vite-examples-plugin/beta?label=@md-plugins/vite-examples-plugin@beta)
![@md-plugins/vite-ssg-plugin](https://img.shields.io/npm/v/@md-plugins/vite-ssg-plugin/beta?label=@md-plugins/vite-ssg-plugin@beta)

<p><strong>Quasar App Extensions</strong></p>

![@md-plugins/quasar-app-extension-vite-md-plugin](https://img.shields.io/npm/v/@md-plugins/quasar-app-extension-vite-md-plugin/beta?label=@md-plugins/quasar-app-extension-vite-md-plugin@beta)
![@md-plugins/quasar-app-extension-q-press](https://img.shields.io/npm/v/@md-plugins/quasar-app-extension-q-press/beta?label=@md-plugins/quasar-app-extension-q-press@beta)

[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/md-plugins/md-plugins)]()
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/md-plugins/md-plugins)]()
[![Netlify Status](https://api.netlify.com/api/v1/badges/850bdc62-254a-464f-98cd-90e823f257d2/deploy-status)](https://app.netlify.com/projects/md-plugins/deploys)

[![npm](https://img.shields.io/npm/dt/@md-plugins/quasar-app-extension-q-press)](https://www.npmjs.com/package/@md-plugins/quasar-app-extension-q-press)
![@md-plugins/quasar-app-extension-q-press](https://img.shields.io/npm/dm/@md-plugins/quasar-app-extension-q-press)

<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A collection of **Markdown-It plugins** and utilities designed for enhanced Markdown processing. This monorepo contains various plugins for handling specific Markdown features.

A collection of **Vite plugins** for transforming Markdown into Vue Single File Components (SFCs), handling raw example source, and generating static documentation output.

A collection of **App Extensions** for Quasar Framework, providing enhanced Markdown support for Quasar applications, including **Q-Press**. The **Q-Press** App Extension is a powerful tool for Quasar developers that simplifies the integration of Markdown content into Quasar applications. It leverages the capabilities of Vite and various Markdown plugins to transform Markdown files into Vue components, enabling a seamless and efficient workflow for content management. Q-Press also uses the SSG Vite plugin to generate route manifests and static HTML output for documentation sites that need static-host-friendly pages.

Inspired by [Quasar Framework](https://quasar.dev) documentation and [mdit-vue](https://github.com/mdit-vue/mdit-vue), this project aims to provide a comprehensive set of tools for working with Markdown content.

## Overview

This monorepo provides:

- Plugins to enhance Markdown rendering with features like blockquotes, inline code, tables, headers, and more.
- A Vite plugin for seamless integration of Markdown into Vue projects.
- A Vite plugin for handling raw SFC content.
- A Vite SSG plugin for route manifests, static HTML shells, and optional prerendered output.
- Shared utilities for common processing tasks.

## Table of Contents

- [Current Release](#current-release)
- [Plugins](#plugins)
- [Installation](#installation)
- [Development](#development)
- [License](#license)

## Current Release

The current beta line in this repository is `0.1.0-beta.25`. Packages in this line publish to npm under the `beta` dist-tag, while the npm `latest` dist-tag still points at the previous `0.1.0-alpha.29` packages.

The `0.1.0` beta line supports direct Markdown-it and Vite plugin usage in Vue/Vite projects, including Markdown transforms, live example source loading, and optional SSG route output. The Quasar app extensions in this repo target Quasar Vite projects using `@quasar/app-vite` `>=3.0.0-beta.43`. Repository development and CI use Node.js `>=22.13` and `pnpm@11.5.1`.

```bash
pnpm add @md-plugins/vite-md-plugin@beta
pnpm add @md-plugins/vite-ssg-plugin@beta
pnpm add @md-plugins/quasar-app-extension-q-press@beta

bun add @md-plugins/vite-md-plugin@beta
bun add @md-plugins/vite-ssg-plugin@beta
bun add @md-plugins/quasar-app-extension-q-press@beta
```

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
| `@md-plugins/md-plugin-table`                     | Adds custom classes and attributes to Markdown tables.                                                               | [README](packages/md-plugin-table/README.md)       |
| `@md-plugins/md-plugin-title`                     | Extracts the first header in Markdown as the page title.                                                             | [README](packages/md-plugin-title/README.md)       |
| `@md-plugins/md-plugin-frontmatter`               | Extracts and processes frontmatter content from Markdown files.                                                      | [README](packages/md-plugin-frontmatter/README.md) |
| `@md-plugins/md-plugin-containers`                | Adds custom containers for callouts, warnings, and more.                                                             | [README](packages/md-plugin-containers/README.md)  |
| `@md-plugins/shared`                              | Shared utilities and types for the plugins.                                                                          | [README](packages/shared/README.md)                |
| `@md-plugins/vite-md-plugin`                      | Vite plugin for transforming Markdown into Vue SFCs.                                                                 | [README](packages/viteMdPlugin/README.md)          |
| `@md-plugins/vite-examples-plugin`                | Vite plugin for loading and transforming example components and their raw source code for usage in your application. | [README](packages/viteExamplesPlugin/README.md)    |
| `@md-plugins/vite-ssg-plugin`                     | Vite plugin for generating route manifests, static HTML shells, and optional prerendered SSG output.                 | [README](packages/viteSsgPlugin/README.md)         |
| `@md-plugins/quasar-app-extension-vite-md-plugin` | Quasar app extension for enhanced Markdown support in Quasar Applications.                                           | [README](packages/viteMdPluginAppExt/README.md)    |
| `@md-plugins/quasar-app-extension-q-press`        | Markdown documentation tooling for Quasar and Vite applications.                                                     | [README](packages/qPress/README.md)                |

## Installation

Clone the repository and use `pnpm` to install dependencies:

```bash
git clone https://github.com/md-plugins/md-plugins.git
cd md-plugins
pnpm install
```

This repository is currently developed with Node.js `>=22.13`, CI runs on Node.js 24, and local tooling uses `pnpm@11.5.1`.

## Development

### Building Packages

Build all packages and the SSG documentation output in the monorepo:

```bash
pnpm build
```

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
