#!/usr/bin/env node

import { runQPressSsgCli } from './qpress-ssg-command.js'

runQPressSsgCli(process.argv.slice(2), { commandName: 'qpress-ssg' })
  .then((exitCode) => {
    process.exitCode = exitCode
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)

    process.stderr.write(`Q-Press SSG prerender failed: ${message}\n`)
    process.exitCode = 1
  })
