import type { MarkdownItEnv } from '@md-plugins/shared'
import { resolvePluginOptions } from '@md-plugins/shared'
import type { Options, PluginWithOptions } from 'markdown-it'
import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import type { MermaidPluginOptions } from './types'

const DEFAULT_MERMAID_PLUGIN_OPTIONS: Required<MermaidPluginOptions> = {
  languages: ['mermaid', 'mmd'],
  renderMode: 'component',
  componentName: 'MarkdownMermaid',
  codeProp: 'code',
  preClass: 'mermaid',
  pageScripts: ["import MarkdownMermaid from '@/.q-press/components/MarkdownMermaid.vue'"],
}

function getFenceLang(token: Token): string {
  return token.info.trim().split(/\s+/, 1)[0] ?? ''
}

function getVueBinding(md: MarkdownIt, value: string): string {
  return md.utils.escapeHtml(JSON.stringify(value))
}

export const mermaidPlugin: PluginWithOptions<MermaidPluginOptions> = (
  md: MarkdownIt,
  options?: MermaidPluginOptions | { mermaidPlugin?: MermaidPluginOptions },
): void => {
  const resolvedOptions = resolvePluginOptions<MermaidPluginOptions, 'mermaidPlugin'>(
    options,
    'mermaidPlugin',
    DEFAULT_MERMAID_PLUGIN_OPTIONS,
  )

  const {
    languages = DEFAULT_MERMAID_PLUGIN_OPTIONS.languages,
    renderMode = DEFAULT_MERMAID_PLUGIN_OPTIONS.renderMode,
    componentName = DEFAULT_MERMAID_PLUGIN_OPTIONS.componentName,
    codeProp = DEFAULT_MERMAID_PLUGIN_OPTIONS.codeProp,
    preClass = DEFAULT_MERMAID_PLUGIN_OPTIONS.preClass,
    pageScripts = DEFAULT_MERMAID_PLUGIN_OPTIONS.pageScripts,
  } = resolvedOptions

  const mermaidLanguages = new Set(languages)
  const originalFenceRender = md.renderer.rules.fence

  md.renderer.rules.fence = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: MarkdownItEnv,
    self,
  ): string => {
    const token = tokens[idx]
    if (!token) {
      return ''
    }

    if (mermaidLanguages.has(getFenceLang(token)) === false) {
      return originalFenceRender
        ? originalFenceRender(tokens, idx, options, env, self)
        : self.renderToken(tokens, idx, options)
    }

    if (renderMode === 'pre') {
      return `<pre class="${md.utils.escapeHtml(preClass)}"><code>${md.utils.escapeHtml(token.content)}</code></pre>`
    }

    if (pageScripts.length > 0) {
      env.pageScripts = env.pageScripts || new Set<string>()
      for (const script of pageScripts) {
        env.pageScripts.add(script)
      }
    }

    return `<${componentName} :${codeProp}="${getVueBinding(md, token.content)}"></${componentName}>`
  }
}
