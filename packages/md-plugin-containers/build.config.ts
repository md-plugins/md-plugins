import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  failOnWarn: false,
  entries: ['src/index'],
  rollup: {
    emitCJS: false,
    inlineDependencies: false,
  },
  // Ensure dist is excluded
  externals: ['node_modules', 'dist'],
})
