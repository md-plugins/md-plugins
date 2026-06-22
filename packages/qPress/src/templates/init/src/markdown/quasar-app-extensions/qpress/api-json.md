---
title: API JSON
desc: Generate Q-Press API JSON from TypeScript source and JSDoc.
related:
  - quasar-app-extensions/qpress/cli
  - quasar-app-extensions/qpress/components
---

Q-Press can generate the JSON consumed by `MarkdownApi` from TypeScript source and JSDoc. Write the public API once in source, add focused JSDoc where TypeScript cannot describe user-facing behavior, then generate API JSON for your docs pages.

The generator writes `*.generated.json` files so you can review output before publishing it. The generated file includes a top-level `generated_at` timestamp, the API `type`, optional `meta.docsUrl`, and API groups such as `props`, `events`, `slots`, `methods`, or `functions`.

## When To Use This

Use API generation when your public API has TypeScript signatures and JSDoc comments that should be the source of truth.

Good targets include composables, utilities, Vue components, and render-function components that declare public props, emits, slots, exposed methods, and return types in source.

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

## Generate API JSON

Run the generator from the docs project:

```bash
pnpm exec qpress api generate
```

For this configured output path:

```text
src/.q-press/api/composables/dark.json
```

Q-Press writes this review file:

```text
src/.q-press/api/composables/dark.generated.json
```

Review the generated file. If the descriptions, examples, categories, params, returns, or slot scopes are thin, update the TypeScript/JSDoc and run the generator again.

Generated JSON starts like this:

```json
{
  "generated_at": "2026-06-22T19:00:00.000Z",
  "type": "component",
  "meta": {
    "docsUrl": "/components/my-component"
  },
  "props": {}
}
```

## Check For Drift

Use `qpress api check` when CI should confirm committed API JSON still matches source:

```bash
pnpm exec qpress api check
```

The checker reports missing or stale API JSON and includes a field-level summary:

```text
Field changes: 5 generated-only, 4 changed, 1 current-only
```

Those field changes help you decide what source docs need attention. `generated-only` fields are present in the latest generated output, `current-only` fields are present in the committed API JSON, and `changed` fields exist in both but differ.

The top-level `generated_at` field is ignored by drift checks so normal timestamp churn does not fail CI.

## Normal Q-Press Checks

When `api.entries` is configured, `qpress check` can also report stale generated API output.

If a project is still drafting API docs and should not fail broader docs checks yet, disable API drift failures:

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

Once the API docs are ready for release validation, remove `checkGeneratedApi: false` so normal checks catch source/API drift.

## Authoring Workflow

::: steps

### Document the source

Add TypeScript types and JSDoc to the public props, events, slots, methods, or exported functions.

### Configure the entry

Add an `api.entries` item with `input`, `output`, and any optional `type`, `group`, or `docsUrl` fields.

### Generate JSON

Run `pnpm exec qpress api generate`.

### Review the generated file

Open the `*.generated.json` file or render it with `MarkdownApi`.

### Fill documentation gaps

Move missing descriptions, examples, categories, accepted values, and event details into TypeScript/JSDoc.

### Commit when ready

Commit the generated API JSON when it is ready to be part of the docs site.
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

## JSDoc Source Patterns

The generator should not guess important documentation. Put the public API description on the source node that owns the API entry, then use tags for the fields that TypeScript alone cannot describe.

### Exported functions

```ts
type Timestamp = {
  /**
   * ISO date value.
   */
  date: string
}

/**
 * Converts a supported input into a timestamp.
 *
 * @param input Date or date-time string.
 * @param-values input '2036-06-08' | '2036-06'
 * @param-example input '2036-06-08'
 * @param now Optional timestamp used for relative flags.
 * @returns Parsed timestamp, or null when invalid.
 * @returns-example null
 * @example parseTimestamp('2036-06-08')
 * @since 0.1.0
 */
export function parseTimestamp(input: string, now?: Timestamp | null): Timestamp | null {
  return null
}
```

This produces a function entry with parameter descriptions, examples, a TypeScript signature, return metadata, and a nested return definition for `Timestamp`.

### Exported const functions

```ts
/**
 * Returns today's date in ISO format.
 *
 * @returns Current ISO date.
 * @deprecated Use todayUTC when server/client timezone consistency matters.
 */
export const today = (): string => '2036-06-08'
```

Use this pattern for composables and helpers that are exported as arrow functions or function expressions.

### Runtime Vue props

```ts
const props = defineProps({
  /**
   * Target URL or route location.
   *
   * @category navigation
   * @category content
   * @example '/docs'
   * @example 'https://example.com'
   */
  to: {
    type: String,
    required: true,
  },

  /**
   * Visual tone used by the link card.
   *
   * @category style
   * @values 'primary' | 'secondary'
   * @default 'primary'
   */
  tone: {
    type: String,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary'].includes(value),
  },
})
```

Runtime prop objects are useful when the component already has Vue runtime validation. The generator reads `type`, `required`, `default`, validator arrays, descriptions, categories, and examples.

### Typed Vue props

```ts
type MarkdownApiProps = {
  /**
   * API JSON object to render directly.
   *
   * @category content
   */
  api?: ApiFile | null

  /**
   * Display name shown in the API card header.
   *
   * @category content
   */
  name?: string

  /**
   * Whether to show the Docs button when `meta.docsUrl` is available.
   *
   * @category navigation
   */
  pageLink?: boolean
}

const props = withDefaults(defineProps<MarkdownApiProps>(), {
  api: null,
  name: 'API Documentation',
  pageLink: false,
})
```

Typed props can come from inline type literals, local interfaces, local type aliases, or locally imported declarations. Use `withDefaults` when optional typed props have runtime defaults.

### Component events

```ts
const emit = defineEmits({
  /**
   * Emitted when the selected mode changes.
   *
   * @param mode Current selected mode.
   * @param-values mode 'dark' | 'light'
   * @param-example mode 'dark'
   */
  'update:mode': (mode: 'dark' | 'light') => true,
})
```

For browser or custom events that are not declared through `defineEmits`, use `@event` on a documented function:

```ts
/**
 * Browser CustomEvent dispatched after the privacy choice is saved.
 *
 * @event qpress:privacy-consent
 * @param detail Stored consent detail.
 * @param-ts-type detail StoredPrivacyConsent
 */
function emitPrivacyConsent(detail: StoredPrivacyConsent): void {
  window.dispatchEvent(new CustomEvent('qpress:privacy-consent', { detail }))
}
```

### Slots

For `<script setup>`, use `defineSlots`:

```ts
defineSlots<{
  /**
   * Custom content inside the card link.
   *
   * @param scope Slot props provided to custom content.
   */
  default(scope: { active: boolean }): unknown
}>()
```

For render-function or `defineComponent` components, use `SlotsType`:

```ts
interface MarkdownPrerenderSlots {
  /**
   * Prerendered Markdown or example content.
   */
  default?: () => unknown
}

export default defineComponent({
  slots: Object as SlotsType<MarkdownPrerenderSlots>,
  setup(_props, { slots }) {
    return () => h('div', slots.default?.())
  },
})
```

### Exposed methods

```ts
export default defineComponent({
  setup(_props, { expose }) {
    /**
     * Moves to the previous visible range.
     *
     * @param amount Number of ranges to move.
     */
    function prev(amount = 1): void {}

    /**
     * Scrolls to a specific time.
     *
     * @param time Time in HH:mm format.
     * @param duration Animation duration in milliseconds.
     * @returns Scroll completion state.
     */
    function scrollToTime(time: string, duration = 0): boolean {
      return true
    }

    expose({
      prev,
      scrollToTime,
    })
  },
})
```

Only document public methods that should appear in the API page. If a generated exposed method is missing a description, add JSDoc to the local function being exposed.

## Metadata Tags

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

## Output Review Examples

Read drift as a prompt to improve source docs or the generator:

```text
Field changes: 8 generated-only, 3 changed, 2 current-only
```

- `generated-only` means the latest source generated a field that is not in the committed API JSON.
- `current-only` means the committed API JSON has a field that source/JSDoc did not generate.
- `changed` means both files describe the same path but disagree on value, such as a default, required flag, or description.

For early review, render generated JSON directly on a local page:

```md
<script import>
import MarkdownApiGeneratedApi from '@/.q-press/api/components/MarkdownApi.generated.json'
</script>

<MarkdownApi :api="MarkdownApiGeneratedApi" name="MarkdownApi" />
```

## What Still Needs Review

Generated output depends on how explicitly the source is documented.

Areas that still need careful review include richer event payload descriptions, imported type expansion, overload documentation, re-exported symbols, default-exported function naming, and deeply nested type definitions.

The safe rule is simple: keep public TypeScript and JSDoc tight, generate, render the result, and fix source documentation until the API page tells users what they need to know.
