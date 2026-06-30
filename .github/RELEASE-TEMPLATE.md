<!--
Release drafting notes:
- Lead with changes md-plugins users feel in their projects: Vite plugin behavior, Markdown-it plugin behavior, Q-Press app-extension behavior, generated output, public APIs, compatibility, install, and migration notes.
- Include docs-site, demo, build tooling, dependency, or release-process changes only when they affect package consumers.
- Fixes should include the short commit id.
- Keep the summary short and concrete.
-->

# md-plugins v0.x.x

Release date: YYYY-MM-DD

## Summary

Short user-facing summary of what changed for md-plugins package, plugin, app-extension, or generated-output users.

## What's Changed

**Features:**

- `commitid` Describe new plugin, app-extension, generated-output, public API, styling, or integration behavior.

**Fixes:**

- `commitid` Describe the bug, who it affected, and what now works correctly.

**Maintenance:**

- `commitid` Include only consumer-relevant maintenance, such as package prep, compatibility updates, or dependency updates that users may notice.

## Breaking Changes

- None.

## Compatibility

- Node.js: `>=22.13`
- pnpm: `>=11.5.0`
- Vite:
- Vue:
- Quasar:
- Q-Press:
- npm dist-tag: `latest`

## Installation

Install the package or packages used by your project.

```bash
pnpm add -D @md-plugins/vite-md-plugin
pnpm add -D @md-plugins/vite-examples-plugin
pnpm add -D @md-plugins/vite-ssg-plugin
pnpm add -D @md-plugins/vite-search-plugin
pnpm add -D @md-plugins/quasar-app-extension-q-press
```

Add the appropriate prerelease tag, such as `@beta`, only when publishing under that dist-tag.

## Documentation

- Docs: https://md-plugins.netlify.app/
- Repository: https://github.com/md-plugins/md-plugins

## Full Changelog

https://github.com/md-plugins/md-plugins/compare/PREVIOUS_TAG...CURRENT_TAG

## Donations

If md-plugins is useful in your workflow and you want to support ongoing maintenance:

GitHub Sponsors: https://github.com/sponsors/hawkeye64
PayPal: https://paypal.me/hawkeye64
