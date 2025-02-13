import type { Options } from 'markdown-it'
import type { MarkdownItEnv } from '@md-plugins/shared'
import type { BlockquotePluginOptions } from '@md-plugins/md-plugin-blockquote'
import type { CodeblockPluginOptions } from '@md-plugins/md-plugin-codeblocks'
import type { FrontmatterPluginOptions } from '@md-plugins/md-plugin-frontmatter'
import type { HeadersPluginOptions } from '@md-plugins/md-plugin-headers'
import type { ImagePluginOptions } from '@md-plugins/md-plugin-image'
import type { InlineCodePluginOptions } from '@md-plugins/md-plugin-inlinecode'
import type { LinkPluginOptions } from '@md-plugins/md-plugin-link'
import type { TablePluginOptions } from '@md-plugins/md-plugin-table'

export interface MarkdownOptions extends Options {
  html?: boolean
  linkify?: boolean
  typographer?: boolean
  breaks?: boolean
  blockquotePlugin?: BlockquotePluginOptions
  codeblockPlugin?: CodeblockPluginOptions
  frontmatterPlugin?: FrontmatterPluginOptions
  headersPlugin?: HeadersPluginOptions | boolean
  imagePlugin?: ImagePluginOptions
  inlineCodePlugin?: InlineCodePluginOptions
  linkPlugin?: LinkPluginOptions
  tablePlugin?: TablePluginOptions
  preProcess?: (env: MarkdownItEnv) => void
  postProcess?: (env: MarkdownItEnv) => void
}

export interface MenuItem {
  name: string
  path?: string
  icon?: string
  iconColor?: string
  rightIcon?: string
  rightIconColor?: string
  badge?: string
  children?: MenuItem[] | undefined
  external?: boolean
  expanded?: boolean
}

export interface MenuNode {
  name: string
  path?: string
  external?: boolean
  children?: MenuNode[]
}

export interface FlatMenuEntry {
  name: string
  category: string | null
  path: string
  prev?: FlatMenuEntry
  next?: FlatMenuEntry
}

export type FlatMenu = Record<string, FlatMenuEntry>

export interface NavItem extends FlatMenuEntry {
  classes: string
}

export interface RelatedItem {
  name: string
  category: string
  path: string
}

export interface UserConfig {
  path: string
  menu: MenuItem[]
  config?: MarkdownOptions
}
