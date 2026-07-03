---
title: Q-Press Privacy Consent
desc: Configure Q-Press privacy notice and consent prompts for static-hosted docs.
examples: QPressSiteConfig
related:
  - quasar-app-extensions/qpress/site-config
  - quasar-app-extensions/qpress/banners-campaigns
---

Use `privacyConsent` only for privacy notices or consent prompts. This feature is separate from announcements and campaigns because privacy consent can require accept, reject, customize, category-level preferences, policy links, expiration, and optional script or embed gating.

Q-Press keeps this static-host friendly, but it cannot provide legal advice. Site owners remain responsible for local privacy, cookie, and consent requirements.

<MarkdownExample title="Generated Layout Toggles" file="GeneratedLayoutToggles" no-edit no-github/>

## Layout Wiring

Q-Press templates render privacy consent from the generated `MarkdownLayout`. Configure it in `src/siteConfig/index.ts`; do not add the component to individual Markdown pages.

```vue
<MarkdownPrivacyConsent :config="qpressShellConfig.privacyConsent" />
```

## Basic Config

```ts [twoslash]
const config = {
  privacyConsent: {
    enabled: true,
    id: 'privacy-consent-v1',
    mode: 'consent',
    title: 'Privacy preferences',
    message:
      'Choose whether this documentation site can enable optional analytics or third-party embeds.',
    policyLink: '/privacy-policy',
    expirationDays: 180,
    categories: [
      { id: 'necessary', label: 'Necessary', required: true },
      { id: 'analytics', label: 'Analytics' },
      { id: 'embeds', label: 'Third-party embeds' },
    ],
  },
}
```

`expirationDays` starts when the visitor saves their choice. Q-Press stores both `savedAt` and a computed `expiresAt`, then asks again after the saved choice expires.

## Consent Event

When a consent choice is read or saved, Q-Press dispatches a `qpress:privacy-consent` event on `window`. Site owners can listen for this event before loading optional analytics, marketing pixels, or third-party embeds:

```ts
window.addEventListener('qpress:privacy-consent', (event) => {
  const consent = event.detail

  if (consent.categories.analytics === true) {
    // Load optional analytics here.
  }
})
```

## Boundaries

Privacy consent should not become a general marketing or campaign mechanism. Use:

- `announcement` for calm site-wide notices
- `campaigns` for restrained opt-in calls to action
- `privacyConsent` for privacy notice, consent, and optional category choices

If a future campaign or docs component can load third-party content, it should honor the saved privacy consent state instead of bypassing it.

## Styling

Use Q-Press theme tokens when a project needs a focused override:

```scss
.qpress-consent {
  color: var(--qpress-text-primary);
  background: var(--qpress-surface-raised-strong);
  border-color: var(--qpress-border-strong);
}
```
