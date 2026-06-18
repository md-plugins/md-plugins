import type { ResolvedConfig } from 'vite'

export type MaybePromise<T> = T | Promise<T>

export type JsonPrimitive = string | number | boolean | null

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export type SearchRecordType = 'page' | 'heading' | 'content'

export interface SearchRecordSource {
  /**
   * Absolute path to the source Markdown file.
   */
  file: string

  /**
   * Markdown file path relative to the configured root.
   */
  relativeFile: string
}

export interface SearchRecord {
  id: string
  type: SearchRecordType
  title: string
  content: string
  url: string
  path: string
  anchor?: string
  section?: string
  hierarchy: string[]
  tags: string[]
  source: SearchRecordSource
  meta?: Record<string, JsonValue>
}

export interface SearchIndex {
  generatedAt: string
  recordCount: number
  records: SearchRecord[]
}

export interface SearchFrontmatterOptions {
  /**
   * Frontmatter field names to read for the page title.
   */
  titleFields?: string[]

  /**
   * Frontmatter field names to read for page descriptions.
   */
  descriptionFields?: string[]

  /**
   * Frontmatter field names to read for tags or search keywords.
   */
  tagFields?: string[]

  /**
   * Frontmatter field that disables indexing when set to false.
   */
  searchField?: string

  /**
   * Frontmatter fields to copy into each record's metadata.
   */
  metaFields?: string[]
}

export interface MarkdownSearchOptions {
  /**
   * Directory containing Markdown pages.
   */
  root: string

  /**
   * Glob pattern or patterns to include.
   */
  include?: string | string[]

  /**
   * Glob pattern or patterns to exclude.
   */
  exclude?: string | string[]

  /**
   * Markdown file that should map to the site root.
   */
  landingPage?: string

  /**
   * URL path prefix for Markdown routes before the Vite base is applied.
   */
  routeBase?: string

  /**
   * Frontmatter parsing and indexing options.
   */
  frontmatter?: SearchFrontmatterOptions

  /**
   * Create heading records in addition to content records. Defaults to true.
   */
  headingRecords?: boolean

  /**
   * Create content records for text under each heading. Defaults to true.
   */
  contentRecords?: boolean

  /**
   * Minimum content length required before a content record is emitted.
   */
  minContentLength?: number
}

export interface CreateSearchIndexOptions {
  /**
   * Markdown sources to index.
   */
  markdown?: MarkdownSearchOptions | MarkdownSearchOptions[]

  /**
   * Base URL path applied to generated record URLs. Defaults to '/'.
   */
  base?: string
}

export interface SearchAdapterOutput {
  fileName: string
  source: string | Uint8Array
}

export interface SearchAdapterContext {
  config?: ResolvedConfig
  index: SearchIndex
  options: ViteSearchPluginOptions
}

export interface SearchAdapter {
  name: string
  transform: (
    records: SearchRecord[],
    context: SearchAdapterContext,
  ) => MaybePromise<SearchAdapterOutput | SearchAdapterOutput[] | void>
}

export type SearchAdapterName = 'json' | 'meilisearch' | 'algolia'

export type SearchAdapterInput = SearchAdapterName | SearchAdapter

export interface JsonSearchAdapterOptions {
  fileName?: string
  pretty?: boolean
  recordsOnly?: boolean
}

export interface MeilisearchAdapterOptions {
  fileName?: string
  pretty?: boolean
  indexUid?: string
  primaryKey?: string
}

export interface AlgoliaAdapterOptions {
  fileName?: string
  pretty?: boolean
}

export interface ViteSearchPluginOptions extends CreateSearchIndexOptions {
  /**
   * Disable build output while keeping the virtual module available.
   */
  enabled?: boolean

  /**
   * Virtual module id for reading the generated search index in application code.
   */
  virtualModuleId?: string

  /**
   * Search output adapters. Defaults to ['json'].
   */
  adapters?: SearchAdapterInput[]
}
