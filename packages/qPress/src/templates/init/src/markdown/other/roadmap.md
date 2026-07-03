---
title: Roadmap
desc: Planned Q-Press and MD-Plugins work on the path to 1.0 and beyond.
keys: Other
related:
  - other/upgrade-guide
  - quasar-app-extensions/qpress/overview
  - quasar-app-extensions/qpress/api-json
  - quasar-app-extensions/qpress/search
  - quasar-app-extensions/qpress/banners-campaigns
---

MD-Plugins provides shared Markdown, Vite, and Q-Press documentation tooling for Quasar app extensions and Vue/Vite content projects. The current focus is to keep the 1.0 baseline dependable while continuing to improve generated docs sites from real downstream usage.

This roadmap is intentionally practical. It highlights what is stable today, what limitations are known, and where future work is likely to happen. Priorities can shift when downstream projects uncover new needs.

## Stable Baseline

The current baseline includes the major pieces needed for production docs sites:

- Q-Press generated docs shell, routing, navigation, themes, examples, API pages, and static search
- focused Q-Press documentation pages for installation, quick start, site config, navigation, search, CodePen, Markdown features, landing pages, API JSON, SSG, CLI, and generated components
- TypeScript and JSDoc driven API JSON generation with review files, direct-output mode, drift checks, and renderer support for Quasar-style API fields
- downstream API generation proofs in MD-Plugins, Timestamp, QCalendar, QScroller, QMediaPlayer, QMarkdown, and QIconPicker
- Q-Press SSG support for static-host-friendly route output
- announcement banners, privacy consent, and restrained campaign dialogs
- Q-Press validation through `qpress check`

## Known Limitations

These are understood limitations rather than hidden blockers. They are good places for early 1.x feedback.

### Offline Font Strategy

Q-Press generated styles currently load Material Icons, Roboto, and Montserrat from the Quasar CDN. That is convenient for public demos, but it is not ideal for private networks, strict CSP policies, or air-gapped documentation sites.

Future work should provide a clear font strategy:

- support self-hosted or package-managed fonts
- keep remote CDN loading opt-in or clearly documented
- document CSP, privacy, and offline tradeoffs
- preserve an easy default path for normal public docs sites

### API Generation Contract

Q-Press can generate API JSON from TypeScript and JSDoc, and that workflow has been proven in MD-Plugins, Timestamp, QCalendar, QScroller, QMediaPlayer, QMarkdown, and QIconPicker.

The public contract should keep getting clearer as more projects adopt it:

- which source shapes are supported
- how full `docsUrl` values are generated for published API JSON
- how runtime event names and template-facing event names are displayed
- whether TypeScript signatures are stored in generated JSON or derived by the renderer
- how unsupported edge cases should be documented or worked around

### Campaign Validation

Announcements, privacy consent, and restrained campaign dialogs are available, but campaign configuration can use stronger validation.

Useful validation includes:

- malformed or expired date windows
- invalid route patterns
- missing or duplicate campaign ids
- trigger and frequency edge cases
- storage failures
- mobile fallback behavior
- reduced-motion behavior

## Forward Roadmap

These areas are likely next steps as users adopt Q-Press and MD-Plugins more broadly.

### Documentation Experience

Q-Press docs have been split into focused pages so users do not have to read one oversized page or infer too much from generated files.

The current structure includes dedicated pages for Quick Start, Installation, Navigation, Search, CodePen, Markdown Features, Landing Page, API JSON, Site Config, SSG, CLI, and generated components.

Ongoing work is mostly maintenance:

- keep generated-template docs aligned with the live MD-Plugins docs
- remove stale migration language as release-candidate work becomes stable
- keep the task list and public roadmap in sync

### Static Output And Generated Routes

Q-Press already supports static route output for normal Markdown pages. The next steps are about generated or metadata-backed pages.

#### SSG Dynamic Routes

Q-Press already registers Markdown routes through a generated manifest and Vue Router dynamic route APIs. The next step is defining parameter sources for generated pages so SSG can emit known static routes for pages such as release entries, package pages, or metadata-backed docs sections.

#### Release Or Blog Collections

Release notes, blog-style posts, and dated content collections may eventually need generated listing pages, archive pages, feeds, search records, and SSG route expansion. This should be driven by a real project need.

#### Optional SEO Outputs

Generated sitemap, canonical metadata, RSS/feed files, and `llms.txt` bundles may be useful once Q-Press has dynamic or dated content collections. Static docs-only sites can usually manage simple SEO files manually.

### Search

The current static search pipeline works for normal docs sites. Future improvements can make it more useful for larger docs sets.

#### Search Maturity

Potential improvements include:

- improved ranking
- result snippets and highlights
- tags or facets
- larger-site split indexes
- analytics hooks
- Pagefind-compatible output or comparison paths

### Localization

Localization will need a dedicated design rather than isolated text substitutions. This should be planned as a coherent Q-Press feature.

Future i18n work should define:

- localized Markdown roots
- localized navigation and site config
- route prefixes or build roots
- locale-aware search indexes
- `lang` and `dir` metadata
- fallback behavior for untranslated pages

### Out Of Scope For Now

Q-Press is not trying to become a full CMS. Multi-user editing, Confluence-style workflows, broad versioned content systems, and generalized content collections should wait until there is a concrete downstream need.
