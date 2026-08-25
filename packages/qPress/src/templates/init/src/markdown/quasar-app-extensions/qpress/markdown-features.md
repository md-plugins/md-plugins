---
title: Q-Press Markdown Features
desc: Use Markdown syntax and Q-Press components for docs content.
related:
  - md-plugins/codeblocks/overview
  - md-plugins/containers/overview
  - quasar-app-extensions/qpress/components
scope:
  fileTree:
    l: src
    c:
      - l: markdown
        c:
          - l: getting-started.md
      - l: examples
        c:
          - l: BasicExample.vue
      - l: siteConfig
        c:
          - l: index.ts
---

Q-Press uses the md-plugins Markdown pipeline plus generated Vue components. Keep plain prose in Markdown syntax, and use Q-Press components when a page needs live examples, API cards, cards, file trees, or static-render controls.

## Markdown Plugins vs Q-Press Components

| Use                                             | Prefer                               |
| ----------------------------------------------- | ------------------------------------ |
| Tabbed install commands or grouped code samples | Codeblocks plugin and ```tabs syntax |
| Notes, warnings, tips, and details              | Containers plugin                    |
| Tables                                          | Table plugin                         |
| Mermaid diagrams                                | Mermaid plugin                       |
| Step-by-step instructions                       | Steps plugin                         |
| Live Vue demos                                  | `MarkdownExample`                    |
| API reference cards                             | `MarkdownApi`                        |
| Related page cards                              | `MarkdownCardLink`                   |
| File trees                                      | `MarkdownTree`                       |

Use the [MD Plugins](/md-plugins/codeblocks/overview) pages for plugin-specific syntax. Use [Components](/quasar-app-extensions/qpress/components) for generated Q-Press component APIs.

## Tabbed Code Blocks

Use ```tabs for install commands or alternate code samples:

````md
```tabs
<<| bash [icon=pnpm] pnpm |>>
pnpm add @md-plugins/vite-md-plugin
<<| bash [icon=bun] bun |>>
bun add @md-plugins/vite-md-plugin
<<| bash [icon=yarn] yarn |>>
yarn add @md-plugins/vite-md-plugin
<<| bash [icon=npm] npm |>>
npm install @md-plugins/vite-md-plugin
```
````

The explicit `icon` attribute adds the bundled package-manager icon without removing the accessible text label. See [Codeblocks](/md-plugins/codeblocks/overview) for advanced tab labels, titles, and code-block options.

## Callouts And Details

Use containers for prose-oriented callouts:

```md
::: tip
Use Q-Press components when Markdown alone would become hard to scan.
:::

::: warning
Keep generated `src/.q-press` files close to the installed template unless you are intentionally carrying a local fork.
:::

:::details Why does this matter?
Generated files are refreshed when you invoke the extension.
:::
```

See [Containers](/md-plugins/containers/overview) for supported container types and styling options.

## File Trees

Use `MarkdownTree` when a folder structure is clearer than prose. Put the tree data in the page frontmatter `scope`, then pass it to the component from Markdown:

```yaml
scope:
  fileTree:
    l: src
    c:
      - l: markdown
        c:
          - l: getting-started.md
      - l: examples
        c:
          - l: BasicExample.vue
      - l: siteConfig
        c:
          - l: index.ts
```

```vue
<MarkdownTree :def="scope.fileTree" />
```

Rendered result:

<MarkdownTree :def="scope.fileTree" />

`MarkdownTree` is useful for generated file layouts, app-extension templates, package build output, and examples that need to show where files belong. The frontmatter `scope` approach is preferred for trees because large inline object props inside Markdown HTML can be hard to read and are easier to break while editing.

## Live Examples

Live examples are resolved through the `examples` frontmatter key and `MarkdownExample`.

```txt
src/markdown/quasar-components/avatar.md
src/examples/QAvatar/BasicExample.vue
```

```yaml
examples: QAvatar
```

```md
<MarkdownExample title="Basic" file="BasicExample" />
```

The `file` value is the Vue filename without the `.vue` extension.

## API Cards

Import API JSON in a `<script import>` block, then pass it to `MarkdownApi`:

```md
<script import>
import MarkdownExampleApi from '@/.q-press/api/components/MarkdownExample.json'
</script>

<MarkdownApi :api="MarkdownExampleApi" name="MarkdownExample" />
```

Use [API JSON](/quasar-app-extensions/qpress/api-json) when TypeScript and JSDoc should generate the JSON instead of maintaining it by hand.

## Card Links

Use `MarkdownCardLink` for compact related-resource cards:

```md
<MarkdownCardLink
  title="Q-Press CLI"
  desc="Validate, generate API JSON, and prerender Q-Press docs."
  to="/quasar-app-extensions/qpress/cli"
/>
```

Keep larger custom landing-page layouts as Vue components or page-scoped markup instead of inventing new Markdown syntax.
