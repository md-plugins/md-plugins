import { describe, it, expect } from 'vitest'
import { slugify } from '../src/slugify'

describe('slugify', () => {
  it('should handle simple strings', () => {
    expect(slugify('Simple Test')).toBe('simple-test')
  })

  it('should handle special characters', () => {
    expect(slugify('Hello @ World!')).toBe('hello-world')
    expect(slugify('Hello@World!')).toBe('hello-world')
    expect(slugify('C# Programming')).toBe('c-programming')
    expect(slugify('Hello*World')).toBe('hello-world')
  })

  it('should replace & with "-and-"', () => {
    expect(slugify('Rock & Roll')).toBe('rock-and-roll')
  })

  it('should remove accents and diacritics', () => {
    expect(slugify('Héllo Wörld')).toBe('hello-world')
  })

  it('should remove control characters', () => {
    expect(slugify('Hello\u0000World')).toBe('hello-world')
  })

  it('should trim trailing and leading separators', () => {
    expect(slugify('-Hello World-')).toBe('hello-world')
    expect(slugify('--Hello--World--')).toBe('hello-world')
  })

  it('should replace multiple separators with a single separator', () => {
    expect(slugify('Hello    World')).toBe('hello-world')
    expect(slugify('Hello---World')).toBe('hello-world')
  })

  it('should ensure slugs do not start with a number', () => {
    expect(slugify('-123Test')).toBe('_123-test')
    expect(slugify('_123Test')).toBe('_123-test')
    expect(slugify('1 2 3 Go')).toBe('_1-2-3-go')
    expect(slugify('123Test')).toBe('_123-test')
  })

  it('should handle camelCase and PascalCase', () => {
    expect(slugify('camelCase')).toBe('camel-case')
    expect(slugify('PascalCase')).toBe('pascal-case')
    expect(slugify('camel10Case')).toBe('camel-10-case')
    expect(slugify('Pascal10Case')).toBe('pascal-10-case')
  })

  it('should replace underscores with hyphens', () => {
    expect(slugify('Hello_World')).toBe('hello-world')
  })

  it('should insert hyphens before and after numbers', () => {
    expect(slugify('hour24Format')).toBe('hour-24-format')
    expect(slugify('version2.0')).toBe('version-2-0')
  })

  it('should handle complex cases', () => {
    expect(slugify('!!Complex__Test Case!!')).toBe('complex-test-case')
    expect(slugify('A   B   C---D')).toBe('a-b-c-d')
    expect(slugify('Hello--World!!')).toBe('hello-world')
    expect(slugify('Hello__World')).toBe('hello-world')
    expect(slugify('Hello   World')).toBe('hello-world')
    expect(slugify('Hello_World!')).toBe('hello-world')
    expect(slugify('Hello@World#')).toBe('hello-world')
    expect(slugify('I ♥ Dogs')).toBe('i-dogs')
  })

  it('should handle empty strings', () => {
    expect(slugify('')).toBe('')
  })
})
