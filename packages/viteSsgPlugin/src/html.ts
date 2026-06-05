import type { SsgRoute, SsgRouteHtmlOptions, SsgRouteRenderContext } from './types'

export function escapeJsonForHtml(json: string): string {
  return json
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function createSsgRoutePayloadScript(route: SsgRoute): string {
  const payload = escapeJsonForHtml(JSON.stringify(route))

  return `<script type="application/json" id="md-plugins-ssg-route">${payload}</script>`
}

export function injectSsgRoutePayload(html: string, route: SsgRoute): string {
  const script = createSsgRoutePayloadScript(route)

  if (html.includes('id="md-plugins-ssg-route"')) {
    return html
  }

  if (html.includes('</head>')) {
    return html.replace('</head>', `${script}\n</head>`)
  }

  return `${script}\n${html}`
}

export function createSsgRouteHtml(
  route: SsgRoute,
  context: SsgRouteRenderContext,
  { injectRoutePayload = true }: { injectRoutePayload?: boolean } = {},
): string {
  if (injectRoutePayload === false) {
    return context.appHtml
  }

  return injectSsgRoutePayload(context.appHtml, route)
}

export async function renderSsgRouteHtml(
  route: SsgRoute,
  context: SsgRouteRenderContext,
  options: SsgRouteHtmlOptions = {},
): Promise<string> {
  const renderedHtml = await options.renderRoute?.(route, context)
  const routeHtml =
    renderedHtml ??
    createSsgRouteHtml(route, context, {
      injectRoutePayload: options.injectRoutePayload,
    })
  const html =
    renderedHtml && options.injectRoutePayload !== false
      ? injectSsgRoutePayload(routeHtml, route)
      : routeHtml

  return (await options.transformHtml?.(html, route, context)) ?? html
}
