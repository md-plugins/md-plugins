import { prerenderSsgRoutes } from './prerender'
import type {
  PrerenderSsgRoutesResult,
  PrerenderVueSsgRoutesOptions,
  SsgRoute,
  SsgRouteRenderContext,
  SsgRouteRenderer,
  VueSsgAppFactoryResult,
  VueSsgRenderToString,
  VueSsgRouteRendererOptions,
} from './types'

const vueServerRendererPackage = '@vue/server-renderer'

/**
 * Escapes a string for safe use inside a dynamically-created regular expression.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Detects the object shape returned by Vue SSG app factories.
 */
function isVueSsgAppFactoryResult(value: unknown): value is VueSsgAppFactoryResult {
  return typeof value === 'object' && value !== null && 'app' in value
}

/**
 * Lazily loads Vue's server renderer with a helpful install error.
 */
async function loadVueRenderToString(): Promise<VueSsgRenderToString> {
  try {
    const renderer = (await import(vueServerRendererPackage)) as {
      renderToString?: VueSsgRenderToString
    }

    if (typeof renderer.renderToString === 'function') {
      return renderer.renderToString
    }
  } catch (error) {
    throw new Error(
      [
        'Unable to load @vue/server-renderer for SSG rendering.',
        'Install it in the app that calls createVueSsgRouteRenderer(),',
        'or pass a custom renderToString option.',
        error instanceof Error ? `Original error: ${error.message}` : undefined,
      ]
        .filter(Boolean)
        .join(' '),
    )
  }

  throw new Error('@vue/server-renderer did not export renderToString.')
}

/**
 * Replaces the empty app mount element in a built HTML shell with rendered Vue HTML.
 */
function replaceMountElement(appHtml: string, renderedAppHtml: string, appMountId: string): string {
  const mountId = escapeRegExp(appMountId)
  const mountElementRE = new RegExp(
    `<([a-zA-Z][\\w:-]*)([^>]*\\bid=["']${mountId}["'][^>]*)>\\s*</\\1>`,
  )

  if (!mountElementRE.test(appHtml)) {
    throw new Error(`Could not find empty app mount element with id "${appMountId}".`)
  }

  return appHtml.replace(
    mountElementRE,
    (_match, tag: string, attributes: string) => `<${tag}${attributes}>${renderedAppHtml}</${tag}>`,
  )
}

/**
 * Moves the app router to the target SSG route before rendering.
 */
async function pushRouterLocation(
  appResult: VueSsgAppFactoryResult,
  route: SsgRoute,
  context: SsgRouteRenderContext,
  options: VueSsgRouteRendererOptions,
): Promise<void> {
  const router = appResult.router

  if (!router) {
    return
  }

  const location = appResult.routeLocation ?? options.routeLocation?.(route, context) ?? route.path
  const navigate =
    options.useRouterReplace === true
      ? (router.replace ?? router.push)
      : (router.push ?? router.replace)

  if (navigate) {
    await navigate.call(router, location)
  }

  await router.isReady?.()
}

/**
 * Creates a route renderer that turns a fresh Vue/Quasar SSR app into static HTML.
 */
export function createVueSsgRouteRenderer(options: VueSsgRouteRendererOptions): SsgRouteRenderer {
  return async (route, context) => {
    const createdApp = await options.createApp(route, context)
    const appResult = isVueSsgAppFactoryResult(createdApp) ? createdApp : { app: createdApp }

    await pushRouterLocation(appResult, route, context, options)

    const renderToString = options.renderToString ?? (await loadVueRenderToString())
    const renderedAppHtml = await renderToString(appResult.app, appResult.ssrContext)
    const transformedAppHtml =
      (await options.transformRenderedAppHtml?.(renderedAppHtml, route, context)) ?? renderedAppHtml
    const html = options.replaceAppHtml
      ? options.replaceAppHtml(context.appHtml, transformedAppHtml, route, context)
      : replaceMountElement(context.appHtml, transformedAppHtml, options.appMountId ?? 'q-app')

    await appResult.onRendered?.()

    return html
  }
}

/**
 * Prerenders Vite/Quasar routes with a Vue app factory in one call.
 */
export async function prerenderVueSsgRoutes(
  options: PrerenderVueSsgRoutesOptions,
): Promise<PrerenderSsgRoutesResult> {
  const {
    createApp,
    renderToString,
    appMountId,
    routeLocation,
    useRouterReplace,
    transformRenderedAppHtml,
    replaceAppHtml,
    ...prerenderOptions
  } = options

  return prerenderSsgRoutes({
    ...prerenderOptions,
    renderRoute: createVueSsgRouteRenderer({
      createApp,
      renderToString,
      appMountId,
      routeLocation,
      useRouterReplace,
      transformRenderedAppHtml,
      replaceAppHtml,
    }),
  })
}
