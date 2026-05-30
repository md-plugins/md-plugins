import { addClassToHast } from 'shiki/core'
import { createHighlighter } from 'shiki'
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers'
import type { ShikiTransformer } from 'shiki/core'

interface HastElement {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HastElement[]
  value?: string
}

export interface CodeLineProps {
  prefix: string[]
  classList: string[]
}

export interface CodeblockTransformerOptions {
  codeClass?: string
  lineList: CodeLineProps[]
  maxheight?: string
  preClass: string
}

const shikiLangs = [
  'bash',
  'css',
  'diff',
  'html',
  'javascript',
  'json',
  'nginx',
  'sass',
  'scss',
  'typescript',
  'vue',
  'xml',
  'yaml',
]

const shikiLangAlias = {
  js: 'javascript',
  markup: 'html',
  shell: 'bash',
  sh: 'bash',
  ts: 'typescript',
  yml: 'yaml',
}

export const highlighter = await createHighlighter({
  themes: ['github-light', 'github-dark'],
  langs: shikiLangs,
  langAlias: shikiLangAlias,
})

const supportedLangSet = new Set(highlighter.getLoadedLanguages())

export const themeOptions = {
  themes: {
    light: 'github-light',
    dark: 'github-dark',
  },
  defaultColor: false,
} as const

export function normalizeShikiLang(lang: string): string {
  return supportedLangSet.has(lang) ? lang : 'text'
}

export function buildCodeBlockTransformers({
  codeClass,
  lineList,
  maxheight,
  preClass,
}: CodeblockTransformerOptions): ShikiTransformer[] {
  return [
    preClassTransformer(preClass, maxheight),
    codeClassTransformer(codeClass),
    transformerNotationHighlight(),
    transformerNotationDiff(),
    transformerNotationFocus(),
    transformerNotationErrorLevel(),
    transformerNotationWordHighlight(),
    lineDecorTransformer(lineList),
  ]
}

function preClassTransformer(preClass: string, maxheight?: string): ShikiTransformer {
  return {
    name: 'md-plugins:pre-class',
    pre(node) {
      addClassToHast(node, preClass)

      if (maxheight !== undefined) {
        const style = typeof node.properties?.style === 'string' ? node.properties.style : ''
        node.properties = {
          ...node.properties,
          style: `${style}${style.length > 0 ? ';' : ''}max-height:${maxheight}`,
        }
      }
    },
  }
}

function codeClassTransformer(codeClass?: string): ShikiTransformer {
  return {
    name: 'md-plugins:code-class',
    code(node) {
      if (codeClass !== undefined && codeClass.length > 0) {
        addClassToHast(node, codeClass)
      }
    },
  }
}

function lineDecorTransformer(lineList: CodeLineProps[]): ShikiTransformer {
  return {
    name: 'md-plugins:line-decor',
    code(codeNode) {
      const lines = (codeNode.children as HastElement[]).filter(
        (child) =>
          child.type === 'element' && child.tagName === 'span' && lineHasClass(child, 'line'),
      )

      lines.forEach((line, index) => {
        const target = lineList[index]
        const classList = [...(target?.classList ?? [])]
        const prefix = target?.prefix ?? []

        if (this.options.lang === 'diff') {
          const first = lineTextContent(line).charAt(0)
          if (first === '+') {
            classList.push('line-add')
          } else if (first === '-') {
            classList.push('line-rem')
          }
        }

        if (classList.length > 0) {
          line.children?.unshift({
            type: 'element',
            tagName: 'span',
            properties: { class: ['c-line', ...classList] },
            children: [],
          })
        }

        if (prefix.length > 0) {
          line.children?.unshift({
            type: 'element',
            tagName: 'span',
            properties: { class: 'c-lpref' },
            children: [{ type: 'text', value: prefix.join(' ') }],
          })
        }
      })
    },
  }
}

function lineHasClass(line: HastElement, className: string): boolean {
  const classValue = line.properties?.class

  if (typeof classValue === 'string') {
    return classValue.split(/\s+/).includes(className)
  }

  if (Array.isArray(classValue)) {
    return classValue.includes(className)
  }

  return false
}

function lineTextContent(line: HastElement): string {
  let acc = ''

  const walk = (node: HastElement) => {
    if (node.type === 'text') {
      acc += node.value ?? ''
      return
    }

    node.children?.forEach(walk)
  }

  line.children?.forEach(walk)

  return acc
}
