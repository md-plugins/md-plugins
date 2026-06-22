import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkQPressApi, generateQPressApi, getGeneratedOutputPath } from '../src/api/qpress-api.js'

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

      await expect(
        readFile(join(root, 'src/.q-press/api/helpers/math.generated.json'), 'utf8'),
      ).rejects.toMatchObject({
        code: 'ENOENT',
      })
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('adds the generated suffix before the file extension', () => {
    expect(getGeneratedOutputPath('/docs/api/timestamp.json')).toBe(
      '/docs/api/timestamp.generated.json',
    )
  })
})
