---
title: Q-Press Site Config
desc: Configure Q-Press identity, global shell options, public URLs, and feature entry points.
related:
  - quasar-app-extensions/qpress/navigation
  - quasar-app-extensions/qpress/banners-campaigns
  - quasar-app-extensions/qpress/privacy-consent
---

The Site Config lives in `src/siteConfig/index.ts`. Treat it as the project-owned contract for the generated Q-Press shell.

Use this page for the global shape. Use the focused pages for larger topics:

- [Navigation](/quasar-app-extensions/qpress/navigation)
- [Search](/quasar-app-extensions/qpress/search)
- [Banners + Campaigns](/quasar-app-extensions/qpress/banners-campaigns)
- [Privacy Consent](/quasar-app-extensions/qpress/privacy-consent)
- [CodePen](/quasar-app-extensions/qpress/codepen)
- [Themes](/quasar-app-extensions/qpress/themes)

## What Site Config Controls

| Section                                       | What it controls                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `title`, `description`, `version`, `lang`     | Browser metadata, visible product identity, and generated docs context.                            |
| `publicUrl`                                   | Published docs root URL used for external/public documentation links.                              |
| `logoConfig`                                  | Header and sidebar logo behavior for light and dark mode.                                          |
| `versionConfig`                               | Whether the title and version are shown in the header and drawer.                                  |
| `config`                                      | Major layout switches such as headers, footer, sidebar, table of contents, and the `More` menu.    |
| `links`                                       | Header links, responsive overflow links, footer links, social links, and optional ecosystem links. |
| `sidebar`                                     | Drawer/sidebar navigation tree.                                                                    |
| `githubEditRootSrc` and `githubSourceRootSrc` | Source locations used by edit, source, and example links.                                          |
| `codepen`                                     | External CSS, scripts, setup code, and package globals used when examples open in CodePen.         |
| `license`, `privacy`, `copyright`             | Footer legal links and ownership text.                                                             |
| `announcement`                                | Optional dismissible top-of-page docs announcement.                                                |
| `privacyConsent`                              | Optional privacy notice or consent prompt for static-hosted docs.                                  |
| `campaigns`                                   | Optional restrained popup/dialog campaigns with route, date, trigger, and frequency controls.      |

## Recommended Editing Flow

1. Update `title`, `description`, logos, and version display first.
2. Add header, sidebar, and footer links once the main docs routes exist.
3. Pick one Q-Press theme in `src/css/quasar.variables.scss`.
4. Configure CodePen only after examples need external packages or assets.
5. Keep announcements, campaigns, and privacy consent disabled until their copy, storage ids, and rules are ready.
6. Run `pnpm check:qpress` after changing routes, navigation, or examples.

## Identity

The top-level identity fields feed browser metadata, generated shell labels, search context, and public docs links:

```ts
const config = {
  lang: 'en-US',
  title: 'My Docs',
  description: 'Documentation for my package.',
  publicUrl: 'https://docs.example.com/',
  version: '1.0.0',
}
```

Set `publicUrl` to the published root URL for the documentation site:

```ts
publicUrl: 'https://docs.example.com/'
```

Use the same value in `qpress.config.*` under `site.publicUrl` when generated API JSON should contain full documentation URLs. This is important for external consumers such as `quasar describe ...`, which read API JSON outside the running docs app after a package has been published.

## Logos And Version Display

`logoConfig` controls the header and sidebar logo:

```ts
const logoConfig = {
  showLogo: true,
  logoLight: '/logo-light.png',
  logoDark: '/logo-dark.png',
  logoAlt: 'My Docs',
}
```

`versionConfig` controls where product/version labels appear:

```ts
const versionConfig = {
  showTitle: true,
  showVersion: true,
  showOnHeader: false,
  showOnSidebar: true,
}
```

## Layout Switches

Use `config` for coarse layout behavior:

```ts
const config = {
  usePrimaryHeader: false,
  useSecondaryHeader: true,
  headerHeightHint: 55,
  useMoreLinks: true,
  useFooter: true,
  useSidebar: true,
  useToc: true,
}
```

`headerHeightHint` should match the enabled header rows so scroll and anchor behavior can account for fixed header height.

## Footer And Legal Links

Footer values are part of Site Config because they belong to the site shell, not individual Markdown pages:

```ts
const config = {
  license: {
    label: 'MIT License',
    link: 'https://github.com/example/project/blob/main/LICENSE.md',
  },
  privacy: {
    label: 'Privacy Policy',
    link: '/privacy-policy',
  },
  copyright: {
    line1: `Copyright © 2024-${new Date().getFullYear()} Example`,
    line2: '',
  },
}
```

Use `links.footerLinks` and `links.socialLinks` for footer groups and social buttons. See [Navigation](/quasar-app-extensions/qpress/navigation) for menu structure.

## Generated Layout Features

Q-Press templates already render optional shell features from the generated `MarkdownLayout`:

```vue
<MarkdownAnnouncement :config="qpressShellConfig.announcement" />
<MarkdownPrivacyConsent :config="qpressShellConfig.privacyConsent" />
<MarkdownCampaigns :campaigns="qpressShellConfig.campaigns" />
```

Configure them in `src/siteConfig/index.ts`; do not add these components to individual Markdown pages.

| Piece            | Configure with   | Focused docs                                                           |
| ---------------- | ---------------- | ---------------------------------------------------------------------- |
| Announcement     | `announcement`   | [Banners + Campaigns](/quasar-app-extensions/qpress/banners-campaigns) |
| Privacy consent  | `privacyConsent` | [Privacy Consent](/quasar-app-extensions/qpress/privacy-consent)       |
| Campaign dialogs | `campaigns`      | [Banners + Campaigns](/quasar-app-extensions/qpress/banners-campaigns) |
| CodePen links    | `codepen`        | [CodePen](/quasar-app-extensions/qpress/codepen)                       |

Skinning belongs in theme and app styles, not in `siteConfig`. Prefer Q-Press CSS variables such as `--qpress-text-primary`, `--qpress-text-body`, `--qpress-surface-panel`, `--qpress-surface-raised-strong`, `--qpress-border-subtle`, and `--qpress-border-strong` so light and dark mode stay aligned with the selected theme.
