import { readFile } from 'node:fs/promises'
import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import { globSync } from 'tinyglobby'
import type { Token } from 'markdown-it'
import type {
  CreateSearchIndexOptions,
  JsonValue,
  MarkdownSearchOptions,
  SearchFrontmatterOptions,
  SearchIndex,
  SearchRecord,
} from './types'
import {
  createSearchRecord,
  createSearchUrl,
  createUniqueAnchorFactory,
  markdownFileToSearchRoutePath,
  normalizePatterns,
  normalizeSearchTags,
  normalizeSearchText,
  resolveMarkdownSourcePath,
} from './records'

const defaultTitleFields = ['title']
const defaultDescriptionFields = ['desc', 'description']
const defaultTagFields = ['tags', 'keys', 'keywords']
const defaultMetaFields = ['badge', 'overline']

const markdown = new MarkdownIt({
  html: false,
  linkify: false,
  typographer: false,
})

type FrontmatterData = Record<string, unknown>

interface PageContext {
  base: string | undefined
  options: MarkdownSearchOptions
  relativeFile: string
  file: string
  path: string
  url: string
  frontmatter: FrontmatterData
  title: string
  description: string
  tags: string[]
  meta?: Record<string, JsonValue>
}

function getFrontmatterValue(frontmatter: FrontmatterData, fields: string[]): unknown {
  return fields.find((field) => frontmatter[field] !== undefined)
    ? frontmatter[fields.find((field) => frontmatter[field] !== undefined)!]
    : undefined
}

function getFrontmatterText(frontmatter: FrontmatterData, fields: string[]): string {
  return normalizeSearchText(getFrontmatterValue(frontmatter, fields))
}

function getFrontmatterTags(frontmatter: FrontmatterData, fields: string[]): string[] {
  return Array.from(new Set(fields.flatMap((field) => normalizeSearchTags(frontmatter[field]))))
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue)
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).every(isJsonValue)
  }

  return false
}

function getFrontmatterMeta(
  frontmatter: FrontmatterData,
  fields: string[],
): Record<string, JsonValue> | undefined {
  const meta: Record<string, JsonValue> = {}

  fields.forEach((field) => {
    const value = frontmatter[field]
    if (isJsonValue(value)) {
      meta[field] = value
    }
  })

  return Object.keys(meta).length === 0 ? undefined : meta
}

function getFrontmatterOptions(options: MarkdownSearchOptions): Required<SearchFrontmatterOptions> {
  return {
    titleFields: options.frontmatter?.titleFields ?? defaultTitleFields,
    descriptionFields: options.frontmatter?.descriptionFields ?? defaultDescriptionFields,
    tagFields: options.frontmatter?.tagFields ?? defaultTagFields,
    searchField: options.frontmatter?.searchField ?? 'search',
    metaFields: options.frontmatter?.metaFields ?? defaultMetaFields,
  }
}

function shouldIndexPage(
  frontmatter: FrontmatterData,
  frontmatterOptions: Required<SearchFrontmatterOptions>,
): boolean {
  return frontmatter[frontmatterOptions.searchField] !== false
}

function isHeadingOpenToken(token: Token): boolean {
  return token.type === 'heading_open' && /^h[1-6]$/.test(token.tag)
}

function getHeadingLevel(token: Token): number {
  return Number(token.tag.slice(1))
}

function getTokenContent(token: Token | undefined): string {
  if (token === undefined) {
    return ''
  }

  if (token.children !== null && token.children.length > 0) {
    return normalizeSearchText(token.children.map(getTokenContent).join(' '))
  }

  if (token.type === 'hardbreak' || token.type === 'softbreak') {
    return ' '
  }

  return normalizeSearchText(token.content)
}

function getInlineContent(token: Token | undefined): string {
  return token?.type === 'inline' ? getTokenContent(token) : ''
}

function flushContentRecord(
  records: SearchRecord[],
  context: PageContext,
  state: {
    anchor?: string
    hierarchy: string[]
    section?: string
    content: string[]
    recordIndex: number
  },
): void {
  const content = normalizeSearchText(state.content.join(' '))
  const minContentLength = context.options.minContentLength ?? 2

  if (context.options.contentRecords === false || content.length < minContentLength) {
    state.content.splice(0)
    return
  }

  records.push(
    createSearchRecord({
      type: 'content',
      path: context.path,
      url: context.url,
      title: context.title,
      content,
      hierarchy: state.hierarchy,
      tags: context.tags,
      source: {
        file: context.file,
        relativeFile: context.relativeFile,
      },
      index: ++state.recordIndex,
      anchor: state.anchor,
      section: state.section,
      meta: context.meta,
    }),
  )

  state.content.splice(0)
}

function createRecordsFromTokens(context: PageContext, tokens: Token[]): SearchRecord[] {
  const records: SearchRecord[] = []
  const createAnchor = createUniqueAnchorFactory()
  const state = {
    anchor: undefined as string | undefined,
    hierarchy: [] as string[],
    section: undefined as string | undefined,
    content: [] as string[],
    recordIndex: 0,
  }

  records.push(
    createSearchRecord({
      type: 'page',
      path: context.path,
      url: context.url,
      title: context.title,
      content: context.description || context.title,
      hierarchy: [],
      tags: context.tags,
      source: {
        file: context.file,
        relativeFile: context.relativeFile,
      },
      index: ++state.recordIndex,
      meta: context.meta,
    }),
  )

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]

    if (isHeadingOpenToken(token)) {
      flushContentRecord(records, context, state)

      const title = getInlineContent(tokens[index + 1])
      if (title.length === 0) {
        continue
      }

      const level = getHeadingLevel(token)
      state.hierarchy[level - 1] = title
      state.hierarchy = state.hierarchy.slice(0, level)
      state.anchor = createAnchor(title)
      state.section = title

      if (context.options.headingRecords !== false) {
        records.push(
          createSearchRecord({
            type: 'heading',
            path: context.path,
            url: context.url,
            title: context.title,
            content: title,
            hierarchy: state.hierarchy,
            tags: context.tags,
            source: {
              file: context.file,
              relativeFile: context.relativeFile,
            },
            index: ++state.recordIndex,
            anchor: state.anchor,
            section: state.section,
            meta: context.meta,
          }),
        )
      }

      index += 1
      continue
    }

    if (token.type === 'inline') {
      const content = getInlineContent(token)
      if (content.length > 0) {
        state.content.push(content)
      }
    }
  }

  flushContentRecord(records, context, state)

  return records
}

async function createMarkdownPageRecords(
  options: MarkdownSearchOptions,
  relativeFile: string,
  base: string | undefined,
): Promise<SearchRecord[]> {
  const frontmatterOptions = getFrontmatterOptions(options)
  const file = resolveMarkdownSourcePath(options.root, relativeFile)
  const raw = await readFile(file, 'utf8')
  const parsed = matter(raw)
  const frontmatter = parsed.data

  if (!shouldIndexPage(frontmatter, frontmatterOptions)) {
    return []
  }

  const path = markdownFileToSearchRoutePath(relativeFile, options.landingPage)
  const url = createSearchUrl(base, options.routeBase, path)
  const tokens = markdown.parse(parsed.content, {})
  const firstHeading = tokens.find((token, index) => isHeadingOpenToken(token) && tokens[index + 1])
  const firstHeadingTitle =
    firstHeading !== undefined ? getInlineContent(tokens[tokens.indexOf(firstHeading) + 1]) : ''
  const title =
    getFrontmatterText(frontmatter, frontmatterOptions.titleFields) || firstHeadingTitle || path

  return createRecordsFromTokens(
    {
      base,
      options,
      relativeFile,
      file,
      path,
      url,
      frontmatter,
      title,
      description: getFrontmatterText(frontmatter, frontmatterOptions.descriptionFields),
      tags: getFrontmatterTags(frontmatter, frontmatterOptions.tagFields),
      meta: getFrontmatterMeta(frontmatter, frontmatterOptions.metaFields),
    },
    tokens,
  )
}

/**
 * Discovers Markdown files and converts them into normalized search records.
 */
export async function discoverMarkdownSearchRecords(
  options: MarkdownSearchOptions,
  base?: string,
): Promise<SearchRecord[]> {
  const files = globSync(normalizePatterns(options.include, ['**/*.md']), {
    cwd: options.root,
    ignore: normalizePatterns(options.exclude, []),
  }).sort()

  const records = await Promise.all(
    files.map((file) => createMarkdownPageRecords(options, file, base)),
  )

  return records.flat()
}

/**
 * Creates a search index from configured Markdown sources.
 */
export async function createSearchIndex(
  options: CreateSearchIndexOptions = {},
): Promise<SearchIndex> {
  const markdownOptions = options.markdown
    ? Array.isArray(options.markdown)
      ? options.markdown
      : [options.markdown]
    : []

  const records = await Promise.all(
    markdownOptions.map((markdownOptionsEntry) =>
      discoverMarkdownSearchRecords(markdownOptionsEntry, options.base),
    ),
  )

  const flattenedRecords = records.flat()

  return {
    generatedAt: new Date().toISOString(),
    recordCount: flattenedRecords.length,
    records: flattenedRecords,
  }
}
