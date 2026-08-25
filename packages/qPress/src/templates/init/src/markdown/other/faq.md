---
title: Frequently Asked Questions
desc: Common questions and answers about MD-Plugins.
keys: Other
---

Use this page to quickly scan the questions people tend to ask while setting up MD-Plugins, Q-Press, and the direct Vite plugins.

## General

:::details Q. What are MD-Plugins?

**A.** MD-Plugins are Markdown-it and Vite plugins that help turn Markdown into application-ready content. They cover things like headings, links, frontmatter, images, code blocks, examples, and Q-Press documentation sites.
:::

:::details Q. Can I use MD-Plugins without Quasar?

**A.** Yes. The individual Markdown-it plugins and direct Vite plugins can be used in non-Quasar projects. For example, `@md-plugins/vite-md-plugin` and `@md-plugins/vite-examples-plugin` can be used in Vue/Vite projects, and the `@md-plugins/md-plugin-*` packages can be used anywhere you configure MarkdownIt.

The Quasar-specific limitation only applies to app extensions, such as Q-Press. Those app extensions target Quasar CLI Vite projects and are not intended for Webpack or JavaScript-only Quasar projects.
:::

:::details Q. Which package should I start with?

**A.** Use `@md-plugins/quasar-app-extension-q-press` if you want the full Q-Press documentation site experience inside a Quasar CLI Vite project.

Use `@md-plugins/vite-md-plugin` if you want Markdown pages or content in a Vue/Vite app without installing the Q-Press app extension.

Use the individual `@md-plugins/md-plugin-*` packages when you already own the MarkdownIt setup and only need specific behavior.
:::

## Installation And Updates

:::details Q. How do I install MD-Plugins?

**A.** Install the package that matches your integration path. For direct Vite plugin usage:

```tabs
<<| bash [icon=pnpm] pnpm |>>
pnpm add @md-plugins/vite-md-plugin
<<| bash Bun |>>
bun add @md-plugins/vite-md-plugin
<<| bash Yarn |>>
yarn add @md-plugins/vite-md-plugin
<<| bash [icon=npm] npm |>>
npm install @md-plugins/vite-md-plugin
```

For Q-Press in a Quasar CLI Vite project:

```bash
quasar ext add @md-plugins/q-press
```

Refer to the installation section for each package when you need package-specific options.
:::

:::details Q. How do I update an existing Q-Press project?

**A.** Update the app extension package, then invoke it so the generated files can be refreshed:

```bash
pnpm up @md-plugins/quasar-app-extension-q-press
quasar ext invoke @md-plugins/q-press
```

Choose `Overwrite All` if you want the generated `src/.q-press` files to match the current stable templates.
:::

:::details Q. Does Q-Press support Webpack projects?

**A.** No. Q-Press targets Quasar CLI Vite projects. The direct Markdown-it and Vite plugin packages are the right path for non-Quasar Vite projects.
:::

## Plugin Usage

:::details Q. How do I add custom classes to images?

**A.** Use the image plugin and pass the class through its options:

```ts
import MarkdownIt from 'markdown-it'
import { imagePlugin } from '@md-plugins/md-plugin-image'

const md = new MarkdownIt()

md.use(imagePlugin, {
  imageClass: 'custom-image-class',
})
```

:::

:::details Q. How do I extract and process frontmatter content?

**A.** Use the frontmatter plugin and read the generated frontmatter from the MarkdownIt environment:

```ts
import MarkdownIt from 'markdown-it'
import { frontmatterPlugin } from '@md-plugins/md-plugin-frontmatter'

const md = new MarkdownIt()

md.use(frontmatterPlugin, {
  grayMatterOptions: {
    excerpt: true,
    excerpt_separator: '<!-- more -->',
  },
  renderExcerpt: true,
})

const env = {}
const html = md.render(code, env)

console.log(env.frontmatter)
```

:::

:::details Q. How do I enhance code block rendering?

**A.** Use the codeblocks plugin. It can render syntax-highlighted code blocks, copy buttons, tabbed code blocks, line highlighting, and code-group metadata:

```ts
import MarkdownIt from 'markdown-it'
import { codeblocksPlugin } from '@md-plugins/md-plugin-codeblocks'

const md = new MarkdownIt()

md.use(codeblocksPlugin, {
  defaultLang: 'javascript',
  containerComponent: 'MarkdownPrerender',
  copyButtonComponent: 'MarkdownCopyButton',
})
```

:::

:::details Q. How do I convert Markdown links into Vue components?

**A.** Use the link plugin to render Markdown links as Vue routing components:

```ts
import MarkdownIt from 'markdown-it'
import { linkPlugin } from '@md-plugins/md-plugin-link'

const md = new MarkdownIt()

md.use(linkPlugin, {
  linkTag: 'RouterLink',
  linkToKeyword: 'to',
  pageScript: 'import { RouterLink } from "vue-router"',
})
```

:::

## Troubleshooting

:::details Q. My Markdown content is not rendering correctly. What should I check first?

**A.** Confirm that the package is installed, the plugin is registered with MarkdownIt or Vite, and your generated Q-Press files are current. If you recently upgraded Q-Press, run:

```bash
quasar ext invoke @md-plugins/q-press
```

Choose `Overwrite All` when you want the generated files to match the latest templates.
:::

:::details Q. Why does an image or icon briefly fill the screen when an SSG page loads?

**A.** The browser can paint server-rendered HTML before the site's external CSS is available. Q-Press includes critical first-paint sizing for Quasar icons, but project-owned images also need intrinsic `width` and `height` attributes so the browser can reserve the correct space immediately:

```vue
<img src="/app-logo.svg" alt="Project logo" class="hero-logo" width="120" height="120" />
```

Use dimensions with the image's real aspect ratio; responsive CSS can still change its displayed size. After upgrading Q-Press, run `quasar ext invoke @md-plugins/q-press`, choose `Overwrite All` to refresh generated templates, and rebuild the site.
:::

:::details Q. How do I report a bug or request a feature?

**A.** Open an issue in the MD-Plugins repository and include the package name, version, reproduction steps, expected result, and actual result.
:::

:::details Q. Where can I get support?

**A.** Start with the package documentation and FAQ. If you are blocked or found a bug, open a GitHub issue with enough detail for someone else to reproduce the problem.
:::
