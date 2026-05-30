---
title: Documentation
desc: Contribute to the documentation
keys: Contributing
---

Documentation improvements are welcome. MD-Plugins includes docs for individual Markdown plugins, Vite plugins, and Q-Press.

## Editing Pages

The easiest way to edit a page is with the **Edit this page on GitHub** link that appears near the bottom of most pages. That opens the exact source file on GitHub so you can propose the change with a pull request.

You can also fork the repository, edit the markdown files locally, and open a pull request.

## Writing Guidelines

Please keep this in mind when writing MD-Plugins docs:

- Speak directly to the user.
- Keep sentences and paragraphs focused.
- Prefer examples that can be copied into real projects.
- Mention package names and commands explicitly.
- Update related pages when a change affects more than one package.

## Local Verification

When changing docs, run:

```bash
pnpm --filter mdplugins_docs build
```
