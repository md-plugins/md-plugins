/**
 * Resolves plugin options from either a direct options object or a nested
 * package-level options bag.
 *
 * Markdown plugins can be configured directly through `md.use(plugin, options)`
 * or through a shared md-plugins config object keyed by plugin name. This helper
 * supports both shapes while applying default values.
 */
export function resolvePluginOptions<T extends object, K extends keyof any>(
  options: T | { [key in K]?: T } | undefined,
  key: K,
  defaults: T,
): T {
  if (options && typeof options === 'object' && key in options) {
    return { ...defaults, ...(options as { [key in K]?: T })[key] }
  }
  return { ...defaults, ...options } as T
}
