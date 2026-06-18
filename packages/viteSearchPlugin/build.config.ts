import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index'],
  failOnWarn: false,
  externals: [/node_modules/, 'vite'],
  rollup: {
    emitCJS: false,
    inlineDependencies: false,
  },
  outDir: 'dist',
})
