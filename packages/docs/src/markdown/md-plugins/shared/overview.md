---
title: Shared Plugin Overview
desc: Overview of the shared utilities and types for MD-Plugins plugins.
---

The `shared` plugin provides a set of utilities and types that are used across various MD-Plugins plugins. It serves as a common foundation, ensuring consistency and reducing duplication of code across the different plugins.

## Key Features

- **Common Utilities**: Provides utility functions that are commonly used across multiple plugins.
- **Type Definitions**: Includes TypeScript type definitions to ensure type safety and consistency.
- **Helper Functions**: Offers helper functions to simplify common tasks and operations.
- **Reusable Components**: Contains reusable components that can be leveraged by other plugins.

## Utilities

The `shared` plugin includes a variety of utility functions that can be used to perform common tasks. Some of the key utilities include:

- **String Manipulation**: Functions for manipulating and formatting strings.
- **Array Operations**: Functions for performing common array operations.
- **Object Handling**: Functions for handling and manipulating objects.
- **Validation**: Functions for validating data and inputs.

## Type Definitions

The `shared` plugin provides TypeScript type definitions that are used across the MD-Plugins project. These type definitions help ensure type safety and consistency. Some of the key type definitions include:

- **MarkdownItEnv**: Defines the structure of the environment object used by MD-Plugins plugins.
- **PluginOptions**: Defines the structure of the options object passed to plugins.

```ts
import Token from 'markdown-it/lib/token.mjs'

/**
 * Escape html chars
 */
declare const htmlEscape: (str: string) => string

/**
 * Unescape html chars
 */
declare const htmlUnescape: (str: string) => string

interface MarkdownItEnv {
  plugins?: Record<string, unknown>
}

interface MarkdownItHeader {
  /**
   * The slug of the header
   *
   * Typically the `id` attr of the header anchor
   */
  id: string
  /**
   * The level of the header
   *
   * `1` to `6` for `<h1>` to `<h6>`
   */
  level: number
  /**
   * The title of the header
   */
  title: string
  /**
   * Link of the header
   *
   * Typically using `#${slug}` as the anchor hash
   */
  link: string
  /**
   * The children of the header
   */
  children: MarkdownItHeader[]
}

interface ResolveTitleOptions {
  /**
   * Should allow inline HTML tags or not.
   *
   * If the result is going to be used as Vue template, it should allow inline
   * HTML tags so that Vue custom components would be kept.
   */
  shouldAllowHtml: boolean
  /**
   * Should escape the text content or not.
   *
   * If the result is going to be used in HTML directly, it should be escaped
   * so that the text content won't be wrongly treated as HTML tags.
   */
  shouldEscapeText: boolean
}

/**
 * Resolve header title from markdown-it token
 *
 * Typically using the next token of `heading_open` token
 */
declare const resolveTitleFromToken: (
  token: Token,
  { shouldAllowHtml, shouldEscapeText }: ResolveTitleOptions,
) => string

interface ResolveHeadersOptions extends ResolveTitleOptions {
  /**
   * Heading level that going to be resolved
   */
  level: number[]
  /**
   * Should allow headers inside nested blocks or not
   *
   * If set to `true`, headers inside blockquote, list, etc. would also be resolved.
   */
  shouldAllowNested: boolean
  /**
   * A custom slugification function
   *
   * Would be ignored if the `id` attr of the token is set.
   */
  slugify?: (str: string) => string
  /**
   * A function for formatting headings
   */
  format?: (str: string) => string | undefined
}

/**
 * Resolve headers from markdown-it tokens
 */
declare const resolveHeadersFromTokens: (
  tokens: Token[],
  {
    level,
    shouldAllowHtml,
    shouldAllowNested,
    shouldEscapeText,
    slugify,
    format,
  }?: Partial<ResolveHeadersOptions>,
) => MarkdownItHeader[]

/**
 * Default slugification function
 */
declare const slugify: (str: string) => string

export {
  type MarkdownItEnv,
  type MarkdownItHeader,
  type ResolveHeadersOptions,
  type ResolveTitleOptions,
  htmlEscape,
  htmlUnescape,
  resolveHeadersFromTokens,
  resolveTitleFromToken,
  slugify,
}
```

## Helper Functions

The `shared` plugin includes a variety of helper functions that simplify common tasks and operations. Some of the key helper functions include:

- **resolveTitleFromToken**: Extracts the title from a Markdown token.
- **parseFrontmatter**: Parses frontmatter content from a Markdown file.
- **generateSlug**: Generates a slug from a given string.
- **htmlEscape**: Escapes HTML characters in a string.
- **htmlUnescape**: Unescapes HTML characters in a string.
- **slugify**: Slugifies a string using a custom function.

## Conclusion

The `shared` plugin is an essential part of the MD-Plugins project, providing common utilities, type definitions, helper functions, and reusable components. By leveraging the `shared` plugin, you can ensure consistency and reduce duplication of code across your plugins.

Happy coding!
