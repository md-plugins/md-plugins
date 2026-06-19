# @md-plugins/md-plugin-steps

A **Markdown-It** plugin that renders wizard-like numbered steps from Markdown headings or explicit step markers.

Use it for install flows, migration guides, tutorials, release checklists, or any docs page where readers need a clear sequence of actions.

## Features

- Registers a `::: steps` container through `markdown-it-container`.
- Turns top-level headings inside the container into numbered visual steps.
- Preserves nested Markdown content such as lists, code fences, tables, and containers.
- Supports alternate `%step%` marker syntax.
- Provides themeable class names for Q-Press or custom docs sites.

## Installation

Install the plugin via your preferred package manager:

```bash
# with pnpm:
pnpm add @md-plugins/md-plugin-steps
# with bun:
bun add @md-plugins/md-plugin-steps
# with Yarn:
yarn add @md-plugins/md-plugin-steps
# with npm:
npm install @md-plugins/md-plugin-steps
```

## Usage

```ts
import MarkdownIt from 'markdown-it'
import { stepsPlugin } from '@md-plugins/md-plugin-steps'

const md = new MarkdownIt()

md.use(stepsPlugin)
```

Then author steps with headings:

```md
::: steps

## Install package

Run the package manager command.

## Configure plugin

Add the plugin to your Markdown-It setup.

## Build docs

Run the docs build and inspect the output.
:::
```

Rendered output uses this general shape:

```html
<div class="markdown-steps" role="list">
  <section class="markdown-step" role="listitem">
    <div class="markdown-step__marker" aria-hidden="true">1</div>
    <div class="markdown-step__content">
      <h3 class="markdown-step__title">Install package</h3>
      <p>Run the package manager command.</p>
    </div>
  </section>
</div>
```

## Alternate marker syntax

You can also use `%step%` marker paragraphs when headings are not a good fit:

```md
::: steps
%step% Install package

Run the package manager command.

%step% Configure plugin

Add the plugin to your Markdown-It setup.
:::
```

For new content, prefer headings because they are easier to read and edit.

## Options

| Option                  | Type                        | Default                    | Description                                        |
| ----------------------- | --------------------------- | -------------------------- | -------------------------------------------------- |
| `containerName`         | `string`                    | `'steps'`                  | Container name registered with markdown-it.        |
| `stepsClass`            | `string`                    | `'markdown-steps'`         | Class for the outer steps container.               |
| `stepClass`             | `string`                    | `'markdown-step'`          | Class for each step item.                          |
| `stepMarkerClass`       | `string`                    | `'markdown-step__marker'`  | Class for the rendered step number.                |
| `stepContentClass`      | `string`                    | `'markdown-step__content'` | Class for the step body wrapper.                   |
| `stepTitleClass`        | `string`                    | `'markdown-step__title'`   | Class for the rendered step title.                 |
| `headingLevels`         | `(2 \| 3 \| 4 \| 5 \| 6)[]` | `[2, 3, 4, 5, 6]`          | Heading levels that create new steps.              |
| `titleTag`              | `StepsTitleTag`             | `'h3'`                     | HTML tag used for rendered step titles.            |
| `enableAlternateMarker` | `boolean`                   | `true`                     | Enables `%step%` marker support.                   |
| `marker`                | `string`                    | `'%step%'`                 | Marker string used by the alternate marker syntax. |

## Custom Classes

```ts
md.use(stepsPlugin, {
  stepsClass: 'docs-steps',
  stepClass: 'docs-step',
  stepMarkerClass: 'docs-step__marker',
  stepContentClass: 'docs-step__body',
  stepTitleClass: 'docs-step__heading',
  titleTag: 'h4',
})
```

## Suggested CSS

```css
.markdown-steps {
  display: grid;
  gap: 1.25rem;
}

.markdown-step {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  gap: 1rem;
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

## Testing

To run the tests for this plugin, use the following command:

```bash
pnpm test
```

## Support

If md-plugin-steps is useful in your workflow and you want to support ongoing maintenance:

- GitHub Sponsors: https://github.com/sponsors/hawkeye64
- PayPal: https://paypal.me/hawkeye64

## License

This plugin is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
