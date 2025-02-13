import type { MarkdownItEnv } from '@md-plugins/shared'
import type { PluginWithOptions, Options } from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import type { TablePluginOptions } from './types'
import { resolvePluginOptions } from '@md-plugins/shared'

// Default options for the table plugin.
const DEFAULT_TABLE_PLUGIN_OPTIONS: TablePluginOptions = {
  tableClass: 'markdown-table',
  tableHeaderClass: 'text-left',
  tableRowClass: '',
  tableCellClass: '',
  tableToken: 'q-markup-table',
  tableAttributes: [],
}

export const tablePlugin: PluginWithOptions<TablePluginOptions> = (
  md,
  options?: TablePluginOptions | { tablePlugin?: TablePluginOptions },
): void => {
  // Resolve and merge plugin options, adding fallback defaults during destructuring.
  const {
    tableClass = DEFAULT_TABLE_PLUGIN_OPTIONS.tableClass,
    tableHeaderClass = DEFAULT_TABLE_PLUGIN_OPTIONS.tableHeaderClass,
    tableRowClass = DEFAULT_TABLE_PLUGIN_OPTIONS.tableRowClass,
    tableCellClass = DEFAULT_TABLE_PLUGIN_OPTIONS.tableCellClass,
    tableToken = DEFAULT_TABLE_PLUGIN_OPTIONS.tableToken,
    tableAttributes = DEFAULT_TABLE_PLUGIN_OPTIONS.tableAttributes,
  } = resolvePluginOptions<TablePluginOptions, 'tablePlugin'>(
    options,
    'tablePlugin',
    DEFAULT_TABLE_PLUGIN_OPTIONS,
  )

  // Preserve the original renderer.
  const render = md.renderer.render.bind(md.renderer)

  md.renderer.render = (tokens: Token[], options: Options, env: MarkdownItEnv): string => {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (!token) continue

      switch (token.type) {
        case 'table_open':
          // Replace default table tag with the custom token and add class.
          token.tag = tableToken ?? (DEFAULT_TABLE_PLUGIN_OPTIONS.tableToken as string)
          token.attrSet('class', tableClass ?? (DEFAULT_TABLE_PLUGIN_OPTIONS.tableClass as string))
          // Set any additional attributes.
          for (const [attrName, attrValue] of tableAttributes ?? []) {
            token.attrSet(attrName, String(attrValue))
          }
          break

        case 'table_close':
          // Ensure closing tag matches the custom opening tag.
          token.tag = tableToken ?? (DEFAULT_TABLE_PLUGIN_OPTIONS.tableToken as string)
          break

        case 'th_open':
          if (tableHeaderClass) {
            token.attrSet('class', tableHeaderClass)
          }
          break

        case 'tr_open':
          if (tableRowClass) {
            token.attrSet('class', tableRowClass)
          }
          break

        case 'td_open':
          if (tableCellClass) {
            token.attrSet('class', tableCellClass)
          }
          break

        // Add more cases if other table-related tokens need handling.
      }
    }

    return render(tokens, options, env)
  }
}
