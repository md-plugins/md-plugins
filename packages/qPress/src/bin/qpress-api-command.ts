import {
  checkQPressApi,
  generateQPressApi,
  type QPressApiGenerateEntry,
  type QPressApiGenerateOptions,
} from '../api/qpress-api.js'
import { loadQPressCliConfig, type QPressApiCliConfig } from './qpress-config.js'

type ApiCliOptions = {
  config?: string
  docsUrl?: string
  generatedSuffix?: string
  group?: QPressApiGenerateEntry['group']
  help?: boolean
  input?: string
  json?: boolean
  noConfig?: boolean
  output?: string
  quiet?: boolean
  root?: string
  type?: string
}

/**
 * Prints qpress api command usage information.
 */
export function printQPressApiHelp(commandName = 'qpress api'): void {
  process.stdout.write(`${commandName}

Generate or check Q-Press API JSON from TypeScript exports and JSDoc.

Usage:
  ${commandName} <generate|check> [options]

Commands:
  generate   Write generated review files next to configured API JSON files.
  check      Compare generated API JSON with committed API JSON without writing files.

Options:
  --root <dir>              Project root. Defaults to the current directory.
  --config <file>           Config file relative to root. Defaults to qpress.config.*.
  --no-config               Skip loading qpress config.
  --input <file>            TypeScript source file for a one-off API entry.
  --output <file>           Existing API JSON path for a one-off API entry.
  --type <name>             API JSON type for a one-off API entry.
  --group <name>            API group for a one-off API entry: functions or methods.
  --docs-url <url>          Documentation URL for a one-off API entry.
  --generated-suffix <text> Generated comparison suffix. Defaults to .generated.
  --json                    Print machine-readable JSON.
  --quiet                   Hide success output.
  -h, --help                Show this help.

By default, generate writes files such as Component.generated.json so you can
review output before publishing it.
`)
}

/**
 * Runs qpress api and returns the intended process exit code.
 */
export async function runQPressApiCli(args: string[]): Promise<number> {
  const [command, ...commandArgs] = args

  if (command === undefined || command === '-h' || command === '--help') {
    printQPressApiHelp()
    return 0
  }

  if (command !== 'generate' && command !== 'check') {
    throw new Error(`Unknown qpress api command: ${command}`)
  }

  const cliOptions = parseApiArgs(commandArgs)

  if (cliOptions.help === true) {
    printQPressApiHelp(`qpress api ${command}`)
    return 0
  }

  const cwd = cliOptions.root ?? process.cwd()
  const config = await loadQPressCliConfig({
    configFile: cliOptions.config,
    cwd,
    loadConfig: cliOptions.noConfig !== true,
  })
  const options = resolveApiOptions(config.api, cliOptions, cwd)

  if (command === 'generate') {
    const result = await generateQPressApi(options)

    if (cliOptions.json === true) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    } else if (cliOptions.quiet !== true) {
      process.stdout.write(formatGenerateResult(result.entries))
    }

    return 0
  }

  const result = await checkQPressApi(options)

  if (cliOptions.json === true) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  } else if (cliOptions.quiet !== true || result.diagnostics.length > 0) {
    process.stdout.write(formatCheckResult(result.diagnostics))
  }

  return result.diagnostics.length === 0 ? 0 : 1
}

function parseApiArgs(args: string[]): ApiCliOptions {
  const options: ApiCliOptions = {}

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true
        break
      case '--root':
        options.root = readValue(args, index, arg)
        index += 1
        break
      case '--config':
        options.config = readValue(args, index, arg)
        index += 1
        break
      case '--no-config':
        options.noConfig = true
        break
      case '--input':
        options.input = readValue(args, index, arg)
        index += 1
        break
      case '--output':
        options.output = readValue(args, index, arg)
        index += 1
        break
      case '--type':
        options.type = readValue(args, index, arg)
        index += 1
        break
      case '--group':
        options.group = readApiGroup(readValue(args, index, arg))
        index += 1
        break
      case '--docs-url':
        options.docsUrl = readValue(args, index, arg)
        index += 1
        break
      case '--generated-suffix':
        options.generatedSuffix = readValue(args, index, arg)
        index += 1
        break
      case '--json':
        options.json = true
        break
      case '--quiet':
        options.quiet = true
        break
      default:
        throw new Error(`Unknown qpress api option: ${arg}`)
    }
  }

  return options
}

function resolveApiOptions(
  configOptions: QPressApiCliConfig | undefined,
  cliOptions: ApiCliOptions,
  cwd: string,
): QPressApiGenerateOptions {
  const cliEntry = createCliEntry(cliOptions)
  const entries = [...(configOptions?.entries ?? []), ...(cliEntry === undefined ? [] : [cliEntry])]
  const generatedSuffix = cliOptions.generatedSuffix ?? configOptions?.generatedSuffix

  if (entries.length === 0) {
    throw new Error(
      'No qpress api entries configured. Add api.entries or pass --input and --output.',
    )
  }

  return {
    cwd,
    entries,
    generatedSuffix,
  }
}

function createCliEntry(options: ApiCliOptions): QPressApiGenerateEntry | undefined {
  if (options.input === undefined && options.output === undefined) {
    return undefined
  }

  if (options.input === undefined || options.output === undefined) {
    throw new Error('Both --input and --output are required for a one-off qpress api entry.')
  }

  return {
    docsUrl: options.docsUrl,
    group: options.group,
    input: options.input,
    output: options.output,
    type: options.type,
  }
}

function readApiGroup(value: string): QPressApiGenerateEntry['group'] {
  if (value !== 'functions' && value !== 'methods') {
    throw new Error('--group must be "functions" or "methods".')
  }

  return value
}

/**
 * Reads the value that follows a CLI flag.
 */
function readValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1]

  if (!value || value.startsWith('-')) {
    throw new Error(`Missing value for ${flag}.`)
  }

  return value
}

function formatGenerateResult(entries: Awaited<ReturnType<typeof generateQPressApi>>['entries']) {
  const lines = ['Q-Press API generated review files:\n']

  for (const entry of entries) {
    const drift =
      entry.differsFromOutput === null
        ? 'missing committed output'
        : entry.differsFromOutput
          ? 'differs from committed output'
          : 'matches committed output'

    lines.push(`- ${entry.generatedOutputPath} (${entry.exportCount} exports, ${drift})`)

    if (entry.fieldChanges.length > 0) {
      lines.push(`  Field changes: ${formatFieldChangeSummary(entry.fieldChanges)}`)
    }
  }

  return `${lines.join('\n')}\n`
}

function formatCheckResult(
  diagnostics: Awaited<ReturnType<typeof checkQPressApi>>['diagnostics'],
): string {
  if (diagnostics.length === 0) {
    return 'Q-Press API check passed.\n'
  }

  const lines = ['Q-Press API check failed:\n']

  for (const diagnostic of diagnostics) {
    if (diagnostic.code === 'api-output-missing') {
      lines.push(`- Missing API JSON: ${diagnostic.outputPath}`)
    } else {
      lines.push(`- Stale API JSON: ${diagnostic.outputPath}`)
    }
    lines.push(`  Source: ${diagnostic.inputPath}`)
    lines.push(`  Compare with: ${diagnostic.generatedOutputPath}`)

    if (diagnostic.fieldChanges.length > 0) {
      lines.push(`  Field changes: ${formatFieldChangeSummary(diagnostic.fieldChanges)}`)
      diagnostic.fieldChanges.slice(0, 10).forEach((change) => {
        lines.push(`    - ${change.type}: ${change.path}`)
      })

      if (diagnostic.fieldChanges.length > 10) {
        lines.push(`    - ...and ${diagnostic.fieldChanges.length - 10} more`)
      }
    }
  }

  return `${lines.join('\n')}\n`
}

function formatFieldChangeSummary(
  changes: Awaited<ReturnType<typeof checkQPressApi>>['diagnostics'][number]['fieldChanges'],
): string {
  const summary = changes.reduce(
    (acc, change) => {
      acc[change.type] += 1

      return acc
    },
    {
      added: 0,
      changed: 0,
      removed: 0,
    },
  )

  return `${summary.added} generated-only, ${summary.changed} changed, ${summary.removed} current-only`
}
