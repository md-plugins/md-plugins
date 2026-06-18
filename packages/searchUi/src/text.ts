const whitespaceRE = /\s+/g
const htmlTagRE = /<[^>]+>/g
const markdownImageRE = /!\[([^\]]*)\]\([^)]*\)/g
const markdownLinkRE = /\[([^\]]+)\]\([^)]*\)/g
const markdownReferenceLinkRE = /\[([^\]]+)\]\[[^\]]*\]/g
const markdownInlineCodeRE = /`([^`]+)`/g
const markdownStrongRE = /(\*\*|__)(.*?)\1/g
const markdownEmphasisRE = /(\*|_)(.*?)\1/g
const markdownStrikeRE = /~~(.*?)~~/g
const markdownHeadingMarkerRE = /^#{1,6}\s+/gm
const markdownBlockquoteMarkerRE = /^>\s?/gm
const markdownListMarkerRE = /^\s*(?:[-*+]|\d+\.)\s+/gm
const markdownReferenceDefinitionRE = /^\[[^\]]+\]:\s+\S+.*$/gm
const spaceBeforePunctuationRE = /\s+([,.;:!?])/g

function stripMarkdownSyntax(value: string): string {
  return value
    .replace(markdownReferenceDefinitionRE, ' ')
    .replace(markdownImageRE, '$1')
    .replace(markdownLinkRE, '$1')
    .replace(markdownReferenceLinkRE, '$1')
    .replace(markdownInlineCodeRE, '$1')
    .replace(markdownStrongRE, '$2')
    .replace(markdownEmphasisRE, '$2')
    .replace(markdownStrikeRE, '$1')
    .replace(markdownHeadingMarkerRE, ' ')
    .replace(markdownBlockquoteMarkerRE, ' ')
    .replace(markdownListMarkerRE, ' ')
    .replace(htmlTagRE, ' ')
    .replaceAll('|', ' ')
    .replace(spaceBeforePunctuationRE, '$1')
}

export function normalizeSearchQuery(value: string): string {
  return value.toLocaleLowerCase().replace(whitespaceRE, ' ').trim()
}

export function createSearchTerms(query: string): string[] {
  return Array.from(new Set(normalizeSearchQuery(query).split(' ').filter(Boolean)))
}

export function normalizeSearchableText(value: unknown): string {
  return stripMarkdownSyntax(String(value ?? ''))
    .toLocaleLowerCase()
    .replace(whitespaceRE, ' ')
    .trim()
}

export function createSearchSnippet(content: string, terms: string[], length = 140): string {
  const normalizedContent = stripMarkdownSyntax(content).replace(whitespaceRE, ' ').trim()

  if (normalizedContent.length <= length) {
    return normalizedContent
  }

  const lowerContent = normalizedContent.toLocaleLowerCase()
  const firstMatch = terms
    .map((term) => lowerContent.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0]

  if (firstMatch === undefined) {
    return `${normalizedContent.slice(0, length - 1).trim()}…`
  }

  const start = Math.max(firstMatch - Math.floor(length / 3), 0)
  const end = Math.min(start + length, normalizedContent.length)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < normalizedContent.length ? '…' : ''

  return `${prefix}${normalizedContent.slice(start, end).trim()}${suffix}`
}
