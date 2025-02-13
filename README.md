# Markdown Plugins Monorepo (md-plugins)

<p align="center">
<a href="https://github.com/md-plugins/md-plugins">
  <img src="https://raw.githubusercontent.com/md-plugins/md-plugins/refs/heads/main/media/markdown-1024x1024.png" alt="md-plugins - Collection of Markdown-it! plugins for Vue and Quasar" width="300" style="border-radius: 50%;">
</a>
<br>
A collection of Markdown-it! plugins, Vite plugins, and App Extensions for Vue and Quasar.
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
![@md-plugins/md-plugin-table](https://img.shields.io/npm/v/@md-plugins/md-plugin-table?label=@md-plugins/md-plugin-table)
![@md-plugins/md-plugin-title](https://img.shields.io/npm/v/@md-plugins/md-plugin-title?label=@md-plugins/md-plugin-title)
![@md-plugins/shared](https://img.shields.io/npm/v/@md-plugins/shared?label=@md-plugins/shared)

<p><strong>Vite Plugins</strong></p>

![@md-plugins/vite-md-plugin](https://img.shields.io/npm/v/@md-plugins/vite-md-plugin?label=@md-plugins/vite-md-plugin)
![@md-plugins/vite-examples-plugin](https://img.shields.io/npm/v/@md-plugins/vite-examples-plugin?label=@md-plugins/vite-examples-plugin)

<p><strong>Quasar App Extensions</strong></p>

![@md-plugins/quasar-app-extension-vite-md-plugin](https://img.shields.io/npm/v/@md-plugins/quasar-app-extension-vite-md-plugin?label=@md-plugins/quasar-app-extension-vite-md-plugin)
![@md-plugins/quasar-app-extension-q-press](https://img.shields.io/npm/v/@md-plugins/quasar-app-extension-q-press?label=@md-plugins/quasar-app-extension-q-press)

[![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/md-plugins/md-plugins)]()
[![GitHub repo size in bytes](https://img.shields.io/github/repo-size/md-plugins/md-plugins)]()

[![npm](https://img.shields.io/npm/dt/@md-plugins/quasar-app-extension-qpress)](https://www.npmjs.com/package/@md-plugins/quasar-app-extension-qpress)
![@md-plugins/quasar-app-extension-qpress](https://img.shields.io/npm/dm/@md-plugins/quasar-app-extension-qpress)

<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

A collection of **Markdown-It plugins** and utilities designed for enhanced Markdown processing. This monorepo contains various plugins for handling specific Markdown features.

A collection of **Vite plugins** for transforming Markdown into Vue Single File Components (SFCs) and for handling raw SFC content.

A collection of **App Extensions** for Quasar Framework, providing enhanced Markdown support for Quasar applications, including **Q-Press**. The **Q-Press** App Extension is a powerful tool for Quasar developers that simplifies the integration of Markdown content into Quasar applications. It leverages the capabilities of Vite and various Markdown plugins to transform Markdown files into Vue components, enabling a seamless and efficient workflow for content management.

Inspired by [Quasar Framework](https://quasar.dev) documentation and [mdit-vue](https://github.com/mdit-vue/mdit-vue), this project aims to provide a comprehensive set of tools for working with Markdown content.

## Overview

This monorepo provides:

- Plugins to enhance Markdown rendering with features like blockquotes, inline code, tables, headers, and more.
- A Vite plugin for seamless integration of Markdown into Vue projects.
- A Vite plugin for handling raw SFC content.
- Shared utilities for common processing tasks.

## Table of Contents

- [Plugins](#plugins)
- [Installation](#installation)
- [Development](#development)
- [License](#license)

## Plugins

| Plugin                              | Description                                                                                                          | Readme                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `@md-plugins/md-plugin-imports`     | Extracts and processes `<script import>` blocks from Markdown.                                                       | [README](packages/md-plugin-imports/README.md)     |
| `@md-plugins/md-plugin-codeblocks`  | Enhances code block rendering with syntax highlighting, tabs, and more.                                              | [README](packages/md-plugin-codeblocks/README.md)  |
| `@md-plugins/md-plugin-blockquote`  | Adds customizable CSS classes to blockquotes.                                                                        | [README](packages/md-plugin-blockquote/README.md)  |
| `@md-plugins/md-plugin-headers`     | Extracts and processes headers for generating ToCs or managing headers.                                              | [README](packages/md-plugin-headers/README.md)     |
| `@md-plugins/md-plugin-inlinecode`  | Adds a custom class to inline code blocks for styling.                                                               | [README](packages/md-plugin-inlinecode/README.md)  |
| `@md-plugins/md-plugin-link`        | Converts Markdown links into Vue components for SPA-friendly routing.                                                | [README](packages/md-plugin-link/README.md)        |
| `@md-plugins/md-plugin-table`       | Adds custom classes and attributes to Markdown tables.                                                               | [README](packages/md-plugin-table/README.md)       |
| `@md-plugins/md-plugin-title`       | Extracts the first header in Markdown as the page title.                                                             | [README](packages/md-plugin-title/README.md)       |
| `@md-plugins/md-plugin-frontmatter` | Extracts and processes frontmatter content from Markdown files.                                                      | [README](packages/md-plugin-frontmatter/README.md) |
| `@md-plugins/md-plugin-containers`  | Adds custom containers for callouts, warnings, and more.                                                             | [README](packages/md-plugin-containers/README.md)  |
| `@md-plugins/shared`                | Shared utilities and types for the plugins.                                                                          | [README](packages/shared/README.md)                |
| `viteMdPlugin`                      | Vite plugin for transforming Markdown into Vue SFCs.                                                                 | [README](packages/viteMdPlugin/README.md)          |
| `viteExamplesPlugin`                | Vite plugin for loading and transforming example components and their raw source code for usage in your application. | [README](packages/viteExamplesPlugin/README.md)    |
| `@md-plugins/vite-md-plugin`        | Quasar app extension for enhanced Markdown support in Quasar Applications.                                           | [README](packages/viteMdPluginAppExt/README.md)    |
| `@md-plugins/qPress`                | The Ultimate Markdown Solution for Quasar Framework Applications.                                                    | [README](packages/qPress/README.md)                |

## Installation

Clone the repository and use `pnpm` to install dependencies:

```bash
git clone https://github.com/md-plugins/md-plugins.git
cd md-plugins
pnpm install
```

## Development

### Building Packages

Build all packages in the monorepo:

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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
