# @md-plugins/shared

The `@md-plugins/shared` package provides common utilities, types, and helpers used across various Markdown-It plugins in the `@md-plugins` ecosystem. It serves as a foundational package to ensure consistency and reduce code duplication across the plugins.

## Features

- Shared TypeScript types for plugin environments.
- Common utility functions for Markdown-It processing.
- Centralized definitions for easier maintenance and reusability.
- Lightweight and dependency-free.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/shared
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

## License

This package is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
