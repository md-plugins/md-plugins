export interface LinkPluginOptions {
  /**
   * The tag for the internal link
   *
   * @default 'MarkdownLink'
   */
  linkTag?: string;
  /**
   * The "to" keyword" for the internal link
   *
   * @default 'to'
   */
  linkToKeyword?: string;
  /**
   * add import statements to the page.
   *
   */
  pageScript?: string;
}

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * An array of page script (import statements) to be included for tags.
     */
    pageScripts?: Set<string>;
  }
}
