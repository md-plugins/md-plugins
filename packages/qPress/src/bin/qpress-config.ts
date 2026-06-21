import { promises as fs } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { QPressCheckOptions } from '../check/qpress-check.js'

export type QPressCheckCliConfig = QPressCheckOptions & {
  failOnWarnings?: boolean
  json?: boolean
  quiet?: boolean
}

export type QPressCliConfig = {
  check?: QPressCheckCliConfig
}

export type LoadQPressCliConfigOptions = {
  configFile?: string
  cwd: string
  loadConfig?: boolean
}

const configFiles = [
  'qpress.config.json',
  'qpress.config.mjs',
  'qpress.config.js',
  'qpress.config.cjs',
  '.qpressrc.json',
]

/**
 * Loads a qpress CLI config file from the project root when one exists.
 */
export async function loadQPressCliConfig({
  configFile,
  cwd,
  loadConfig = true,
}: LoadQPressCliConfigOptions): Promise<QPressCliConfig> {
  if (loadConfig === false) {
    return {}
  }

  const configPath = configFile === undefined ? await findConfigFile(cwd) : resolve(cwd, configFile)

  if (configPath === undefined) {
    return {}
  }

  if (!(await pathExists(configPath))) {
    throw new Error(`Q-Press config file was not found: ${configPath}`)
  }

  const config = await readConfigFile(configPath)

  if (!isRecord(config)) {
    throw new Error(`Q-Press config must export an object: ${configPath}`)
  }

  return config
}

/**
 * Finds the first supported qpress config file in a project root.
 */
async function findConfigFile(cwd: string): Promise<string | undefined> {
  for (const configFile of configFiles) {
    const configPath = resolve(cwd, configFile)

    if (await pathExists(configPath)) {
      return configPath
    }
  }

  return undefined
}

/**
 * Reads JSON or JavaScript qpress config files.
 */
async function readConfigFile(configPath: string): Promise<unknown> {
  if (extname(configPath) === '.json') {
    return JSON.parse(await fs.readFile(configPath, 'utf8')) as unknown
  }

  const module = (await import(pathToFileURL(configPath).href)) as {
    default?: unknown
  }

  return module.default ?? module
}

/**
 * Checks whether a value is a plain object-like record.
 */
function isRecord(value: unknown): value is QPressCliConfig {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Checks whether a filesystem path exists.
 */
async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path)
    return true
  } catch {
    return false
  }
}
