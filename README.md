# Markdown Plugins Monorepo (md-plugins)

<p align="center">
<a href="https://github.com/md-plugins/md-plugins">
  <img src="https://raw.githubusercontent.com/md-plugins/md-plugins/refs/heads/main/media/markdown-1024x1024.png" alt="md-plugins - Collection of Markdown-it! plugins for Vue and Quasar" width="300" style="border-radius: 50%;">
</a>
<br>
Collection of Markdown-it! plugins for Vue and Quasar
</p>

**NOTE:** This monorepo is currently under development and not yet ready for production use.

A collection of **Markdown-It plugins** and utilities designed for enhanced Markdown processing. This monorepo contains various plugins for handling specific Markdown features, as well as a Vite plugin for transforming Markdown into Vue Single File Components (SFCs).

Inspired by [Quasar Framework](https://quasar.dev) documentation and [mdit-vue](https://github.com/mdit-vue/mdit-vue), this project aims to provide a comprehensive set of tools for working with Markdown content.

## Overview

This monorepo provides:

- Plugins to enhance Markdown rendering with features like blockquotes, inline code, tables, headers, and more.
- A Vite plugin for seamless integration of Markdown into Vue projects.
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
