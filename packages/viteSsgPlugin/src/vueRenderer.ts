import { prerenderSsgRoutes } from './prerender'
import { injectSsgTeleports, replaceSsgMountElement } from './htmlShell'
import type {
  PrerenderSsgRoutesResult,
  PrerenderVueSsgRoutesOptions,
  SsgRoute,
  SsgRouteRenderContext,
  SsgRouteRenderer,
  VueSsgAppFactoryResult,
  VueSsgRenderToString,
  VueSsgRouteRendererOptions,
  VueSsgSsrContext,
} from './types'

const vueServerRendererPackage = '@vue/server-renderer'

/**
 * Detects the object shape returned by Vue SSG app factories.
 */
function isVueSsgAppFactoryResult(value: unknown): value is VueSsgAppFactoryResult {
  return typeof value === 'object' && value !== null && 'app' in value
}

/**
 * Resolves an observable SSR context for Vue Teleport output.
 */
function resolveSsrContext(appResult: VueSsgAppFactoryResult): VueSsgSsrContext {
  if (appResult.ssrContext === undefined) {
    return {}
  }

  if (
    typeof appResult.ssrContext !== 'object' ||
    appResult.ssrContext === null ||
    Array.isArray(appResult.ssrContext)
  ) {
    throw new Error('Vue SSG app factory ssrContext must be an object when provided.')
  }

  return appResult.ssrContext
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
 * Runs app and framework SSR callbacks after Vue has rendered the route.
 */
async function runRenderedCallbacks(
  appResult: VueSsgAppFactoryResult,
  ssrContext: VueSsgSsrContext,
): Promise<void> {
  await appResult.onRendered?.()

  const rendered = ssrContext.rendered

  if (typeof rendered === 'function') {
    await rendered.call(ssrContext)
  }
}

/**
 * Creates a route renderer that turns a fresh Vue/Quasar SSR app into static HTML.
 */
export function createVueSsgRouteRenderer(options: VueSsgRouteRendererOptions): SsgRouteRenderer {
  return async (route, context) => {
    const createdApp = await options.createApp(route, context)
    const appResult = isVueSsgAppFactoryResult(createdApp) ? createdApp : { app: createdApp }
    const ssrContext = resolveSsrContext(appResult)

    await pushRouterLocation(appResult, route, context, options)

    const renderToString = options.renderToString ?? (await loadVueRenderToString())
    const renderedAppHtml = await renderToString(appResult.app, ssrContext)

    await runRenderedCallbacks(appResult, ssrContext)

    const transformedAppHtml =
      (await options.transformRenderedAppHtml?.(renderedAppHtml, route, context)) ?? renderedAppHtml
    const appResultWithSsrContext =
      appResult.ssrContext === ssrContext ? appResult : { ...appResult, ssrContext }
    const htmlWithApp = options.replaceAppHtml
      ? await options.replaceAppHtml(
          context.appHtml,
          transformedAppHtml,
          route,
          context,
          appResultWithSsrContext,
        )
      : replaceSsgMountElement(context.appHtml, transformedAppHtml, options.appMountId ?? 'q-app')

    return injectSsgTeleports(htmlWithApp, ssrContext.teleports)
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
