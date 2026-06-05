---
title: Q-Press Advanced Topics
desc: Advanced Topics for the Q-Press App-Extension.
examples: QAvatar
related:
  - vite-plugins/vite-examples-plugin/overview
---

If you plan on having `api` and `examples` support in your markdown files, we will discuss making the necessary updates to support that. If you don't know what `api` and `examples` are, here are examples for Quasar's `QAvatar` component:

<script import>
import AvatarApi from 'quasar/dist/api/QAvatar.json'
</script>

<MarkdownApi :api="AvatarApi" name="QAvatar"/>

<MarkdownExample title="Title for example card" file="BasicExample" no-edit no-github/>

## Usage

You will need to make sure you have the necessary components installed as outlined further down in the [Installation](#installation) section.

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
We will touch on this at a later date. For now, you can look at the Api folder in the .q-press folder.
:::

```markdown
<script import >
import AvatarApi from 'quasar/dist/api/QAvatar.json'
</script>

<MarkdownApi :api="AvatarApi" name="QAvatar"/>
```

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

## Q-Press SSG Runner

Q-Press projects can prerender docs routes with the generated scripts:

```bash
pnpm build:ssg:renderer
pnpm build:ssg
pnpm prerender:ssg
```

The `qpress-ssg` command reads `dist/spa/q-press-ssg-routes.json`, imports the built Quasar SSR
renderer from `dist/ssr/server/server-entry.js`, renders each route, and writes the prerendered
HTML back into the SPA output folder.

```bash
qpress-ssg --out-dir dist/spa --ssr-dir dist/ssr
```

`build:ssg:renderer` requires Quasar SSR mode. If a docs app has never enabled SSR before, run `quasar mode add ssr` once, build the renderer again, and keep deploying the generated `dist/spa` folder as static output.

Q-Press also keeps lower-level helpers available for custom build tooling:

- `src/.q-press/ssg/create-app`: Creates a fresh Vue SSR app for each route, installs Quasar with
  the Q-Press plugins, resolves the host Pinia store and router, and prepares a Quasar-style
  `ssrContext`.
- `src/.q-press/ssg/prerender`: Wraps `prerenderVueSsgRoutes()` with the generated Q-Press app
  factory.

If a project needs to customize the per-route SSR context or Quasar options, use the generated
wrapper and pass `createAppOptions`:

```ts
await prerenderQPressSsgRoutes({
  outDir: 'dist/spa',
  createAppOptions(route) {
    return {
      ssrContext: {
        url: route.path,
        req: {
          url: route.path,
          headers: {
            cookie: 'theme=dark',
          },
        },
      },
    }
  },
})
```

For lower-level control, import `createQPressSsgApp` directly and pass it to `prerenderVueSsgRoutes()` from `@md-plugins/vite-ssg-plugin`.

```ts
import { prerenderVueSsgRoutes } from '@md-plugins/vite-ssg-plugin'
import { createQPressSsgApp } from './src/.q-press/ssg/create-app'

await prerenderVueSsgRoutes({
  outDir: 'dist/spa',
  createApp: createQPressSsgApp,
})
```

The generated factory is intentionally reusable instead of being tied to a single script. Run it
from build tooling that understands the docs app's TypeScript, Vue, and alias configuration when
the built `qpress-ssg` command is not enough.

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
