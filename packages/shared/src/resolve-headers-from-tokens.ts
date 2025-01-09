import type { MarkdownItHeader } from './types'
import type Token from 'markdown-it/lib/token.mjs'
import type { ResolveTitleOptions } from './resolve-title-from-token'
import { resolveTitleFromToken } from './resolve-title-from-token'
import { slugify as defaultSlugify } from './slugify'

export interface ResolveHeadersOptions extends ResolveTitleOptions {
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
export const resolveHeadersFromTokens = (
  tokens: Token[],
  {
    level = [1, 2, 3],
    shouldAllowHtml = false,
    shouldAllowNested = false,
    shouldEscapeText = false,
    slugify = defaultSlugify,
    format = (str: string) => str,
  }: Partial<ResolveHeadersOptions> = {},
): MarkdownItHeader[] => {
  const headers: MarkdownItHeader[] = []
  const stack: MarkdownItHeader[] = []

  const pushHeader = (header: MarkdownItHeader): void => {
    // Ensure that headers at the same or higher level clear the stack
    while (stack.length > 0 && header.level <= stack[0]!.level) {
      stack.shift()
    }

    if (stack.length === 0) {
      headers.push(header) // Top-level header
    } else {
      stack[0]!.children.push(header) // Nested header
    }

    stack.unshift(header) // Add current header to the stack
  }

  tokens.forEach((token, i) => {
    if (token.type !== 'heading_open') return

    // Skip nested headers if nesting is not allowed
    if (token.level !== 0 && !shouldAllowNested) return

    const headerLevel = Number.parseInt(token.tag.slice(1), 10)

    if (!level.includes(headerLevel)) return

    const nextToken = tokens[i + 1]
    if (!nextToken) return

    const title = resolveTitleFromToken(nextToken, {
      shouldAllowHtml,
      shouldEscapeText,
    })

    const slug = token.attrGet('id') ?? slugify(title)

    pushHeader({
      level: headerLevel,
      title: format(title) ?? title,
      id: slug,
      link: `#${slug}`,
      children: [],
    })
  })

  return headers
}
