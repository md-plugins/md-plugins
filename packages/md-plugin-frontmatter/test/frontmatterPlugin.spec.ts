import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import { frontmatterPlugin } from '../src/md-plugin-frontmatter' // Adjust path as needed
import type { FrontmatterPluginOptions } from '../src/types'

describe('frontmatterPlugin', () => {
  it('extracts frontmatter into env.frontmatter', () => {
    const md = new MarkdownIt()
    md.use(frontmatterPlugin)

    const markdownInput = `
---
title: Test Title
author: Test Author
---

This is the content.
    `.trim()

    const env: any = {}
    const renderedHTML = md.render(markdownInput, env)

    expect(env.frontmatter).toEqual({
      title: 'Test Title',
      author: 'Test Author',
    })
    expect(renderedHTML).toBe('<p>This is the content.</p>\n')
  })

  it('stores raw content without frontmatter in env.content', () => {
    const md = new MarkdownIt()
    md.use(frontmatterPlugin)

    const markdownInput = `
---
title: Test Title
---

This is the content.
    `.trim()

    const env: any = {}
    md.render(markdownInput, env)

    expect(env.content).toBe('\nThis is the content.')
  })

  it('renders the excerpt when renderExcerpt is true', () => {
    const options: FrontmatterPluginOptions = { renderExcerpt: true }
    const md = new MarkdownIt()
    md.use(frontmatterPlugin, options)

    const markdownInput = `
---
title: Test Title
excerpt: This is the excerpt.
---

This is the content.
    `.trim()

    const env: any = {}
    const renderedHTML = md.render(markdownInput, env)

    expect(env.excerpt).toBe('<p>This is the excerpt.</p>\n')
    expect(renderedHTML).toBe('<p>This is the content.</p>\n')
  })

  it('stores raw excerpt when renderExcerpt is false', () => {
    const options: FrontmatterPluginOptions = { renderExcerpt: false }
    const md = new MarkdownIt()
    md.use(frontmatterPlugin, options)

    const markdownInput = `
---
title: Test Title
excerpt: This is the excerpt.
---

This is the content.
    `.trim()

    const env: any = {}
    md.render(markdownInput, env)

    expect(env.excerpt).toBeUndefined()
  })

  it('handles Markdown without frontmatter gracefully', () => {
    const md = new MarkdownIt()
    md.use(frontmatterPlugin)

    const markdownInput = `
This is Markdown content without frontmatter.
    `.trim()

    const env: any = {}
    const renderedHTML = md.render(markdownInput, env)

    expect(env.frontmatter).toStrictEqual({})
    expect(env.content).toBe(markdownInput)
    expect(renderedHTML).toBe('<p>This is Markdown content without frontmatter.</p>\n')
  })
})
