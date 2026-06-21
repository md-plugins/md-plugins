---
title: Q-Press CLI
desc: Validate, prerender, and automate Q-Press documentation projects from one command.
related:
  - quasar-app-extensions/qpress/ssg
  - quasar-app-extensions/qpress/advanced
---

Q-Press exposes one primary CLI command with focused subcommands. The CLI is installed as a project-local npm binary, not a global shell command:

```bash
pnpm exec qpress check
pnpm exec qpress ssg
```

Inside package scripts, you can call `qpress` directly because npm, pnpm, yarn, and bun add local binaries to the script PATH.

The older `qpress-ssg` binary remains available as a backwards-compatible alias, but new scripts should prefer `qpress ssg` so all Q-Press tooling is grouped under one command.

## Help Output

Every command supports `--help`:

```bash
pnpm exec qpress --help
pnpm exec qpress check --help
pnpm exec qpress ssg --help
```

Use these when you need the current option list from the installed package.

## How Projects Get The CLI

The CLI is provided by the installed `@md-plugins/quasar-app-extension-q-press` package through its npm `bin` entries. It is not copied into your app source by the generated template and is not installed globally.

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

Use `qpress check` before release or CI builds to catch docs-specific problems that normal TypeScript and lint checks do not always see. Run it directly through your package manager:

```bash
pnpm exec qpress check
```

Or use the generated package script:

```bash
pnpm check:qpress
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
pnpm exec qpress check --fail-on-warnings
```

## Configuration File

Q-Press can load project-local check options from a config file in the project root. This keeps package scripts readable as validation grows.

Supported filenames:

- `qpress.config.json`
- `qpress.config.mjs`
- `qpress.config.js`
- `qpress.config.cjs`
- `.qpressrc.json`

Put check options under the `check` key:

```json
{
  "check": {
    "allowedRoutes": ["/theme-builder"],
    "ignoreFiles": ["__*.md"],
    "checkUnreachable": true
  }
}
```

CLI flags override config values. Repeated list options such as `allowedRoutes` and `ignoreFiles` merge with the config values.

Unknown config keys and invalid value types fail fast with a clear error. For example, `allowedRoutes` must be an array of strings and `checkUnreachable` must be a boolean.

Use an explicit config file when needed:

```bash
pnpm exec qpress check --config docs-qpress.config.mjs
```

Skip config loading for debugging or one-off CI checks:

```bash
pnpm exec qpress check --no-config
```

## Custom Routes

If your docs include custom Vue routes that are valid but not generated from Markdown, allow them explicitly:

```bash
pnpm exec qpress check --allow-route /theme-builder
```

You can repeat `--allow-route` for multiple routes.

## Navigation Checks

Q-Press checks configured `siteConfig` routes by default, including `path`, `route`, `to`, `href`, `link`, and `url` values that point to absolute internal routes.

External URLs and static assets are ignored. If your siteConfig lives somewhere other than `src/siteConfig`, point the checker at it:

```bash
pnpm exec qpress check --site-config-dir docsConfig
```

If you need to temporarily skip navigation validation:

```bash
pnpm exec qpress check --no-navigation
```

## Unreachable Pages

Hidden pages are sometimes intentional, so unreachable-page warnings are opt-in. Enable them when you want release checks to flag Markdown routes that are not referenced from configured navigation:

```bash
pnpm exec qpress check --check-unreachable
```

This is useful before public releases, but it may be too strict for sites that intentionally keep custom tools, release archives, or private drafts out of the main menu.

## Ignored Markdown Files

If your docs folder includes intentional scratch pages, fixtures, or generated drafts that should not participate in release checks, ignore them explicitly:

```bash
pnpm exec qpress check --ignore-file "__*.md"
```

You can repeat `--ignore-file` for multiple patterns. The checker does not hard-code any filename conventions, so ignored files stay visible and intentional.

## Machine-Readable Output

Use JSON output when another script needs to consume diagnostics:

```bash
pnpm exec qpress check --json
```

Use quiet output when CI should only print failures:

```bash
pnpm exec qpress check --quiet
```

## Static Site Generation

Use `qpress ssg` to prerender Q-Press routes into static HTML:

```bash
pnpm exec qpress ssg --out-dir dist/spa
```

The SSG command reads the generated route manifest, uses the Q-Press app factory, renders each route at build time, and writes route-specific HTML into your static output folder.

See [Q-Press SSG](/quasar-app-extensions/qpress/ssg) for renderer modes, output configuration, route crawling, exclusions, redirects, reports, and browser-only content guidance.
