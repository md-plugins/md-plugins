---
title: Headers Plugin Advanced Topics
desc: Headers plugin advanced topics for Markdown.
---

## Headers Plugin

The `headers` plugin allows you to add custom classes to headers and generate a table of contents (TOC) in your Markdown content. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### Type Information

```ts
import { PluginWithOptions } from 'markdown-it'

/**
 * Options of md-plugin-headers
 */
interface HeadersPluginOptions {
  /**
   * A custom slugification function
   *
   * Should use the same slugify function with markdown-it-anchor
   * to ensure the link is matched
   */
  slugify?: (str: string) => string
  /**
   * A function for formatting header title
   */
  format?: (str: string) => string
  /**
   * Heading level that going to be extracted
   *
   * Should be a subset of markdown-it-anchor's `level` option
   * to ensure the slug is existed
   *
   * @default [2,3]
   */
  level?: number[]
  /**
   * Should allow headers inside nested blocks or not
   *
   * If set to `true`, headers inside blockquote, list, etc. would also be extracted.
   *
   * @default false
   */
  shouldAllowNested?: boolean
  /**
   * Should allow API headers
   *
   * If set to `true`, headers for `<MarkdownAPI>` title would also be extracted.
   *
   * @default true
   */
  shouldAllowApi?: boolean
  /**
   * Should allow Example headers
   *
   * If set to `true`, headers for `<MarkdownExample>` title would also be extracted.
   *
   * @default true
   */
  shouldAllowExample?: boolean
}

interface TocItem {
  id: string
  title: string
  sub?: boolean
  deep?: boolean
}

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * The toc that are extracted by `md-plugin-headers`
     */
    toc?: TocItem[]
  }
}

declare const headersPlugin: PluginWithOptions<HeadersPluginOptions>

export { type HeadersPluginOptions, type TocItem, headersPlugin }
```

### Conclusion

The `headers` plugin is a powerful tool for adding custom classes to headers and generating a TOC in your Markdown content. By customizing the levels, slugify function, and format function, you can tailor the plugin to fit your specific needs. Remember, it is up to you to handle the generated TOC data and send it to the front-end in a way that suits your application. Experiment with different configurations and find the one that works best for you.

Happy coding!
