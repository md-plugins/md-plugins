import { globSync } from 'tinyglobby'
import type { MarkdownSsgRoutesOptions, SsgRouteInput } from './types'

const markdownExtensionRE = /\.md$/i

function normalizePatterns(patterns: string | string[] | undefined, fallback: string[]): string[] {
  if (patterns === undefined) {
    return fallback
  }

  return Array.isArray(patterns) ? patterns : [patterns]
}

export function markdownFileToRoutePath(
  markdownFile: string,
  { landingPage = 'landing-page.md' }: Pick<MarkdownSsgRoutesOptions, 'landingPage'> = {},
): string {
  const normalizedFile = markdownFile.replace(/\\/g, '/').replace(/^\.\//, '')

  if (normalizedFile === landingPage.replace(/\\/g, '/').replace(/^\.\//, '')) {
    return '/'
  }

  const routeParts = normalizedFile.replace(markdownExtensionRE, '').split('/')
  const lastPart = routeParts.at(-1)
  const parentPart = routeParts.at(-2)

  if (routeParts.length > 1 && lastPart === parentPart) {
    routeParts.pop()
  }

  return `/${routeParts.join('/')}`
}

export function discoverMarkdownSsgRoutes({
  root,
  include,
  exclude,
  landingPage,
}: MarkdownSsgRoutesOptions): SsgRouteInput[] {
  const files = globSync(normalizePatterns(include, ['**/*.md']), {
    cwd: root,
    ignore: normalizePatterns(exclude, []),
  }).sort()

  return files.map((file) => ({
    path: markdownFileToRoutePath(file, { landingPage }),
    meta: {
      source: 'markdown',
      file,
    },
  }))
}
