export type MaybePromise<T> = T | Promise<T>

export type JsonPrimitive = string | number | boolean | null

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export type SsgRouteParams = Record<string, JsonPrimitive | undefined>

export type SsgRouteMeta = Record<string, JsonValue | undefined>

export interface SsgRouteObject {
  path: string
  meta?: SsgRouteMeta
  params?: SsgRouteParams
  data?: JsonValue
}

export type SsgRouteInput = string | SsgRouteObject

export interface SsgRoute {
  path: string
  htmlFile: string
  id: string
  meta: SsgRouteMeta
  params: SsgRouteParams
  data?: JsonValue
}

export interface SsgRouteManifest {
  base: string
  routes: SsgRoute[]
}

export type SsgRouteSource = SsgRouteInput[] | (() => MaybePromise<SsgRouteInput[]>)

export interface ViteSsgPluginOptions {
  /**
   * Enables manifest emission. The virtual module remains available either way.
   */
  enabled?: boolean

  /**
   * Static route declarations or a function that resolves them.
   */
  routes?: SsgRouteSource

  /**
   * Base path used by the generated route manifest.
   * Falls back to Vite's resolved base.
   */
  base?: string

  /**
   * Build asset path for the generated route manifest.
   */
  manifestFile?: string

  /**
   * Virtual module id used to import the generated route manifest.
   */
  virtualModuleId?: string
}
