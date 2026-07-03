---
title: Q-Press Banners + Campaigns
desc: Configure Q-Press announcement banners and restrained campaign dialogs.
examples: QPressSiteConfig
related:
  - quasar-app-extensions/qpress/site-config
  - quasar-app-extensions/qpress/privacy-consent
---

Q-Press templates render optional announcement and campaign components from the generated `MarkdownLayout`. Configure them in `src/siteConfig/index.ts`; do not add these components to individual Markdown pages.

```vue
<MarkdownAnnouncement :config="qpressShellConfig.announcement" />
<MarkdownCampaigns :campaigns="qpressShellConfig.campaigns" />
```

Keep these features disabled until the copy, route targeting, storage ids, and legal requirements are ready.

<MarkdownExample title="Generated Layout Toggles" file="GeneratedLayoutToggles" no-edit no-github/>

## Announcements

Use `announcement` for calm site-wide notices such as releases, maintenance windows, upgrade warnings, or sponsor messages. Announcements are intentionally separate from privacy consent and marketing popups.

```ts [twoslash]
const config = {
  announcement: {
    enabled: true,
    id: 'qpress-2026-06-release',
    message: 'Q-Press 0.1.0 includes improved SSG and themed docs components.',
    tone: 'info',
    startAt: '2026-06-01T00:00:00Z',
    endAt: '2026-06-30T23:59:59Z',
    dismissible: true,
    action: {
      label: 'Read release notes',
      link: '/other/releases',
    },
  },
}
```

`id` is the versioned dismissal key. When a visitor dismisses the banner, Q-Press stores that id in `localStorage`. Change the id when you want dismissed visitors to see a new announcement.

## Campaigns

Use `campaigns` for restrained opt-in prompts such as sponsor messages, release campaigns, route-specific upgrade notices, or limited-time calls to action.

```ts [twoslash]
const config = {
  campaigns: [
    {
      enabled: true,
      id: 'sponsor-qpress-v1',
      title: 'Support Q-Press maintenance',
      message: 'If Q-Press is useful in your workflow, consider sponsoring ongoing maintenance.',
      tone: 'sponsor',
      startAt: '2026-06-01T00:00:00Z',
      endAt: '2026-06-30T23:59:59Z',
      includeRoutes: ['/quasar-app-extensions/qpress/*'],
      excludeRoutes: ['/privacy-policy'],
      trigger: { type: 'scroll-depth', scrollDepth: 65 },
      frequency: { strategy: 'days', days: 30, maxViews: 3 },
      device: 'desktop',
      mobileFallback: 'none',
      closeOnEsc: true,
      closeOnBackdrop: true,
      action: {
        label: 'Sponsor Jeff',
        link: 'https://github.com/sponsors/hawkeye64',
        external: true,
      },
    },
  ],
}
```

Campaign triggers currently support `load`, `delay`, `scroll-depth`, and desktop `exit-intent`. Route patterns support exact paths and simple trailing-wildcard prefixes such as `/guides/*`. Frequency defaults to `once`; use `session`, `days`, or `always` only when the message genuinely needs that behavior.

## Recipes

### Route-Specific Upgrade Notice

```ts
{
  enabled: true,
  id: 'qpress-upgrade-guide-v2',
  title: 'Q-Press upgrade notes',
  message: 'This section changed in the latest release. Review the upgrade guide before updating generated files.',
  tone: 'warning',
  includeRoutes: ['/quasar-app-extensions/qpress/*'],
  excludeRoutes: ['/quasar-app-extensions/qpress/upgrade-guide'],
  trigger: { type: 'load' },
  frequency: { strategy: 'once' },
  action: {
    label: 'Open upgrade guide',
    link: '/quasar-app-extensions/qpress/upgrade-guide',
  },
}
```

### Limited Release Promotion

```ts
{
  enabled: true,
  id: 'docs-release-2026-07',
  title: 'New docs release',
  message: 'The July docs update includes SSG, API generation, and Q-Press validation improvements.',
  tone: 'info',
  startAt: '2026-07-01T00:00:00Z',
  endAt: '2026-07-15T23:59:59Z',
  includeRoutes: ['/*'],
  trigger: { type: 'delay', delayMs: 2000 },
  frequency: { strategy: 'session' },
  action: {
    label: 'Read release notes',
    link: '/releases',
  },
}
```

### Sponsor Prompt

```ts
{
  enabled: true,
  id: 'sponsor-docs-maintenance-v1',
  title: 'Support ongoing maintenance',
  message: 'If these docs help your workflow, consider sponsoring future maintenance.',
  tone: 'sponsor',
  includeRoutes: ['/quasar-app-extensions/qpress/*'],
  trigger: { type: 'scroll-depth', scrollDepth: 70 },
  frequency: { strategy: 'days', days: 30, maxViews: 3 },
  device: 'desktop',
  mobileFallback: 'none',
  action: {
    label: 'Sponsor Jeff',
    link: 'https://github.com/sponsors/hawkeye64',
    external: true,
  },
}
```

### Desktop Exit Intent With Mobile Fallback

```ts
{
  enabled: true,
  id: 'newsletter-exit-intent-v1',
  title: 'Before you go',
  message: 'Bookmark the release notes to keep track of Q-Press changes.',
  tone: 'info',
  includeRoutes: ['/quasar-app-extensions/qpress/*'],
  trigger: { type: 'exit-intent' },
  device: 'all',
  mobileFallback: 'load',
  frequency: { strategy: 'days', days: 14, maxViews: 2 },
  action: {
    label: 'View release notes',
    link: '/releases',
  },
}
```

## Styling

Skinning belongs in theme and app styles, not in `siteConfig`. The generated components use Q-Press theme tokens and expose stable wrapper classes:

```scss
.qpress-announcement {
  border-bottom-color: var(--qpress-border-strong);
}

.qpress-campaign {
  background: var(--qpress-surface-raised-strong);
  border-color: var(--qpress-border-strong);
}
```
