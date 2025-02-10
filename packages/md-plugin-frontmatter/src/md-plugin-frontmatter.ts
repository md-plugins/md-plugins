import type { MarkdownItEnv } from '@md-plugins/shared'
import grayMatter from 'gray-matter'
import type { PluginWithOptions } from 'markdown-it'
import type { FrontmatterPluginOptions } from './types'
import type MarkdownIt from 'markdown-it'

/**
 * Get markdown frontmatter and excerpt
 *
 * Extract them into env
 */
export const frontmatterPlugin: PluginWithOptions<FrontmatterPluginOptions> = (
  md: MarkdownIt,
  { grayMatterOptions, renderExcerpt = false } = {},
): void => {
  const render = md.render.bind(md)

  md.render = (src: string, env: MarkdownItEnv = {}): string => {
    let data, content, excerpt

    try {
      // Parse frontmatter and content
      ;({ data, content } = grayMatter(src, grayMatterOptions))
    } catch (error) {
      console.error('Failed to parse frontmatter:', error)
      data = {}
      content = src
      excerpt = undefined
    }

    // extract stripped content
    env.content = content

    // extract frontmatter
    env.frontmatter = {
      // allow providing default value
      ...env.frontmatter,
      ...data,
    }

    // render and extract excerpt
    env.excerpt = (
      renderExcerpt && data.excerpt
        ? // render the excerpt with original markdown-it render method.
          render(data.excerpt, env)
        : // use the raw excerpt directly
          excerpt
    ) as string

    return render(content, env)
  }
}
