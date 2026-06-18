import type {
  JsonSearchProviderOptions,
  SearchIndex,
  SearchOptions,
  SearchProvider,
  SearchRecord,
  SearchResult,
} from './types'
import { createSearchSnippet, createSearchTerms, normalizeSearchableText } from './text'

function normalizeIndexPayload(payload: SearchIndex | SearchRecord[]): SearchRecord[] {
  return Array.isArray(payload) ? payload : payload.records
}

function getSearchFields(record: SearchRecord): Record<string, string> {
  return {
    title: normalizeSearchableText(record.title),
    section: normalizeSearchableText(record.section),
    hierarchy: normalizeSearchableText(record.hierarchy.join(' ')),
    tags: normalizeSearchableText(record.tags.join(' ')),
    content: normalizeSearchableText(record.content),
  }
}

function scoreRecord(record: SearchRecord, terms: string[]): number {
  const fields = getSearchFields(record)
  let score = 0

  for (const term of terms) {
    let matched = false

    if (fields.title.includes(term)) {
      score += fields.title.startsWith(term) ? 36 : 28
      matched = true
    }

    if (fields.section.includes(term)) {
      score += fields.section.startsWith(term) ? 24 : 18
      matched = true
    }

    if (fields.hierarchy.includes(term)) {
      score += 12
      matched = true
    }

    if (fields.tags.includes(term)) {
      score += 10
      matched = true
    }

    if (fields.content.includes(term)) {
      score += record.type === 'content' ? 8 : 5
      matched = true
    }

    if (!matched) {
      return 0
    }
  }

  if (record.type === 'page') {
    score += 6
  } else if (record.type === 'heading') {
    score += 4
  }

  return score
}

function hasUsefulContent(result: SearchResult): boolean {
  const content = normalizeSearchableText(result.content)

  if (content === '') {
    return false
  }

  return (
    content !== normalizeSearchableText(result.title) &&
    content !== normalizeSearchableText(result.section)
  )
}

function preferDuplicateResult(current: SearchResult, candidate: SearchResult): SearchResult {
  if (current.type === 'content' && candidate.type !== 'content' && hasUsefulContent(current)) {
    return current
  }

  if (candidate.type === 'content' && current.type !== 'content' && hasUsefulContent(candidate)) {
    return candidate
  }

  if (candidate.score > current.score) {
    return candidate
  }

  return current
}

function collapseDuplicateResults(results: SearchResult[]): SearchResult[] {
  const byUrl = new Map<string, SearchResult>()

  for (const result of results) {
    const current = byUrl.get(result.url)

    byUrl.set(result.url, current === undefined ? result : preferDuplicateResult(current, result))
  }

  return Array.from(byUrl.values()).sort(
    (a, b) => b.score - a.score || a.title.localeCompare(b.title),
  )
}

export function searchRecords(
  records: SearchRecord[],
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  const terms = createSearchTerms(query)

  if (terms.length === 0) {
    return []
  }

  const results = records
    .map((record): SearchResult | undefined => {
      const score = scoreRecord(record, terms)

      if (score === 0) {
        return undefined
      }

      return {
        id: record.id,
        title: record.title,
        url: record.url,
        content: createSearchSnippet(record.content, terms),
        score,
        type: record.type,
        path: record.path,
        section: record.section,
        hierarchy: record.hierarchy,
        tags: record.tags,
        record,
      }
    })
    .filter((result): result is SearchResult => result !== undefined)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))

  const displayResults =
    options.collapseDuplicateResults === false ? results : collapseDuplicateResults(results)

  return displayResults.slice(0, options.limit ?? 12)
}

export function createStaticSearchProvider(records: SearchRecord[]): SearchProvider {
  return {
    search(query, options) {
      return searchRecords(records, query, options)
    },
  }
}

export function createJsonSearchProvider(options: JsonSearchProviderOptions = {}): SearchProvider {
  let recordsPromise: Promise<SearchRecord[]> | undefined

  async function loadRecords(): Promise<SearchRecord[]> {
    if (options.index !== undefined) {
      return normalizeIndexPayload(options.index)
    }

    if (options.src === undefined) {
      throw new Error('createJsonSearchProvider requires either "src" or "index".')
    }

    const src = options.src

    recordsPromise ??= Promise.resolve().then(async () => {
      const fetcher = options.fetcher ?? globalThis.fetch

      if (fetcher === undefined) {
        throw new Error('No fetch implementation is available for loading the search index.')
      }

      const response = await fetcher(src)

      if (!response.ok) {
        throw new Error(`Unable to load search index: ${response.status} ${response.statusText}`)
      }

      const responseText = await response.text()

      try {
        return normalizeIndexPayload(JSON.parse(responseText) as SearchIndex | SearchRecord[])
      } catch {
        const contentType = response.headers.get('content-type') ?? 'unknown content type'
        const preview = responseText.trim().slice(0, 120)

        throw new Error(
          `Unable to parse search index JSON from ${src}. Received ${contentType}${preview ? `: ${preview}` : '.'}`,
        )
      }
    })

    return recordsPromise
  }

  return {
    async search(query, searchOptions) {
      return searchRecords(await loadRecords(), query, searchOptions)
    },
  }
}
