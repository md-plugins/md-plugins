import { describe, it, expect } from 'vitest'
import MarkdownIt from 'markdown-it'
import { importsPlugin } from '../src/md-plugin-imports'
import type { MarkdownItEnv } from '@md-plugins/shared'

describe('importsPlugin', () => {
  const markdownIt = MarkdownIt().use(importsPlugin)

  it('should extract script imports and store them in env.pageScripts', () => {
    const src = `
# Header

<script import>
import MyComponent from './MyComponent.vue';
</script>

Some content here.
`

    const env: MarkdownItEnv = {}
    const result = markdownIt.render(src, env)

    // Verify the rendered content
    expect(result).not.toContain('<script import>')
    expect(result).not.toContain('import MyComponent from')

    // Verify the pageScripts set
    expect(env.pageScripts).toBeInstanceOf(Set)
    expect(env.pageScripts).toContain("import MyComponent from './MyComponent.vue';")
  })

  it('should handle multiple script imports in various forms', () => {
    const src = `
<script import>
import A from './A.vue';
import C from './C.vue';
</script>

Some content here.

<script import>
import B from './B.vue';
</script>
`

    const env: MarkdownItEnv = {}
    const result = markdownIt.render(src, env)

    // Verify the rendered content
    expect(result).not.toContain('<script import>')
    expect(result).not.toContain('import A from')
    expect(result).not.toContain('import B from')
    expect(result).not.toContain('import C from')

    // Verify the pageScripts set
    expect(env.pageScripts).toBeInstanceOf(Set)
    expect(env.pageScripts).toContain("import A from './A.vue';")
    expect(env.pageScripts).toContain("import B from './B.vue';")
    expect(env.pageScripts).toContain("import C from './C.vue';")
  })

  it('should do nothing if there are no script imports', () => {
    const src = `
  # Header

  Some content here.
  `

    const env: MarkdownItEnv = {}
    const result = markdownIt.render(src, env)

    // Verify the rendered content matches expected HTML
    expect(result).toBe('<h1>Header</h1>\n<p>Some content here.</p>\n')

    // Verify that no script imports are added
    expect(env.pageScripts).toBeInstanceOf(Set)
    expect(env.pageScripts!.size).toBe(0)
  })

  it('should handle empty script import blocks gracefully', () => {
    const src = `
<script import>
</script>

Some content here.
`

    const env: MarkdownItEnv = {}
    const result = markdownIt.render(src, env)

    // Verify the rendered content
    expect(result).not.toContain('<script import>')

    // Verify the pageScripts set
    expect(env.pageScripts).toBeInstanceOf(Set)
    expect(env.pageScripts!.size).toBe(0)
  })

  it('should handle script imports with frontmatter present', () => {
    const src = `---
title: Frontmatter Example
author: John Doe
---

  <script import>
  import A from './A.vue';
  import B from './B.vue';
  </script>

# Header

  <script import>
  import C from './C.vue';
  </script>

Some content here.
  `

    const env: MarkdownItEnv = {}
    const result = markdownIt.render(src, env)

    console.log('env:', env)
    console.log('result:', result)

    // Verify the script imports are correctly extracted
    expect(env.pageScripts).toBeInstanceOf(Set)
    expect(env.pageScripts).toContain("import A from './A.vue';")
    expect(env.pageScripts).toContain("import B from './B.vue';")
    expect(env.pageScripts).toContain("import C from './C.vue';")

    // Verify the rendered content includes frontmatter as plain text
    expect(result).toContain('title: Frontmatter Example')
    expect(result).toContain('author: John Doe')

    // Verify the rendered content does not include the script block
    expect(result).not.toContain('<script import>')
    expect(result).not.toContain('import A from')

    // Verify the rest of the markdown content is rendered correctly
    expect(result).toContain('<h1>Header</h1>')
    expect(result).toContain('<p>Some content here.</p>')
  })
})
