import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import { titlePlugin } from '../src/md-plugin-title' // Adjust path as needed

describe('titlePlugin', () => {
  it('extracts the title from the first H1 tag', () => {
    const md = new MarkdownIt()
    const env: { title?: string; heading?: boolean } = {}

    // Register the plugin
    md.use(titlePlugin)

    const markdownInput = `
# This is the Title

Some content here.
    `.trim()

    const renderedHTML = md.render(markdownInput, env)

    expect(env.title).toBe('This is the Title')
    expect(env.heading).toBe(true)
    expect(renderedHTML).toContain('<h1>This is the Title</h1>')
  })

  it('handles content without an H1 tag gracefully', () => {
    const md = new MarkdownIt()
    const env: { title?: string; heading?: boolean } = {}

    // Register the plugin
    md.use(titlePlugin)

    const markdownInput = `
## This is a Subtitle

Some content here.
    `.trim()

    const renderedHTML = md.render(markdownInput, env)

    expect(env.title).toBe('')
    expect(env.heading).toBe(false)
    expect(renderedHTML).toContain('<h2>This is a Subtitle</h2>')
  })

  it('escapes HTML in the extracted title', () => {
    const md = new MarkdownIt()
    const env: { title?: string; heading?: boolean } = {}

    // Register the plugin
    md.use(titlePlugin)

    const markdownInput = `
# This is a <b>bold</b> Title

Some content here.
    `.trim()

    const renderedHTML = md.render(markdownInput, env)

    expect(env.title).toBe('This is a <b>bold</b> Title')
    expect(env.heading).toBe(true)
    expect(renderedHTML).toContain(
      '<h1>This is a &lt;b&gt;bold&lt;/b&gt; Title</h1>\n<p>Some content here.</p>\n',
    )
  })

  it('extracts the title even with additional content before the H1', () => {
    const md = new MarkdownIt()
    const env: { title?: string; heading?: boolean } = {}

    // Register the plugin
    md.use(titlePlugin)

    const markdownInput = `
Some introductory text.

# Actual Title

Some content here.
    `.trim()

    const renderedHTML = md.render(markdownInput, env)

    expect(env.title).toBe('Actual Title')
    expect(env.heading).toBe(true)
    expect(renderedHTML).toContain('<h1>Actual Title</h1>')
  })

  it('handles multiple H1 tags, extracting only the first as the title', () => {
    const md = new MarkdownIt()
    const env: { title?: string; heading?: boolean } = {}

    // Register the plugin
    md.use(titlePlugin)

    const markdownInput = `
# First Title

Some content here.

# Second Title
    `.trim()

    const renderedHTML = md.render(markdownInput, env)

    expect(env.title).toBe('First Title')
    expect(env.heading).toBe(true)
    expect(renderedHTML).toContain('<h1>First Title</h1>')
    expect(renderedHTML).toContain('<h1>Second Title</h1>')
  })
})
