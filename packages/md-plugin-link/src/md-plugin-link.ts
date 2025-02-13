import type { MarkdownItEnv } from '@md-plugins/shared'
import type MarkdownIt from 'markdown-it'
import type { Options, PluginWithOptions } from 'markdown-it'
import type Renderer from 'markdown-it/lib/renderer.mjs'
import type Token from 'markdown-it/lib/token.mjs'
import type { LinkPluginOptions } from './types'
import { resolvePluginOptions } from '@md-plugins/shared'

// Default options for the link plugin.
const DEFAULT_LINK_PLUGIN_OPTIONS: LinkPluginOptions = {
  linkTag: 'MarkdownLink',
  linkToKeyword: 'to',
  pageScript: 'import MarkdownLink from "src/.q-press/components/MarkdownLink.vue"',
}

export const linkPlugin: PluginWithOptions<LinkPluginOptions> = (
  md: MarkdownIt,
  options?: LinkPluginOptions | { linkPlugin?: LinkPluginOptions },
): void => {
  // Resolve and merge options using the shared helper.
  const {
    linkTag = 'MarkdownLink',
    linkToKeyword = 'to',
    pageScript,
  } = resolvePluginOptions<LinkPluginOptions, 'linkPlugin'>(
    options,
    'linkPlugin',
    DEFAULT_LINK_PLUGIN_OPTIONS,
  )

  // Override the link_open rule.
  md.renderer.rules.link_open = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: any,
    self: Renderer,
  ): string => {
    const token = tokens[idx]
    if (!token) {
      return ''
    }

    const hrefIndex = token.attrIndex('href')
    if (hrefIndex < 0 || !token.attrs) {
      return self.renderToken(tokens, idx, options)
    }

    const link = token.attrs[hrefIndex] as [string, string]
    const url = link[1]

    // Set the custom tag and update the attribute key/value.
    token.tag = linkTag
    link[0] = linkToKeyword
    link[1] = decodeURI(url)

    // Add the pageScript to the environment if provided.
    if (pageScript) {
      env.pageScripts = env.pageScripts || new Set<string>()
      env.pageScripts.add(pageScript)
    }

    return self.renderToken(tokens, idx, options)
  }

  // Override the link_close rule to ensure matching tags.
  md.renderer.rules.link_close = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: MarkdownItEnv,
    self: Renderer,
  ): string => {
    const token = tokens[idx]
    if (!token) {
      return ''
    }

    // Find the corresponding link_open token by searching backward.
    let openIdx = idx - 1
    while (openIdx >= 0 && tokens[openIdx].type !== 'link_open') {
      openIdx--
    }

    const openingToken = tokens[openIdx]
    if (openingToken && openingToken.tag) {
      // Ensure the closing tag matches the custom tag.
      token.tag = openingToken.tag
    }

    return self.renderToken(tokens, idx, options)
  }
}
