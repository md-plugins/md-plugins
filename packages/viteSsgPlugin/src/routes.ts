import type {
  SsgRoute,
  SsgRouteInput,
  SsgRouteManifest,
  SsgRouteMeta,
  SsgRouteParams,
} from './types'

export const defaultSsgManifestFile = 'q-press-ssg-routes.json'
export const defaultSsgVirtualModuleId = 'virtual:md-plugins/ssg-routes'

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

export function normalizeSsgRoutePath(path: string): string {
  const trimmed = path.trim()

  if (!trimmed) {
    throw new Error('SSG route path cannot be empty')
  }

  const withoutHash = trimmed.split('#')[0] ?? ''
  const withoutQuery = withoutHash.split('?')[0] ?? ''
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
  const compacted = withLeadingSlash.replace(/\/{2,}/g, '/')

  if (compacted === '/') {
    return '/'
  }

  return compacted.replace(/\/+$/, '')
}

export function routePathToHtmlFile(routePath: string): string {
  const normalized = normalizeSsgRoutePath(routePath)

  if (normalized === '/') {
    return 'index.html'
  }

  return `${normalized.slice(1)}/index.html`
}

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

export function createSsgRouteManifest(
  routeInputs: SsgRouteInput[],
  { base = '/' }: { base?: string } = {},
): SsgRouteManifest {
  const routes = routeInputs.map(normalizeSsgRoute)
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
