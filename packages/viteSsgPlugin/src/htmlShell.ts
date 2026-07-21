/**
 * Escapes a string for safe use inside a dynamically-created regular expression.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Creates a matcher for an empty element with the requested id.
 */
function createEmptyElementByIdRE(id: string): RegExp {
  const escapedId = escapeRegExp(id)
  const idValue = `(?:["']${escapedId}["']|${escapedId}(?=[\\s/>]))`

  return new RegExp(`<([a-zA-Z][\\w:-]*)([^>]*?\\s+id\\s*=\\s*${idValue}[^>]*)>\\s*</\\1\\s*>`, 'i')
}

/**
 * Extracts an unescaped simple id from a Vue Teleport target selector.
 */
function getTeleportTargetId(target: string): string {
  const match = /^#([a-zA-Z_][\w-]*)$/.exec(target)

  if (!match) {
    throw new Error(
      `Unsupported Vue SSR Teleport target "${target}". ` +
        'Use a simple #id selector and a dedicated empty target element in the app shell.',
    )
  }

  return match[1]
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
  const mountElementRE = createEmptyElementByIdRE(appMountId)

  if (!mountElementRE.test(appHtml)) {
    throw new Error(`Could not find empty app mount element with id "${appMountId}".`)
  }

  return appHtml.replace(
    mountElementRE,
    (_match, tag: string, attributes: string) => `<${tag}${attributes}>${renderedAppHtml}</${tag}>`,
  )
}

/**
 * Injects Vue SSR Teleport fragments into dedicated empty shell elements.
 *
 * Vue records Teleports by their target selector. Static HTML generation cannot
 * query a live DOM, so targets are intentionally limited to unambiguous simple
 * id selectors such as `#modals`.
 */
export function injectSsgTeleports(
  appHtml: string,
  teleports: Record<string, string> | undefined,
): string {
  if (teleports === undefined) {
    return appHtml
  }

  if (typeof teleports !== 'object' || teleports === null || Array.isArray(teleports)) {
    throw new Error('Vue SSR context teleports must be a record of target selectors and HTML.')
  }

  let html = appHtml

  for (const [target, teleportHtml] of Object.entries(teleports)) {
    if (typeof teleportHtml !== 'string') {
      throw new Error(`Vue SSR Teleport content for target "${target}" must be a string.`)
    }

    const targetId = getTeleportTargetId(target)
    const targetElementRE = createEmptyElementByIdRE(targetId)

    if (!targetElementRE.test(html)) {
      throw new Error(
        `Could not find an empty Vue SSR Teleport target for "${target}" in the app shell.`,
      )
    }

    html = html.replace(
      targetElementRE,
      (_match, tag: string, attributes: string) => `<${tag}${attributes}>${teleportHtml}</${tag}>`,
    )
  }

  return html
}
