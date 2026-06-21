---
title: Q-Press Themes
desc: Themes for the Q-Press App Extension for Quasar.
---

Currently, there are eight themes available for **Q-Press**:

- **Copperline**
- **Default**
- **Evergreen**
- **Mystic**
- **Newspaper**
- **Signal**
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

| Theme input                                                | Runtime result                                                                                                  | Visible effect                                                                                |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `$brand-primary`                                           | `--qpress-color-primary`, `--qpress-rgb-primary`, action/chip/icon tokens                                       | Menu accents, pills, highlighted values, icon blocks, primary CTAs, and landing-page accents. |
| `$brand-secondary`                                         | `--qpress-color-secondary`, `--qpress-rgb-secondary`, secondary shadow mixes                                    | Secondary palette color available for custom components and subtle depth.                     |
| `$brand-accent`                                            | `--qpress-color-accent`, `--qpress-rgb-accent`                                                                  | Extra accent color available for custom components.                                           |
| `$brand-border-color-light` and `$brand-border-color-dark` | `--qpress-border-subtle`, `--qpress-border-strong`, pill, tile, resource, search, and highlighted border tokens | Shared border language for cards, panels, sections, Steps, code gutters, and search surfaces. |
| `$brand-light-bg` and `$brand-dark-bg`                     | `--qpress-surface-page`, `--qpress-surface-panel`, hero start/end tokens                                        | Page background, panel background, and landing-page hero atmosphere.                          |
| `$brand-light-text` and `$brand-dark-text`                 | `--qpress-text-primary`, `--qpress-text-body`, `--qpress-text-muted`, `--qpress-text-soft`                      | Headings, paragraph text, helper text, and lower-emphasis copy.                               |
| `$brand-light` and `$dark-pill`                            | `--qpress-surface-base`, `--qpress-surface-raised`, pill/chip/action backgrounds                                | Cards, raised panels, pills, chips, and ghost buttons.                                        |
| `$steps-*` variables                                       | Generated `.markdown-steps`, `.markdown-step`, `.markdown-step__marker`, and `.markdown-step__title` styles     | Numbered instructional flows that inherit the same panel, border, text, and marker tone.      |
| `$shadow--large`, `$shadow--medium`, `$shadow--small`      | Shadow tokens and component shadows                                                                             | Depth on cards, hero sections, and elevated controls.                                         |

### Token Families

| Family               | Tokens                                                                                                                                                                                                                                                                             | Use them for                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Base colors          | `--qpress-color-primary`, `--qpress-color-secondary`, `--qpress-color-accent`, `--qpress-color-light`, `--qpress-color-dark`                                                                                                                                                       | Direct color references.                                         |
| RGB channels         | `--qpress-rgb-primary`, `--qpress-rgb-secondary`, `--qpress-rgb-accent`, `--qpress-rgb-light`, `--qpress-rgb-dark`, `--qpress-rgb-text`, `--qpress-rgb-surface`, `--qpress-rgb-surface-raised`                                                                                     | Opacity-aware color mixes with `rgb(var(--token) / 0.24)`.       |
| Text                 | `--qpress-text-primary`, `--qpress-text-body`, `--qpress-text-muted`, `--qpress-text-soft`, `--qpress-meta-text`                                                                                                                                                                   | Headings, body copy, support text, and soft labels.              |
| Surfaces             | `--qpress-surface-page`, `--qpress-surface-base`, `--qpress-surface-raised`, `--qpress-surface-raised-strong`, `--qpress-surface-panel`, `--qpress-panel-gradient-top`, `--qpress-panel-gradient-bottom`                                                                           | Page backgrounds, cards, panels, and stronger card states.       |
| Borders and shadows  | `--qpress-border-subtle`, `--qpress-border-strong`, `--qpress-card-shadow`, `--qpress-shadow-large`, `--qpress-pill-border`, `--qpress-highlight-border`, `--qpress-tile-border`, `--qpress-tile-hover-border`, `--qpress-resource-item-border`, `--qpress-tile-hover-shadow`      | Card outlines, section dividers, search surfaces, and elevation. |
| Actions              | `--qpress-action-solid-bg`, `--qpress-action-solid-text`, `--qpress-action-solid-shadow`, `--qpress-action-ghost-bg`, `--qpress-action-ghost-text`                                                                                                                                 | Primary and secondary buttons.                                   |
| Chips and pills      | `--qpress-chip-bg`, `--qpress-chip-text`, `--qpress-pill-bg`, `--qpress-pill-border`, `--qpress-pill-text`                                                                                                                                                                         | Small labels, feature tags, and compact link pills.              |
| Highlights and icons | `--qpress-highlight-bg`, `--qpress-highlight-border`, `--qpress-highlight-value`, `--qpress-highlight-label`, `--qpress-icon-bg`, `--qpress-icon-color`, `--qpress-accent-line`                                                                                                    | Stats cards, icon tiles, callout headers, and accent rules.      |
| Tiles and resources  | `--qpress-tile-bg`, `--qpress-tile-border`, `--qpress-tile-hover-bg`, `--qpress-tile-hover-border`, `--qpress-tile-hover-shadow`, `--qpress-resource-link-bg`, `--qpress-resource-link-text`, `--qpress-resource-item-bg`, `--qpress-resource-item-border`, `--qpress-spot-accent` | Landing-page feature cards, resource cards, and link groups.     |
| Hero atmosphere      | `--qpress-mesh-color`, `--qpress-hero-glow-primary`, `--qpress-hero-glow-secondary`, `--qpress-hero-start`, `--qpress-hero-end`                                                                                                                                                    | Landing-page backgrounds and decorative glows.                   |

Steps styling is generated from Sass theme inputs instead of runtime `--qpress-*` tokens. By default, `$steps-border-color-light` and `$steps-border-color-dark` point back to the shared brand border variables so Steps match cards, code panels, and search UI.

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

Changing `$brand-light-bg` or `$brand-dark-bg` changes the panel surface. Changing `$brand-light-text` or `$brand-dark-text` changes the copy. Changing `$brand-border-color-light` or `$brand-border-color-dark` changes the border contrast.

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

$dark-pill: color.scale($brand-dark-bg, $lightness: 12%);
$dark-text: $brand-dark-text;
$dark-bg: $brand-dark-bg;

$separator-color: $brand-accent;
$separator-color-dark: $brand-accent;

$brand-border-color-light: $separator-color;
$brand-border-color-dark: rgba($brand-medium, 0.68);

$steps-bg: $brand-light-codeblock-bg;
$steps-bg-dark: $brand-dark-codeblock-bg;
$steps-text: $brand-light-text;
$steps-text-dark: $brand-dark-text;
$steps-title-color: $brand-light-text;
$steps-title-color-dark: $brand-dark-text;
$steps-border-color-light: $brand-border-color-light;
$steps-border-color-dark: $brand-border-color-dark;
$steps-marker-bg: $brand-primary;
$steps-marker-bg-dark: color.mix($brand-primary, $brand-light, 82%);
$steps-marker-color: $brand-light;
$steps-marker-color-dark: $brand-dark-bg;
$steps-shadow: 0 10px 20px 0 rgba($brand-dark, 0.08);
$steps-shadow-dark: 0 10px 20px 0 rgba(#000, 0.2);

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

$dark-pill: color.scale($brand-dark-bg, $lightness: 12%)
$dark-text: $brand-dark-text
$dark-bg: $brand-dark-bg

$separator-color: $brand-accent
$separator-color-dark: $brand-accent

$brand-border-color-light: $separator-color
$brand-border-color-dark: rgba($brand-medium, 0.68)

$steps-bg: $brand-light-codeblock-bg
$steps-bg-dark: $brand-dark-codeblock-bg
$steps-text: $brand-light-text
$steps-text-dark: $brand-dark-text
$steps-title-color: $brand-light-text
$steps-title-color-dark: $brand-dark-text
$steps-border-color-light: $brand-border-color-light
$steps-border-color-dark: $brand-border-color-dark
$steps-marker-bg: $brand-primary
$steps-marker-bg-dark: color.mix($brand-primary, $brand-light, 82%)
$steps-marker-color: $brand-light
$steps-marker-color-dark: $brand-dark-bg
$steps-shadow: 0 10px 20px 0 rgba($brand-dark, 0.08)
$steps-shadow-dark: 0 10px 20px 0 rgba(#000, 0.2)

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

These breakpoints create the `.lt-*` and `.gt-*` utility classes used by the generated Q-Press header. They also need to match the `mq` values in `src/siteConfig/index.ts`.

| Breakpoint          | Correlation                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `mq` on a menu item | Q-Press renders that menu item with either `gt-{mq}` or `lt-{mq}`. If the value is missing from `$mq-list`, the generated class will not exist. |
| `.gt-{mq}`          | Visible at `{mq}px` and wider. Used by primary and secondary header links.                                                                      |
| `.lt-{mq}`          | Visible below `{mq}px`. Used by the `More` menu, drawer button, and compact header controls.                                                    |
| `1300 /* drawer */` | Default drawer/menu-button breakpoint in the generated layout. Keep this in sync if you customize the drawer behavior.                          |
| `1400`              | Default breakpoint for showing social icon links directly in the header instead of keeping them inside `More`.                                  |

For example, if `src/siteConfig/index.ts` contains a menu item with `mq: 1330`, then `$mq-list` must include `1330` so Q-Press can generate `.gt-1330` and `.lt-1330`.

The generated Q-Press site uses these menu correlations by default:

| Default value | Used by                                         |
| ------------- | ----------------------------------------------- |
| `470`         | `Getting Started` header menu item.             |
| `860`         | `MD Plugins` header menu item.                  |
| `1000`        | `Vite Plugins` header menu item.                |
| `1330`        | `Quasar App Extensions` header menu item.       |
| `1400`        | `Other` header menu item and social icon links. |

If you add a menu item, widen labels, enable search, or change header actions, adjust the affected `mq` values and keep `$mq-list` in sync.

```tabs
<<| scss SCSS |>>
$mq-list:
  375,
  470,
  510,
  600,
  750,
  780,
  820,
  850,
  860,
  900,
  910,
  960,
  980,
  1000,
  1020,
  1060,
  1080,
  1100,
  1130,
  1140,
  1190,
  1220,
  1240,
  1300 /* drawer */,
  1310,
  1330,
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
$mq-list: 375, 470, 510, 600, 750, 780, 820, 850, 860, 900, 910, 960, 980, 1000, 1020, 1060, 1080, 1100, 1130, 1140, 1190, 1220, 1240, 1300, 1310, 1330, 1400

@each $query in $mq-list
  @media (min-width: #{$query}px)
    .lt-#{$query}
      display: none

  @media (max-width: #{$query - 1}px)
    .gt-#{$query}
      display: none
```
