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
