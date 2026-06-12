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

## Q-Press SSG Runner

Q-Press projects can prerender docs routes with the generated scripts:

```bash
pnpm build:ssg
pnpm prerender:ssg
pnpm preview:ssg
```

The `qpress-ssg` command reads `dist/spa/q-press-ssg-routes.json`, loads the generated Q-Press SSG app factory from `src/.q-press/ssg/create-app.ts`, renders each route at build time, and writes the prerendered HTML back into the SPA output folder. It does not require Quasar SSR mode.

```bash
qpress-ssg --out-dir dist/spa
```

Use `--out-dir` when the project wants the generated files somewhere other than the default
`dist/spa`. Q-Press does not require a `dist/ssg` convention.

To verify the generated static output locally from the repository root, build the docs package and serve the prerendered SPA output with Quasar's history fallback:

```bash
pnpm --dir packages/docs build:ssg
cd packages/docs
pnpm preview:ssg
```

The generated `preview:ssg` script uses Quasar's static server with the `--history` flag because
Q-Press docs use Vue Router history mode. That keeps refreshed deep links such as
`/vite-plugins/vite-ssg-plugin/advanced` working during local testing.

The runner has additional controls for larger docs sites:

```bash
qpress-ssg \
  --crawl-links \
  --concurrency 4 \
  --interval 250 \
  --exclude /drafts/private \
  --report-file q-press-ssg-report.json
```

By default, Q-Press merges static routes from `src/router/routes.ts`, follows renderer redirects,
skips renderer 404s, and writes a JSON generation report. Use `--no-router-routes`,
`--redirects error`, `--not-found error`, or `--no-report` when a project needs stricter behavior.

If a project already has Quasar SSR mode enabled and wants to reuse that renderer instead, build the renderer and opt in explicitly:

```bash
pnpm build:ssg:renderer
qpress-ssg --renderer quasar-ssr --out-dir dist/spa --ssr-dir dist/ssr
```

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

The generated factory is intentionally reusable instead of being tied to a single script. Run it from build tooling that understands the docs app's TypeScript, Vue, and alias configuration when the built `qpress-ssg` command is not enough.

## Where To Go Next

Use the [viteExamplesPlugin](/vite-plugins/vite-examples-plugin/overview) docs when you need deeper example-source behavior, and use the [viteSsgPlugin](/vite-plugins/vite-ssg-plugin/overview) docs when you need lower-level SSG control outside the generated Q-Press runner.
