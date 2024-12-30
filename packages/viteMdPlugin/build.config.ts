import { defineBuildConfig } from 'unbuild'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const rootPackageJson = JSON.parse(readFileSync(join(__dirname, './package.json'), 'utf8'))

const allDependencies = [
  ...Object.keys(rootPackageJson.dependencies || {}),
  ...Object.keys(rootPackageJson.devDependencies || {}),
  ...Object.keys(rootPackageJson.peerDependencies || {}),
]

// Filter to exclude `@md-plugins/*` packages
const externals = allDependencies.filter((dep) => !dep.startsWith('@md-plugins/'))

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index'],
  failOnWarn: false,
  externals: [
    /node_modules/, // Exclude all dependencies in node_modules
    /^@md-plugins\//, // Specifically exclude all @md-plugins/* packages
    'markdown-it',
  ],
  rollup: {
    emitCJS: false, // Generates CommonJS modules
    inlineDependencies: false, // Don't inline all dependencies
  },
  outDir: 'dist', // Explicitly set the output directory if needed
  // hooks: {
  //   'rollup:options'(ctx, options) {
  //     console.log('Rollup Options:', options);
  //   },
  // },
})
