import type { MarkdownItEnv } from '@md-plugins/shared'
import type { PluginWithOptions } from 'markdown-it'
import type { TablePluginOptions } from './types'

import type { Options } from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

export const tablePlugin: PluginWithOptions<TablePluginOptions> = (
  md,
  {
    tableClass = 'markdown-table',
    tableHeaderClass = 'text-left',
    tableRowClass = '',
    tableCellClass = '',
    tableToken = 'q-markup-table',
    tableAttributes = [],
  } = {},
): void => {
  const render = md.renderer.render.bind(md.renderer)

  md.renderer.render = (tokens: Token[], options: Options, env: MarkdownItEnv): string => {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (!token) {
        continue
      }

      switch (token.type) {
        case 'table_open':
          // Replace default table tag with custom token
          token.tag = tableToken
          token.attrSet('class', tableClass)
          // Set any additional attributes
          for (const [attrName, attrValue] of tableAttributes) {
            token.attrSet(attrName, String(attrValue))
          }
          break

        case 'table_close':
          // Ensure closing tag matches the opening tag
          token.tag = tableToken
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

        // Add more cases if other table-related tokens need handling
      }
    }

    return render(tokens, options, env)
  }
}
