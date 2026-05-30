---
title: Best Practices FAQ
desc: Recommended setup and maintenance practices for MD-Plugins.
keys: FAQ
---

## Best Practices

:::details Q. Should I install every MD-Plugins package?

**A.** No. Install the packages you actually use. Q-Press pulls together the generated documentation-site pieces for Quasar projects, while direct Vite or MarkdownIt projects can stay smaller by installing only the plugin packages they need.
:::

:::details Q. Should I edit generated Q-Press files directly?

**A.** Keep project-specific content in your app where possible, and treat generated `src/.q-press` files as replaceable. If you need the latest templates, update the package and run `quasar ext invoke @md-plugins/q-press`.
:::

:::details Q. How should I handle Q-Press themes?

**A.** Import one Q-Press theme in `src/css/quasar.variables.scss` or `src/css/quasar.variables.sass`, then put project-specific overrides below that import. This keeps theme defaults predictable.
:::

:::details Q. Where is the full FAQ?

**A.** The main FAQ lives at [Frequently Asked Questions](/other/faq).
:::
