#!/usr/bin/env node

import { prerenderQPressSsg } from '../ssg/prerender-qpress-ssg.js'

function printHelp(): void {
  process.stdout.write(`qpress-ssg

Prerender Q-Press routes into a built static SPA output directory.

Usage:
  qpress-ssg [options]

Options:
  --out-dir <dir>        SPA output directory. Defaults to dist/spa.
  --ssr-dir <dir>        Quasar SSR output directory. Defaults to dist/ssr.
  --manifest-file <file> SSG route manifest inside out-dir. Defaults to q-press-ssg-routes.json.
  --app-html-file <file> App shell file inside out-dir. Defaults to index.html.
  --app-mount-id <id>    App mount element id. Defaults to q-app.
  --quiet               Hide route summary output.
  -h, --help            Show this help.
`)
}

type CliOptions = {
  appHtmlFile?: string
  appMountId?: string
  manifestFile?: string
  outDir?: string
  quiet?: boolean
  ssrDir?: string
}

function readValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1]

  if (!value || value.startsWith('-')) {
    throw new Error(`Missing value for ${flag}.`)
  }

  return value
}

function parseArgs(args: string[]): CliOptions & { help?: boolean } {
  const options: CliOptions & { help?: boolean } = {}

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
      case '--app-mount-id':
        options.appMountId = readValue(args, index, arg)
        index += 1
        break
      case '--quiet':
        options.quiet = true
        break
      default:
        throw new Error(`Unknown option: ${arg}`)
    }
  }

  return options
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    printHelp()
    return
  }

  const result = await prerenderQPressSsg(options)

  if (options.quiet) {
    return
  }

  process.stdout.write(
    `Q-Press SSG prerendered ${result.routes.length} route${result.routes.length === 1 ? '' : 's'} into ${result.outDir}.\n`,
  )
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)

  process.stderr.write(`Q-Press SSG prerender failed: ${message}\n`)
  process.exitCode = 1
})
