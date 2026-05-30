import { describe, expect, it } from 'vitest'

import { createMarkdownRenderer } from '../src/md'

describe('createMarkdownRenderer', () => {
  it('renders inserted text syntax', () => {
    const renderer = createMarkdownRenderer()
    const result = renderer.render('Contributors like ++you++ help.', {})

    expect(result.html).toContain('Contributors like <ins>you</ins> help.')
  })
})
