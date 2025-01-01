import type matter from 'gray-matter'

type GrayMatterOptions = matter.GrayMatterOption<string, GrayMatterOptions>

/**
 * Options of md-plugin-frontmatter
 */
export interface FrontmatterPluginOptions {
  /**
   * Options of gray-matter
   *
   * @see https://github.com/jonschlinkert/gray-matter#options
   */
  grayMatterOptions?: GrayMatterOptions

  /**
   * Render the excerpt or not
   *
   * @default false
   */
  renderExcerpt?: boolean
}

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * The raw Markdown content without frontmatter
     */
    content?: string

    /**
     * Whether render excerpt or not
     */
    renderExcerpt?: boolean

    /**
     * The excerpt that extracted by `md-plugin-frontmatter`
     *
     * - Would be the rendered HTML when `renderExcerpt` is enabled
     * - Would be the raw Markdown when `renderExcerpt` is disabled
     */
    excerpt?: string

    /**
     * The frontmatter that extracted by `md-plugin-frontmatter`
     */
    frontmatter?: Record<string, unknown>
  }
}
