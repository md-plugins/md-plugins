/**
 * Escapes a string for safe use inside a dynamically-created regular expression.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Replaces an empty app mount element with server-rendered HTML.
 *
 * Supports quoted and unquoted IDs, arbitrary attribute order, and custom
 * element names as emitted by production HTML minifiers.
 */
export function replaceSsgMountElement(
  appHtml: string,
  renderedAppHtml: string,
  appMountId: string,
): string {
  const mountId = escapeRegExp(appMountId)
  const idValue = `(?:["']${mountId}["']|${mountId}(?=[\\s/>]))`
  const mountElementRE = new RegExp(
    `<([a-zA-Z][\\w:-]*)([^>]*?\\s+id\\s*=\\s*${idValue}[^>]*)>\\s*</\\1\\s*>`,
    'i',
  )

  if (!mountElementRE.test(appHtml)) {
    throw new Error(`Could not find empty app mount element with id "${appMountId}".`)
  }

  return appHtml.replace(
    mountElementRE,
    (_match, tag: string, attributes: string) => `<${tag}${attributes}>${renderedAppHtml}</${tag}>`,
  )
}
