---
title: Steps Plugin Advanced Topics
desc: Configure, theme, and constrain numbered step blocks.
related:
  - md-plugins/steps/overview
  - quasar-app-extensions/qpress/themes
---

The Steps plugin is intentionally small: it identifies step boundaries, wraps each step in predictable markup, and leaves visual design to CSS. That keeps it useful in Q-Press, plain Markdown-It sites, and other Vite-powered docs.

## Options

```ts
import { stepsPlugin } from '@md-plugins/md-plugin-steps'

md.use(stepsPlugin, {
  containerName: 'steps',
  headingLevels: [2, 3],
  titleTag: 'h3',
  enableAlternateMarker: true,
  marker: '%step%',
  stepsClass: 'markdown-steps',
  stepClass: 'markdown-step',
  stepMarkerClass: 'markdown-step__marker',
  stepContentClass: 'markdown-step__content',
  stepTitleClass: 'markdown-step__title',
})
```

| Option                  | Default                    | Purpose                                                  |
| ----------------------- | -------------------------- | -------------------------------------------------------- |
| `containerName`         | `'steps'`                  | Container name registered with `markdown-it-container`.  |
| `headingLevels`         | `[2, 3, 4, 5, 6]`          | Heading levels that start a new step.                    |
| `titleTag`              | `'h3'`                     | HTML tag used for rendered step titles.                  |
| `enableAlternateMarker` | `true`                     | Enables `%step% Title` as an alternate marker syntax.    |
| `marker`                | `'%step%'`                 | Marker text used when alternate marker syntax is active. |
| `stepsClass`            | `'markdown-steps'`         | Class for the outer container.                           |
| `stepClass`             | `'markdown-step'`          | Class for each step item.                                |
| `stepMarkerClass`       | `'markdown-step__marker'`  | Class for the visible step number.                       |
| `stepContentClass`      | `'markdown-step__content'` | Class for the step body wrapper.                         |
| `stepTitleClass`        | `'markdown-step__title'`   | Class for the rendered title.                            |

## Restrict Heading Levels

Use `headingLevels` when the container should only treat specific heading levels as step boundaries.

```ts
md.use(stepsPlugin, {
  headingLevels: [3],
})
```

```md
::: steps

### Step title

This starts a step.

#### Supporting detail

This remains inside the current step.
:::
```

## Disable Alternate Markers

If your docs should only use heading-driven steps, disable marker parsing.

```ts
md.use(stepsPlugin, {
  enableAlternateMarker: false,
})
```

## Theme With CSS

The default classes are intentionally plain and stable. These styles provide a good starting point:

```css
.markdown-steps {
  display: grid;
  gap: 1.25rem;
  margin: 1.5rem 0;
}

.markdown-step {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
  border-radius: 12px;
}

.markdown-step__marker {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: white;
  background: var(--q-primary, #1976d2);
  font-weight: 700;
}

.markdown-step__title {
  margin: 0 0 0.5rem;
}
```

## Accessibility

The plugin renders the wrapper with `role="list"` and each step with `role="listitem"`. Step numbers are visual markers and are rendered with `aria-hidden="true"` so screen readers do not announce duplicate numbering before each title.

Use clear step titles and keep the body content self-contained. That makes the sequence easier to skim for everyone, including users navigating by headings or landmarks.
