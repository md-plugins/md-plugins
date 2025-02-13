import type { MarkdownItEnv } from '@md-plugins/shared'
import grayMatter from 'gray-matter'
import type { PluginWithOptions } from 'markdown-it'
import type { FrontmatterPluginOptions } from './types'
import type MarkdownIt from 'markdown-it'
import { resolvePluginOptions } from '@md-plugins/shared'

/**
 * Default options for the frontmatter plugin.
 * Here we ensure grayMatterOptions is at least an empty object and renderExcerpt is false.
 */
const DEFAULT_FRONTMATTER_PLUGIN_OPTIONS: FrontmatterPluginOptions = {
  grayMatterOptions: {},
  renderExcerpt: false,
}

/**
 * Get markdown frontmatter and excerpt.
 * Extract them into env.
 */
export const frontmatterPlugin: PluginWithOptions<FrontmatterPluginOptions> = (
  md: MarkdownIt,
  options?: FrontmatterPluginOptions | { frontmatterPlugin?: FrontmatterPluginOptions },
): void => {
  // Resolve options from either a global configuration object or directly passed plugin options.
  const resolvedOptions = resolvePluginOptions<FrontmatterPluginOptions, 'frontmatterPlugin'>(
    options,
    'frontmatterPlugin',
    DEFAULT_FRONTMATTER_PLUGIN_OPTIONS,
  )

  const {
    grayMatterOptions = DEFAULT_FRONTMATTER_PLUGIN_OPTIONS.grayMatterOptions,
    renderExcerpt = DEFAULT_FRONTMATTER_PLUGIN_OPTIONS.renderExcerpt,
  } = resolvedOptions

  // Preserve the original render method.
  const render = md.render.bind(md)

  // Override md.render to parse frontmatter before rendering.
  md.render = (src: string, env: MarkdownItEnv = {}): string => {
    let data, content, excerpt

    try {
      // Parse frontmatter and content.
      ;({ data, content } = grayMatter(src, grayMatterOptions))
    } catch (error) {
      console.error('Failed to parse frontmatter:', error)
      data = {}
      content = src
      excerpt = undefined
    }

    // Save the stripped content in env.
    env.content = content

    // Merge any existing frontmatter in env with the parsed data.
    env.frontmatter = {
      ...env.frontmatter,
      ...data,
    }

    // Optionally render and extract the excerpt.
    env.excerpt = (renderExcerpt && data.excerpt ? render(data.excerpt, env) : excerpt) as string

    // Finally, render the main content.
    return render(content, env)
  }
}
