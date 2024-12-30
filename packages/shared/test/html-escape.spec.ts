import { describe, it, expect } from 'vitest'
import { htmlEscape } from '../src/html-escape'

describe('htmlEscape', () => {
  it('should escape & to &amp;', () => {
    expect(htmlEscape('&')).toBe('&amp;')
  })

  it('should escape < to &lt;', () => {
    expect(htmlEscape('<')).toBe('&lt;')
  })

  it('should escape > to &gt;', () => {
    expect(htmlEscape('>')).toBe('&gt;')
  })

  it('should escape " to &quot;', () => {
    expect(htmlEscape('"')).toBe('&quot;')
  })

  it("should escape ' to &#39;", () => {
    expect(htmlEscape("'")).toBe('&#39;')
  })

  it('should escape multiple characters correctly', () => {
    expect(htmlEscape('Tom & Jerry <script>alert("Hello")</script>')).toBe(
      'Tom &amp; Jerry &lt;script&gt;alert(&quot;Hello&quot;)&lt;/script&gt;',
    )
  })

  it('should return the same string if no escapable characters exist', () => {
    expect(htmlEscape('Hello World!')).toBe('Hello World!')
  })

  it('should handle an empty string', () => {
    expect(htmlEscape('')).toBe('')
  })

  it('should handle strings with mixed escapable and non-escapable characters', () => {
    expect(htmlEscape('<a href="link">Link & Description</a>')).toBe(
      '&lt;a href=&quot;link&quot;&gt;Link &amp; Description&lt;/a&gt;',
    )
  })

  it('should not escape already escaped characters', () => {
    expect(htmlEscape('&lt;div&gt;')).toBe('&amp;lt;div&amp;gt;')
  })
})
