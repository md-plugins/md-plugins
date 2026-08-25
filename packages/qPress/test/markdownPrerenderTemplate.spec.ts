import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { VNode } from 'vue'
import { describe, expect, it } from 'vitest'

import MarkdownPrerender from '../src/templates/init/src/_q-press/components/MarkdownPrerender'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('MarkdownPrerender template', () => {
  it('renders a supported tab icon without replacing its text label', () => {
    const setup = MarkdownPrerender.setup as unknown as (
      props: Record<string, unknown>,
      context: { slots: { default: () => never[] } },
    ) => () => VNode
    const render = setup(
      {
        title: undefined,
        tabs: ['pnpm', 'Custom'],
        tabIcons: { pnpm: 'pnpm', Custom: 'unknown' },
      },
      { slots: { default: () => [] } },
    )

    const nodes = collectVNodes(render())
    const pnpmIcon = nodes.find((node) => node.props?.['data-package-manager-icon'] === 'pnpm')

    expect(pnpmIcon?.props?.['aria-hidden']).toBe('true')
    expect(nodes.some((node) => node.children === 'pnpm')).toBe(true)
    expect(nodes.some((node) => node.props?.['data-package-manager-icon'] === 'unknown')).toBe(
      false,
    )
  })

  it('keeps the init and update templates synchronized', () => {
    const initTemplate = readFileSync(
      resolve(packageRoot, 'src/templates/init/src/_q-press/components/MarkdownPrerender.ts'),
      'utf8',
    )
    const updateTemplate = readFileSync(
      resolve(packageRoot, 'src/templates/update/src/_q-press/components/MarkdownPrerender.ts'),
      'utf8',
    )

    expect(updateTemplate).toBe(initTemplate)
  })
})

function collectVNodes(node: VNode): VNode[] {
  const nodes = [node]
  const children = node.children

  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === 'object' && child !== null) {
        nodes.push(...collectVNodes(child as VNode))
      }
    }
  } else if (typeof children === 'object' && children !== null) {
    for (const slot of Object.values(children)) {
      if (typeof slot === 'function') {
        const slotNodes = slot()
        for (const child of Array.isArray(slotNodes) ? slotNodes : [slotNodes]) {
          if (typeof child === 'object' && child !== null) {
            nodes.push(...collectVNodes(child as VNode))
          }
        }
      }
    }
  }

  return nodes
}
