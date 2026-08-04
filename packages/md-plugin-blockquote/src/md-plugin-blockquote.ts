import type { MarkdownItPluginWithOptions } from '@md-plugins/shared'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { MarkdownIt } from 'markdown-it'
import type { MarkdownItOptions } from 'markdown-it'
import type { Token } from 'markdown-it'
import type { BlockquotePluginOptions } from './types'
import { resolvePluginOptions } from '@md-plugins/shared'

// Default options for the blockquote plugin
const DEFAULT_BLOCKQUOTE_OPTIONS: BlockquotePluginOptions = {
  blockquoteClass: 'markdown-blockquote',
}

/**
 * Adds the configured CSS class to every rendered Markdown blockquote.
 */
export const blockquotePlugin: MarkdownItPluginWithOptions<BlockquotePluginOptions> = (
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

  md.renderer.render = (
    tokens: Token[],
    options: Required<MarkdownItOptions>,
    env: MarkdownItEnv | undefined,
  ): string => {
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
