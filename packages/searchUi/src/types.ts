/// <reference lib="dom" />

export type MaybePromise<T> = T | Promise<T>

export type SearchRecordType = 'page' | 'heading' | 'content'

export interface SearchRecordSource {
  file: string
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
  meta?: Record<string, unknown>
}

export interface SearchIndex {
  generatedAt: string
  recordCount: number
  records: SearchRecord[]
}

export interface SearchResult {
  id: string
  title: string
  url: string
  content: string
  score: number
  type: SearchRecordType
  path: string
  section?: string
  hierarchy: string[]
  tags: string[]
  record: SearchRecord
}

export interface SearchOptions {
  limit?: number
  collapseDuplicateResults?: boolean
}

export interface SearchProvider {
  search: (query: string, options?: SearchOptions) => MaybePromise<SearchResult[]>
}

export interface JsonSearchProviderOptions {
  src?: string
  index?: SearchIndex | SearchRecord[]
  fetcher?: typeof fetch
}

export interface MdSearchSelectEventDetail {
  result: SearchResult
}

export interface CreateSearchOptions {
  target: Element
  src?: string
  provider?: SearchProvider
  placeholder?: string
  triggerLabel?: string
  panelTitle?: string
  searchLabel?: string
  theme?: 'light' | 'dark'
  shortcut?: string
  minQueryLength?: number
  maxResults?: number
  showDuplicateResults?: boolean
}
