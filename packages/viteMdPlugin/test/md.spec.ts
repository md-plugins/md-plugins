import { describe, expect, it } from 'vitest'

import { createMarkdownRenderer } from '../src/md'

describe('createMarkdownRenderer', () => {
  it('renders inserted text syntax', () => {
    const renderer = createMarkdownRenderer()
    const result = renderer.render('Contributors like ++you++ help.', {})

    expect(result.html).toContain('Contributors like <ins>you</ins> help.')
  })

  it('registers user supplied MarkdownIt plugins', () => {
    const renderer = createMarkdownRenderer({
      markdownItPlugins: [
        (md) => {
          md.inline.ruler.after('text', 'sample_marker', (state, silent) => {
            if (state.src.slice(state.pos, state.pos + 3) !== '!!!') {
              return false
            }

            if (silent === false) {
              const token = state.push('sample_marker', 'strong', 0)
              token.content = 'marked'
            }

            state.pos += 3
            return true
          })

          md.renderer.rules.sample_marker = (tokens, idx) =>
            `<strong>${tokens[idx]?.content}</strong>`
        },
      ],
    })

    const result = renderer.render('This is !!!', {})

    expect(result.html).toContain('This is <strong>marked</strong>')
  })
})
