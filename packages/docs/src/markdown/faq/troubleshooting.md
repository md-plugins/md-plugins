---
title: Troubleshooting FAQ
desc: Common problems and fixes for MD-Plugins and Q-Press.
keys: FAQ
---

## Troubleshooting

:::details Q. My Markdown content is not rendering correctly. What should I check first?

**A.** Confirm that the package is installed, the plugin is registered with MarkdownIt or Vite, and your generated Q-Press files are current. If you recently upgraded Q-Press, run `quasar ext invoke @md-plugins/q-press`.
:::

:::details Q. I upgraded Q-Press and now browser code says `process is not defined`. What changed?

**A.** Quasar CLI Vite 3 expects browser-side code to use `import.meta.env` instead of `process.env`. Refresh generated Q-Press files with `quasar ext invoke @md-plugins/q-press` and choose `Overwrite All` if you want the current templates.
:::

:::details Q. How do I report a bug or request a feature?

**A.** Open an issue in the MD-Plugins repository and include the package name, version, reproduction steps, expected result, and actual result.
:::

:::details Q. Where is the full FAQ?

**A.** The main FAQ lives at [Frequently Asked Questions](/other/faq).
:::
