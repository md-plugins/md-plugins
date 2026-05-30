---
title: Shared Package Overview
desc: Overview of the shared utilities and types used by MD-Plugins packages.
---

The `@md-plugins/shared` package provides utilities and types used internally by the MD-Plugins packages. It serves as a common foundation, ensuring consistency and reducing duplication across the different plugins.

::: tip
QPress applications do not need to install or import `@md-plugins/shared` directly. Install it only when you are building a custom Markdown-It plugin or contributing to the MD-Plugins packages themselves.
:::

## Key Features

- **Common Utilities**: Provides utility functions that are commonly used across multiple plugins.
- **Type Definitions**: Includes TypeScript type definitions to ensure type safety and consistency.
- **Helper Functions**: Offers helper functions to simplify common tasks and operations.
- **Reusable Helpers**: Contains shared helpers that can be leveraged by other MD-Plugins packages.

## Utilities

The shared package includes a variety of utility functions that can be used to perform common tasks. Some of the key utilities include:

- **String Manipulation**: Functions for manipulating and formatting strings.
- **Array Operations**: Functions for performing common array operations.
- **Object Handling**: Functions for handling and manipulating objects.
- **Validation**: Functions for validating data and inputs.

## Type Definitions

The shared package provides TypeScript type definitions that are used across the MD-Plugins project. These type definitions help ensure type safety and consistency. Some of the key type definitions include:

- **MarkdownItEnv**: Defines the structure of the environment object used by MD-Plugins plugins.
- **PluginOptions**: Defines the structure of the options object passed to plugins.

```ts [twoslash]
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
type ResolvePluginOptionsFn = <T extends object, K extends keyof any>(
  options:
    | T
    | {
        [P in K]?: T
      }
    | undefined,
  key: K,
  defaults: T,
) => T

interface LinkPluginOptions {
  externalTarget?: '_blank' | '_self'
  externalRel?: string
}

const linkOptions = resolvePluginOptions({ link: { externalTarget: '_blank' } }, 'link', {
  externalTarget: '_self',
  externalRel: 'noopener',
} satisfies LinkPluginOptions)

const linkTarget = linkOptions.externalTarget
//    ^?

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
  token: unknown,
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
  tokens: unknown[],
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

declare function resolvePluginOptions<T extends object, K extends keyof any>(
  options:
    | T
    | {
        [key in K]?: T
      }
    | undefined,
  key: K,
  defaults: T,
): T

export {
  type MarkdownItEnv,
  type MarkdownItHeader,
  type ResolveHeadersOptions,
  type ResolvePluginOptionsFn,
  type ResolveTitleOptions,
  htmlEscape,
  htmlUnescape,
  resolveHeadersFromTokens,
  resolvePluginOptions,
  resolveTitleFromToken,
  slugify,
}
```

## Helper Functions

The shared package includes a variety of helper functions that simplify common tasks and operations. Some of the key helper functions include:

- **resolveTitleFromToken**: Extracts the title from a Markdown token.
- **parseFrontmatter**: Parses frontmatter content from a Markdown file.
- **generateSlug**: Generates a slug from a given string.
- **htmlEscape**: Escapes HTML characters in a string.
- **htmlUnescape**: Unescapes HTML characters in a string.
- **slugify**: Slugifies a string using a custom function.

## Conclusion

The shared package is an essential internal part of the MD-Plugins project, providing common utilities, type definitions, and helper functions. If you are building custom plugins, you can use it to stay aligned with the same types and helpers used by the official MD-Plugins packages.

Happy coding!
