#!/usr/bin/env node

import {
  checkQPressProject,
  formatQPressCheckResult,
  type QPressCheckOptions,
} from '../check/qpress-check.js'
import { runQPressSsgCli } from './qpress-ssg-command.js'

type CheckCliOptions = QPressCheckOptions & {
  failOnWarnings?: boolean
  help?: boolean
  json?: boolean
  quiet?: boolean
}

/**
 * Prints top-level qpress command usage information.
 */
function printHelp(): void {
  process.stdout.write(`qpress

Q-Press project tooling.

Usage:
  qpress <command> [options]

Commands:
  check   Validate Q-Press Markdown routes, examples, API JSON, and SSG-risky examples.
  ssg     Prerender Q-Press routes into static HTML.

Options:
  -h, --help   Show this help.
`)
}

/**
 * Prints qpress check command usage information.
 */
function printCheckHelp(): void {
  process.stdout.write(`qpress check

Validate a Q-Press documentation project before build or release.

Usage:
  qpress check [options]

Options:
  --root <dir>          Project root. Defaults to the current directory.
  --src-dir <dir>       App source directory. Defaults to src.
  --markdown-dir <dir>  Markdown directory inside src-dir. Defaults to markdown.
  --examples-dir <dir>  Examples directory inside src-dir. Defaults to examples.
  --api-dir <dir>       API JSON directory inside src-dir. Defaults to .q-press/api.
  --site-config-dir <dir>
                       siteConfig directory inside src-dir. Defaults to siteConfig.
  --landing-page <file> Landing page Markdown filename. Defaults to landing-page.md.
  --ignore-file <glob>  Ignore a Markdown file path. Can be repeated.
  --allow-route <route> Treat a custom non-Markdown route as valid. Can be repeated.
  --no-navigation       Skip siteConfig navigation route checks.
  --check-unreachable   Warn when Markdown routes are not referenced by siteConfig navigation.
  --no-ssg-unsafe       Skip browser-global SSG-safety warnings for example files.
  --fail-on-warnings    Exit with code 1 when warnings are found.
  --json                Print machine-readable JSON.
  --quiet               Hide success output.
  -h, --help            Show this help.
`)
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

/**
 * Parses qpress check CLI arguments.
 */
function parseCheckArgs(args: string[]): CheckCliOptions {
  const options: CheckCliOptions = {}

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true
        break
      case '--root':
        options.cwd = readValue(args, index, arg)
        index += 1
        break
      case '--src-dir':
        options.srcDir = readValue(args, index, arg)
        index += 1
        break
      case '--markdown-dir':
        options.markdownDir = readValue(args, index, arg)
        index += 1
        break
      case '--examples-dir':
        options.examplesDir = readValue(args, index, arg)
        index += 1
        break
      case '--api-dir':
        options.apiDir = readValue(args, index, arg)
        index += 1
        break
      case '--site-config-dir':
        options.siteConfigDir = readValue(args, index, arg)
        index += 1
        break
      case '--landing-page':
        options.landingPage = readValue(args, index, arg)
        index += 1
        break
      case '--ignore-file':
        options.ignoreFiles ??= []
        options.ignoreFiles.push(readValue(args, index, arg))
        index += 1
        break
      case '--allow-route':
        options.allowedRoutes ??= []
        options.allowedRoutes.push(readValue(args, index, arg))
        index += 1
        break
      case '--no-navigation':
        options.checkNavigation = false
        break
      case '--check-unreachable':
        options.checkUnreachable = true
        break
      case '--no-ssg-unsafe':
        options.checkSsgUnsafe = false
        break
      case '--fail-on-warnings':
        options.failOnWarnings = true
        break
      case '--json':
        options.json = true
        break
      case '--quiet':
        options.quiet = true
        break
      default:
        throw new Error(`Unknown qpress check option: ${arg}`)
    }
  }

  return options
}

/**
 * Runs qpress check and returns the intended process exit code.
 */
async function runCheck(args: string[]): Promise<number> {
  const options = parseCheckArgs(args)

  if (options.help === true) {
    printCheckHelp()
    return 0
  }

  const result = await checkQPressProject(options)

  if (options.json === true) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  } else if (options.quiet !== true || result.diagnostics.length > 0) {
    process.stdout.write(formatQPressCheckResult(result))
  }

  return result.errors.length > 0 || (options.failOnWarnings === true && result.warnings.length > 0)
    ? 1
    : 0
}

/**
 * Runs the qpress command dispatcher.
 */
async function run(): Promise<void> {
  const [command, ...args] = process.argv.slice(2)

  if (command === undefined || command === '-h' || command === '--help') {
    printHelp()
    return
  }

  if (command === 'check') {
    process.exitCode = await runCheck(args)
    return
  }

  if (command === 'ssg') {
    process.exitCode = await runQPressSsgCli(args)
    return
  }

  throw new Error(`Unknown qpress command: ${command}`)
}

run().catch((error: unknown) => {
  process.stderr.write(`${(error as Error).message}\n`)
  process.exitCode = 1
})
