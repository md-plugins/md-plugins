---
title: Steps Plugin
desc: Render wizard-like numbered steps in Markdown.
related:
  - md-plugins/steps/advanced
  - vite-plugins/vite-md-plugin/overview
---

The Steps plugin turns a `::: steps` container into a sequence of numbered step blocks. Use it for install flows, migrations, tutorials, setup guides, and release checklists where readers need to follow a clear order.

## Name

The official NPM name is `@md-plugins/md-plugin-steps`.

## Installation

You can install the Steps plugin using npm, yarn, pnpm, or bun. Choose your preferred method below:

```tabs
<<| bash [icon=pnpm] pnpm |>>
pnpm add @md-plugins/md-plugin-steps
<<| bash [icon=bun] bun |>>
bun add @md-plugins/md-plugin-steps
<<| bash [icon=yarn] yarn |>>
yarn add @md-plugins/md-plugin-steps
<<| bash [icon=npm] npm |>>
npm install @md-plugins/md-plugin-steps
```

Q-Press and `viteMdPlugin` include the Steps plugin by default. Install it directly only when you own the raw Markdown-It instance yourself.

## Basic Usage

Author each step as a heading inside the `steps` container. The heading becomes the step title, and the Markdown that follows becomes the step body.

::: steps

## Choose the container

Wrap ordered instructions in a `::: steps` container when the reader should complete tasks in sequence.

## Register the plugin

Q-Press and `viteMdPlugin` include the Steps plugin by default. If you own a raw Markdown-It instance, install the package and register `stepsPlugin` directly.

## Write the guide

Use headings for each step title. The plugin turns each heading and its following Markdown into a numbered step.
:::

The Markdown for the example above looks like this:

```md
::: steps

## Choose the container

Wrap ordered instructions in a `::: steps` container when the reader should complete tasks in sequence.

## Register the plugin

Q-Press and `viteMdPlugin` include the Steps plugin by default. If you own a raw Markdown-It instance, install the package and register `stepsPlugin` directly.

## Write the guide

Use headings for each step title. The plugin turns each heading and its following Markdown into a numbered step.
:::
```

## Markdown-It Setup

Q-Press and `viteMdPlugin` include `@md-plugins/md-plugin-steps` in the default Markdown-It stack, so `::: steps` works without extra configuration in generated Q-Press docs sites.

If you own a raw Markdown-It instance instead, install and register the plugin directly:

```ts
import MarkdownIt from 'markdown-it'
import { stepsPlugin } from '@md-plugins/md-plugin-steps'

const md = new MarkdownIt()

md.use(stepsPlugin)
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
