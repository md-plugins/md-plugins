/// // eslint-disable-next-line typescript-eslint/no-empty-object-type
export interface MarkdownItEnv {
  plugins?: Record<string, unknown>
  // empty interface to allow for env to be extended with module augmentation
}

// used by multiple plugins
export interface MarkdownItHeader {
  /**
   * The slug of the header
   *
   * Typically the `id` attr of the header anchor
   */
  id: string

  /**
   * The level of the header
   *
   * `1` to `6` for `<h1>` to `<h6>`
   */
  level: number

  /**
   * The title of the header
   */
  title: string

  /**
   * Link of the header
   *
   * Typically using `#${slug}` as the anchor hash
   */
  link: string

  /**
   * The children of the header
   */
  children: MarkdownItHeader[]
}
