---
title: Q-Press Themes
desc: Themes for the Q-Press App Extension for Quasar.
---

Currently, there are six themes available for **Q-Press**:

- **Default**
- **Evergreen**
- **Mystic**
- **Newspaper**
- **Sunrise**
- **Tawny**

## Theme Gallery

Each preview below is wrapped in a `qpress-theme-preview` namespace. That means the gallery can show every bundled theme at once without importing every theme file or overriding the active site theme.

<script import>
import QPressThemeGallery from '@/components/QPressThemeGallery.vue'
</script>

<QPressThemeGallery />

To use a theme, add the import to your `src/css/quasar.variables.scss` or `src/css/quasar.variables.sass` file:

```tabs
<<| scss SCSS |>>
@import '../.q-press/css/themes/sunrise.scss';
<<| sass Sass |>>
@import '../.q-press/css/themes/sunrise.scss'
```

This will load the `sunrise` theme into your **Q-Press** enabled app. Q-Press themes are shipped as `.scss` files, but they can be imported from either SCSS or Sass syntax.

Import only one Q-Press theme, then add any project-specific overrides below that import. This keeps the theme variables predictable while still letting you tune colors, typography, and spacing for your site.

## Runtime Theme Tokens

Q-Press also publishes the active theme as runtime CSS custom properties. These tokens are derived from the selected Sass theme and switch automatically between `body.body--light` and `body.body--dark`, so shared components can follow future theme changes without copying Sass variables into every component.

Use Sass variables when you are defining a theme, and use runtime CSS variables when you are styling reusable docs UI.

| Use                                                                       | Best place                                             | Why                                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Pick a bundled theme                                                      | `src/css/quasar.variables.scss`                        | The selected theme sets the design foundation before build time.               |
| Override brand colors, fonts, breakpoints, or shadows                     | `src/css/quasar.variables.scss` below the theme import | Sass values generate Quasar colors and Q-Press runtime tokens together.        |
| Style landing pages, callouts, cards, badges, or docs-only Vue components | Component styles or page styles                        | `--qpress-*` tokens react to light/dark mode and future theme changes.         |
| Tune one page without changing the whole site                             | A page-level wrapper class                             | Local aliases can point to `--qpress-*` tokens while staying easy to override. |

### What Changes What

| Theme input                                           | Runtime result                                                                             | Visible effect                                                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `$brand-primary`                                      | `--qpress-color-primary`, `--qpress-rgb-primary`, action/chip/icon tokens                  | Menu accents, pills, highlighted values, icon blocks, primary CTAs, and landing-page accents. |
| `$brand-secondary`                                    | `--qpress-color-secondary`, `--qpress-rgb-secondary`, border tokens                        | Subtle borders, card outlines, and secondary surface contrast.                                |
| `$brand-accent`                                       | `--qpress-color-accent`, `--qpress-rgb-accent`                                             | Extra accent color available for custom components.                                           |
| `$brand-light-bg` and `$brand-dark-bg`                | `--qpress-surface-page`, `--qpress-surface-panel`, hero start/end tokens                   | Page background, panel background, and landing-page hero atmosphere.                          |
| `$brand-light-text` and `$brand-dark-text`            | `--qpress-text-primary`, `--qpress-text-body`, `--qpress-text-muted`, `--qpress-text-soft` | Headings, paragraph text, helper text, and lower-emphasis copy.                               |
| `$brand-light` and `$dark-pill`                       | `--qpress-surface-base`, `--qpress-surface-raised`, pill/chip/action backgrounds           | Cards, raised panels, pills, chips, and ghost buttons.                                        |
| `$shadow--large`, `$shadow--medium`, `$shadow--small` | Shadow tokens and component shadows                                                        | Depth on cards, hero sections, and elevated controls.                                         |

### Token Families

| Family               | Tokens                                                                                                                                                                                      | Use them for                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Base colors          | `--qpress-color-primary`, `--qpress-color-secondary`, `--qpress-color-accent`, `--qpress-color-light`, `--qpress-color-dark`                                                                | Direct color references.                                     |
| RGB channels         | `--qpress-rgb-primary`, `--qpress-rgb-secondary`, `--qpress-rgb-accent`, `--qpress-rgb-light`, `--qpress-rgb-dark`, `--qpress-rgb-text`, `--qpress-rgb-surface`                             | Opacity-aware color mixes with `rgb(var(--token) / 0.24)`.   |
| Text                 | `--qpress-text-primary`, `--qpress-text-body`, `--qpress-text-muted`, `--qpress-text-soft`                                                                                                  | Headings, body copy, support text, and soft labels.          |
| Surfaces             | `--qpress-surface-page`, `--qpress-surface-base`, `--qpress-surface-raised`, `--qpress-surface-raised-strong`, `--qpress-surface-panel`                                                     | Page backgrounds, cards, panels, and stronger card states.   |
| Borders and shadows  | `--qpress-border-subtle`, `--qpress-border-strong`, `--qpress-card-shadow`, `--qpress-shadow-large`                                                                                         | Card outlines, section dividers, and elevation.              |
| Actions              | `--qpress-action-solid-bg`, `--qpress-action-solid-text`, `--qpress-action-solid-shadow`, `--qpress-action-ghost-bg`, `--qpress-action-ghost-text`                                          | Primary and secondary buttons.                               |
| Chips and pills      | `--qpress-chip-bg`, `--qpress-chip-text`, `--qpress-pill-bg`, `--qpress-pill-border`, `--qpress-pill-text`                                                                                  | Small labels, feature tags, and compact link pills.          |
| Highlights and icons | `--qpress-highlight-bg`, `--qpress-highlight-border`, `--qpress-highlight-value`, `--qpress-highlight-label`, `--qpress-icon-bg`, `--qpress-icon-color`                                     | Stats cards, icon tiles, and callout headers.                |
| Tiles and resources  | `--qpress-tile-bg`, `--qpress-tile-border`, `--qpress-tile-hover-bg`, `--qpress-tile-hover-border`, `--qpress-resource-link-bg`, `--qpress-resource-link-text`, `--qpress-resource-item-bg` | Landing-page feature cards, resource cards, and link groups. |
| Hero atmosphere      | `--qpress-mesh-color`, `--qpress-hero-glow-primary`, `--qpress-hero-glow-secondary`, `--qpress-hero-start`, `--qpress-hero-end`                                                             | Landing-page backgrounds and decorative glows.               |

### Example: Theme-Aware Card

This card follows the active theme in light and dark mode:

```scss
.custom-docs-panel {
  color: var(--qpress-text-primary);
  background: var(--qpress-surface-raised);
  border: 1px solid var(--qpress-border-subtle);
  box-shadow: var(--qpress-card-shadow);
}
```

Changing `$brand-light-bg` or `$brand-dark-bg` changes the panel surface. Changing `$brand-light-text` or `$brand-dark-text` changes the copy. Changing `$brand-secondary` changes the border contrast.

### Example: Pill Or Tag

Use pill tokens for compact labels that should match the menu accent color:

```scss
.custom-docs-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2rem;
  padding: 0.25rem 0.8rem;
  color: var(--qpress-pill-text);
  background: var(--qpress-pill-bg);
  border: 1px solid var(--qpress-pill-border);
  border-radius: 999px;
}
```

Changing `$brand-primary` changes the pill text and icon color. Changing `$brand-light`, `$dark-pill`, or the current color mode changes the pill background.

### Example: Local Landing Page Aliases

For larger pages, create local aliases once and then style the page with names that match the design:

```scss
.product-landing {
  --product-heading: var(--qpress-text-primary);
  --product-copy: var(--qpress-text-body);
  --product-card-bg: var(--qpress-surface-raised);
  --product-card-border: var(--qpress-border-subtle);
  --product-action-bg: var(--qpress-action-solid-bg);
  --product-action-text: var(--qpress-action-solid-text);
}

.product-card {
  color: var(--product-copy);
  background: var(--product-card-bg);
  border: 1px solid var(--product-card-border);
}
```

This is the pattern used by the generated landing page: `--landing-*` tokens point back to `--qpress-*` tokens. If you change the selected Q-Press theme later, the landing page follows along.

::: warning
If you override a base runtime color directly, also override the matching RGB token. For example, `--qpress-color-primary` and `--qpress-rgb-primary` should stay in sync because many transparent backgrounds use `rgb(var(--qpress-rgb-primary) / 0.16)`. In most cases, it is safer to change the Sass theme variables and let Q-Press generate the runtime tokens.
:::

## Custom Themes

If you want to build your own theme, add these variables to your `src/css/quasar.variables.scss` or `src/css/quasar.variables.sass` file and modify them to your liking:

```tabs
<<| scss SCSS |>>
@use 'sass:color';

$primary: #214466;
$secondary: #266660;
$accent: #853394;

$positive: #2ecc71;
$negative: #ff1732;
$info: #10a0ff;
$warning: #ffd52d;

$brand-primary: #00bfff;
$brand-secondary: #4b555c;
$brand-accent: #ea5e13;
$brand-dark: #2c3e50;
$brand-light: #f5f5f5;
$brand-medium: #6b7f86;
$brand-light-text: #4d4d4d;
$brand-light-bg: #fefefe;
$brand-dark-bg: #080e1a;
$brand-dark-text: #cbcbcb;
$brand-light-codeblock-bg: #f5f5f5;
$brand-light-codeblock-text: #4d4d4d;
$brand-dark-codeblock-bg: #121212;
$brand-dark-codeblock-text: #e6e6e6;

$header-btn-color--light: #757575;
$header-btn-hover-color--light: #212121;
$header-btn-color--dark: #929397;
$header-btn-hover-color--dark: #fff;

$light-pill: $brand-light;
$light-text: $brand-light-text;
$light-bg: $brand-light-bg;

$dark-pill: scale-color($brand-dark-bg, $lightness: 12%);
$dark-text: $brand-dark-text;
$dark-bg: $brand-dark-bg;

$separator-color: $brand-accent;
$separator-color-dark: $brand-accent;

$font-size: 16px;
$font-size-brand: 16px;
$font-weight-brand: 500;
$font-weight-technical: 400;
$letter-spacing-brand: 0.7px;

$font-family-technical:
  'Roboto',
  -apple-system,
  Avenir,
  BlinkMacSystemFont,
  'Segoe UI',
  Helvetica,
  Arial,
  sans-serif;
$font-family-examples: $font-family-technical;
$font-family-brand: 'Montserrat', $font-family-technical;

$shadow--large: 0 24px 24px 0 rgba(0, 179, 255, 0.24);
$shadow--medium: 0 6px 6px 0 rgba($brand-primary, 0.38);
$shadow--small: 0 6px 6px 0 rgba($brand-primary, 0.28);

$header-height: 55px;
$header-transition: 0.6s cubic-bezier(0.25, 0.8, 0.5, 1);
$header-quick-transition: 0.28s ease-in-out;
<<| sass Sass |>>
@use 'sass:color'

$primary: #214466
$secondary: #266660
$accent: #853394

$positive: #2ecc71
$negative: #ff1732
$info: #10a0ff
$warning: #ffd52d

$brand-primary: #00bfff
$brand-secondary: #4b555c
$brand-accent: #ea5e13
$brand-dark: #2c3e50
$brand-light: #f5f5f5
$brand-medium: #6b7f86
$brand-light-text: #4d4d4d
$brand-light-bg: #fefefe
$brand-dark-bg: #080e1a
$brand-dark-text: #cbcbcb
$brand-light-codeblock-bg: #f5f5f5
$brand-light-codeblock-text: #4d4d4d
$brand-dark-codeblock-bg: #121212
$brand-dark-codeblock-text: #e6e6e6

$header-btn-color--light: #757575
$header-btn-hover-color--light: #212121
$header-btn-color--dark: #929397
$header-btn-hover-color--dark: #fff

$light-pill: $brand-light
$light-text: $brand-light-text
$light-bg: $brand-light-bg

$dark-pill: scale-color($brand-dark-bg, $lightness: 12%)
$dark-text: $brand-dark-text
$dark-bg: $brand-dark-bg

$separator-color: $brand-accent
$separator-color-dark: $brand-accent

$font-size: 16px
$font-size-brand: 16px
$font-weight-brand: 500
$font-weight-technical: 400
$letter-spacing-brand: 0.7px

$font-family-technical: 'Roboto', -apple-system, Avenir, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif
$font-family-examples: $font-family-technical
$font-family-brand: 'Montserrat', $font-family-technical

$shadow--large: 0 24px 24px 0 rgba(0, 179, 255, 0.24)
$shadow--medium: 0 6px 6px 0 rgba($brand-primary, 0.38)
$shadow--small: 0 6px 6px 0 rgba($brand-primary, 0.28)

$header-height: 55px
$header-transition: 0.6s cubic-bezier(0.25, 0.8, 0.5, 1)
$header-quick-transition: 0.28s ease-in-out
```

For custom themes, prefer deriving dark surfaces such as `$dark-pill` from `$brand-dark-bg` instead of `$brand-primary`. Accent colors can become too saturated or too dark when reused as backgrounds or text in dark mode.

## Media Query Breakpoints

When setting up your menu system, you may need to adjust the media query breakpoints. You can add the following to your `src/css/quasar.variables.scss` or `src/css/quasar.variables.sass` file:

```tabs
<<| scss SCSS |>>
$mq-list:
  375,
  470,
  510,
  600,
  780,
  860,
  910,
  1000,
  1020,
  1100,
  1130,
  1190,
  1300 /* drawer */,
  1310,
  1400;

@each $query in $mq-list {
  @media (min-width: #{$query}px) {
    .lt-#{$query} {
      display: none;
    }
  }

  @media (max-width: #{$query - 1}px) {
    .gt-#{$query} {
      display: none;
    }
  }
}
<<| sass Sass |>>
$mq-list: 375, 470, 510, 600, 780, 860, 910, 1000, 1020, 1100, 1130, 1190, 1300, 1310, 1400

@each $query in $mq-list
  @media (min-width: #{$query}px)
    .lt-#{$query}
      display: none

  @media (max-width: #{$query - 1}px)
    .gt-#{$query}
      display: none
```
