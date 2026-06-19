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
  externals: ['node_modules', 'dist'],
})
