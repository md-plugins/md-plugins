import { prerenderQPressSsg } from '../ssg/prerender-qpress-ssg.js'

type QPressSsgCliOptions = {
  appHtmlFile?: string
  appShellFile?: string
  appMountId?: string
  concurrency?: number
  crawlLinks?: boolean
  exclude?: string[]
  help?: boolean
  includeRouterRoutes?: boolean
  interval?: number
  manifestFile?: string
  notFound?: 'error' | 'skip'
  outDir?: string
  quiet?: boolean
  redirects?: 'error' | 'follow' | 'skip'
  reportFile?: string | false
  renderer?: 'qpress' | 'quasar-ssr'
  routerRoutesEntry?: string
  srcDir?: string
  ssgAppEntry?: string
  ssrDir?: string
}

type QPressSsgCommandOptions = {
  commandName?: string
}

/**
 * Prints Q-Press SSG command usage information.
 */
export function printQPressSsgHelp(commandName = 'qpress ssg'): void {
  process.stdout.write(`${commandName}

Prerender Q-Press routes into a built static SPA output directory.

Usage:
  ${commandName} [options]

Options:
  --out-dir <dir>        SPA output directory. Defaults to dist/spa.
  --renderer <name>      qpress or quasar-ssr. Defaults to qpress.
  --src-dir <dir>        App source directory for qpress renderer. Defaults to src.
  --ssg-app-entry <file> Q-Press SSG app entry inside src-dir.
                         Defaults to .q-press/ssg/create-app.ts.
  --ssr-dir <dir>        Quasar SSR output directory for quasar-ssr renderer.
                         Defaults to dist/ssr.
  --manifest-file <file> SSG route manifest inside out-dir. Defaults to q-press-ssg-routes.json.
  --app-html-file <file> App shell file inside out-dir. Defaults to index.html.
  --app-shell-file <file>
                         Immutable SPA shell inside out-dir. Defaults to q-press-ssg-shell.html.
  --app-mount-id <id>    App mount element id. Defaults to q-app.
  --exclude <route>      Exclude a route path. Can be repeated.
  --crawl-links          Crawl rendered internal links and prerender discovered routes.
  --no-router-routes     Do not merge static routes from src/router/routes.ts.
  --router-routes-entry <file>
                         Router routes entry inside src-dir. Defaults to router/routes.ts.
  --concurrency <count>  Number of routes to prerender at once. Defaults to 1.
  --interval <ms>        Milliseconds to wait between prerender batches. Defaults to 0.
  --redirects <mode>     error, follow, or skip. Defaults to follow.
  --not-found <mode>     error or skip. Defaults to skip.
  --report-file <file>   JSON report file inside out-dir. Defaults to q-press-ssg-report.json.
  --no-report            Do not write a JSON generation report.
  --quiet                Hide route summary output.
  -h, --help             Show this help.
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
 * Reads a CLI flag value that must be an integer greater than zero.
 */
function readPositiveInteger(args: string[], index: number, flag: string): number {
  const value = Number(readValue(args, index, flag))

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${flag} must be a positive integer.`)
  }

  return value
}

/**
 * Reads a CLI flag value that must be zero or a positive integer.
 */
function readNonNegativeInteger(args: string[], index: number, flag: string): number {
  const value = Number(readValue(args, index, flag))

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${flag} must be a non-negative integer.`)
  }

  return value
}

/**
 * Parses Q-Press SSG CLI arguments into prerender options.
 */
function parseQPressSsgArgs(args: string[]): QPressSsgCliOptions {
  const options: QPressSsgCliOptions = {}

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    switch (arg) {
      case '-h':
      case '--help':
        options.help = true
        break
      case '--out-dir':
        options.outDir = readValue(args, index, arg)
        index += 1
        break
      case '--renderer': {
        const renderer = readValue(args, index, arg)

        if (renderer !== 'qpress' && renderer !== 'quasar-ssr') {
          throw new Error('--renderer must be either "qpress" or "quasar-ssr".')
        }

        options.renderer = renderer
        index += 1
        break
      }
      case '--src-dir':
        options.srcDir = readValue(args, index, arg)
        index += 1
        break
      case '--ssg-app-entry':
        options.ssgAppEntry = readValue(args, index, arg)
        index += 1
        break
      case '--ssr-dir':
        options.ssrDir = readValue(args, index, arg)
        index += 1
        break
      case '--manifest-file':
        options.manifestFile = readValue(args, index, arg)
        index += 1
        break
      case '--app-html-file':
        options.appHtmlFile = readValue(args, index, arg)
        index += 1
        break
      case '--app-shell-file':
        options.appShellFile = readValue(args, index, arg)
        index += 1
        break
      case '--app-mount-id':
        options.appMountId = readValue(args, index, arg)
        index += 1
        break
      case '--exclude':
        options.exclude ??= []
        options.exclude.push(readValue(args, index, arg))
        index += 1
        break
      case '--crawl-links':
        options.crawlLinks = true
        break
      case '--no-router-routes':
        options.includeRouterRoutes = false
        break
      case '--router-routes-entry':
        options.routerRoutesEntry = readValue(args, index, arg)
        index += 1
        break
      case '--concurrency':
        options.concurrency = readPositiveInteger(args, index, arg)
        index += 1
        break
      case '--interval':
        options.interval = readNonNegativeInteger(args, index, arg)
        index += 1
        break
      case '--redirects': {
        const redirects = readValue(args, index, arg)

        if (redirects !== 'error' && redirects !== 'follow' && redirects !== 'skip') {
          throw new Error('--redirects must be "error", "follow", or "skip".')
        }

        options.redirects = redirects
        index += 1
        break
      }
      case '--not-found': {
        const notFound = readValue(args, index, arg)

        if (notFound !== 'error' && notFound !== 'skip') {
          throw new Error('--not-found must be "error" or "skip".')
        }

        options.notFound = notFound
        index += 1
        break
      }
      case '--report-file':
        options.reportFile = readValue(args, index, arg)
        index += 1
        break
      case '--no-report':
        options.reportFile = false
        break
      case '--quiet':
        options.quiet = true
        break
      default:
        throw new Error(`Unknown qpress ssg option: ${arg}`)
    }
  }

  return options
}

/**
 * Executes the Q-Press SSG command and returns the intended process exit code.
 */
export async function runQPressSsgCli(
  args: string[],
  options: QPressSsgCommandOptions = {},
): Promise<number> {
  const commandName = options.commandName ?? 'qpress ssg'
  const ssgOptions = parseQPressSsgArgs(args)

  if (ssgOptions.help === true) {
    printQPressSsgHelp(commandName)
    return 0
  }

  const result = await prerenderQPressSsg(ssgOptions)

  if (ssgOptions.quiet === true) {
    return 0
  }

  process.stdout.write(
    `Q-Press SSG prerendered ${result.routes.length} route${result.routes.length === 1 ? '' : 's'} into ${result.outDir}.\n`,
  )

  if (result.skipped.length > 0) {
    process.stdout.write(
      `Skipped ${result.skipped.length} route${result.skipped.length === 1 ? '' : 's'} (${result.skipped.map((route) => `${route.path}:${route.reason}`).join(', ')}).\n`,
    )
  }

  if (result.report !== undefined) {
    process.stdout.write(`Wrote SSG report with ${result.report.routeCount} route entries.\n`)
  }

  return 0
}
