import type { SsgRoute, SsgRouteHtmlOptions, SsgRouteRenderContext } from './types'

const ssgRoutePayloadId = 'md-plugins-ssg-route'
const scriptElementRE = /<script\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>[\s\S]*?<\/script\s*>/gi
const htmlAttributeRE =
  /(?:^|\s+)([^\s"'=<>`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

/**
 * Reads one HTML attribute without mistaking text inside another quoted value for an attribute.
 */
function getHtmlAttributeValue(attributes: string, name: string): string | undefined {
  htmlAttributeRE.lastIndex = 0

  for (const match of attributes.matchAll(htmlAttributeRE)) {
    if (match[1].toLowerCase() === name) {
      return match[2] ?? match[3] ?? match[4]
    }
  }

  return undefined
}

/**
 * Escapes JSON so it can be embedded safely inside an HTML `<script>` tag.
 */
export function escapeJsonForHtml(json: string): string {
  return json
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/**
 * Serializes an SSG route into the route payload script consumed during hydration.
 */
export function createSsgRoutePayloadScript(route: SsgRoute): string {
  const payload = escapeJsonForHtml(JSON.stringify(route))

  return `<script type="application/json" id="${ssgRoutePayloadId}">${payload}</script>`
}

/**
 * Injects the current route payload, replacing any stale copies without creating duplicates.
 */
export function injectSsgRoutePayload(html: string, route: SsgRoute): string {
  const script = createSsgRoutePayloadScript(route)
  let replacedPayload = false
  const htmlWithCurrentPayload = html.replace(scriptElementRE, (element, attributes: string) => {
    if (getHtmlAttributeValue(attributes, 'id') !== ssgRoutePayloadId) {
      return element
    }

    if (replacedPayload) {
      return ''
    }

    replacedPayload = true
    return script
  })

  if (replacedPayload) {
    return htmlWithCurrentPayload
  }

  if (html.includes('</head>')) {
    return html.replace('</head>', `${script}\n</head>`)
  }

  return `${script}\n${html}`
}

/**
 * Creates the default per-route HTML shell for a static SSG route.
 */
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

/**
 * Renders one SSG route, optionally delegating to a framework renderer and HTML transform.
 */
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
