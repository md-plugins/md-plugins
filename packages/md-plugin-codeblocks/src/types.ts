export interface Lang {
  name: string
  customCopy?: boolean
  aliases?: string
}

export interface CodeblockPluginOptions {
  /**
   * The default language to use if none is detected.
   * @default 'markup'
   */
  defaultLang?: string

  /**
   * The component used to wrap code blocks.
   * @default 'markdown-prerender'
   */
  containerComponent?: string

  /**
   * The component used to render the copy button.
   * @default 'markdown-copy-button'
   */
  copyButtonComponent?: string

  /**
   * The comonent name for the tab panel.
   * @default 'q-tab-panel'
   */
  tabPanelTagName?: string

  /**
   * The class(es) to be used with the tab panel.
   * @default 'q-pa-none'
   */
  tabPanelTagClass?: string

  /**
   * The class to be used for the pre tag.
   * @default 'markdown-code'
   */
  preClass?: string

  /**
   * The class to be used for the code tag (ok to be empty).
   * @default ''
   */
  codeClass?: string

  /**
   * An array of page scripts to be included.
   */
  pageScripts?: string[]

  /**
   * Optional Prism languages configuration array. This allows you to override or add custom language definitions.
   * Each item can have a `name`, optional `aliases`, and `customCopy` boolean.
   */
  langList?: Lang[]
}

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * An array of page script (import statements) to be included.
     */
    pageScripts?: Set<string>
  }
}
