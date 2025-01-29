import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  declaration: true,
  entries: ['src/index'],
  failOnWarn: false,
  externals: [
    /node_modules/, // Exclude all dependencies in node_modules
    // /^@md-plugins\//, // Specifically exclude all @md-plugins/* packages
    'markdown-it',
    'vite',
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
