import { describe, expect, it } from 'vitest'

import { createMarkdownRenderer } from '../src/md'

describe('createMarkdownRenderer', () => {
  it('renders inserted text syntax', () => {
    const renderer = createMarkdownRenderer()
    const result = renderer.render('Contributors like ++you++ help.', {})

    expect(result.html).toContain('Contributors like <ins>you</ins> help.')
  })

  it('treats source line wrapping as a soft break by default', () => {
    const renderer = createMarkdownRenderer()
    const result = renderer.render('This paragraph is wrapped\nin source markdown.', {})

    expect(result.html).toContain('This paragraph is wrapped\nin source markdown.')
    expect(result.html).not.toContain('<br>')
  })

  it('allows hard line breaks when explicitly enabled', () => {
    const renderer = createMarkdownRenderer({ breaks: true })
    const result = renderer.render('This paragraph is wrapped\nin source markdown.', {})

    expect(result.html).toContain('<br>')
  })

  it('renders built-in steps containers', () => {
    const renderer = createMarkdownRenderer()
    const result = renderer.render(
      `::: steps

## Install the package

Add the package.

## Register the plugin

Use the default Q-Press markdown stack.
:::`,
      {},
    )

    expect(result.html).toContain('<div class="markdown-steps" role="list">')
    expect(result.html).toContain('<div class="markdown-step__marker" aria-hidden="true">1</div>')
    expect(result.html).toContain('<h3 class="markdown-step__title">Install the package</h3>')
    expect(result.html).toContain('Use the default Q-Press markdown stack.')
    expect(result.html).not.toContain('<p>::: steps</p>')
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
