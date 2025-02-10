import { describe, it, expect } from 'vitest'
import { resolveHeadersFromTokens } from '../src/resolve-headers-from-tokens'
import type Token from 'markdown-it/lib/token.mjs'
import type { ResolveHeadersOptions } from '../src/resolve-headers-from-tokens'

describe('resolveHeadersFromTokens', () => {
  const createToken = (
    type: string,
    tag: string,
    level: number,
    content = '',
    attrs: Record<string, string> = {},
  ): Token =>
    ({
      type,
      tag,
      level,
      content,
      children: content ? [{ type: 'text', content }] : undefined,
      attrGet: (attr: string) => attrs[attr] ?? null,
    }) as unknown as Token

  const baseOptions: ResolveHeadersOptions = {
    level: [1, 2, 3],
    shouldAllowHtml: false,
    shouldAllowNested: false,
    shouldEscapeText: false,
    slugify: (str: string) => str.toLowerCase().replace(/\s+/g, '-'),
    // format: undefined,
  }

  it('should resolve headers from tokens', () => {
    const tokens: Token[] = [
      createToken('heading_open', 'h1', 0, '', { id: 'header-1' }),
      createToken('inline', '', 0, 'Header 1'),
      createToken('heading_close', 'h1', 0),
      createToken('heading_open', 'h2', 0, '', { id: 'header-2' }),
      createToken('inline', '', 0, 'Header 2'),
      createToken('heading_close', 'h2', 0),
    ]

    const result = resolveHeadersFromTokens(tokens, baseOptions)

    expect(result).toEqual([
      {
        level: 1,
        title: 'Header 1',
        id: 'header-1',
        link: '#header-1',
        children: [
          {
            level: 2,
            title: 'Header 2',
            id: 'header-2',
            link: '#header-2',
            children: [],
          },
        ],
      },
    ])
  })

  it('should deep resolve headers from tokens', () => {
    const tokens: Token[] = [
      createToken('heading_open', 'h1', 0, '', { id: 'header-1' }),
      createToken('inline', '', 0, 'Header 1'),
      createToken('heading_close', 'h1', 0),
      createToken('heading_open', 'h4', 0, '', { id: 'header-4' }),
      createToken('inline', '', 0, 'Header 4'),
      createToken('heading_close', 'h4', 0),
    ]

    const result = resolveHeadersFromTokens(tokens, {
      ...baseOptions,
      level: [1, 2, 3, 4],
    })

    expect(result).toEqual([
      {
        level: 1,
        title: 'Header 1',
        id: 'header-1',
        link: '#header-1',
        children: [
          {
            level: 4,
            title: 'Header 4',
            id: 'header-4',
            link: '#header-4',
            children: [],
          },
        ],
      },
    ])
  })

  it('should respect the level option', () => {
    const tokens: Token[] = [
      createToken('heading_open', 'h1', 0, '', { id: 'header-1' }),
      createToken('inline', '', 0, 'Header 1'),
      createToken('heading_close', 'h1', 0),
      createToken('heading_open', 'h4', 0, '', { id: 'header-4' }),
      createToken('inline', '', 0, 'Header 4'),
      createToken('heading_close', 'h4', 0),
    ]

    const result = resolveHeadersFromTokens(tokens, {
      ...baseOptions,
      level: [1, 2, 3],
    })

    expect(result).toEqual([
      {
        level: 1,
        title: 'Header 1',
        id: 'header-1',
        link: '#header-1',
        children: [],
      },
    ])
  })

  it('should use slugify when id is missing', () => {
    const tokens: Token[] = [
      createToken('heading_open', 'h1', 0),
      createToken('inline', '', 0, 'Generated Slug Header'),
      createToken('heading_close', 'h1', 0),
    ]

    const result = resolveHeadersFromTokens(tokens, baseOptions)

    expect(result).toEqual([
      {
        level: 1,
        title: 'Generated Slug Header',
        id: 'generated-slug-header',
        link: '#generated-slug-header',
        children: [],
      },
    ])
  })

  it('should format the title if a format function is provided', () => {
    const tokens: Token[] = [
      createToken('heading_open', 'h1', 0),
      createToken('inline', '', 0, 'Header with Formatting'),
      createToken('heading_close', 'h1', 0),
    ]

    const result = resolveHeadersFromTokens(tokens, {
      ...baseOptions,
      format: (title) => `Formatted: ${title}`,
    })

    expect(result).toEqual([
      {
        level: 1,
        title: 'Formatted: Header with Formatting',
        id: 'header-with-formatting',
        link: '#header-with-formatting',
        children: [],
      },
    ])
  })

  it('should skip nested headers if shouldAllowNested is false', () => {
    const tokens: Token[] = [
      createToken('heading_open', 'h1', 0, '', { id: 'header-1' }),
      createToken('inline', '', 0, 'Header 1'),
      createToken('heading_close', 'h1', 0),
      createToken('heading_open', 'h2', 1, '', { id: 'nested-header-2' }),
      createToken('inline', '', 1, 'Nested Header 2'),
      createToken('heading_close', 'h2', 1),
    ]

    const result = resolveHeadersFromTokens(tokens, baseOptions)

    expect(result).toEqual([
      {
        level: 1,
        title: 'Header 1',
        id: 'header-1',
        link: '#header-1',
        children: [],
      },
    ])
  })

  it('should include nested headers if shouldAllowNested is true', () => {
    const tokens: Token[] = [
      createToken('heading_open', 'h1', 0, '', { id: 'header-1' }),
      createToken('inline', '', 0, 'Header 1'),
      createToken('heading_close', 'h1', 0),
      createToken('heading_open', 'h2', 1, '', { id: 'nested-header-2' }),
      createToken('inline', '', 1, 'Nested Header 2'),
      createToken('heading_close', 'h2', 1),
    ]

    const result = resolveHeadersFromTokens(tokens, {
      ...baseOptions,
      shouldAllowNested: true,
    })

    expect(result).toEqual([
      {
        level: 1,
        title: 'Header 1',
        id: 'header-1',
        link: '#header-1',
        children: [
          {
            level: 2,
            title: 'Nested Header 2',
            id: 'nested-header-2',
            link: '#nested-header-2',
            children: [],
          },
        ],
      },
    ])
  })

  it('should return an empty array when there are no headers', () => {
    const tokens: Token[] = [
      createToken('paragraph_open', 'p', 0),
      createToken('inline', '', 0, 'This is a paragraph'),
      createToken('paragraph_close', 'p', 0),
      createToken('code_block', '', 0, 'console.log("No headers here!");'),
    ]

    const result = resolveHeadersFromTokens(tokens, baseOptions)

    expect(result).toEqual([])
  })
})
