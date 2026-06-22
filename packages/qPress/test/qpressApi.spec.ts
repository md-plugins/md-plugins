import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkQPressApi, generateQPressApi, getGeneratedOutputPath } from '../src/api/qpress-api.js'
import { runQPressApiCli } from '../src/bin/qpress-api-command.js'

/**
 * Creates a temporary project root for qpress API generator tests.
 */
async function createProject(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'qpress-api-'))

  await Promise.all(
    Object.entries(files).map(async ([file, content]) => {
      const path = join(root, file)

      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, content)
    }),
  )

  return root
}

describe('qpress api', () => {
  it('writes generated comparison files without overwriting existing API JSON', async () => {
    const root = await createProject({
      'src/.q-press/api/composables/timestamp.json': '{"type":"component"}\n',
      'src/utils/timestamp.ts': `
type Timestamp = {
  date: string
}

type ParserReturn = {
  /**
   * Parsed timestamp object.
   */
  value: Timestamp

  /**
   * Whether parsing succeeded.
   */
  valid: boolean
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
 * @returns-api-exemption examples
 * @example parseTimestamp('2036-06-08')
 * @since 0.1.0
 */
export function parseTimestamp(input: string, now?: Timestamp | null): Timestamp | null {
  return null
}

/**
 * Parses a timestamp with metadata.
 *
 * @returns Parser result.
 */
export function parseWithMetadata(): ParserReturn {
  return {
    value: {
      date: '2036-06-08',
    },
    valid: true,
  }
}

/**
 * Returns today's date.
 *
 * @returns Date string.
 * @deprecated Use todayUTC instead when server/client timezone consistency matters.
 */
export const today = (): string => '2036-06-08'
`,
    })

    try {
      const result = await generateQPressApi({
        cwd: root,
        entries: [
          {
            docsUrl: '/api/timestamp',
            input: 'src/utils/timestamp.ts',
            output: 'src/.q-press/api/composables/timestamp.json',
          },
        ],
      })

      const existing = await readFile(
        join(root, 'src/.q-press/api/composables/timestamp.json'),
        'utf8',
      )
      const generated = JSON.parse(
        await readFile(join(root, 'src/.q-press/api/composables/timestamp.generated.json'), 'utf8'),
      )

      expect(existing).toBe('{"type":"component"}\n')
      expect(result.entries[0]?.differsFromOutput).toBe(true)
      expect(result.entries[0]?.exportCount).toBe(3)
      expect(result.entries[0]?.fieldChanges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: '$.functions',
            type: 'added',
          }),
          expect.objectContaining({
            path: '$.meta',
            type: 'added',
          }),
        ]),
      )
      expect(generated.meta.docsUrl).toBe('/api/timestamp')
      expect(generated.functions.parseTimestamp.desc).toBe(
        'Converts a supported input into a timestamp.',
      )
      expect(generated.functions.parseTimestamp.addedIn).toBe('0.1.0')
      expect(generated.functions.parseTimestamp.params.input).toEqual({
        desc: 'Date or date-time string.',
        examples: ["'2036-06-08'"],
        required: true,
        tsType: 'string',
        type: 'string',
        values: ["'2036-06-08'", "'2036-06'"],
      })
      expect(generated.functions.parseTimestamp.tsSignature).toBe(
        'function parseTimestamp(input: string, now?: Timestamp | null): Timestamp | null',
      )
      expect(generated.functions.parseTimestamp.params.now.required).toBe(false)
      expect(generated.functions.parseTimestamp.returns).toEqual({
        __exemption: ['examples'],
        definition: {
          date: {
            desc: '',
            required: true,
            tsType: 'string',
            type: 'string',
          },
        },
        desc: 'Parsed timestamp, or null when invalid.',
        examples: ['null'],
        tsType: 'Timestamp | null',
        type: 'Timestamp | null',
      })
      expect(generated.functions.parseTimestamp.examples).toEqual(["parseTimestamp('2036-06-08')"])
      expect(generated.functions.parseWithMetadata.returns.definition).toEqual({
        value: {
          desc: 'Parsed timestamp object.',
          required: true,
          tsType: 'Timestamp',
          type: 'Timestamp',
        },
        valid: {
          desc: 'Whether parsing succeeded.',
          required: true,
          tsType: 'boolean',
          type: 'boolean',
        },
      })
      expect(generated.functions.today.returns.type).toBe('string')
      expect(generated.functions.today.deprecated).toBe(
        'Use todayUTC instead when server/client timezone consistency matters.',
      )
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('captures supported API edge cases without overwriting curated files', async () => {
    const root = await createProject({
      'src/.q-press/api/composables/edge.json': '{"type":"component"}\n',
      'src/types.ts': `
export interface ExternalClock {
  now(): Date
}

export interface ExternalResult {
  /**
   * External result label.
   */
  label: string
}
`,
      'src/utils/edge.ts': `
import type { ExternalClock, ExternalResult } from '../types'

export type WindowResult = {
  /**
   * Start details for the window.
   */
  start: {
    date: string
    time?: string
  }

  /**
   * Duration in minutes.
   */
  minutes: number

  /**
   * Formats a label for display.
   */
  format(label: string): string
}

/**
 * Creates a date window.
 *
 * @param input Date input.
 * @param options Optional format options.
 * @param clock Optional external clock.
 * @returns Window result, or null.
 * @example createWindow('2036-06-08')
 * @example createWindow('2036-06-08', { zone: 'UTC' })
 * @since 0.1.0
 */
export function createWindow(
  input: string,
  options: { zone?: string; step?: number } = {},
  clock?: ExternalClock,
): WindowResult | null {
  return null
}

/**
 * Returns a concrete date window.
 *
 * @returns Window result.
 * @deprecated Use createWindow for nullable parsing.
 */
export const getWindow = function (): WindowResult {
  return {
    start: {
      date: '2036-06-08',
    },
    minutes: 30,
    format: (label) => label,
  }
}

/**
 * Returns an imported result.
 *
 * @returns Imported result.
 */
export function getExternalResult(): ExternalResult {
  return {
    label: 'External',
  }
}

/**
 * Parses a string input.
 *
 * @param input Input value.
 * @returns Parsed value.
 */
export function parseValue(input: string): string
export function parseValue(input: number): number

/**
 * Parses an overloaded input.
 *
 * @param input Input value.
 * @returns Parsed value.
 */
export function parseValue(input: string | number): string | number {
  return input
}
`,
    })

    try {
      const result = await generateQPressApi({
        cwd: root,
        entries: [
          {
            input: 'src/utils/edge.ts',
            output: 'src/.q-press/api/composables/edge.json',
          },
        ],
      })
      const generated = JSON.parse(
        await readFile(join(root, 'src/.q-press/api/composables/edge.generated.json'), 'utf8'),
      )

      expect(result.entries[0]?.exportCount).toBe(4)
      expect(generated.functions.createWindow.addedIn).toBe('0.1.0')
      expect(generated.functions.createWindow.examples).toEqual([
        "createWindow('2036-06-08')",
        "createWindow('2036-06-08', { zone: 'UTC' })",
      ])
      expect(generated.functions.createWindow.params.input.required).toBe(true)
      expect(generated.functions.createWindow.params.options.required).toBe(false)
      expect(generated.functions.createWindow.params.options.tsType).toContain('zone?: string')
      expect(generated.functions.createWindow.params.clock.required).toBe(false)
      expect(generated.functions.createWindow.params.clock.tsType).toBe('ExternalClock')
      expect(generated.functions.createWindow.returns).toEqual({
        definition: {
          format: {
            desc: 'Formats a label for display.',
            required: true,
            tsType: '(label: string) => string',
            type: '(label: string) => string',
          },
          minutes: {
            desc: 'Duration in minutes.',
            required: true,
            tsType: 'number',
            type: 'number',
          },
          start: {
            desc: 'Start details for the window.',
            required: true,
            tsType: '{\n    date: string\n    time?: string\n  }',
            type: '{\n    date: string\n    time?: string\n  }',
          },
        },
        desc: 'Window result, or null.',
        tsType: 'WindowResult | null',
        type: 'WindowResult | null',
      })
      expect(generated.functions.getExternalResult.returns).toEqual({
        definition: {
          label: {
            desc: 'External result label.',
            required: true,
            tsType: 'string',
            type: 'string',
          },
        },
        desc: 'Imported result.',
        tsType: 'ExternalResult',
        type: 'ExternalResult',
      })
      expect(generated.functions.getWindow.deprecated).toBe(
        'Use createWindow for nullable parsing.',
      )
      expect(generated.functions.getWindow.returns.definition).toEqual({
        format: {
          desc: 'Formats a label for display.',
          required: true,
          tsType: '(label: string) => string',
          type: '(label: string) => string',
        },
        minutes: {
          desc: 'Duration in minutes.',
          required: true,
          tsType: 'number',
          type: 'number',
        },
        start: {
          desc: 'Start details for the window.',
          required: true,
          tsType: '{\n    date: string\n    time?: string\n  }',
          type: '{\n    date: string\n    time?: string\n  }',
        },
      })
      expect(generated.functions.parseValue.tsSignature).toBe(
        'function parseValue(input: string | number): string | number',
      )
      expect(generated.functions.parseValue.params.input.tsType).toBe('string | number')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('infers returned object definitions from local functions', async () => {
    const root = await createProject({
      'src/.q-press/api/composables/scroll.json': '{"type":"component"}\n',
      'src/composables/scroll.ts': `
/**
 * Provides anchor scrolling and active table-of-contents tracking.
 *
 * @returns Scroll helpers.
 */
export function useScroll() {
  /**
   * Scrolls the page to the HTML element with the specified ID.
   *
   * @param id - The ID of the HTML element to scroll to.
   */
  function scrollTo(id: string) {
  }

  /**
   * Handles the page scroll event.
   *
   * @param position - Current vertical scroll position.
   */
  function onPageScroll({ position }: { position: number }) {
    void position
  }

  return {
    scrollTo,
    onPageScroll,
  }
}
`,
    })

    try {
      await generateQPressApi({
        cwd: root,
        entries: [
          {
            input: 'src/composables/scroll.ts',
            output: 'src/.q-press/api/composables/scroll.json',
          },
        ],
      })
      const generated = JSON.parse(
        await readFile(join(root, 'src/.q-press/api/composables/scroll.generated.json'), 'utf8'),
      )

      expect(generated.functions.useScroll.tsSignature).toBe('function useScroll(): Object')
      expect(generated.functions.useScroll.returns).toEqual({
        definition: {
          onPageScroll: {
            desc: 'Handles the page scroll event.',
            params: {
              position: {
                desc: 'Current vertical scroll position.',
                required: true,
                tsType: 'number',
                type: 'number',
              },
            },
            required: true,
            returns: null,
            tsSignature: 'function onPageScroll({ position }: { position: number }): void',
            type: 'Function',
          },
          scrollTo: {
            desc: 'Scrolls the page to the HTML element with the specified ID.',
            params: {
              id: {
                desc: 'The ID of the HTML element to scroll to.',
                required: true,
                tsType: 'string',
                type: 'string',
              },
            },
            required: true,
            returns: null,
            tsSignature: 'function scrollTo(id: string): void',
            type: 'Function',
          },
        },
        desc: 'Scroll helpers.',
        type: 'Object',
      })
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('extracts Vue component props, events, and slots', async () => {
    const root = await createProject({
      'src/.q-press/api/components/ExampleCard.json': '{"type":"component"}\n',
      'src/components/ExampleCard.vue': `
<template>
  <a v-if="props.external" :href="props.to">
    <slot />
  </a>
</template>

<script setup lang="ts">
const props = defineProps({
  /**
   * Target URL or route.
   *
   * @example '/docs'
   * @example 'https://example.com'
   * @category navigation
   * @category content
   */
  to: {
    type: String,
    required: true,
  },
  external: Boolean,
  /**
   * Visual tone for the card.
   *
   * @values 'primary' | 'secondary'
   * @applicable card, link
   * @api-exemption examples
   */
  tone: {
    type: [String, Number],
    default: 'primary',
  },
})

const emit = defineEmits(['select', 'update:modelValue'])

function select() {
  emit('select', { id: 1 })
  emit('update:modelValue', 'active')
}

defineSlots<{
  /**
   * Custom content inside the card link.
   *
   * @param scope Slot props provided to custom content.
   */
  default(scope: { active: boolean }): unknown
}>()
</script>
`,
      'src/components/TypedEvents.vue': `
<script setup lang="ts">
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
</script>
`,
      'src/components/TypedProps.vue': `
<script setup lang="ts">
type NoticeConfig = {
  enabled: boolean
}

const props = defineProps<{
  /**
   * Privacy consent settings from site config.
   *
   * @category content
   */
  config?: NoticeConfig | undefined
  /**
   * Whether the notice is active.
   *
   * @category state
   */
  active: boolean
}>()

/**
 * Browser CustomEvent dispatched after the notice is saved.
 *
 * @event qpress:notice-saved
 * @param detail Stored notice detail.
 */
function emitNotice(detail: NoticeConfig): void {
  window.dispatchEvent(new CustomEvent('qpress:notice-saved', { detail }))
}

/**
 * Stores the current notice choice.
 *
 * @api
 * @category actions
 * @api-exemption examples
 */
function saveNotice(): void {}
</script>
`,
      'src/components/DefaultedProps.vue': `
<script setup lang="ts">
type DefaultedProps = {
  /**
   * API data passed directly to the renderer.
   *
   * @category content
   */
  api?: Record<string, unknown> | null

  /**
   * API display name.
   *
   * @category content
   */
  name?: string

  /**
   * Whether to show the docs link.
   *
   * @category navigation
   */
  pageLink?: boolean
}

withDefaults(defineProps<DefaultedProps>(), {
  api: null,
  name: 'API Documentation',
  pageLink: false,
})
</script>
`,
    })

    try {
      const result = await generateQPressApi({
        cwd: root,
        entries: [
          {
            input: 'src/components/ExampleCard.vue',
            output: 'src/.q-press/api/components/ExampleCard.json',
          },
        ],
      })
      const generated = JSON.parse(
        await readFile(
          join(root, 'src/.q-press/api/components/ExampleCard.generated.json'),
          'utf8',
        ),
      )

      expect(result.entries[0]?.exportCount).toBe(6)
      expect(generated.props.to).toEqual({
        category: 'navigation|content',
        desc: 'Target URL or route.',
        examples: ["'/docs'", "'https://example.com'"],
        required: true,
        type: 'String',
      })
      expect(generated.props.external).toEqual({
        desc: '',
        type: 'Boolean',
      })
      expect(generated.props.tone).toEqual({
        __exemption: ['examples'],
        applicable: ['card', 'link'],
        default: 'primary',
        desc: 'Visual tone for the card.',
        type: 'String | Number',
        values: ["'primary'", "'secondary'"],
      })
      expect(generated.props.external.category).toBeUndefined()
      expect(generated.props.external.examples).toBeUndefined()
      expect(generated.events.select).toEqual({
        desc: '',
        params: {
          value: {
            desc: '',
            type: 'Object',
          },
        },
      })
      expect(generated.events['update:modelValue']).toEqual({
        desc: '',
        params: {
          modelValue: {
            desc: '',
            type: 'String',
          },
        },
      })
      expect(generated.slots.default).toEqual({
        desc: 'Custom content inside the card link.',
        scope: {
          scope: {
            desc: 'Slot props provided to custom content.',
            tsType: '{ active: boolean }',
            type: 'Object',
          },
        },
      })

      await generateQPressApi({
        cwd: root,
        entries: [
          {
            input: 'src/components/TypedEvents.vue',
            output: 'src/.q-press/api/components/TypedEvents.json',
          },
        ],
      })
      const typedGenerated = JSON.parse(
        await readFile(
          join(root, 'src/.q-press/api/components/TypedEvents.generated.json'),
          'utf8',
        ),
      )

      expect(typedGenerated.events['update:mode']).toEqual({
        desc: 'Emitted when the selected mode changes.',
        params: {
          mode: {
            desc: 'Current selected mode.',
            examples: ["'dark'"],
            required: true,
            tsType: "'dark' | 'light'",
            type: "'dark' | 'light'",
            values: ["'dark'", "'light'"],
          },
        },
      })

      await generateQPressApi({
        cwd: root,
        entries: [
          {
            input: 'src/components/TypedProps.vue',
            output: 'src/.q-press/api/components/TypedProps.json',
          },
        ],
      })
      const typedPropsGenerated = JSON.parse(
        await readFile(
          join(root, 'src/.q-press/api/components/TypedProps.generated.json'),
          'utf8',
        ),
      )

      expect(typedPropsGenerated.props.config).toEqual({
        category: 'content',
        desc: 'Privacy consent settings from site config.',
        required: false,
        tsType: 'NoticeConfig | undefined',
        type: 'NoticeConfig',
      })
      expect(typedPropsGenerated.props.active).toEqual({
        category: 'state',
        desc: 'Whether the notice is active.',
        required: true,
        tsType: 'boolean',
        type: 'Boolean',
      })
      expect(typedPropsGenerated.events['qpress:notice-saved']).toEqual({
        desc: 'Browser CustomEvent dispatched after the notice is saved.',
        params: {
          detail: {
            desc: 'Stored notice detail.',
            required: true,
            tsType: 'NoticeConfig',
            type: 'NoticeConfig',
          },
        },
      })
      expect(typedPropsGenerated.methods.saveNotice).toEqual({
        __exemption: ['examples'],
        category: 'actions',
        desc: 'Stores the current notice choice.',
        returns: null,
        tsSignature: 'function saveNotice(): void',
        type: 'Function',
      })

      await generateQPressApi({
        cwd: root,
        entries: [
          {
            input: 'src/components/DefaultedProps.vue',
            output: 'src/.q-press/api/components/DefaultedProps.json',
          },
        ],
      })
      const defaultedGenerated = JSON.parse(
        await readFile(
          join(root, 'src/.q-press/api/components/DefaultedProps.generated.json'),
          'utf8',
        ),
      )

      expect(defaultedGenerated.props.api).toEqual({
        category: 'content',
        default: 'null',
        desc: 'API data passed directly to the renderer.',
        required: false,
        tsType: 'Record<string, unknown> | null',
        type: 'Record<string, unknown> | null',
      })
      expect(defaultedGenerated.props.name).toEqual({
        category: 'content',
        default: 'API Documentation',
        desc: 'API display name.',
        required: false,
        tsType: 'string',
        type: 'String',
      })
      expect(defaultedGenerated.props.pageLink).toEqual({
        category: 'navigation',
        default: 'false',
        desc: 'Whether to show the docs link.',
        required: false,
        tsType: 'boolean',
        type: 'Boolean',
      })
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('extracts props from TypeScript Vue component exports', async () => {
    const root = await createProject({
      'src/.q-press/api/components/HeaderMenu.json': '{"type":"component"}\n',
      'src/.q-press/api/components/Prerender.json': '{"type":"component"}\n',
      'src/components/HeaderMenu.ts': `
interface MenuElement {
  name?: string
  path?: string
}

export default {
  props: {
    /**
     * Menu entries shown in the header.
     *
     * @category content
     * @example [{ name: 'Docs', path: '/docs' }]
     */
    elements: Array,

    /**
     * Responsive class prefix applied to menu entries.
     *
     * @category style
     * @example 'md'
     */
    mqPrefix: String,
  },
}
`,
      'src/components/Prerender.ts': `
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    /**
     * Title displayed above prerendered content.
     *
     * @category content
     * @example 'Example Title'
     */
    title: {
      type: String as PropType<string>,
      required: false,
      default: undefined,
    },

    /**
     * Labels for tabbed prerendered content.
     *
     * @category content
     * @example ['Template', 'Script']
     */
    tabs: {
      type: Array as PropType<string[]>,
      required: false,
      default: undefined,
    },
  },
})
`,
    })

    try {
      await generateQPressApi({
        cwd: root,
        entries: [
          {
            input: 'src/components/HeaderMenu.ts',
            output: 'src/.q-press/api/components/HeaderMenu.json',
          },
          {
            input: 'src/components/Prerender.ts',
            output: 'src/.q-press/api/components/Prerender.json',
          },
        ],
      })
      const headerMenu = JSON.parse(
        await readFile(join(root, 'src/.q-press/api/components/HeaderMenu.generated.json'), 'utf8'),
      )
      const prerender = JSON.parse(
        await readFile(join(root, 'src/.q-press/api/components/Prerender.generated.json'), 'utf8'),
      )

      expect(headerMenu.props.elements).toEqual({
        category: 'content',
        desc: 'Menu entries shown in the header.',
        examples: ["[{ name: 'Docs', path: '/docs' }]"],
        type: 'Array',
      })
      expect(headerMenu.props['mq-prefix']).toEqual({
        category: 'style',
        desc: 'Responsive class prefix applied to menu entries.',
        examples: ["'md'"],
        type: 'String',
      })
      expect(prerender.props.title).toEqual({
        category: 'content',
        desc: 'Title displayed above prerendered content.',
        examples: ["'Example Title'"],
        required: false,
        tsType: 'string',
        type: 'String',
      })
      expect(prerender.props.tabs).toEqual({
        category: 'content',
        desc: 'Labels for tabbed prerendered content.',
        examples: ["['Template', 'Script']"],
        required: false,
        tsType: 'string[]',
        type: 'Array',
      })
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('extracts TypeScript Vue component APIs from imported spreads and typed slots', async () => {
    const root = await createProject({
      'src/.q-press/api/components/CalendarDay.json': '{"type":"component"}\n',
      'src/components/CalendarDay.ts': `
import { defineComponent, type SlotsType } from 'vue'
import { useCommonEmits, useCommonProps } from '../composables/useCommon'
import { getRawMouseEvents } from '../composables/useMouse'
import type { CalendarDaySlots } from '../slots'

export default defineComponent({
  slots: Object as SlotsType<CalendarDaySlots>,

  props: {
    ...useCommonProps,
    useNavigation: Boolean,
  },

  emits: [
    'update:model-value',
    ...useCommonEmits,
    ...getRawMouseEvents('-day'),
  ],

  setup(_props, { expose, slots }) {
    slots.default?.()

    /**
     * Moves to the previous visible range.
     *
     * @param amount Number of ranges to move.
     */
    function prev(amount?: number): void {}

    expose({
      prev,
      moveToToday,
    })
  },
})
`,
      'src/composables/useCommon.ts': `
import { type PropType } from 'vue'

export const useCommonProps = {
  modelValue: {
    type: String,
    default: '',
  },
  dateType: {
    type: String as PropType<'round' | 'square'>,
    default: 'round',
    validator: (value: string) => ['round', 'square'].includes(value),
  },
} as const

export const useCommonEmits = ['change', 'moved']
`,
      'src/composables/useMouse.ts': `
export function getRawMouseEvents(suffix: string): string[] {
  return [
    'click' + suffix,
    'contextmenu' + suffix,
    'mousedown' + suffix,
    'mousemove' + suffix,
    'mouseup' + suffix,
    'mouseenter' + suffix,
    'mouseleave' + suffix,
    'touchstart' + suffix,
    'touchmove' + suffix,
    'touchend' + suffix,
  ]
}
`,
      'src/slots.ts': `
type SlotProps<T> = { scope: T }

export interface DaySlotScope {
  timestamp: string
  activeDate?: boolean
}

export interface CalendarDaySlots {
  /**
   * Custom day cell content.
   */
  day?: SlotProps<DaySlotScope>
}
`,
    })

    try {
      await generateQPressApi({
        cwd: root,
        entries: [
          {
            input: 'src/components/CalendarDay.ts',
            output: 'src/.q-press/api/components/CalendarDay.json',
          },
        ],
      })
      const generated = JSON.parse(
        await readFile(
          join(root, 'src/.q-press/api/components/CalendarDay.generated.json'),
          'utf8',
        ),
      )

      expect(Object.keys(generated.props)).toEqual(['model-value', 'date-type', 'use-navigation'])
      expect(generated.props['date-type']).toEqual({
        desc: '',
        default: 'round',
        tsType: "'round' | 'square'",
        type: 'String',
        values: ["'round'", "'square'"],
      })
      expect(generated.events).toHaveProperty('change')
      expect(generated.events).toHaveProperty('click-day')
      expect(generated.events).toHaveProperty('contextmenu-day')
      expect(generated.slots.default).toEqual({
        desc: '',
      })
      expect(generated.slots.day).toEqual({
        desc: 'Custom day cell content.',
        scope: {
          timestamp: {
            desc: '',
            required: true,
            tsType: 'string',
            type: 'String',
          },
          activeDate: {
            desc: '',
            required: false,
            tsType: 'boolean',
            type: 'Boolean',
          },
        },
      })
      expect(generated.methods.prev).toEqual({
        desc: 'Moves to the previous visible range.',
        params: {
          amount: {
            desc: 'Number of ranges to move.',
            required: false,
            tsType: 'number',
            type: 'number',
          },
        },
        returns: null,
        tsSignature: 'function prev(amount?: number): void',
        type: 'Function',
      })
      expect(generated.methods.moveToToday).toEqual({
        desc: '',
        type: 'Function',
      })
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('checks stale API JSON without writing comparison files', async () => {
    const root = await createProject({
      'src/.q-press/api/helpers/math.json': '{"type":"component"}\n',
      'src/helpers/math.ts': `
/**
 * Adds two numbers.
 *
 * @param left Left value.
 * @param right Right value.
 * @returns Sum.
 */
export function add(left: number, right: number): number {
  return left + right
}
`,
    })

    try {
      const result = await checkQPressApi({
        cwd: root,
        entries: [
          {
            group: 'methods',
            input: 'src/helpers/math.ts',
            output: 'src/.q-press/api/helpers/math.json',
          },
        ],
      })

      expect(result.diagnostics).toEqual([
        expect.objectContaining({
          code: 'api-output-stale',
        }),
      ])
      expect(result.diagnostics[0]?.fieldChanges).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: '$.methods',
            type: 'added',
          }),
        ]),
      )

      await expect(
        readFile(join(root, 'src/.q-press/api/helpers/math.generated.json'), 'utf8'),
      ).rejects.toMatchObject({
        code: 'ENOENT',
      })
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('supports metadata flags for one-off CLI generation', async () => {
    const root = await createProject({
      'src/utils/clipboard.ts': `
/**
 * Copies text to the clipboard.
 *
 * @param text - Text to copy.
 * @returns Completion promise.
 */
export function copyText(text: string): Promise<void> {
  return Promise.resolve()
}
`,
    })
    const stdoutWrite = process.stdout.write
    let output = ''

    try {
      process.stdout.write = ((chunk: string | Uint8Array) => {
        output += chunk.toString()

        return true
      }) as typeof process.stdout.write

      const exitCode = await runQPressApiCli([
        'generate',
        '--no-config',
        '--root',
        root,
        '--input',
        'src/utils/clipboard.ts',
        '--output',
        'src/.q-press/api/internal/clipboard.json',
        '--type',
        'plugin',
        '--group',
        'methods',
        '--docs-url',
        '/internal/clipboard',
        '--json',
      ])
      const generated = JSON.parse(
        await readFile(join(root, 'src/.q-press/api/internal/clipboard.generated.json'), 'utf8'),
      )

      expect(exitCode).toBe(0)
      expect(JSON.parse(output).entries[0].exportCount).toBe(1)
      expect(generated.type).toBe('plugin')
      expect(generated.meta.docsUrl).toBe('/internal/clipboard')
      expect(generated.methods.copyText.params.text.desc).toBe('Text to copy.')
    } finally {
      process.stdout.write = stdoutWrite
      await rm(root, { force: true, recursive: true })
    }
  })

  it('adds the generated suffix before the file extension', () => {
    expect(getGeneratedOutputPath('/docs/api/timestamp.json')).toBe(
      '/docs/api/timestamp.generated.json',
    )
  })
})
