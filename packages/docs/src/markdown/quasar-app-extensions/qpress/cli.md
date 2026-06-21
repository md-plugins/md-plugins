---
title: Q-Press CLI
desc: Validate, prerender, and automate Q-Press documentation projects from one command.
related:
  - quasar-app-extensions/qpress/ssg
  - quasar-app-extensions/qpress/advanced
---

Q-Press exposes one primary CLI command with focused subcommands:

```bash
qpress check
qpress ssg
```

The older `qpress-ssg` binary remains available as a backwards-compatible alias, but new scripts should prefer `qpress ssg` so all Q-Press tooling is grouped under one command.

## How Projects Get The CLI

The CLI is provided by the installed `@md-plugins/quasar-app-extension-q-press` package through its npm `bin` entries. It is not copied into your app source by the generated template.

When you install or update Q-Press, run the app-extension invoke flow so your generated scripts point at the current command names:

```bash
quasar ext invoke @md-plugins/q-press
```

Installed projects also get package scripts for the common workflows:

```bash
pnpm check:qpress
pnpm build:ssg
pnpm prerender:ssg
pnpm preview:ssg
```

## Project Validation

Use `qpress check` before release or CI builds to catch docs-specific problems that normal TypeScript and lint checks do not always see:

```bash
qpress check
```

The checker scans:

- Markdown route duplicates
- Broken internal Markdown and HTML links
- Broken `siteConfig` navigation routes
- Missing `MarkdownExample` source files
- Missing imported Q-Press API JSON files
- Malformed API JSON files
- Missing frontmatter title or description warnings
- Common browser-only globals in examples that can surprise SSG builds

Errors fail the command. Warnings, such as missing frontmatter or SSG-risky browser globals, are reported without failing by default.

Use `--fail-on-warnings` when CI should treat warnings as blockers:

```bash
qpress check --fail-on-warnings
```

## Custom Routes

If your docs include custom Vue routes that are valid but not generated from Markdown, allow them explicitly:

```bash
qpress check --allow-route /theme-builder
```

You can repeat `--allow-route` for multiple routes.

## Navigation Checks

Q-Press checks configured `siteConfig` routes by default, including `path`, `route`, `to`, `href`, `link`, and `url` values that point to absolute internal routes.

External URLs and static assets are ignored. If your siteConfig lives somewhere other than `src/siteConfig`, point the checker at it:

```bash
qpress check --site-config-dir docsConfig
```

If you need to temporarily skip navigation validation:

```bash
qpress check --no-navigation
```

## Unreachable Pages

Hidden pages are sometimes intentional, so unreachable-page warnings are opt-in. Enable them when you want release checks to flag Markdown routes that are not referenced from configured navigation:

```bash
qpress check --check-unreachable
```

This is useful before public releases, but it may be too strict for sites that intentionally keep custom tools, release archives, or private drafts out of the main menu.

## Ignored Markdown Files

If your docs folder includes intentional scratch pages, fixtures, or generated drafts that should not participate in release checks, ignore them explicitly:

```bash
qpress check --ignore-file "__*.md"
```

You can repeat `--ignore-file` for multiple patterns. The checker does not hard-code any filename conventions, so ignored files stay visible and intentional.

## Machine-Readable Output

Use JSON output when another script needs to consume diagnostics:

```bash
qpress check --json
```

Use quiet output when CI should only print failures:

```bash
qpress check --quiet
```

## Static Site Generation

Use `qpress ssg` to prerender Q-Press routes into static HTML:

```bash
qpress ssg --out-dir dist/spa
```

The SSG command reads the generated route manifest, uses the Q-Press app factory, renders each route at build time, and writes route-specific HTML into your static output folder.

See [Q-Press SSG](/quasar-app-extensions/qpress/ssg) for renderer modes, output configuration, route crawling, exclusions, redirects, reports, and browser-only content guidance.
