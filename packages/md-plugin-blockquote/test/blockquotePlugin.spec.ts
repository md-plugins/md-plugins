import MarkdownIt from 'markdown-it'
import { blockquotePlugin } from '../src/md-plugin-blockquote'
import { describe, it, expect } from 'vitest'

describe('blockquotePlugin', () => {
  it('adds the specified class to blockquote elements', () => {
    // Create a MarkdownIt instance
    const md = new MarkdownIt()

    // Use the plugin with a custom class
    md.use(blockquotePlugin, { blockquoteClass: 'custom-blockquote-class' })

    // Markdown input
    const markdownInput = `
> This is a blockquote
>
> Another line
    `.trim()

    // Render the markdown
    const renderedHTML = md.render(markdownInput)

    // Verify that the rendered HTML contains the custom class
    expect(renderedHTML).toContain('<blockquote class="custom-blockquote-class">')
  })

  it('does not affect non-blockquote elements', () => {
    // Create a MarkdownIt instance
    const md = new MarkdownIt()

    // Use the plugin with default settings
    md.use(blockquotePlugin)

    // Markdown input without blockquotes
    const markdownInput = `
This is a paragraph.

1. This is a list item.
    `.trim()

    // Render the markdown
    const renderedHTML = md.render(markdownInput)

    // Verify that no blockquote class is added
    expect(renderedHTML).not.toContain('class="markdown-blockquote"')
  })

  it('uses the default class when no class is specified', () => {
    // Create a MarkdownIt instance
    const md = new MarkdownIt()

    // Use the plugin without custom options
    md.use(blockquotePlugin)

    // Markdown input
    const markdownInput = `
> Default blockquote
    `.trim()

    // Render the markdown
    const renderedHTML = md.render(markdownInput)

    // Verify that the rendered HTML contains the default class
    expect(renderedHTML).toContain('<blockquote class="markdown-blockquote">')
  })
})
