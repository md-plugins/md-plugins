import type { MarkdownItEnv, MarkdownItPluginWithOptions } from '@md-plugins/shared'
import type { MarkdownIt } from 'markdown-it'
import type { MarkdownItOptions, Renderer, Token } from 'markdown-it'
import type { InlineCodePluginOptions } from './types'
import { resolvePluginOptions } from '@md-plugins/shared'

// Default options for the inline code plugin.
const DEFAULT_INLINECODE_PLUGIN_OPTIONS: InlineCodePluginOptions = {
  inlineCodeClass: 'markdown-token',
}

/**
 * Adds a class to inline code.
 */
export const inlinecodePlugin: MarkdownItPluginWithOptions<InlineCodePluginOptions> = (
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
    _options: Required<MarkdownItOptions>,
    _env: MarkdownItEnv | undefined | undefined,
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

    return '<code' + self.renderAttrs(token) + '>' + md.utils.escapeHtml(token.content) + '</code>'
  }
}
