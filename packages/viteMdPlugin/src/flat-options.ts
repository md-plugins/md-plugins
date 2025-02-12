import type { MarkdownOptions } from './types'
import type { BlockquotePluginOptions } from '@md-plugins/md-plugin-blockquote'
import type { CodeblockPluginOptions } from '@md-plugins/md-plugin-codeblocks'
import type { FrontmatterPluginOptions } from '@md-plugins/md-plugin-frontmatter'
import type { HeadersPluginOptions } from '@md-plugins/md-plugin-headers'
import type { ImagePluginOptions } from '@md-plugins/md-plugin-image'
import type { InlineCodePluginOptions } from '@md-plugins/md-plugin-inlinecode'
import type { LinkPluginOptions } from '@md-plugins/md-plugin-link'
import type { TablePluginOptions } from '@md-plugins/md-plugin-table'

export interface MarkdownParserOptions
  extends MarkdownOptions,
    BlockquotePluginOptions,
    CodeblockPluginOptions,
    FrontmatterPluginOptions,
    HeadersPluginOptions,
    ImagePluginOptions,
    InlineCodePluginOptions,
    LinkPluginOptions,
    TablePluginOptions {
  html?: boolean
  linkify?: boolean
  typographer?: boolean
  breaks?: boolean
}

export function flattenOptions(options: MarkdownOptions): MarkdownParserOptions {
  const flattened: MarkdownParserOptions = { ...options }

  // Extract and merge nested options
  if (options.blockquote) {
    Object.assign(flattened, options.blockquote)
    delete flattened.blockquote
  }
  if (options.codeblocks) {
    Object.assign(flattened, options.codeblocks)
    delete flattened.codeblocks
  }
  if (options.frontmatter) {
    Object.assign(flattened, options.frontmatter)
    delete flattened.frontmatter
  }
  if (options.headers && typeof options.headers === 'object') {
    Object.assign(flattened, options.headers)
    delete flattened.headers
  }
  if (options.image) {
    Object.assign(flattened, options.image)
    delete flattened.image
  }
  if (options.inlinecode) {
    Object.assign(flattened, options.inlinecode)
    delete flattened.inlinecode
  }
  if (options.link) {
    Object.assign(flattened, options.link)
    delete flattened.link
  }
  if (options.table) {
    Object.assign(flattened, options.table)
    delete flattened.table
  }

  return flattened
}
