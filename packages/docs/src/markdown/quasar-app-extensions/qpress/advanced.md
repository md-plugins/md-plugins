---
title: Q-Press Advanced Topics
desc: Advanced Topics for the Q-Press App-Extension.
examples: QAvatar
related:
  - vite-plugins/viteexamplesplugin/overview
---

If you plan on having `api` and `examples` support in your markdown files, we will discuss making the necessary updates to support that. If you don't know what `api` and `examples` are, here are examples for Quasar's `QAvatar` component:

<script import>
import AvatarApi from 'quasar/dist/api/QAvatar.json'
</script>

<MarkdownApi :api="AvatarApi" name="QAvatar"/>

<MarkdownExample title="Title for example card" file="BasicExample" no-edit no-github/>

## Usage

You will need to make sure you have the necessary components installed as outlined further fown in the [Installation](#installation) section.

In your `src` folder, you should have an `examples` folder. Each child folder should be a topic, like a `QAvatar` folder. In this folder, you will add your examples.

In the `frontmatter` of your markdown file, you will need to specify the topic folder like so:

```yaml
examples: QAvatar
```

In your markdown file, you can add the following to create an `example` card:

::: tip
The `file="BasicExample"` is the name of the Vue file (without extension) in the `examples/QAvatar` folder.
:::

```markdown
<MarkdownExample title="Title for example card" file="BasicExample" no-edit no-github/>
```

In your markdown file, you can add the following to create an `api` card:

::: tip
The API format conforms to Quasar's API format.
We will touch on this at a later date.
:::

```markdown
<script import>
import AvatarApi from 'quasar/dist/api/QAvatar.json'
</script>

<MarkdownApi :api="AvatarApi" name="QAvatar"/>
```

## viteExamplesPlugin

### Installation

You can install the Vite Examples plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/vite-examples-plugin
<<| bash yarn |>>
yarn add @md-plugins/vite-examples-plugin
<<| bash pnpm |>>
pnpm add @md-plugins/vite-examples-plugin
```

### Quasar Configuration

To use the Vite Examples plugin with Quasar, you can extend the Vite configuration as follows:

```ts
import { viteExamplesPlugin, viteManualChunks } from '@md-plugins/vite-examples-plugin'

extendViteConf(viteConf, { isClient }) {
  if (ctx.prod && isClient) {
    viteConf.build = viteConf.build || {}
    viteConf.build.chunkSizeWarningLimit = 650
    viteConf.build.rollupOptions = {
      output: { manualChunks: viteManualChunks },
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

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
