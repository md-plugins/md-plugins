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
 * @param now Optional timestamp used for relative flags.
 * @returns Parsed timestamp, or null when invalid.
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
        required: true,
        tsType: 'string',
        type: 'string',
      })
      expect(generated.functions.parseTimestamp.tsSignature).toBe(
        'function parseTimestamp(input: string, now?: Timestamp | null): Timestamp | null',
      )
      expect(generated.functions.parseTimestamp.params.now.required).toBe(false)
      expect(generated.functions.parseTimestamp.returns).toEqual({
        desc: 'Parsed timestamp, or null when invalid.',
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
`,
      'src/utils/edge.ts': `
import type { ExternalClock } from '../types'

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

      expect(result.entries[0]?.exportCount).toBe(3)
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
        desc: 'Window result, or null.',
        tsType: 'WindowResult | null',
        type: 'WindowResult | null',
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
   */
  'update:mode': (mode: 'dark' | 'light') => true,
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
        default: 'primary',
        desc: '',
        type: 'String | Number',
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
            required: true,
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
            required: true,
            tsType: "'dark' | 'light'",
            type: "'dark' | 'light'",
          },
        },
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
