# Markdown Plugins Monorepo

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

| Plugin                              | Description                                                             | Readme                                             |
| ----------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| `@md-plugins/md-plugin-imports`     | Extracts and processes `<script import>` blocks from Markdown.          | [README](packages/md-plugin-imports/README.md)     |
| `@md-plugins/md-plugin-codeblocks`  | Enhances code block rendering with syntax highlighting, tabs, and more. | [README](packages/md-plugin-codeblocks/README.md)  |
| `@md-plugins/md-plugin-blockquote`  | Adds customizable CSS classes to blockquotes.                           | [README](packages/md-plugin-blockquote/README.md)  |
| `@md-plugins/md-plugin-headers`     | Extracts and processes headers for generating ToCs or managing headers. | [README](packages/md-plugin-headers/README.md)     |
| `@md-plugins/md-plugin-inlinecode`  | Adds a custom class to inline code blocks for styling.                  | [README](packages/md-plugin-inlinecode/README.md)  |
| `@md-plugins/md-plugin-link`        | Converts Markdown links into Vue components for SPA-friendly routing.   | [README](packages/md-plugin-link/README.md)        |
| `@md-plugins/md-plugin-table`       | Adds custom classes and attributes to Markdown tables.                  | [README](packages/md-plugin-table/README.md)       |
| `@md-plugins/md-plugin-title`       | Extracts the first header in Markdown as the page title.                | [README](packages/md-plugin-title/README.md)       |
| `@md-plugins/md-plugin-frontmatter` | Extracts and processes frontmatter content from Markdown files.         | [README](packages/md-plugin-frontmatter/README.md) |
| `@md-plugins/md-plugin-containers`  | Adds custom containers for callouts, warnings, and more.                | [README](packages/md-plugin-containers/README.md)  |
| `@md-plugins/shared`                | Shared utilities and types for the plugins.                             | [README](packages/shared/README.md)                |
| `viteMdPlugin`                      | Vite plugin for transforming Markdown into Vue SFCs.                    | [README](packages/vite-md-plugin/README.md)        |

## Installation

Clone the repository and use `pnpm` to install dependencies:

```bash
git clone https://github.com/md-plugins/md-plugins.git
cd md-plugins
pnpm install
```

## Development

### Running Tests

Each package includes unit tests. To run all tests across the monorepo:

```bash
pnpm test
```

### Building Packages

Build all packages in the monorepo:

```bash
pnpm build
```

### Linting

Ensure code quality across all packages:

```bash
pnpm lint
```

## Contributing

We welcome contributions! Please open an issue or submit a pull request with your proposed changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
