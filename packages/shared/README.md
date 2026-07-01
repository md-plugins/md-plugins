# @md-plugins/shared

[![npm version](https://img.shields.io/npm/v/@md-plugins/shared?label=%40md-plugins%2Fshared)](https://www.npmjs.com/package/@md-plugins/shared)
[![npm downloads](https://img.shields.io/npm/dt/@md-plugins/shared)](https://www.npmjs.com/package/@md-plugins/shared)
[![npm monthly downloads](https://img.shields.io/npm/dm/@md-plugins/shared)](https://www.npmjs.com/package/@md-plugins/shared)
[![license](https://img.shields.io/npm/l/@md-plugins/shared)](https://www.npmjs.com/package/@md-plugins/shared)

<span class="badge-github-sponsors"><a href="https://github.com/sponsors/hawkeye64" title="Sponsor this project on GitHub"><img src="https://img.shields.io/badge/github-sponsors-ea4aaa.svg?logo=githubsponsors&logoColor=white" alt="GitHub Sponsors button" /></a></span>
<span class="badge-paypal"><a href="https://paypal.me/hawkeye64" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>

[![Discord](https://img.shields.io/badge/discord-join%20server-738ADB?style=for-the-badge&logo=discord&logoColor=738ADB)](https://chat.quasar.dev)
[![X](https://img.shields.io/badge/follow-@jgalbraith64-1DA1F2?style=for-the-badge&logo=x&logoColor=1DA1F2)](https://twitter.com/jgalbraith64)

The `@md-plugins/shared` package provides common utilities, types, and helpers used across the Markdown-it plugins in the md-plugins ecosystem. It keeps Q-Press and direct plugin usage on the same environment shape for frontmatter, table of contents, extracted titles, and page-level imports.

Q-Press applications and regular `@md-plugins/vite-md-plugin` users do not need to install this package directly. Use it only when building a custom Markdown-it plugin or contributing to the md-plugins packages.

## Features

- Shared TypeScript types for plugin environments.
- Common utility functions for Markdown-it processing.
- Centralized definitions for easier maintenance and reusability.
- Lightweight and dependency-free.

## Installation

Install the package via your preferred package manager when you need it for plugin development:

```bash
# with pnpm:
pnpm add @md-plugins/shared
# with bun:
bun add @md-plugins/shared
# with Yarn:
yarn add @md-plugins/shared
# with npm:
npm install @md-plugins/shared
```

## Usage

The `@md-plugins/shared` package is not intended to be used directly by end-users but as a dependency for other `@md-plugins` packages. However, if you’re developing a custom plugin or extending existing functionality, you can import and use the utilities provided.

## Example: Accessing Types

```ts
import type { MarkdownItEnv } from '@md-plugins/shared'

const env: MarkdownItEnv = {
  toc: [],
  frontmatter: {},
}
```

## Example: Utility Function

```ts
import { resolveTitleFromToken } from '@md-plugins/shared'

const token = { content: '# My Title' }
const title = resolveTitleFromToken(token, {
  shouldAllowHtml: false,
  shouldEscapeText: true,
})

console.log(title) // "My Title"
```

## Provided Types

The `shared` package defines common types used across plugins. Here are some examples:

### `MarkdownItEnv`

```ts
export interface MarkdownItEnv {
  toc?: Array<Record<string, any>> // Extracted table of contents
  frontmatter?: Record<string, unknown> // Frontmatter data
  pageScripts?: Set<string> // Scripts to be included in the page
  content?: string // Markdown content excluding frontmatter
  title?: string // Extracted title
}
```

This type allows consistent management of the Markdown-It environment.

## Utility Functions

### `resolveTitleFromToken`

A utility function to resolve the title from a Markdown-It token.

```ts
function resolveTitleFromToken(
  token: Token,
  options: { shouldAllowHtml: boolean; shouldEscapeText: boolean },
): string
```

- Parameters:
  - token: The Markdown-It token to extract the title from.
  - options: Configuration for allowing HTML or escaping text.
- Returns: The resolved title as a string

### `slugify`

Provides a standard implementation of slugification for plugins:

```ts
function slugify(str: string): string
```

- Converts a string into a URL-friendly slug.
- Removes special characters and replaces spaces with hyphens.

## Documentation

In case this README falls out of date, please refer to the [documentation](https://md-plugins.netlify.app/md-plugins/shared/overview) for the latest information.

## Support

If md-plugins shared utilities is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
