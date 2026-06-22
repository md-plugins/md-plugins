---
title: API JSON
desc: Generate, compare, and gradually adopt Q-Press API JSON from TypeScript and JSDoc.
related:
  - quasar-app-extensions/qpress/cli
  - quasar-app-extensions/qpress/components
---

Q-Press can render existing hand-authored API JSON and generated API JSON side by side while you migrate toward source-driven documentation.

The generator is intentionally conservative. It writes comparison files such as `*.generated.json` and never overwrites your committed API files unless a future explicit adoption command is added.

## When To Use This

Use API generation when your public API already has TypeScript signatures and JSDoc comments that should be the source of truth.

Good first targets are composables, utilities, and small TypeScript modules because their exported functions map cleanly to Q-Press API entries.

For Vue components, keep hand-authored API JSON until the generator supports props, emits, slots, exposed members, and companion metadata well enough for your project.

## Configure Entries

Add source/output pairs under `api.entries` in `qpress.config.json`, `qpress.config.mjs`, or another supported Q-Press config file:

```json
{
  "api": {
    "entries": [
      {
        "input": "src/.q-press/composables/dark.ts",
        "output": "src/.q-press/api/composables/dark.json",
        "group": "functions",
        "docsUrl": "/quasar-app-extensions/qpress/overview"
      }
    ]
  }
}
```

Use `group: "functions"` for composables and utility functions. Use `group: "methods"` when the generated output should render under the Methods API tab.

## Generate Comparison Files

Run the generator from the docs project:

```bash
pnpm exec qpress api generate
```

For this committed API file:

```text
src/.q-press/api/composables/dark.json
```

Q-Press writes this review file:

```text
src/.q-press/api/composables/dark.generated.json
```

Review the generated file before adoption. The generated output is intentionally pure generator output so you can compare it with the existing hand-authored file and see which source or JSDoc details are still missing.

## Check For Drift

Use `qpress api check` when you want a CI-friendly report without writing files:

```bash
pnpm exec qpress api check
```

The checker reports missing or stale API JSON and includes a field-level summary:

```text
Field changes: 5 generated-only, 4 changed, 1 current-only
```

Those field changes help you decide what the generator still needs to learn. `generated-only` fields exist only in generated output, `current-only` fields exist only in the committed hand-authored file, and `changed` fields exist in both but differ.

## Normal Q-Press Checks

When `api.entries` is configured, `qpress check` can also report stale generated API output.

During early migration, disable API drift failures in the broader docs check:

```json
{
  "check": {
    "checkGeneratedApi": false
  }
}
```

You can also skip API drift checks for one command:

```bash
pnpm exec qpress check --no-api
```

Once the generated output is trusted, remove `checkGeneratedApi: false` so normal release validation catches API drift.

## Adoption Workflow

::: steps

### Add a low-risk target

Add one low-risk `api.entries` target.

### Generate comparison JSON

Run `pnpm exec qpress api generate`.

### Compare the output

Compare the committed API JSON with the generated comparison file.

### Move metadata to source

Move missing descriptions, examples, categories, accepted values, and event details into TypeScript/JSDoc.

### Check the drift

Run `pnpm exec qpress api check` to confirm the remaining drift is understood.

### Adopt only after review

Commit config, docs, or tests first; adopt generated JSON only after review.
:::

## What The Generator Currently Extracts

The generator focuses on TypeScript source plus explicit JSDoc metadata:

- Exported function declarations.
- Exported `const` arrow functions.
- Exported `const` function expressions.
- Object-style `<script setup>` `defineProps`.
- Typed `<script setup>` `defineProps<T>()` from inline type literals, local interfaces, local type aliases, and local imported declarations.
- `withDefaults(defineProps<T>(), defaults)` default values.
- Simple array-style and object-style `<script setup>` `defineEmits`.
- TypeScript `defineComponent({ props, emits, slots, setup })` component declarations.
- Imported prop and emit spreads when they resolve to local TypeScript source.
- `SlotsType<T>` slot declarations and render-function slot usage.
- Public methods exposed through `setup(..., { expose })`.
- Template `<slot>` usage, with descriptions from `defineSlots` JSDoc when provided.
- JSDoc descriptions.
- `@param`, `@returns`, `@example`, `@category`, `@since`, `@deprecated`, and explicit API metadata tags.
- TypeScript signatures.
- Local interface and type-literal return definitions when the return type points directly at them.
- Simple accepted values from validator arrays such as `['day', 'week'].includes(value)`.

Use repeated `@example` tags to emit multiple examples. Use `@category` on prop JSDoc to place generated props into MarkdownApi category tabs; repeat the tag or separate names with `|` or `,` when a prop belongs to more than one category. Props without `@category` omit the field and render in MarkdownApi's default group.

Use explicit metadata tags when TypeScript cannot safely infer a field:

```ts
/**
 * Calendar view mode.
 *
 * @category behavior
 * @values 'day' | 'week' | 'month'
 * @applicable calendar, scheduler
 * @default 'day'
 * @api-exemption examples
 */
view: {
  type: String,
  default: 'day',
}
```

Supported property-level metadata tags:

- `@values value | value` for accepted values.
- `@applicable name, name` for project-specific applicability labels.
- `@default value` when the runtime default needs a documented form.
- `@required true` or `@required false` to override requiredness.
- `@type Type` and `@ts-type Type` when the displayed type needs to be explicit.
- `@api-exemption field, field` for Quasar-style `__exemption` values.

Use parameter and return variants for functions, events, and slot scopes:

```ts
/**
 * Emitted when the selected mode changes.
 *
 * @event update:mode
 * @param mode Current selected mode.
 * @param-values mode 'dark' | 'light'
 * @param-example mode 'dark'
 */
function emitMode(mode: 'dark' | 'light'): void {}
```

Parameter metadata tags start with the parameter name: `@param-values name ...`, `@param-example name ...`, `@param-default name ...`, `@param-required name false`, `@param-type name Type`, `@param-ts-type name Type`, and `@param-api-exemption name examples`.

Return metadata uses `@returns-*` or `@return-*`, such as `@returns-example null`, `@returns-type Timestamp`, `@returns-ts-type Timestamp`, and `@returns-api-exemption examples`.

Use `defineSlots` when slot descriptions should be generated from source:

```ts
defineSlots<{
  /**
   * Slot for custom content inside the link.
   */
  default(): unknown
}>()
```

## What Still Needs Review

Generated output is not a complete replacement for all existing API JSON yet.

Areas that still need careful review include richer event payload descriptions, imported type expansion, overload documentation, re-exported symbols, default-exported function naming, and deeply nested type definitions.

The safe rule is simple: generate for comparison, review the diff, and only adopt what is better than the current API page.
