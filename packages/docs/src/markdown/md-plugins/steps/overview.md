---
title: Steps Plugin
desc: Render wizard-like numbered steps in Markdown.
related:
  - md-plugins/steps/advanced
  - vite-plugins/vite-md-plugin/overview
---

The Steps plugin turns a `::: steps` container into a sequence of numbered step blocks. Use it for install flows, migrations, tutorials, setup guides, and release checklists where readers need to follow a clear order.

## Basic Usage

Author each step as a heading inside the `steps` container. The heading becomes the step title, and the Markdown that follows becomes the step body.

::: steps

## Install the package

Add the package with your preferred package manager.

```bash
pnpm add @md-plugins/md-plugin-steps
```

## Register the plugin

Pass the plugin to Markdown-It or to `viteMdPlugin` through `config.markdownItPlugins`.

```ts
import { stepsPlugin } from '@md-plugins/md-plugin-steps'

md.use(stepsPlugin)
```

## Write the guide

Wrap the ordered instructions in a `::: steps` container and let the plugin create the numbered layout.
:::

The Markdown for the example above looks like this:

````md
::: steps

## Install the package

Add the package with your preferred package manager.

```bash
pnpm add @md-plugins/md-plugin-steps
```

## Register the plugin

Pass the plugin to Markdown-It or to `viteMdPlugin` through `config.markdownItPlugins`.

```ts
import { stepsPlugin } from '@md-plugins/md-plugin-steps'

md.use(stepsPlugin)
```

## Write the guide

Wrap the ordered instructions in a `::: steps` container and let the plugin create the numbered layout.
:::
````

## Setup

```ts
import MarkdownIt from 'markdown-it'
import { stepsPlugin } from '@md-plugins/md-plugin-steps'

const md = new MarkdownIt()

md.use(stepsPlugin)
```

For Q-Press or `viteMdPlugin`, register it as an additional Markdown-It plugin:

```ts
import { stepsPlugin } from '@md-plugins/md-plugin-steps'
import { viteMdPlugin } from '@md-plugins/vite-md-plugin'

viteMdPlugin({
  path: './src/markdown',
  menu: [],
  config: {
    markdownItPlugins: [stepsPlugin],
  },
})
```

## Alternate Marker Syntax

Headings are the preferred syntax because they are easier to scan and edit. If a heading would disrupt the document structure, enable the alternate marker syntax and start each step with `%step%`.

```md
::: steps
%step% Install the package

Add the package with your preferred package manager.

%step% Register the plugin

Pass the plugin to Markdown-It.
:::
```

The alternate marker syntax is enabled by default. You can disable it with `enableAlternateMarker: false`.
