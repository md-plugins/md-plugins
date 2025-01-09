import { describe, it, expect } from 'vitest'
import { htmlUnescape } from '../src/html-unescape'

describe('htmlUnescape', () => {
  it('should unescape &amp; to &', () => {
    expect(htmlUnescape('&amp;')).toBe('&')
  })

  it('should unescape &#38; to &', () => {
    expect(htmlUnescape('&#38;')).toBe('&')
  })

  it('should unescape &lt; to <', () => {
    expect(htmlUnescape('&lt;')).toBe('<')
  })

  it('should unescape &#60; to <', () => {
    expect(htmlUnescape('&#60;')).toBe('<')
  })

  it('should unescape &gt; to >', () => {
    expect(htmlUnescape('&gt;')).toBe('>')
  })

  it('should unescape &#62; to >', () => {
    expect(htmlUnescape('&#62;')).toBe('>')
  })

  it("should unescape &apos; to '", () => {
    expect(htmlUnescape('&apos;')).toBe("'")
  })

  it("should unescape &#39; to '", () => {
    expect(htmlUnescape('&#39;')).toBe("'")
  })

  it('should unescape &quot; to "', () => {
    expect(htmlUnescape('&quot;')).toBe('"')
  })

  it('should unescape &#34; to "', () => {
    expect(htmlUnescape('&#34;')).toBe('"')
  })

  it('should unescape multiple entities correctly', () => {
    expect(htmlUnescape('&lt;div&gt;Hello &quot;World&quot;&lt;/div&gt;')).toBe(
      '<div>Hello "World"</div>',
    )
  })

  it('should return the same string if no escapable entities exist', () => {
    expect(htmlUnescape('Hello World!')).toBe('Hello World!')
  })

  it('should handle an empty string', () => {
    expect(htmlUnescape('')).toBe('')
  })

  it('should handle strings with mixed escaped and unescaped characters', () => {
    expect(htmlUnescape('&lt;a href="link"&gt;Link &amp; Description&lt;/a&gt;')).toBe(
      '<a href="link">Link & Description</a>',
    )
  })

  it('should not change already unescaped characters', () => {
    expect(htmlUnescape('<div>')).toBe('<div>')
  })
})
