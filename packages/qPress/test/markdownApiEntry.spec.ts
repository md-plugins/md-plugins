import type { VNode } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('vue', () => ({
  defineComponent: (component: unknown) => component,
  h: function h(type: unknown, propsOrChildren?: unknown, children?: unknown) {
    const hasChildrenArgument = arguments.length === 3
    const hasProps =
      hasChildrenArgument ||
      (propsOrChildren !== null &&
        propsOrChildren !== undefined &&
        typeof propsOrChildren === 'object' &&
        !Array.isArray(propsOrChildren) &&
        !('type' in propsOrChildren))

    return {
      children: hasChildrenArgument ? children : hasProps ? undefined : propsOrChildren,
      props: hasProps ? propsOrChildren : undefined,
      type,
    }
  },
  ref: (value: unknown) => ({ value }),
}))

vi.mock('quasar', () => ({
  Notify: {
    create: vi.fn(),
  },
  QBadge: 'QBadge',
  QBtn: 'QBtn',
  QBtnToggle: 'QBtnToggle',
}))

vi.mock('@quasar/extras/mdi-v7', () => ({
  mdiMinusBox: 'mdi-minus-box',
  mdiPlusBox: 'mdi-plus-box',
}))

const { default: MarkdownApiEntry } =
  await import('../src/templates/init/src/_q-press/components/MarkdownApiEntry.js')

type ApiEntryRender = () => VNode

/**
 * Creates a render function for MarkdownApiEntry without mounting a browser app.
 */
function createEntryRender(type: string, definition: Record<string, unknown>): ApiEntryRender {
  return (
    MarkdownApiEntry as unknown as {
      setup: (props: { type: string; definition: Record<string, unknown> }) => ApiEntryRender
    }
  ).setup({ type, definition })
}

/**
 * Reads visible VNode text plus Quasar label props used by the API renderer.
 */
function collectText(value: unknown): string {
  const chunks: string[] = []

  visit(value, chunks)

  return chunks.join(' ')
}

function visit(value: unknown, chunks: string[]): void {
  if (value === null || value === undefined || typeof value === 'boolean') {
    return
  }

  if (typeof value === 'string' || typeof value === 'number') {
    chunks.push(String(value))

    return
  }

  if (Array.isArray(value)) {
    for (const child of value) {
      visit(child, chunks)
    }

    return
  }

  if (typeof value !== 'object') {
    return
  }

  const vnode = value as VNode & {
    children?: unknown
    props?: Record<string, unknown>
  }

  if (typeof vnode.props?.label === 'string') {
    chunks.push(vnode.props.label)
  }

  if (Array.isArray(vnode.props?.options)) {
    for (const option of vnode.props.options) {
      if (
        option !== null &&
        typeof option === 'object' &&
        'label' in option &&
        typeof option.label === 'string'
      ) {
        chunks.push(option.label)
      }
    }
  }

  visit(vnode.children, chunks)
}

/**
 * Opens every MarkdownApiEntry details toggle currently rendered.
 */
function expandDetails(value: unknown): void {
  if (value === null || value === undefined || typeof value !== 'object') {
    return
  }

  if (Array.isArray(value)) {
    for (const child of value) {
      expandDetails(child)
    }

    return
  }

  const vnode = value as VNode & {
    children?: unknown
    props?: Record<string, unknown>
  }

  if (
    typeof vnode.props?.class === 'string' &&
    vnode.props.class.includes('markdown-api-entry__expand-btn') &&
    typeof vnode.props.onClick === 'function'
  ) {
    vnode.props.onClick()
  }

  expandDetails(vnode.children)
}

describe('MarkdownApiEntry', () => {
  it('renders legacy hand-authored API JSON details', () => {
    const render = createEntryRender('props', {
      modelValue: {
        default: false,
        desc: 'Controls whether the panel is open.',
        examples: ['<Example v-model="open" />'],
        properties: {
          reason: {
            desc: 'Explains why the value changed.',
            type: 'String',
          },
        },
        sync: true,
        type: 'Boolean',
        values: [true, false],
      },
    })

    const collapsed = render()

    expect(collectText(collapsed)).toContain('modelValue')
    expect(collectText(collapsed)).toContain('Boolean')
    expect(collectText(collapsed)).toContain('Controls whether the panel is open.')

    expandDetails(collapsed)

    const expandedText = collectText(render())

    expect(expandedText).toContain('Default value')
    expect(expandedText).toContain('Required to be used with v-model!')
    expect(expandedText).toContain('Accepted values')
    expect(expandedText).toContain('Props')
    expect(expandedText).toContain('reason')
    expect(expandedText).toContain('Example')
  })

  it('renders empty string default values explicitly', () => {
    const render = createEntryRender('props', {
      src: {
        default: '',
        desc: 'Optional source content.',
        type: 'String',
      },
    })

    const collapsed = render()

    expect(collectText(collapsed)).toContain('src')

    expandDetails(collapsed)

    const expandedText = collectText(render())

    expect(expandedText).toContain('Default value')
    expect(expandedText).toContain('empty string ("")')
  })

  it('renders generated function API JSON with TypeScript details', () => {
    const render = createEntryRender('functions', {
      parseTimestamp: {
        addedIn: '0.1.0',
        desc: 'Converts **input** into a `Timestamp`.',
        examples: ["parseTimestamp('2036-06-08')"],
        params: {
          input: {
            desc: 'Date or date-time string.',
            required: true,
            type: 'String',
          },
          now: {
            desc: 'Optional timestamp used for relative flags.',
            required: false,
            type: ['Timestamp', 'null'],
          },
        },
        returns: {
          definition: {
            date: {
              desc: 'Formatted date.',
              type: 'String',
            },
            time: {
              desc: 'Formatted time.',
              type: 'String',
            },
          },
          desc: 'Parsed timestamp, or null when invalid.',
          type: ['Timestamp', 'null'],
        },
        tsSignature:
          'function parseTimestamp(input: string, now?: Timestamp | null): Timestamp | null',
        type: 'Function',
      },
    })

    const collapsed = render()
    const collapsedText = collectText(collapsed)

    expect(collapsedText).toContain('parseTimestamp')
    expect(collapsedText).toContain('(input, now?) => Timestamp | null')
    expect(collapsedText).toContain('0.1.0+')

    expandDetails(collapsed)

    const expandedText = collectText(render())

    expect(expandedText).toContain('TypeScript')
    expect(expandedText).toContain(
      'function parseTimestamp(input: string, now?: Timestamp | null): Timestamp | null',
    )
    expect(expandedText).toContain('Params')
    expect(expandedText).toContain('input')
    expect(expandedText).toContain('Return type: Timestamp | null')
    expect(expandedText).toContain('date')
    expect(expandedText).toContain("parseTimestamp('2036-06-08')")
  })

  it('renders Quasar-style API metadata without losing richer fields', () => {
    const render = createEntryRender('quasarConfOptions', {
      category: 'brand',
      configFileType: 'Record<string, string>',
      definition: {
        primary: {
          category: 'palette',
          configFileType: 'String',
          deprecated: 'Use design tokens instead.',
          desc: 'Primary brand color.',
          tsType: 'string',
          type: 'String',
        },
      },
      desc: 'Brand color configuration.',
      propName: 'brand',
      type: 'Object',
    })

    const initialText = collectText(render())
    const toggled = render()
    const text = collectText(toggled)

    expect(initialText).toContain('app.use(Quasar, { config: {')
    expect(text).toContain('UI config')
    expect(text).toContain('quasar.config file')
    expect(text).toContain('Record<string, string>')
    expect(text).toContain('Category')
    expect(text).toContain('brand')
    expect(text).toContain('primary')

    expandDetails(toggled)

    const expandedText = collectText(render())

    expect(expandedText).toContain('Deprecated')
    expect(expandedText).toContain('Use design tokens instead.')
    expect(expandedText).toContain('TypeScript')
    expect(expandedText).toContain('string')
  })
})
