---
title: Q-Press CLI
desc: Validate, prerender, and automate Q-Press documentation projects from one command.
related:
  - quasar-app-extensions/qpress/ssg
  - quasar-app-extensions/qpress/advanced
---

Q-Press exposes one primary CLI command with focused subcommands. The CLI is installed as a project-local npm binary, not a global shell command:

```bash
pnpm exec qpress api generate
pnpm exec qpress check
pnpm exec qpress ssg
```

Inside package scripts, you can call `qpress` directly because npm, pnpm, yarn, and bun add local binaries to the script PATH.

The older `qpress-ssg` binary remains available as a backwards-compatible alias, but new scripts should prefer `qpress ssg` so all Q-Press tooling is grouped under one command.

## Help Output

Every command supports `--help`:

```bash
pnpm exec qpress --help
pnpm exec qpress api --help
pnpm exec qpress api generate --help
pnpm exec qpress api check --help
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
- Broken `related` frontmatter routes
- Broken `siteConfig` navigation routes
- Missing `MarkdownExample` source files
- Missing imported Q-Press API JSON files
- Malformed API JSON files
- Stale generated API JSON when `api.entries` is configured
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
  "api": {
    "generatedSuffix": ".generated",
    "entries": [
      {
        "input": "src/utils/timestamp.ts",
        "output": "src/.q-press/api/composables/timestamp.json",
        "group": "functions",
        "docsUrl": "https://docs.example.com/api/timestamp"
      }
    ]
  },
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

## API JSON Generation

Use `qpress api` when you want TypeScript exports and JSDoc to become the source of truth for Q-Press API JSON.

The first pass is intentionally review-first. `generate` writes comparison files next to your configured API JSON files and does not overwrite committed API files:

```bash
pnpm exec qpress api generate
```

For example, an entry with this output path:

```text
src/.q-press/api/composables/timestamp.json
```

Generates this comparison file:

```text
src/.q-press/api/composables/timestamp.generated.json
```

Review the generated file against the hand-authored file before deciding whether to adopt it. This keeps existing API JSON safe while the generator matures.

Run `check` when CI should report stale or missing API JSON without writing files:

```bash
pnpm exec qpress api check
```

`qpress check` also runs these stale generated API checks automatically when `api.entries` is configured. This keeps the normal release validator aware of API drift without requiring a second command in most CI scripts.

If you need to run the docs checks without generated API drift checks, use:

```bash
pnpm exec qpress check --no-api
```

The generator currently extracts exported TypeScript functions and exported `const` arrow/function expressions. It reads JSDoc descriptions plus `@param`, `@returns`, `@example`, and `@since` tags, then emits the same JSON shape used by `MarkdownApi`.

Configure entries under `api.entries`:

```json
{
  "api": {
    "entries": [
      {
        "input": "src/utils/timestamp.ts",
        "output": "src/.q-press/api/composables/timestamp.json",
        "group": "functions",
        "docsUrl": "https://docs.example.com/api/timestamp"
      }
    ]
  }
}
```

Use `group: "functions"` for composables and utilities, or `group: "methods"` when the generated API should appear under the Methods tab.

You can also run a one-off comparison without config:

```bash
pnpm exec qpress api generate \
  --input src/utils/timestamp.ts \
  --output src/.q-press/api/composables/timestamp.json \
  --type plugin \
  --group methods \
  --docs-url https://docs.example.com/api/timestamp
```

For one-off runs, `--type`, `--group`, and `--docs-url` mirror the matching `api.entries` fields. Use them when you are probing a new source file and want the generated comparison artifact to resemble the final API JSON shape.

## Custom Routes

If your docs include custom Vue routes that are valid but not generated from Markdown, allow them explicitly:

```bash
pnpm exec qpress check --allow-route /theme-builder
```

You can repeat `--allow-route` for multiple routes.

The same route set is used for Markdown links, `related` frontmatter, and `siteConfig` navigation, so one allowed route covers all three places.

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
