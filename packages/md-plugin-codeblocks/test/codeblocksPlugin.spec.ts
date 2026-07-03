import MarkdownIt from 'markdown-it'
import { codeblocksPlugin } from '../src/md-plugin-codeblocks'
import { describe, it, expect } from 'vitest'

describe('codeblocksPlugin', () => {
  it('adds syntax highlighting for a specific language', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin, {
      containerComponent: 'MarkdownPrerender',
      copyButtonComponent: 'MarkdownCopyButton',
      preClass: 'markdown-code',
    })

    const markdownInput = `
\`\`\`js
console.log('Hello, world!');
\`\`\`
      `.trim()

    const renderedHTML = md.render(markdownInput)

    // Check for container component
    expect(renderedHTML).toContain('<MarkdownPrerender>')
    expect(renderedHTML).toContain('</MarkdownPrerender>')

    // Check for syntax highlighting
    expect(renderedHTML).toContain('<pre v-pre class="shiki')
    expect(renderedHTML).toContain('markdown-code')
    expect(renderedHTML).toContain('<code>')
    expect(renderedHTML).toContain('--shiki-light')
    expect(renderedHTML).toContain('console.')
    expect(renderedHTML).toContain("'Hello, world!'")

    // Check for copy button
    expect(renderedHTML).toContain('<MarkdownCopyButton')
    expect(renderedHTML).toContain(`code="console.log('Hello, world!');"`)
  })

  it('applies a default language when none is specified', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin, {
      defaultLang: 'markup',
      containerComponent: 'MarkdownPrerender',
      copyButtonComponent: 'MarkdownCopyButton',
      preClass: 'markdown-code',
    })

    const markdownInput = `
\`\`\`
<div>Hello, world!</div>
\`\`\`
      `.trim()

    const renderedHTML = md.render(markdownInput)

    expect(renderedHTML).toContain('<MarkdownPrerender>')
    expect(renderedHTML).toContain('<pre v-pre class="shiki')
    expect(renderedHTML).toContain('markdown-code')
    expect(renderedHTML).toContain('<MarkdownCopyButton')
  })

  it('handles highlighted lines correctly', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin, {
      containerComponent: 'MarkdownPrerender',
      copyButtonComponent: 'MarkdownCopyButton',
      preClass: 'markdown-code',
    })

    const markdownInput = `
\`\`\` js [highlight=2]
console.log('Line 1');
console.log('Line 2');
console.log('Line 3');
\`\`\`
      `.trim()

    const renderedHTML = md.render(markdownInput)

    // console.log('renderedHTML:', renderedHTML)

    expect(renderedHTML).toContain('<MarkdownPrerender>')
    expect(renderedHTML).toContain('<span class="c-line line-highlight">')
  })

  it('renders Twoslash output when explicitly enabled with bracket attrs', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin)

    const markdownInput = `
\`\`\`ts [twoslash]
const count = 1
//    ^?
\`\`\`
      `.trim()

    const renderedHTML = md.render(markdownInput)

    expect(renderedHTML).toContain('twoslash')
    expect(renderedHTML).toContain('twoslash-popup-code')
    expect(renderedHTML).toContain('count')
    expect(renderedHTML).toContain(':')
    expect(renderedHTML).toContain('code="const count = 1')
    expect(renderedHTML).not.toContain('twoslash-popup-code" />')
  })

  it('renders Twoslash output when enabled with a bare meta flag', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin)

    const markdownInput = `
\`\`\`ts twoslash Type query
const enabled = true
//    ^?
\`\`\`
      `.trim()

    const renderedHTML = md.render(markdownInput)

    expect(renderedHTML).toContain('<MarkdownPrerender title="Type query">')
    expect(renderedHTML).toContain('twoslash-popup-code')
    expect(renderedHTML).not.toContain('title="twoslash')
  })

  it('applies minimum and maximum height styles from fence attrs', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin)

    const markdownInput = `
\`\`\`ts [minheight=12rem maxheight=30rem]
const selected = true
\`\`\`
      `.trim()

    const renderedHTML = md.render(markdownInput)

    expect(renderedHTML).toContain('min-height:12rem')
    expect(renderedHTML).toContain('max-height:30rem')
  })

  it('renders tabbed code blocks with multiple tabs and attributes', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin, {
      containerComponent: 'MarkdownPrerender',
      tabPanelTagName: 'q-tab-panel',
      tabPanelTagClass: 'q-pa-none',
      preClass: 'markdown-code',
    })

    const markdownInput = `
\`\`\`tabs quasar.config file
<<| js One |>>
export default function (ctx) { // can be async too
console.log(ctx);
}
<<| js [numbered] Two (numbered) |>>
const x = {
  dev: true,
  prod: false
}
<<| diff Three (with diff) |>>
{
  min: 0
- super: false
+ super: true
  max: 100
}
\`\`\`
      `.trim()

    const renderedHTML = md.render(markdownInput)

    // Verify rendered tabs
    expect(renderedHTML).toContain('<MarkdownPrerender title="quasar.config file"')
    expect(renderedHTML).toContain('<q-tab-panel class="q-pa-none" name="One">')
    expect(renderedHTML).toContain('<q-tab-panel class="q-pa-none" name="Two (numbered)">')
    expect(renderedHTML).toContain('<q-tab-panel class="q-pa-none" name="Three (with diff)">')

    // Verify tab contents
    expect(renderedHTML).toContain('export')
    expect(renderedHTML).toContain('<span class="c-lpref">')
    expect(renderedHTML).toContain('true')
    expect(renderedHTML).toContain('<span class="c-line line-add"></span>')
    expect(renderedHTML).toContain('<span class="c-line line-rem"></span>')
  })

  it('applies minheight to tabbed code block panels', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin, {
      containerComponent: 'MarkdownPrerender',
      tabPanelTagName: 'q-tab-panel',
      tabPanelTagClass: 'q-pa-none',
      preClass: 'markdown-code',
    })

    const markdownInput = `
\`\`\`tabs
<<| js [minheight=9rem] One |>>
console.log('one')
<<| ts Two |>>
const two = 2
\`\`\`
      `.trim()

    const renderedHTML = md.render(markdownInput)

    expect(renderedHTML).toContain('<q-tab-panel class="q-pa-none" name="One">')
    expect(renderedHTML).toContain('min-height:9rem')
  })

  it('falls back gracefully for unsupported languages', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin)

    const markdownInput = `
\`\`\`unsupported-lang
some random code
\`\`\`
        `.trim()

    const renderedHTML = md.render(markdownInput)

    expect(renderedHTML).toContain('<pre v-pre class="shiki')
    expect(renderedHTML).toContain('markdown-code')
    expect(renderedHTML).toContain('<code>')
  })

  it('handles magic comments for add/remove/highlight', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin)

    const markdownInput = `
\`\`\`javascript
[[! add]]
console.log('Added Line');
[[! rem]]
console.log('Removed Line');
console.log('Normal Line');
\`\`\`
        `.trim()

    const renderedHTML = md.render(markdownInput)

    expect(renderedHTML).toContain('<span class="c-line line-add">')
    expect(renderedHTML).toContain('<span class="c-line line-rem">')
    expect(renderedHTML).toContain(`<span class="c-lpref"> </span>`)
    expect(renderedHTML).toContain(`'Normal Line'`)
  })

  it('renders empty tabs gracefully with no content', () => {
    const md = new MarkdownIt()
    md.use(codeblocksPlugin, {
      containerComponent: 'MarkdownPrerender',
      tabPanelTagName: 'q-tab-panel',
      tabPanelTagClass: 'q-pa-none',
      preClass: 'markdown-code',
    })

    const markdownInput = `
\`\`\`tabs
<<| js Empty Tab |>>

<<| js Another Empty Tab |>>
\`\`\`
    `.trim()

    const renderedHTML = md.render(markdownInput)

    // Verify rendered tabs
    expect(renderedHTML).toContain('<MarkdownPrerender')
    expect(renderedHTML).toContain('<q-tab-panel class="q-pa-none" name="Empty Tab">')
    expect(renderedHTML).toContain('<q-tab-panel class="q-pa-none" name="Another Empty Tab">')

    // Verify the content of empty tabs contains a <pre> block and copy button
    expect(renderedHTML).toContain(
      '<q-tab-panel class="q-pa-none" name="Empty Tab"><pre v-pre class="shiki',
    )
    expect(renderedHTML).toContain(
      '<q-tab-panel class="q-pa-none" name="Another Empty Tab"><pre v-pre class="shiki',
    )
  })
})
