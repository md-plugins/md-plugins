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

## Workspace Wiring Patterns

Q-Press runs inside a Quasar docs app, but the TypeScript source and generated API JSON do not have to live inside that docs app. In a workspace, create a docs project first, install Q-Press there, then point `api.entries` at the package or app code you want to document.

```bash
pnpm create quasar@latest docs
cd docs
quasar ext add @md-plugins/q-press
```

Use `docs` for a simple repository, or `packages/docs` in a monorepo. Keep the generated `src/.q-press` folder owned by the docs app. Put reusable API JSON either in the package that publishes it or in the docs app when it is only a documentation asset.

### App extension with UI

Use this when the repository publishes both an app extension package and a UI package. Generate API JSON into the UI package so consumers and docs import the same published artifact.

```text
my-extension/
  packages/
    app-extension/
    ui/
      src/components/MyCalendar.ts
      dist/api/
    docs/
      src/markdown/components/my-calendar.md
  qpress.config.json
```

```json
{
  "api": {
    "entries": [
      {
        "input": "packages/ui/src/components/MyCalendar.ts",
        "output": "packages/ui/dist/api/MyCalendar.json",
        "docsUrl": "/components/my-calendar"
      }
    ]
  }
}
```

In the docs page, import the API JSON from the UI package entry that users will install:

```md
<script import>
import MyCalendarApi from '@scope/quasar-ui-my-calendar/dist/api/MyCalendar.json'
</script>

<MarkdownApi :api="MyCalendarApi" name="MyCalendar" />
```

During local docs development, keep those package-shaped imports but alias them back to workspace source. This lets examples hot-update from `packages/ui/src`, lets `MarkdownApi` hot-update after regenerated API JSON changes, and keeps source styles in Vite's normal module graph:

```ts
// packages/docs/quasar.config.ts
import { defineConfig } from '#q-app'

const uiPackage = '@scope/quasar-ui-my-calendar'

export default defineConfig((ctx) => {
  const uiDir = ctx.appPaths.appDir + '/../ui'

  return {
    build: {
      typescript: {
        extendTsConfig(tsConfig) {
          tsConfig.compilerOptions ??= {}
          tsConfig.compilerOptions.paths ??= {}
          tsConfig.compilerOptions.paths[uiPackage] = ['./../../ui/src/index.ts']
          tsConfig.compilerOptions.paths[`${uiPackage}/dist/api/*`] = ['./../../ui/dist/api/*']
        },
      },

      extendViteConf(viteConf) {
        const alias = viteConf.resolve?.alias
        viteConf.resolve = viteConf.resolve || {}
        viteConf.resolve.alias = [
          ...(Array.isArray(alias)
            ? alias
            : Object.entries(alias ?? {}).map(([find, replacement]) => ({ find, replacement }))),
          {
            find: new RegExp(`^${uiPackage}$`),
            replacement: uiDir + '/src/index.ts',
          },
          {
            find: new RegExp(`^${uiPackage}/dist/api/(.+)\\.json$`),
            replacement: uiDir + '/dist/api/$1.json',
          },
          {
            find: new RegExp(`^${uiPackage}/(?:dist/)?index(?:\\.rtl)?(?:\\.min)?\\.css$`),
            replacement: uiDir + '/src/index.scss',
          },
        ]
      },
    },
  }
})
```

Changing JSDoc in `packages/ui/src` still requires regenerating API JSON. Once `qpress api generate --write-output` updates `packages/ui/dist/api/*.json`, the docs dev server can receive the JSON update through the local alias. Restart the dev server after changing `quasar.config.ts`.

Wire direct API output into the UI package build:

```json
{
  "scripts": {
    "build:api": "qpress api generate --root ../.. --write-output",
    "check:api": "qpress api check --root ../..",
    "build": "pnpm build:api && vite build"
  }
}
```

The exact component build command depends on the UI package, but `build:api` should run before package artifacts such as web-types or docs previews read `dist/api`.

### Pure app extension

Use this when the app extension has no UI package. Generate API JSON into the docs app because the API page documents extension commands, prompts, boot helpers, composables, or configuration rather than publishable Vue components.

```text
my-extension/
  packages/
    app-extension/
      src/index.ts
      src/install.ts
    docs/
      src/.q-press/api/app-extension/
      src/markdown/app-extension/api.md
  qpress.config.json
```

```json
{
  "api": {
    "entries": [
      {
        "input": "packages/app-extension/src/install.ts",
        "output": "packages/docs/src/.q-press/api/app-extension/install.json",
        "type": "plugin",
        "group": "functions",
        "docsUrl": "/app-extension/api"
      }
    ]
  }
}
```

Render the generated docs-local API JSON:

```md
<script import>
import InstallApi from '@/.q-press/api/app-extension/install.json'
</script>

<MarkdownApi :api="InstallApi" name="App Extension Install API" />
```

In this shape, the docs build owns API generation:

```json
{
  "scripts": {
    "api:generate": "qpress api generate --root ../.. --write-output",
    "api:check": "qpress api check --root ../..",
    "build": "pnpm api:generate && quasar build"
  }
}
```

### Home-grown Quasar docs site

Use this when the project is not an app extension. The source may be a local component, app-only composable, or internal package. Generate API JSON into the docs app unless another package needs to publish it.

```text
my-app/
  src/components/DateRangePicker.vue
  docs/
    src/.q-press/api/components/
    src/markdown/components/date-range-picker.md
  qpress.config.json
```

```json
{
  "api": {
    "entries": [
      {
        "input": "src/components/DateRangePicker.vue",
        "output": "docs/src/.q-press/api/components/DateRangePicker.json",
        "docsUrl": "/components/date-range-picker"
      }
    ]
  }
}
```

The docs package scripts should point Q-Press at the workspace root because the config and source are outside the docs folder:

```json
{
  "scripts": {
    "api:generate": "qpress api generate --root .. --write-output",
    "api:check": "qpress api check --root ..",
    "check:qpress": "qpress check --root .. --src-dir docs/src",
    "build": "pnpm api:generate && quasar build"
  }
}
```

If the project uses `packages/docs`, use `--root ../..` instead. The important rule is that `--root` points at the folder containing `qpress.config.json`, and `input` and `output` paths are resolved from that root.

## Generate API JSON

Run the generator from the folder that contains `qpress.config.json`:

```bash
pnpm exec qpress api generate
```

If the command runs from a nested docs package, point it at the workspace config:

```bash
pnpm exec qpress api generate --root ../..
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

When the review file is accepted, write the configured API JSON path directly with `--write-output`:

```bash
pnpm exec qpress api generate --write-output
```

Use this mode before committing accepted API JSON and in release or component build scripts after the source JSDoc is the accepted API source of truth. The command writes the configured `output` files, such as `dark.json`; it does not delete review files such as `dark.generated.json`. Delete review files before committing unless your project intentionally keeps them for comparison.

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

### Write final API JSON

Run `pnpm exec qpress api generate --write-output` to replace the configured `output` files without the review suffix.

### Remove review files

Delete `*.generated.json` review files before committing, unless your project intentionally tracks comparison output.

### Commit when ready

Commit the generated API JSON when it is ready to be part of the docs site.

### Wire the release build

Use `pnpm exec qpress api generate --write-output` in the build that publishes your package or docs assets so release artifacts are regenerated from source.
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
- Documented emit string arrays and documented helper spreads such as `@api-follow getRawMouseEvents`.
- `SlotsType<T>` slot declarations and render-function slot usage.
- Public methods exposed through `setup(..., { expose })`.
- Wrapper API forwarding with `@api-source`, `@api-slots`, and `@api-events`.
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

For `defineComponent` emit arrays, document string entries directly. This also works when the array is imported from another local TypeScript file:

```ts
export const useCalendarEmits = [
  /**
   * Emitted when the visible date range changes.
   *
   * @param scope Changed visible range.
   * @param-type scope Object
   * @param-ts-type scope CalendarChangeEvent
   */
  'change',
]
```

If a helper expands to a known family of event names, document the spread and tell the generator which helper to follow:

```ts
export default defineComponent({
  emits: [
    /**
     * Interact with a day cell.
     *
     * @api-follow getRawMouseEvents
     * @api-scope DaySlotScope
     * @param scope Day cell scope.
     * @param event Native mouse or touch event.
     */
    ...getRawMouseEvents('-day'),
  ],
})
```

`@api-follow getRawMouseEvents` expands the suffix into the mouse and touch event names, copies the group description to each event, adds the documented `event` param, and expands `@api-scope` into the `scope.definition`.

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
   * @applicable card, link
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

### Wrapper components

Wrapper components often forward slots or events to a selected child component. Runtime forwarding is difficult to infer safely, so document the forwarding contract on the wrapper export:

```ts
import QCalendarDay from './QCalendarDay'
import QCalendarMonth from './QCalendarMonth'

/**
 * Wrapper component that renders the active calendar view.
 *
 * @api-source QCalendarDay
 * @api-source QCalendarMonth
 * @api-slots QCalendarDay, QCalendarMonth
 * @api-events QCalendarDay, QCalendarMonth
 */
export default defineComponent({
  name: 'QCalendar',
})
```

Use bare `@api-source` when the wrapper forwards all public groups from a child component. Use explicit `@api-props`, `@api-events`, `@api-slots`, or `@api-methods` when the wrapper only forwards selected groups. Forwarded entries get source-derived `applicable` values such as `day` or `month`; duplicate slot and event names merge their scope fields, and fields that only exist for some child components are marked optional.

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

Supported entry-level metadata tags:

| Tag                                  | Use it for                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `@example value`                     | One rendered example. Repeat for multiple examples.                                              |
| `@category name`                     | Prop category tabs. Repeat or separate names with `\|` or `,` for multiple categories.           |
| `@since version`                     | Emits `addedIn`. Works on functions, methods, component props, events, and slots.                |
| `@deprecated message`                | Emits `deprecated`; omit the message when a boolean deprecated flag is enough.                   |
| `@values value \| value`             | Accepted values.                                                                                 |
| `@applicable name, name`             | Project-specific applicability labels, such as calendar view modes or forwarded wrapper sources. |
| `@default value`                     | Documented default when the runtime value needs a clearer display form.                          |
| `@required true` / `@required false` | Requiredness override.                                                                           |
| `@type Type`                         | Displayed API type override.                                                                     |
| `@ts-type Type`                      | TypeScript type override. `@tsType` is also accepted.                                            |
| `@api-exemption field, field`        | Quasar-style `__exemption` values. `@exemption` is also accepted.                                |

Supported structural tags:

| Tag                             | Use it for                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `@api`                          | Include a local function declaration as a component method when it is not exposed through `expose({ ... })`. |
| `@event name`                   | Create an event entry from a documented function, useful for browser `CustomEvent` APIs.                     |
| `@api-follow getRawMouseEvents` | Expand a supported helper spread into multiple event entries.                                                |
| `@api-scope TypeName`           | Attach a scope definition to `@api-follow` events. `@api-event-scope` is also accepted.                      |
| `@api-source ComponentName`     | Forward props, events, slots, and methods from a child component.                                            |
| `@api-props ComponentName`      | Forward only props from a child component.                                                                   |
| `@api-events ComponentName`     | Forward only events from a child component.                                                                  |
| `@api-slots ComponentName`      | Forward only slots from a child component.                                                                   |
| `@api-methods ComponentName`    | Forward only methods from a child component.                                                                 |

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

Parameter metadata tags start with the parameter name. Supported parameter metadata tags are `@param-values name ...`, `@param-applicable name ...`, `@param-example name ...`, `@param-default name ...`, `@param-required name false`, `@param-type name Type`, `@param-ts-type name Type`, and `@param-api-exemption name examples`. The aliases `@param-tsType` and `@param-exemption` are also accepted.

Return metadata uses `@returns-*` or `@return-*`. Supported return metadata tags are `@returns-values`, `@returns-applicable`, `@returns-example`, `@returns-default`, `@returns-required`, `@returns-type`, `@returns-ts-type`, and `@returns-api-exemption`. The `@return-*` form and the aliases `@returns-tsType` and `@returns-exemption` are also accepted.

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
import MarkdownApiApi from '@/.q-press/api/components/MarkdownApi.json'
</script>

<MarkdownApi :api="MarkdownApiApi" name="MarkdownApi" />
```

## What Still Needs Review

Generated output depends on how explicitly the source is documented.

Areas that still need careful review include richer event payload descriptions, imported type expansion, overload documentation, re-exported symbols, default-exported function naming, and deeply nested type definitions.

The safe rule is simple: keep public TypeScript and JSDoc tight, generate, render the result, and fix source documentation until the API page tells users what they need to know.
