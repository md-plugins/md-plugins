import { promises as fs } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { QPressApiGenerateEntry, QPressApiEntryGroup } from '../api/qpress-api.js'
import type { QPressCheckOptions } from '../check/qpress-check.js'

export type QPressApiCliConfig = {
  entries?: QPressApiGenerateEntry[]
  generatedSuffix?: string
}

export type QPressCheckCliConfig = QPressCheckOptions & {
  failOnWarnings?: boolean
  json?: boolean
  quiet?: boolean
}

export type QPressSiteCliConfig = {
  publicUrl?: string
}

export type QPressCliConfig = {
  api?: QPressApiCliConfig
  check?: QPressCheckCliConfig
  site?: QPressSiteCliConfig
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

const topLevelConfigKeys = new Set(['api', 'check', 'site'])
const stringApiKeys = new Set(['generatedSuffix'])
const apiConfigKeys = new Set(['entries', ...stringApiKeys])
const stringApiEntryKeys = new Set(['docsUrl', 'generatedSuffix', 'input', 'output', 'type'])
const apiEntryKeys = new Set([...stringApiEntryKeys, 'group'])
const stringSiteKeys = new Set(['publicUrl'])
const siteConfigKeys = new Set(stringSiteKeys)
const apiEntryGroups = new Set<QPressApiEntryGroup>(['functions', 'methods'])
const stringCheckKeys = new Set([
  'apiDir',
  'cwd',
  'examplesDir',
  'landingPage',
  'markdownDir',
  'siteConfigDir',
  'srcDir',
])
const booleanCheckKeys = new Set([
  'checkGeneratedApi',
  'checkNavigation',
  'checkSsgUnsafe',
  'checkUnreachable',
  'failOnWarnings',
  'json',
  'quiet',
])
const stringArrayCheckKeys = new Set(['allowedRoutes', 'ignoreFiles'])
const checkConfigKeys = new Set([...stringCheckKeys, ...booleanCheckKeys, ...stringArrayCheckKeys])

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

  validateQPressCliConfig(config, configPath)

  return config as QPressCliConfig
}

/**
 * Validates qpress config shape and supported option value types.
 */
function validateQPressCliConfig(config: Record<string, unknown>, configPath: string): void {
  validateKnownKeys(config, topLevelConfigKeys, configPath, 'config')
  validateApiConfig(config, configPath)
  validateCheckConfig(config, configPath)
  validateSiteConfig(config, configPath)
}

/**
 * Validates qpress API generator config.
 */
function validateApiConfig(config: Record<string, unknown>, configPath: string): void {
  if (config.api === undefined) {
    return
  }

  if (!isRecord(config.api)) {
    throw new Error(`Q-Press config "api" must be an object: ${configPath}`)
  }

  validateKnownKeys(config.api, apiConfigKeys, configPath, 'api')

  for (const [key, value] of Object.entries(config.api)) {
    if (stringApiKeys.has(key)) {
      validateString(value, configPath, `api.${key}`)
      continue
    }

    if (key === 'entries') {
      validateApiEntries(value, configPath)
    }
  }
}

/**
 * Validates qpress check config.
 */
function validateCheckConfig(config: Record<string, unknown>, configPath: string): void {
  if (config.check === undefined) {
    return
  }

  if (!isRecord(config.check)) {
    throw new Error(`Q-Press config "check" must be an object: ${configPath}`)
  }

  validateKnownKeys(config.check, checkConfigKeys, configPath, 'check')

  for (const [key, value] of Object.entries(config.check)) {
    if (stringCheckKeys.has(key)) {
      validateString(value, configPath, `check.${key}`)
      continue
    }

    if (booleanCheckKeys.has(key)) {
      validateBoolean(value, configPath, `check.${key}`)
      continue
    }

    if (stringArrayCheckKeys.has(key)) {
      validateStringArray(value, configPath, `check.${key}`)
    }
  }
}

/**
 * Validates publication-facing site config used by Q-Press CLI tools.
 */
function validateSiteConfig(config: Record<string, unknown>, configPath: string): void {
  if (config.site === undefined) {
    return
  }

  if (!isRecord(config.site)) {
    throw new Error(`Q-Press config "site" must be an object: ${configPath}`)
  }

  validateKnownKeys(config.site, siteConfigKeys, configPath, 'site')

  for (const [key, value] of Object.entries(config.site)) {
    if (stringSiteKeys.has(key)) {
      validateString(value, configPath, `site.${key}`)
    }
  }
}

/**
 * Validates API generator entries.
 */
function validateApiEntries(value: unknown, configPath: string): void {
  if (!Array.isArray(value)) {
    throw new Error(`Q-Press config "api.entries" must be an array: ${configPath}`)
  }

  value.forEach((entry, index) => {
    const entryPath = `api.entries[${index}]`

    if (!isRecord(entry)) {
      throw new Error(`Q-Press config "${entryPath}" must be an object: ${configPath}`)
    }

    validateKnownKeys(entry, apiEntryKeys, configPath, entryPath)

    for (const [key, entryValue] of Object.entries(entry)) {
      if (stringApiEntryKeys.has(key)) {
        validateString(entryValue, configPath, `${entryPath}.${key}`)
        continue
      }

      if (key === 'group') {
        validateApiEntryGroup(entryValue, configPath, `${entryPath}.group`)
      }
    }

    if (entry.input === undefined) {
      throw new Error(`Q-Press config "${entryPath}.input" is required: ${configPath}`)
    }

    if (entry.output === undefined) {
      throw new Error(`Q-Press config "${entryPath}.output" is required: ${configPath}`)
    }
  })
}

/**
 * Validates an API generator target group.
 */
function validateApiEntryGroup(value: unknown, configPath: string, path: string): void {
  if (typeof value !== 'string' || !apiEntryGroups.has(value as QPressApiEntryGroup)) {
    throw new Error(`Q-Press config "${path}" must be "functions" or "methods": ${configPath}`)
  }
}

/**
 * Reports unknown config keys so typos do not silently change checker behavior.
 */
function validateKnownKeys(
  value: Record<string, unknown>,
  knownKeys: Set<string>,
  configPath: string,
  path: string,
): void {
  for (const key of Object.keys(value)) {
    if (!knownKeys.has(key)) {
      throw new Error(`Unknown Q-Press config key "${path}.${key}" in ${configPath}`)
    }
  }
}

/**
 * Validates a string config value.
 */
function validateString(value: unknown, configPath: string, path: string): void {
  if (typeof value !== 'string') {
    throw new Error(`Q-Press config "${path}" must be a string: ${configPath}`)
  }
}

/**
 * Validates a boolean config value.
 */
function validateBoolean(value: unknown, configPath: string, path: string): void {
  if (typeof value !== 'boolean') {
    throw new Error(`Q-Press config "${path}" must be a boolean: ${configPath}`)
  }
}

/**
 * Validates a string-array config value.
 */
function validateStringArray(value: unknown, configPath: string, path: string): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`Q-Press config "${path}" must be an array of strings: ${configPath}`)
  }
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
function isRecord(value: unknown): value is Record<string, unknown> {
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
