import type { MarkdownItEnv } from '@md-plugins/shared'
import type MarkdownIt from 'markdown-it'
import type { Options, PluginWithOptions } from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import type { BlockquotePluginOptions } from './types'
import { resolvePluginOptions } from '@md-plugins/shared'

// Default options for the blockquote plugin
const DEFAULT_BLOCKQUOTE_OPTIONS: BlockquotePluginOptions = {
  blockquoteClass: 'markdown-blockquote',
}

export const blockquotePlugin: PluginWithOptions<BlockquotePluginOptions> = (
  md: MarkdownIt,
  options?: BlockquotePluginOptions | { blockquotePlugin?: BlockquotePluginOptions },
): void => {
  // Use resolvePluginOptions to merge defaults with any provided options.
  const { blockquoteClass = DEFAULT_BLOCKQUOTE_OPTIONS.blockquoteClass } = resolvePluginOptions<
    BlockquotePluginOptions,
    'blockquotePlugin'
  >(options, 'blockquotePlugin', DEFAULT_BLOCKQUOTE_OPTIONS)

  // Preserve the original render method
  const originalRender = md.renderer.render.bind(md.renderer)

  md.renderer.render = (tokens: Token[], options: Options, env: MarkdownItEnv): string => {
    // Iterate over all tokens to ensure multiple blockquotes are handled
    tokens.forEach((token) => {
      if (token.tag === 'blockquote' && token.type === 'blockquote_open') {
        const existingClass = token.attrGet('class') || ''
        const newClass = [existingClass, blockquoteClass]
          .filter(Boolean) // remove falsey values
          .join(' ')
        token.attrSet('class', newClass)
      }
    })

    // Call the original render method
    return originalRender(tokens, options, env)
  }
}
