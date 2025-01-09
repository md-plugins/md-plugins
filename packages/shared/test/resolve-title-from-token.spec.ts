import { describe, it, expect } from 'vitest'
import { resolveTitleFromToken } from '../src/resolve-title-from-token'
import type { ResolveTitleOptions } from '../src/resolve-title-from-token'
import type Token from 'markdown-it/lib/token.mjs'

const mockToken = (children: Partial<Token>[]): Token =>
  ({
    children: children as Token[],
  }) as Token

describe('resolveTitleFromToken', () => {
  const options: ResolveTitleOptions = {
    shouldAllowHtml: false,
    shouldEscapeText: false,
  }

  it('should resolve a simple title with text tokens', () => {
    const token = mockToken([{ type: 'text', content: 'Hello World' }])
    const result = resolveTitleFromToken(token, options)
    expect(result).toBe('Hello World')
  })

  it('should escape text if shouldEscapeText is true', () => {
    const token = mockToken([{ type: 'text', content: '<Hello World>' }])
    const result = resolveTitleFromToken(token, {
      ...options,
      shouldEscapeText: true,
    })
    expect(result).toBe('&lt;Hello World&gt;')
  })

  it('should include html_inline tokens if shouldAllowHtml is true', () => {
    const token = mockToken([
      { type: 'text', content: 'Hello ' },
      { type: 'html_inline', content: '<b>World</b>' },
    ])
    const result = resolveTitleFromToken(token, {
      ...options,
      shouldAllowHtml: true,
    })
    expect(result).toBe('Hello <b>World</b>')
  })

  it('should exclude html_inline tokens if shouldAllowHtml is false', () => {
    const token = mockToken([
      { type: 'text', content: 'Hello ' },
      { type: 'html_inline', content: '<b>World</b>' },
    ])
    const result = resolveTitleFromToken(token, options)
    expect(result).toBe('Hello')
  })

  it('should handle code_inline tokens correctly', () => {
    const token = mockToken([
      { type: 'text', content: 'Code: ' },
      { type: 'code_inline', content: '<myCode>' },
    ])
    const result = resolveTitleFromToken(token, {
      ...options,
      shouldEscapeText: true,
    })
    expect(result).toBe('Code: &lt;myCode&gt;')
  })

  it('should ignore tokens with meta.isPermalinkSymbol', () => {
    const token = mockToken([
      { type: 'text', content: 'Hello' },
      {
        type: 'text',
        content: '#',
        meta: { isPermalinkSymbol: true },
      },
    ])
    const result = resolveTitleFromToken(token, options)
    expect(result).toBe('Hello')
  })

  it('should handle empty tokens gracefully', () => {
    const token = mockToken([])
    const result = resolveTitleFromToken(token, options)
    expect(result).toBe('')
  })

  it('should combine different token types correctly', () => {
    const token = mockToken([
      { type: 'text', content: 'Hello ' },
      { type: 'emoji', content: '😊' },
      { type: 'code_inline', content: '<code>' },
    ])
    const result = resolveTitleFromToken(token, {
      ...options,
      shouldEscapeText: true,
    })
    expect(result).toBe('Hello 😊&lt;code&gt;')
  })
})
