import { describe, expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'

import { mermaidPlugin } from '../src/md-plugin-mermaid'
import type { MarkdownItEnv } from '@md-plugins/shared'

describe('mermaidPlugin', () => {
  it('renders Mermaid fences as a Vue component by default', () => {
    const md = new MarkdownIt()
    const env: MarkdownItEnv = {}

    md.use(mermaidPlugin)

    const rendered = md.render('```mermaid\ngraph TD\nA --> B\n```', env)

    expect(rendered).toContain(
      '<MarkdownMermaid :code="&quot;graph TD\\nA --&gt; B\\n&quot;"></MarkdownMermaid>',
    )
    expect(Array.from(env.pageScripts || [])).toEqual([
      "import MarkdownMermaid from '@/.q-press/components/MarkdownMermaid.vue'",
    ])
  })

  it('can render plain pre blocks for raw MarkdownIt usage', () => {
    const md = new MarkdownIt()

    md.use(mermaidPlugin, { renderMode: 'pre' })

    const rendered = md.render('```mermaid\ngraph TD\nA --> B\n```')

    expect(rendered).toContain('<pre class="mermaid"><code>graph TD\nA --&gt; B\n</code></pre>')
  })

  it('passes fence classes through to the rendered component', () => {
    const md = new MarkdownIt()

    md.use(mermaidPlugin)

    const rendered = md.render('```mermaid {.desktop-only .wide-diagram}\ngraph TD\nA --> B\n```')

    expect(rendered).toContain(
      '<MarkdownMermaid class="desktop-only wide-diagram" :code="&quot;graph TD\\nA --&gt; B\\n&quot;"></MarkdownMermaid>',
    )
  })

  it('combines preClass and fence classes in pre mode', () => {
    const md = new MarkdownIt()

    md.use(mermaidPlugin, { renderMode: 'pre' })

    const rendered = md.render('```mermaid {.desktop-only}\ngraph TD\nA --> B\n```')

    expect(rendered).toContain(
      '<pre class="mermaid desktop-only"><code>graph TD\nA --&gt; B\n</code></pre>',
    )
  })

  it('delegates non-Mermaid fences to the existing renderer', () => {
    const md = new MarkdownIt()

    md.use(mermaidPlugin)

    const rendered = md.render('```ts\nconst ok = true\n```')

    expect(rendered).toContain('<pre><code class="language-ts">const ok = true\n</code></pre>')
  })
})
