import type {
  SsgRoute,
  SsgRouteExclusion,
  SsgRouteInput,
  SsgRouteManifest,
  SsgRouteMeta,
  SsgRouteParams,
} from './types'

export const defaultSsgManifestFile = 'q-press-ssg-routes.json'
export const defaultSsgReportFile = 'q-press-ssg-report.json'
export const defaultSsgVirtualModuleId = 'virtual:md-plugins/ssg-routes'

export interface SsgRouterRouteLike {
  path?: string
  children?: SsgRouterRouteLike[]
}

const windowsReservedPathSegmentRE = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i

/**
 * Returns whether a route segment contains a character that cannot be used in
 * a portable output filename.
 */
function hasInvalidPathCharacter(segment: string): boolean {
  return Array.from(segment).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0

    return codePoint <= 31 || '<>:"|?*'.includes(character)
  })
}

/**
 * Ensures a route can be mapped to the same safe output path on every platform.
 */
function assertPortableSsgRoutePath(path: string): void {
  if (path.includes('\\')) {
    throw new Error(`SSG route path cannot contain backslashes: ${path}`)
  }

  for (const segment of path.split('/').filter(Boolean)) {
    if (segment === '.' || segment === '..') {
      throw new Error(`SSG route path cannot contain dot segments: ${path}`)
    }

    if (
      hasInvalidPathCharacter(segment) ||
      segment.endsWith('.') ||
      segment.endsWith(' ') ||
      windowsReservedPathSegmentRE.test(segment)
    ) {
      throw new Error(`SSG route path contains a platform-invalid segment: ${path}`)
    }
  }
}

/**
 * Returns whether a normalized route represents a page rather than a dynamic
 * route or asset-looking file path.
 */
function isNormalizedStaticSsgRoutePath(path: string): boolean {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes(':') &&
    !path.includes('*') &&
    !/\.[a-z0-9]+$/i.test(path)
  )
}

/**
 * Normalizes a Vite base value for use in generated SSG manifests and links.
 */
export function normalizeSsgBase(base = '/'): string {
  const trimmed = base.trim()

  if (trimmed === '' || trimmed === '/') {
    return '/'
  }

  if (trimmed === '.' || trimmed === './') {
    return './'
  }

  if (/^[a-z]+:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, '')
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '')

  return withoutTrailingSlash || '/'
}

/**
 * Normalizes a route path into an absolute path without query, hash, or trailing slash.
 */
export function normalizeSsgRoutePath(path: string): string {
  const trimmed = path.trim()

  if (!trimmed) {
    throw new Error('SSG route path cannot be empty')
  }

  const withoutHash = trimmed.split('#')[0] ?? ''
  const withoutQuery = withoutHash.split('?')[0] ?? ''

  assertPortableSsgRoutePath(withoutQuery)

  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  const compacted = withLeadingSlash.replace(/\/{2,}/g, '/')

  if (compacted === '/') {
    return '/'
  }

  return compacted.replace(/\/+$/, '')
}

/**
 * Checks whether a route path can be emitted as a static HTML file.
 */
export function isStaticSsgRoutePath(path: string): boolean {
  try {
    return isNormalizedStaticSsgRoutePath(normalizeSsgRoutePath(path))
  } catch {
    return false
  }
}

/**
 * Converts a route path to the HTML file emitted for that route.
 */
export function routePathToHtmlFile(routePath: string): string {
  const normalized = normalizeSsgRoutePath(routePath)

  if (!isNormalizedStaticSsgRoutePath(normalized)) {
    throw new Error(`SSG route path must be a static page path: ${normalized}`)
  }

  if (normalized === '/') {
    return 'index.html'
  }

  return `${normalized.slice(1)}/index.html`
}

/**
 * Converts a route path into a stable id for manifest entries and diagnostics.
 */
export function routePathToId(routePath: string): string {
  const normalized = normalizeSsgRoutePath(routePath)

  if (normalized === '/') {
    return 'root'
  }

  return normalized
    .slice(1)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Returns whether a normalized route path matches one of the configured exclusions.
 */
export function isSsgRouteExcluded(path: string, exclude: SsgRouteExclusion[] = []): boolean {
  const normalized = normalizeSsgRoutePath(path)

  return exclude.some((pattern) =>
    typeof pattern === 'string'
      ? normalizeSsgRoutePath(pattern) === normalized
      : pattern.test(normalized),
  )
}

/**
 * Joins parent and child Vue Router paths while respecting absolute child paths.
 */
function joinRoutePaths(parentPath: string, childPath: string): string {
  if (!childPath || childPath === '/') {
    return parentPath || '/'
  }

  if (childPath.startsWith('/')) {
    return childPath
  }

  return `${parentPath.replace(/\/+$/, '')}/${childPath}`
}

/**
 * Flattens Vue Router-style route records into static SSG route paths.
 */
export function flattenStaticSsgRouterRoutes(
  routes: SsgRouterRouteLike[],
  { base = '', exclude = [] }: { base?: string; exclude?: SsgRouteExclusion[] } = {},
): string[] {
  const routePaths: string[] = []

  function visit(route: SsgRouterRouteLike, parentPath: string): void {
    const path = joinRoutePaths(parentPath, route.path ?? '')

    if (isStaticSsgRoutePath(path) && !isSsgRouteExcluded(path, exclude)) {
      routePaths.push(path)
    }

    for (const child of route.children ?? []) {
      visit(child, path)
    }
  }

  for (const route of routes) {
    visit(route, base)
  }

  return Array.from(new Set(routePaths.map(normalizeSsgRoutePath)))
}

/**
 * Converts a string or object route input into a complete manifest route entry.
 */
export function normalizeSsgRoute(input: SsgRouteInput): SsgRoute {
  const route =
    typeof input === 'string'
      ? {
          path: input,
          meta: {},
          params: {},
        }
      : input

  const path = normalizeSsgRoutePath(route.path)
  const meta: SsgRouteMeta = route.meta ?? {}
  const params: SsgRouteParams = route.params ?? {}

  return {
    path,
    htmlFile: routePathToHtmlFile(path),
    id: routePathToId(path),
    meta,
    params,
    ...(Object.hasOwn(route, 'data') ? { data: route.data } : {}),
  }
}

/**
 * Builds and validates an SSG route manifest from route inputs.
 */
export function createSsgRouteManifest(
  routeInputs: SsgRouteInput[],
  { base = '/', exclude = [] }: { base?: string; exclude?: SsgRouteExclusion[] } = {},
): SsgRouteManifest {
  const routes = routeInputs
    .map(normalizeSsgRoute)
    .filter((route) => !isSsgRouteExcluded(route.path, exclude))
  const routePaths = new Set<string>()

  for (const route of routes) {
    if (routePaths.has(route.path)) {
      throw new Error(`Duplicate SSG route path: ${route.path}`)
    }

    routePaths.add(route.path)
  }

  return {
    base: normalizeSsgBase(base),
    routes,
  }
}
