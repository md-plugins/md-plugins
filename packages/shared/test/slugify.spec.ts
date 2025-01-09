import { describe, it, expect } from 'vitest'
import { slugify } from '../src/slugify'

describe('slugify', () => {
  it('should handle simple strings', () => {
    expect(slugify('Simple Test')).toBe('simple-test')
  })

  it('should handle special characters', () => {
    expect(slugify('Hello @ World!')).toBe('hello-world')
    expect(slugify('C# Programming')).toBe('c-programming')
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
    expect(slugify('123Test')).toBe('_123test')
    expect(slugify('1 2 3 Go')).toBe('_1-2-3-go')
  })

  it('should handle complex cases', () => {
    expect(slugify('!!Complex__Test Case!!')).toBe('complex-test-case')
    expect(slugify('A   B   C---D')).toBe('a-b-c-d')
  })

  it('should handle empty strings', () => {
    expect(slugify('')).toBe('')
  })
})
