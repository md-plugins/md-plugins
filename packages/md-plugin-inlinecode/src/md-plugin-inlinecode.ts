import type { MarkdownItEnv } from '@md-plugins/shared'
import type MarkdownIt from 'markdown-it'
import type { PluginWithOptions, Options } from 'markdown-it'
import type Renderer from 'markdown-it/lib/renderer.mjs'
import type Token from 'markdown-it/lib/token.mjs'
import type { InlineCodePluginOptions } from './types'
import { escapeHtml } from 'markdown-it/lib/common/utils.mjs'
import { resolvePluginOptions } from '@md-plugins/shared'

// Default options for the inline code plugin.
const DEFAULT_INLINECODE_PLUGIN_OPTIONS: InlineCodePluginOptions = {
  inlineCodeClass: 'markdown-token',
}

/**
 * Adds a class to inline code.
 */
export const inlinecodePlugin: PluginWithOptions<InlineCodePluginOptions> = (
  md: MarkdownIt,
  options?: InlineCodePluginOptions | { inlinecodePlugin?: InlineCodePluginOptions },
): void => {
  // Resolve and merge plugin options.
  const { inlineCodeClass } = resolvePluginOptions<InlineCodePluginOptions, 'inlinecodePlugin'>(
    options,
    'inlinecodePlugin',
    DEFAULT_INLINECODE_PLUGIN_OPTIONS,
  )

  md.renderer.rules.code_inline = (
    tokens: Token[],
    idx: number,
    _options: Options,
    _env: MarkdownItEnv,
    self: Renderer,
  ): string => {
    const token = tokens[idx]
    if (!token) {
      return ''
    }

    const existingClass = token.attrGet('class') || ''
    const combinedClass = [existingClass, inlineCodeClass]
      .filter(Boolean) // Remove falsy values.
      .join(' ')

    token.attrSet('class', combinedClass)

    return '<code' + self.renderAttrs(token) + '>' + escapeHtml(token.content) + '</code>'
  }
}
