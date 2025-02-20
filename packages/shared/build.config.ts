import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index'],
  rollup: {
    emitCJS: false, // Generates CommonJS modules
    inlineDependencies: false,
  },
  outDir: 'dist', // Explicitly set the output directory if needed
})
