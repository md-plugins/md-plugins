/**
 * Escapes a string for safe interpolation into a generated RegExp.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Replaces the empty Quasar app mount element with server-rendered app HTML.
 */
export function replaceQPressMountElement(
  appHtml: string,
  renderedAppHtml: string,
  appMountId: string,
): string {
  const mountId = escapeRegExp(appMountId)
  const mountElementRE = new RegExp(
    `<([a-zA-Z][\\w:-]*)([^>]*\\bid=["']?${mountId}["']?[^>]*)>\\s*</\\1>`,
  )

  if (!mountElementRE.test(appHtml)) {
    throw new Error(`Could not find empty app mount element with id "${appMountId}".`)
  }

  return appHtml.replace(
    mountElementRE,
    (_match, tag: string, attributes: string) => `<${tag}${attributes}>${renderedAppHtml}</${tag}>`,
  )
}
