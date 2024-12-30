export interface TablePluginOptions {
  /**
   * The class for the table
   *
   * @default 'markdown-page-table'
   */
  tableClass?: string
  /**
   * The class for the table header
   *
   * @default 'text-left'
   */
  tableHeaderClass?: string
  /**
   * The class for the table row
   *
   * @default ''
   */
  tableRowClass?: string
  /**
   * The class for the table cell
   *
   * @default ''
   */
  tableCellClass?: string
  /**
   * The token for the table
   *
   * @default 'q-markup-table' (replaces 'table')
   */
  tableToken?: string
  /**
   * The attributes for the table
   *
   * @default [ [':wrap-cells', 'true'],[':flat', 'true'],[':bordered', 'true'] ]
   */
  tableAttributes?: [string, any][]
}
