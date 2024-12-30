import type { MarkdownItEnv } from '@md-plugins/shared'
import type { PluginWithOptions } from 'markdown-it'
import type { ImagePluginOptions } from './types'
import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import type { Options } from 'markdown-it'

export const imagePlugin = (md: MarkdownIt, { imageClass = 'markdown-image' } = {}) => {
  const originalImageRender = md.renderer.rules.image

  md.renderer.rules.image = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: MarkdownItEnv,
    self,
  ) => {
    const token = tokens[idx]
    if (!token) {
      return self.renderToken(tokens, idx, options)
    }

    // Add or update the class
    const existingClass = token.attrGet('class') || ''
    const combinedClass = [existingClass, imageClass].filter(Boolean).join(' ')
    token.attrSet('class', combinedClass)

    // Add to or update the 'alt' attribute
    if (token.content) {
      const altIndex = token.attrIndex('alt')
      if (altIndex >= 0 && token.attrs) {
        const altValue = token.attrs[altIndex][1] // Get the current 'alt' value
        if (!altValue) {
          token.attrs[altIndex][1] = token.content // Set 'alt' if empty
        }
      } else {
        token.attrPush(['alt', token.content]) // Add 'alt' if not present
      }
    }

    // Call the original render method
    return originalImageRender
      ? originalImageRender(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)
  }
}
