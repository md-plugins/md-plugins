import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: './src/index.ts',
      outDir: './dist',
      minify: false,
      dts: true,
      license: false,
    },
  ],
  hooks: {
    rolldownConfig(config) {
      const external = Array.isArray(config.external) ? config.external : []

      config.external = [
        ...external,
        'vite',
        /^vite\//,
        'postcss',
        /^postcss\//,
      ] as typeof config.external
    },
  },
})
