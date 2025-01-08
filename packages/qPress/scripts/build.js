// Copy from the Docs package to this project
import fse from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the current directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Construct full paths
const initPath = path.resolve(__dirname, '../src/templates/init')
const updatePath = path.resolve(__dirname, '../src/templates/update')
const globalsPath = path.resolve(__dirname, '../../docs/src/q-press.globals.d.ts')
const qPressPath = path.resolve(__dirname, '../../docs/src/.q-press')
const componentsPath = path.resolve(__dirname, '../../docs/src/components')
const markdownPath = path.resolve(__dirname, '../../docs/src/markdown')
const siteConfigPath = path.resolve(__dirname, '../../docs/src/siteConfig')

// The "update" folder only gets 'q-press.globals.d.ts' and the '_q-press' folder
fse.removeSync(initPath)
fse.removeSync(updatePath)

fse.copySync(globalsPath, path.join(initPath, 'src/q-press.globals.d.ts'))
fse.copySync(globalsPath, path.join(updatePath, 'src/q-press.globals.d.ts'))

fse.copySync(qPressPath, path.join(initPath, 'src/_q-press'))
fse.copySync(qPressPath, path.join(updatePath, 'src/_q-press'))

fse.copySync(componentsPath, path.join(initPath, 'src/components'))
fse.copySync(markdownPath, path.join(initPath, 'src/markdown'))
fse.copySync(siteConfigPath, path.join(initPath, 'src/siteConfig'))
