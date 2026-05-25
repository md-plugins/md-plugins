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
const distTemplatesPath = path.resolve(__dirname, '../dist/templates')
const globalsPath = path.resolve(__dirname, '../src/q-press-globals.d.ts')
const distGlobalsPath = path.resolve(__dirname, '../dist/q-press-globals.d.ts')
const qPressPath = path.resolve(__dirname, '../../docs/src/.q-press')
const componentsPath = path.resolve(__dirname, '../../docs/src/components')
const markdownPath = path.resolve(__dirname, '../../docs/src/markdown')
const examplesPath = path.resolve(__dirname, '../../docs/src/examples')
const siteConfigPath = path.resolve(__dirname, '../../docs/src/siteConfig')

// The "update" folder only gets the '_q-press' folder.
fse.removeSync(initPath)
fse.removeSync(updatePath)
fse.removeSync(distTemplatesPath)

fse.copySync(globalsPath, distGlobalsPath)

fse.copySync(qPressPath, path.join(initPath, 'src/_q-press'))
fse.copySync(qPressPath, path.join(updatePath, 'src/_q-press'))

fse.copySync(componentsPath, path.join(initPath, 'src/components'))
fse.copySync(markdownPath, path.join(initPath, 'src/markdown'))
fse.copySync(examplesPath, path.join(initPath, 'src/examples'))
fse.copySync(siteConfigPath, path.join(initPath, 'src/siteConfig'))

// Keep rendered templates next to the compiled install script for published packages.
fse.copySync(path.resolve(__dirname, '../src/templates'), distTemplatesPath)
