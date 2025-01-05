import type { MarkdownItEnv } from '@md-plugins/shared'
import type MarkdownIt from 'markdown-it'
import type { Options, PluginWithOptions } from 'markdown-it'
import type Renderer from 'markdown-it/lib/renderer.mjs'
import type Token from 'markdown-it/lib/token.mjs'
import type { LinkPluginOptions } from './types'

export const linkPlugin: PluginWithOptions<LinkPluginOptions> = (
  md: MarkdownIt,
  {
    linkTag = 'MarkdownLink',
    linkToKeyword = 'to',
    pageScript = 'import MarkdownLink from "src/.q-press/components/MarkdownLink.vue"',
  }: LinkPluginOptions = {},
): void => {
  // Override the link_open rule
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

    token.tag = linkTag
    link[0] = linkToKeyword
    link[1] = decodeURI(url)

    if (pageScript) {
      env.pageScripts = env.pageScripts || new Set<string>()
      // Add the pageScript to the set
      env.pageScripts.add(pageScript)
    }

    return self.renderToken(tokens, idx, options)
  }

  // Override the link_close rule to ensure matching tags
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

    // To reliably find the link_open token, search backwards
    let openIdx = idx - 1
    while (openIdx >= 0 && tokens[openIdx]!.type !== 'link_open') {
      openIdx--
    }

    const openingToken = tokens[openIdx]
    if (openingToken && openingToken.tag) {
      // make sure closing tag matches opening tag
      token.tag = openingToken.tag
    }

    return self.renderToken(tokens, idx, options)
  }
}
