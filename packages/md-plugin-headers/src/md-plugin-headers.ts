import { slugify as defaultSlugify } from '@md-plugins/shared'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { PluginWithOptions } from 'markdown-it'
import type { HeadersPluginOptions } from './types'
import type MarkdownIt from 'markdown-it'
import { resolvePluginOptions } from '@md-plugins/shared'

// Default options for the headers plugin
const DEFAULT_HEADERS_PLUGIN_OPTIONS: HeadersPluginOptions = {
  level: [2, 3],
  slugify: defaultSlugify,
  // Default to an identity function if no formatter is provided.
  format: (str: string) => str,
  shouldAllowNested: false,
  shouldAllowApi: true,
  shouldAllowExample: true,
}

function parseContent(
  str: string,
  slugify: (str: string) => string,
  format: (str: string) => string,
): { id: string; title: string } {
  const title = String(str)
    .replace(/<\/?[^>]+(>|$)/g, '')
    .trim()
  return {
    id: slugify(title),
    title: format(title),
  }
}

export const headersPlugin: PluginWithOptions<HeadersPluginOptions> = (
  md: MarkdownIt,
  options?: HeadersPluginOptions | { headersPlugin?: HeadersPluginOptions },
): void => {
  // Merge user-provided options with our defaults.
  const {
    level = DEFAULT_HEADERS_PLUGIN_OPTIONS.level,
    slugify = DEFAULT_HEADERS_PLUGIN_OPTIONS.slugify,
    format = DEFAULT_HEADERS_PLUGIN_OPTIONS.format,
    shouldAllowApi = DEFAULT_HEADERS_PLUGIN_OPTIONS.shouldAllowApi,
    shouldAllowExample = DEFAULT_HEADERS_PLUGIN_OPTIONS.shouldAllowExample,
    shouldAllowNested = DEFAULT_HEADERS_PLUGIN_OPTIONS.shouldAllowNested,
  } = resolvePluginOptions<HeadersPluginOptions, 'headersPlugin'>(
    options,
    'headersPlugin',
    DEFAULT_HEADERS_PLUGIN_OPTIONS,
  )

  const originalHeadingOpen = md.renderer.rules.heading_open
  const originalHtmlBlock = md.renderer.rules.html_block

  md.renderer.rules.heading_open = (tokens, idx, options, env: MarkdownItEnv, self): string => {
    const token = tokens[idx]
    if (!token) {
      return self.renderToken(tokens, idx, options)
    }

    // Extract header level (e.g. h1 -> 1, h2 -> 2, etc.)
    const headerLevel = Number.parseInt(token.tag.slice(1), 10)

    // Get the inline content (the next token should be the inline token)
    const contentToken = tokens[idx + 1]
    const content =
      contentToken && contentToken.children
        ? contentToken.children.reduce((acc, t) => acc + t.content, '')
        : ''

    const { id, title } = parseContent(content, slugify!, format!)

    token.attrSet('id', id)
    // Set a default class for styling and attach a click handler (for copying the heading)
    token.attrSet('class', `markdown-heading markdown-${token.tag}`)
    token.attrSet('@click', `copyHeading(\`${id}\`)`)

    // Ensure a table-of-contents array exists on env
    env.toc = env.toc || []

    // Only include headings with levels specified in the options.
    if ((level ?? []).includes(headerLevel)) {
      if (headerLevel === (level ?? [])[0]) {
        env.toc.push({ id, title })
      } else {
        env.toc.push({ id, title, sub: true })
      }
    }

    if (typeof originalHeadingOpen === 'function') {
      return originalHeadingOpen(tokens, idx, options, env, self)
    }
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.html_block = (tokens, idx, options, env: MarkdownItEnv, self): string => {
    const token = tokens[idx]
    if (!token) {
      return ''
    }

    env.toc = env.toc || []

    // Process API headers if allowed.
    if (shouldAllowApi && /^<MarkdownApi\s/.test(token.content)) {
      const match = /(?:file|name)="([^"]+)"/.exec(token.content)
      if (match !== null) {
        const title = `${match[1]} API`
        if (slugify) {
          env.toc.push({ id: slugify(title), title, deep: true })
        }
      }
    }

    // Process Example headers if allowed.
    if (shouldAllowExample && /^<MarkdownExample(?:\s+title="([^"]*)")?\s*/.test(token.content)) {
      const match = token.content.match(/^<MarkdownExample(?:\s+title="([^"]*)")?\s*/)
      if (match !== null) {
        const title = match[1] ?? 'Example'
        if (slugify) {
          env.toc.push({ id: slugify('example-' + title), title, deep: true })
        }
      }
    }

    if (typeof originalHtmlBlock === 'function') {
      return originalHtmlBlock(tokens, idx, options, env, self)
    }
    return token.content
  }
}
