import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const distDmts = resolve(process.cwd(), 'dist/index.d.mts')
const distDts = resolve(process.cwd(), 'dist/index.d.ts')

if (existsSync(distDmts)) {
  copyFileSync(distDmts, distDts)
}
