export type MermaidRenderMode = 'component' | 'pre'

export interface MermaidPluginOptions {
  /**
   * Languages that should be treated as Mermaid diagrams.
   *
   * @default ['mermaid', 'mmd']
   */
  languages?: string[]

  /**
   * Render as a Vue component or as a plain Mermaid pre block.
   *
   * @default 'component'
   */
  renderMode?: MermaidRenderMode

  /**
   * The Vue component used when renderMode is "component".
   *
   * @default 'MarkdownMermaid'
   */
  componentName?: string

  /**
   * The prop name used to pass diagram source into the component.
   *
   * @default 'code'
   */
  codeProp?: string

  /**
   * The class applied to plain pre blocks when renderMode is "pre".
   *
   * @default 'mermaid'
   */
  preClass?: string

  /**
   * Page-level import statements required by the component render mode.
   */
  pageScripts?: string[]
}

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * An array of page script import statements to include in generated Vue pages.
     */
    pageScripts?: Set<string>
  }
}
