---
title: Q-Press Themes
desc: Themes for Q-Press App-Extension for Quasar.
---

Currently, there are five themes available for **Q-Press**:

- **Default**
- **Mystic**
- **Newspaper**
- **Sunrise**
- **Tawny**

To use a theme, simply add the following line to your `src/css/quasar.variables.(scss|sass)` file:

```scss
@import '../.q-press/css/themes/sunrise.scss';
```

This will load the `sunrise` theme into your **Q-Press** enabled app.

## Custom Themes

If you want to build your own theme, add these variables to your `src/css/quasar.variables.(scss|sass)` file and modify them to your liking:

```scss
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

$dark-pill: scale-color($brand-primary, $lightness: -80%);
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
```

## Media Query Breakpoints

When setting up your menu system, you may need to adjust the media query breakpoints. You can add the following to your `src/css/quasar.variables.(scss|sass)` file:

```scss
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
```
