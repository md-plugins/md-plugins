---
title: Q-Press CodePen
desc: Configure CodePen output for Q-Press Markdown examples.
related:
  - quasar-app-extensions/qpress/site-config
  - quasar-app-extensions/qpress/markdown-features
---

`codepen` is used by `MarkdownExample` when a live example opens in CodePen. Keep CodePen setup in Site Config rather than hard-coding dependencies into each example.

## Basic Config

```ts [twoslash]
const codepen = {
  titleSuffix: ' - Q-Press Example',
  jsPreProcessor: 'typescript',
  globalPackages: [
    {
      packageName: 'quasar',
      globalName: 'Quasar',
    },
  ],
}
```

## External Resources

Use `cssExternal`, `jsExternal`, or `head` when examples need shared assets:

```ts
const codepen = {
  cssExternal: ['https://cdn.jsdelivr.net/npm/quasar@latest/dist/quasar.prod.css'],
  jsExternal: ['https://cdn.jsdelivr.net/npm/quasar@latest/dist/quasar.umd.prod.js'],
  head: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
}
```

Use `globalPackages` when Q-Press should derive CodePen package resources from npm package names and globals.

## Package Strategy

Prefer browser-ready UMD or IIFE assets when a library provides them. Avoid relying on `esm.sh` conversion for packages that already publish browser globals.

For examples that need ESM-only packages, use `modulePackages` and an explicit import URL:

```ts
const codepen = {
  modulePackages: [
    {
      packageName: '@scope/package-name',
      importUrl: 'https://esm.sh/@scope/package-name',
    },
  ],
}
```

Keep this list small. If many examples need the same package, it probably belongs in the shared CodePen config.

## Example Cards

CodePen links are controlled by `MarkdownExample` props and the page's `examples` frontmatter:

```yaml
---
title: Button Examples
examples: QBtn
---
```

```md
<MarkdownExample title="Basic" file="Basic" />
```

Use `no-codepen` on an example only when the example depends on local-only assets, browser APIs, or setup that cannot work in CodePen.
