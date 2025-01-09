import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import { inlinecodePlugin } from '../src/md-plugin-inlinecode' // Adjust path as needed

describe('inlinecodePlugin', () => {
  it('adds the default class to inline code blocks', () => {
    const md = new MarkdownIt()
    inlinecodePlugin(md)

    const markdownInput = '`inline code`'
    const renderedHTML = md.render(markdownInput)

    // Ensure the default class is applied
    expect(renderedHTML).toContain('<code class="markdown-token">inline code</code>')
  })

  it('applies a custom class to inline code blocks', () => {
    const md = new MarkdownIt()
    inlinecodePlugin(md, { inlineCodeClass: 'custom-class' })

    const markdownInput = '`custom class code`'
    const renderedHTML = md.render(markdownInput)

    // Ensure the custom class is applied
    expect(renderedHTML).toContain('<code class="custom-class">custom class code</code>')
  })

  it('preserves existing classes on inline code blocks', () => {
    const md = new MarkdownIt()
    inlinecodePlugin(md)

    const markdownInput = '`existing class code`'
    const renderedHTML = md.render(markdownInput)

    // Ensure the default class is added without removing existing classes
    expect(renderedHTML).toContain('<code class="markdown-token">existing class code</code>')
  })

  it('uses the fallback renderer if no original rule exists', () => {
    const md = new MarkdownIt()
    delete md.renderer.rules.code_inline // Simulate no existing rule
    inlinecodePlugin(md)

    const markdownInput = '`fallback renderer`'
    const renderedHTML = md.render(markdownInput)

    // Ensure the plugin renders the content correctly even without an original renderer
    expect(renderedHTML).toContain('<code class="markdown-token">fallback renderer</code>')
  })

  it('handles multiple inline code blocks in the same input', () => {
    const md = new MarkdownIt()
    inlinecodePlugin(md, { inlineCodeClass: 'multi-class' })

    const markdownInput = '`first block` and `second block`'
    const renderedHTML = md.render(markdownInput)

    // Ensure both blocks are rendered with the custom class
    expect(renderedHTML).toContain('<code class="multi-class">first block</code>')
    expect(renderedHTML).toContain('<code class="multi-class">second block</code>')
  })
})
