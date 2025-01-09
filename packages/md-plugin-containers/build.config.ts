import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index'],
  rollup: {
    emitCJS: false,
    inlineDependencies: false, // Inline all dependencies
  },
  hooks: {
    'build:done': () => {
      console.log('Build completed!')
    },
  },
  // Ensure dist is excluded
  externals: ['node_modules', 'dist'],
})
