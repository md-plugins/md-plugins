import type {
  AlgoliaAdapterOptions,
  JsonSearchAdapterOptions,
  MeilisearchAdapterOptions,
  SearchAdapter,
  SearchAdapterInput,
  SearchIndex,
  SearchRecord,
} from './types'

function stringifyJson(value: unknown, pretty = true): string {
  return `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`
}

function serializeIndex(index: SearchIndex, options: JsonSearchAdapterOptions = {}): string {
  return stringifyJson(options.recordsOnly === true ? index.records : index, options.pretty)
}

/**
 * Emits the normalized md-plugins search index.
 */
export function createJsonSearchAdapter(options: JsonSearchAdapterOptions = {}): SearchAdapter {
  return {
    name: 'json',
    transform(_records, context) {
      return {
        fileName: options.fileName ?? 'search/search-index.json',
        source: serializeIndex(context.index, options),
      }
    },
  }
}

/**
 * Emits documents and metadata ready for a Meilisearch upload step.
 */
export function createMeilisearchAdapter(options: MeilisearchAdapterOptions = {}): SearchAdapter {
  const primaryKey = options.primaryKey ?? 'id'

  return {
    name: 'meilisearch',
    transform(records) {
      return {
        fileName: options.fileName ?? 'search/meilisearch.json',
        source: stringifyJson(
          {
            indexUid: options.indexUid,
            primaryKey,
            documents: records.map((record) => ({
              id: record.id,
              type: record.type,
              title: record.title,
              section: record.section,
              content: record.content,
              hierarchy: record.hierarchy,
              tags: record.tags,
              url: record.url,
              path: record.path,
              anchor: record.anchor,
              source: record.source,
              meta: record.meta,
            })),
          },
          options.pretty,
        ),
      }
    },
  }
}

function createAlgoliaHierarchy(record: SearchRecord): Record<string, string | null> {
  const fallback = record.title

  return {
    lvl0: record.hierarchy[0] ?? fallback,
    lvl1: record.hierarchy[1] ?? null,
    lvl2: record.hierarchy[2] ?? null,
    lvl3: record.hierarchy[3] ?? null,
    lvl4: record.hierarchy[4] ?? null,
    lvl5: record.hierarchy[5] ?? null,
  }
}

/**
 * Emits records shaped for an Algolia upload or DocSearch-style adapter step.
 */
export function createAlgoliaAdapter(options: AlgoliaAdapterOptions = {}): SearchAdapter {
  return {
    name: 'algolia',
    transform(records) {
      return {
        fileName: options.fileName ?? 'search/algolia.json',
        source: stringifyJson(
          records.map((record) => ({
            objectID: record.id,
            url: record.url,
            type: record.type,
            hierarchy: createAlgoliaHierarchy(record),
            content: record.content,
            anchor: record.anchor,
            tags: record.tags,
            source: record.source,
            meta: record.meta,
          })),
          options.pretty,
        ),
      }
    },
  }
}

/**
 * Converts adapter names and custom adapters into executable adapter instances.
 */
export function normalizeSearchAdapters(
  adapters: SearchAdapterInput[] | undefined,
): SearchAdapter[] {
  const adapterInputs = adapters ?? ['json']

  return adapterInputs.map((adapter) => {
    if (typeof adapter !== 'string') {
      return adapter
    }

    switch (adapter) {
      case 'json':
        return createJsonSearchAdapter()
      case 'meilisearch':
        return createMeilisearchAdapter()
      case 'algolia':
        return createAlgoliaAdapter()
    }
  })
}
