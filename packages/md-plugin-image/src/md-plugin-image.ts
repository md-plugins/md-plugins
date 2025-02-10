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

    // Extract width and height from the token content if present
    let content = token.content
    const widthMatch = content.match(/width="(\d+)"/)
    const heightMatch = content.match(/height="(\d+)"/)

    if (widthMatch && widthMatch.length > 1) {
      token.attrSet('width', widthMatch[1] as string)
      content = content.replace(widthMatch[0], '').trim() // Remove width from content
    }
    if (heightMatch && heightMatch.length > 1) {
      token.attrSet('height', heightMatch[1] as string)
      content = content.replace(heightMatch[0], '').trim() // Remove height from content
    }

    // Add or update the 'alt' attribute
    if (content) {
      const altIndex = token.attrIndex('alt')
      if (
        altIndex >= 0 &&
        token.attrs &&
        token.attrs[altIndex] &&
        token.attrs[altIndex].length > 1
      ) {
        const altValue = token.attrs[altIndex][1] // Get the current 'alt' value
        if (!altValue && altIndex) {
          token.attrs[altIndex][1] = content // Set 'alt' if empty
        }
      } else {
        token.attrPush(['alt', content]) // Add 'alt' if not present
      }
    }

    // Add or update the class
    const existingClass = token.attrGet('class') || ''
    const combinedClass = [existingClass, imageClass].filter(Boolean).join(' ')
    token.attrSet('class', combinedClass)

    token.content = content // Update the content with the modified token
    if (token.children) {
      token.children.forEach((child) => {
        if (child.type === 'text') {
          child.content = content // Update the content of child images
        }
      })
    }

    // Call the original render method
    return originalImageRender
      ? originalImageRender(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)
  }
}
