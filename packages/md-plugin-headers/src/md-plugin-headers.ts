import { slugify as defaultSlugify } from '@md-plugins/shared'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { PluginWithOptions } from 'markdown-it'
import type { HeadersPluginOptions } from './types'
import type MarkdownIt from 'markdown-it'

const titleRE = /<\/?[^>]+(>|$)/g
const apiRE = /^<MarkdownApi /
const apiNameRE = /(?:file|name)="([^"]+)"/
const exampleRE = /^<MarkdownExample(?:\s+title="([^"]*)")?\s*/

function parseContent(
  str: string,
  slugify: (str: string) => string = defaultSlugify,
  format: (str: string) => string = (_str: string) => _str,
): { id: string; title: string } {
  const title = String(str).replace(titleRE, '').trim()

  return {
    id: slugify(title),
    title: format(title) ?? title,
  }
}

// export const mdPluginHeading: PluginSimple = (md) => {
export const headersPlugin: PluginWithOptions<HeadersPluginOptions> = (
  md: MarkdownIt,
  // prettier-ignore
  {
    level = [2, 3],
    slugify = defaultSlugify,
    format
  }: HeadersPluginOptions = {},
): void => {
  const originalHeadingOpen = md.renderer.rules.heading_open
  const originalHtmlBlock = md.renderer.rules.html_block

  md.renderer.rules.heading_open = (tokens, idx, options, env: MarkdownItEnv, self): string => {
    const token = tokens[idx]
    if (!token) {
      return self.renderToken(tokens, idx, options)
    }

    // get the level from the tag, h1 -> 1, h2 -> 2, etc.
    const headerLevel = Number.parseInt(token.tag.slice(1), 10)

    // content of the heading (next token is the inline content)
    const contentToken = tokens[idx + 1]
    const content =
      contentToken && contentToken.children
        ? contentToken.children.reduce((acc, t) => acc + t.content, '')
        : ''

    const { id, title } = parseContent(content, slugify, format)

    token.attrSet('id', id)
    // TODO: Jeff - 'markdown-heading' and 'markdown-' should be props
    token.attrSet('class', `markdown-heading markdown-${token.tag}`)
    // TODO: Jeff - 'copyHeading' should be a prop
    token.attrSet('@click', `copyHeading(\`${id}\`)`)

    // Ensure toc array exists
    env.toc = env.toc || []

    // console.log('token level:', token.level, title)

    // If the heading level matches the first level in the array, it’s a main heading
    // otherwise it's considered a subheading
    if (level.includes(headerLevel)) {
      if (headerLevel === level[0]) {
        env.toc.push({ id, title })
      } else {
        env.toc.push({ id, title, sub: true })
      }
    }
    // else: the heading is not included in the toc, but we still must render it

    if (typeof originalHeadingOpen === 'function') {
      return originalHeadingOpen(tokens, idx, options, env, self)
    }
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.html_block = (tokens, idx, options, env: MarkdownItEnv, self): string => {
    const token = tokens[idx]
    if (!token) {
      return ''
    }

    env.toc = env.toc || []

    // TODO: Jeff - RE's should be an array prop ({ RE: string | RegExp[], postfix?: string, children: [] })
    // where if RE matches, then children are run through the same process
    if (apiRE.test(token.content)) {
      const match = apiNameRE.exec(token.content)
      if (match !== null) {
        const title = `${match[1]} API`
        env.toc.push({ id: slugify(title), title, deep: true })
      }
    }

    const match = token.content.match(exampleRE)
    if (match !== null) {
      const title = match[1] ?? 'Example'
      env.toc.push({ id: slugify(title), title, deep: true })
    }

    if (typeof originalHtmlBlock === 'function') {
      return originalHtmlBlock(tokens, idx, options, env, self)
    }
    return token.content
  }
}
