---
title: Q-Press Advanced Topics
desc: Advanced Topics for the Q-Press App Extension.
examples: QAvatar
related:
  - vite-plugins/vite-examples-plugin/overview
---

Q-Press has two advanced content workflows that turn Markdown pages into richer documentation:

- **Live examples** render Vue files from `src/examples`.
- **API cards** render Quasar-style JSON metadata through `MarkdownApi`.

Here are both workflows on the same page using Quasar's `QAvatar` component:

<script import>
import AvatarApi from 'quasar/dist/api/QAvatar.json'
</script>

<MarkdownApi :api="AvatarApi" name="QAvatar"/>

<MarkdownExample title="Title for example card" file="BasicExample" no-edit no-github/>

## Live Examples

Live examples are resolved through the `examples` frontmatter key and `MarkdownExample`.

The folder contract is:

```txt
src/markdown/quasar-components/avatar.md
src/examples/QAvatar/BasicExample.vue
src/examples/QAvatar/DenseExample.vue
```

In the frontmatter of your Markdown file, specify the matching topic folder:

```yaml
examples: QAvatar
```

Then add an example card in Markdown:

```markdown
<MarkdownExample title="Title for example card" file="BasicExample" no-edit no-github/>
```

The `file="BasicExample"` value is the Vue filename without the `.vue` extension. Because the page frontmatter says `examples: QAvatar`, Q-Press resolves the file from `src/examples/QAvatar/BasicExample.vue`.

### Common Example Mistakes

| Symptom                                | Check                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------- |
| The example card is empty              | Confirm the page frontmatter has `examples: FolderName`.                        |
| The example file is not found          | Confirm `file` omits `.vue` and matches the filename exactly.                   |
| CodePen output is missing dependencies | Configure `codepen` in `src/siteConfig/index.ts`.                               |
| The example only fails during SSG      | Guard browser-only APIs such as `window`, `document`, and element measurements. |

## API Cards

Q-Press API cards use the same general JSON shape as Quasar component API files. Import the JSON in a `<script import>` block, then pass it to `MarkdownApi`:

```markdown
<script import >
import AvatarApi from 'quasar/dist/api/QAvatar.json'
</script>

<MarkdownApi :api="AvatarApi" name="QAvatar"/>
```

Q-Press ships API JSON for its own generated components under `src/.q-press/api/components`. You can use those files as a reference when creating API JSON for your own documentation components.

```markdown
<script import>
import MarkdownExampleApi from '@/.q-press/api/components/MarkdownExample.json'
</script>

<MarkdownApi :api="MarkdownExampleApi" name="MarkdownExample"/>
```

API cards are most useful when a component has enough props, slots, or events that prose would become hard to scan.

## viteExamplesPlugin

### Installation

You can install the Vite Examples plugin using npm, yarn, pnpm, or bun. Choose your preferred method below:

```tabs
<<| bash pnpm |>>
pnpm add @md-plugins/vite-examples-plugin
<<| bash bun |>>
bun add @md-plugins/vite-examples-plugin
<<| bash yarn |>>
yarn add @md-plugins/vite-examples-plugin
<<| bash npm |>>
npm install @md-plugins/vite-examples-plugin
```

### Quasar Configuration

To use the Vite Examples plugin with Quasar, you can extend the Vite configuration as follows:

```ts
import { viteExamplesPlugin, viteManualChunks } from '@md-plugins/vite-examples-plugin'

extendViteConf(viteConf, { isClient }) {
  if (ctx.prod && isClient) {
    viteConf.build = viteConf.build || {}
    viteConf.build.chunkSizeWarningLimit = 650
    viteConf.build.rolldownOptions = viteConf.build.rolldownOptions || {}
    viteConf.build.rolldownOptions.output = viteConf.build.rolldownOptions.output || {}
    viteConf.build.rolldownOptions.output.codeSplitting = {
      groups: [
        {
          name: (moduleId) => viteManualChunks(moduleId) ?? null,
        },
      ],
    }
  }
}

vitePlugins: [
  viteExamplesPlugin({
    isProd: ctx.prod,
    path: ctx.appPaths.srcDir + '/examples',
  }),
  // other plugins...
]
```

## Static Site Generation

Q-Press includes a first-class static generation workflow for docs sites that need route-specific HTML, crawler-friendly metadata, and static-host deployment without requiring a runtime SSR server.

See [Q-Press SSG](/quasar-app-extensions/qpress/ssg) for the full runner workflow, CLI flags, output behavior, optional Quasar SSR renderer, reports, and browser-only content guidance.

## Where To Go Next

Use the [viteExamplesPlugin](/vite-plugins/vite-examples-plugin/overview) docs when you need deeper example-source behavior, use [Q-Press SSG](/quasar-app-extensions/qpress/ssg) for docs-site prerendering, and use the [viteSsgPlugin](/vite-plugins/vite-ssg-plugin/overview) docs when you need lower-level SSG control outside the generated Q-Press runner.
