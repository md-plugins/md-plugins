import { describe, expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import { stepsPlugin } from '../src/md-plugin-steps'

describe('stepsPlugin', () => {
  it('renders headings inside a steps container as numbered steps', () => {
    const md = new MarkdownIt()

    md.use(stepsPlugin)

    const input = `
::: steps
## Install package

Run the install command.

## Configure plugin

Update your Markdown-It setup.
:::
    `.trim()

    const output = md.render(input).trim()

    expect(output).toContain('<div class="markdown-steps" role="list">')
    expect(output).toContain('<div class="markdown-step__marker" aria-hidden="true">1</div>')
    expect(output).toContain('<h3 class="markdown-step__title">Install package</h3>')
    expect(output).toContain('<p>Run the install command.</p>')
    expect(output).toContain('<div class="markdown-step__marker" aria-hidden="true">2</div>')
    expect(output).toContain('<h3 class="markdown-step__title">Configure plugin</h3>')
    expect(output).not.toContain('<h2>Install package</h2>')
  })

  it('preserves nested lists and code fences inside step content', () => {
    const md = new MarkdownIt()

    md.use(stepsPlugin)

    const input = `
::: steps
### Create files

- Add a README.
- Add package metadata.

### Build

\`\`\`bash
pnpm build
\`\`\`
:::
    `.trim()

    const output = md.render(input).trim()

    expect(output).toContain('<li>Add a README.</li>')
    expect(output).toContain('<pre><code class="language-bash">pnpm build')
  })

  it('preserves content before the first step', () => {
    const md = new MarkdownIt()

    md.use(stepsPlugin)

    const input = `
::: steps
Read this before starting.

## First step

Continue here.
:::
    `.trim()

    const output = md.render(input).trim()

    expect(output).toContain('<p>Read this before starting.</p>')
    expect(output).toContain('<h3 class="markdown-step__title">First step</h3>')
  })

  it('supports alternate marker syntax', () => {
    const md = new MarkdownIt()

    md.use(stepsPlugin)

    const input = `
::: steps
%step% First marker

Alternate marker content.

%step% Second marker

More content.
:::
    `.trim()

    const output = md.render(input).trim()

    expect(output).toContain('<h3 class="markdown-step__title">First marker</h3>')
    expect(output).toContain('<p>Alternate marker content.</p>')
    expect(output).toContain('<h3 class="markdown-step__title">Second marker</h3>')
    expect(output).not.toContain('%step%')
  })

  it('allows custom classes and title tag', () => {
    const md = new MarkdownIt()

    md.use(stepsPlugin, {
      stepsClass: 'docs-steps',
      stepClass: 'docs-step',
      stepMarkerClass: 'docs-step__marker',
      stepContentClass: 'docs-step__body',
      stepTitleClass: 'docs-step__heading',
      titleTag: 'h4',
    })

    const input = `
::: steps
## Custom step

Custom content.
:::
    `.trim()

    const output = md.render(input).trim()

    expect(output).toContain('<div class="docs-steps" role="list">')
    expect(output).toContain('<section class="docs-step" role="listitem">')
    expect(output).toContain('<div class="docs-step__marker" aria-hidden="true">1</div>')
    expect(output).toContain('<div class="docs-step__body">')
    expect(output).toContain('<h4 class="docs-step__heading">Custom step</h4>')
  })
})
