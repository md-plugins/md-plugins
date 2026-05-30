---
title: Mermaid Advanced Topics
desc: Mermaid plugin options and integration details.
---

The Mermaid plugin is small, but it has two different integration paths:

- **Component mode** is the Q-Press default. It emits `MarkdownMermaid` and lets Vue render Mermaid on the client.
- **Pre mode** emits a plain `<pre class="mermaid">` block for custom MarkdownIt pipelines.

## Options

| Option          | Type         | Default              | Description                                  |
| --------------- | ------------ | -------------------- | -------------------------------------------- | ------------------------- |
| `languages`     | `string[]`   | `['mermaid', 'mmd']` | Fence languages treated as Mermaid diagrams. |
| `renderMode`    | `'component' | 'pre'`               | `'component'`                                | Output mode for diagrams. |
| `componentName` | `string`     | `'MarkdownMermaid'`  | Component used in component mode.            |
| `codeProp`      | `string`     | `'code'`             | Component prop that receives Mermaid source. |
| `preClass`      | `string`     | `'mermaid'`          | CSS class used in pre mode.                  |
| `pageScripts`   | `string[]`   | Q-Press import       | Imports added to generated Vue pages.        |

## Component Mode

Use component mode when Markdown output is compiled into Vue components:

```ts
import MarkdownIt from 'markdown-it'
import { mermaidPlugin } from '@md-plugins/md-plugin-mermaid'

const md = new MarkdownIt()
md.use(mermaidPlugin, {
  componentName: 'MarkdownMermaid',
  codeProp: 'code',
})
```

Component mode adds this import to the generated page when a Mermaid fence is found:

```ts
import MarkdownMermaid from '@/.q-press/components/MarkdownMermaid.vue'
```

## Pre Mode

Use pre mode when your app has its own Mermaid bootstrapping:

```ts
import MarkdownIt from 'markdown-it'
import { mermaidPlugin } from '@md-plugins/md-plugin-mermaid'

const md = new MarkdownIt()
md.use(mermaidPlugin, {
  renderMode: 'pre',
  preClass: 'mermaid',
})
```

Then run Mermaid after the HTML is mounted:

```ts
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false })
await mermaid.run({ querySelector: '.mermaid' })
```

## Security

The Q-Press `MarkdownMermaid` component initializes Mermaid with `securityLevel: 'strict'`. Keep that unless you have a specific reason to allow looser rendering.
