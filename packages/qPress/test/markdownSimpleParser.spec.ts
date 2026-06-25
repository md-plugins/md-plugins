import { describe, expect, it } from 'vitest'
import { parseMarkdownSimple } from '../src/templates/init/src/_q-press/components/MarkdownSimpleParser.js'

describe('MarkdownSimpleParser', () => {
  it('parses release-style markdown without structural break noise', () => {
    const html = parseMarkdownSimple(
      `## Documentation

---

::: tip Heads up
Run \`qpress check\` before publishing.
:::

| Command | Description |
| --- | --- |
| generate | Creates API JSON |

Fixed #42.
`,
      {
        issueUrl: 'https://github.com/example/project',
      },
    )

    expect(html).toContain('<div class="markdown-simple__heading text-h5">Documentation</div>')
    expect(html).toContain('<hr class="markdown-simple__rule">')
    expect(html).toContain('<div class="markdown-simple__container-title">Heads up</div>')
    expect(html).toContain('<code class="markdown-token">qpress check</code>')
    expect(html).toContain('<div class="q-markup-table')
    expect(html).toContain('href="https://github.com/example/project/issues/42"')

    expect(html).not.toContain('>---<')
    expect(html).not.toMatch(/<br><br><div class="markdown-simple__heading/)
    expect(html).not.toMatch(/<br><br><hr class="markdown-simple__rule">/)
    expect(html).not.toMatch(/<br><br><div class="markdown-simple__container/)
  })

  it('keeps fenced code content out of inline markdown parsing', () => {
    const html = parseMarkdownSimple(
      `Before

\`\`\`ts
const value = '#42 and **not bold**'
\`\`\`

After
`,
    )

    expect(html).toContain('<pre class="markdown-code markdown-simple__code"><code>')
    expect(html).toContain("const value = '#42 and **not bold**'")
    expect(html).not.toContain('issues/42')
    expect(html).not.toContain('<strong>not bold</strong>')
  })
})
