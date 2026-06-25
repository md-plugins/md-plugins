import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { checkQPressProject, formatQPressCheckResult } from '../src/check/qpress-check.js'

/**
 * Creates a temporary Q-Press-style project with the requested files.
 */
async function createProject(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'qpress-check-'))

  await Promise.all(
    Object.entries(files).map(async ([file, content]) => {
      const path = join(root, file)

      await mkdir(dirname(path), { recursive: true })
      await writeFile(path, content)
    }),
  )

  return root
}

describe('qpress check', () => {
  it('passes a valid Q-Press project', async () => {
    const root = await createProject({
      'src/.q-press/api/components/Example.json': '{"type":"component"}',
      'src/examples/QAvatar/BasicExample.vue': '<template><q-avatar /></template>',
      'src/markdown/guides/intro.md': `---
title: Intro
desc: Intro page.
---

[Home](/)
`,
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
examples: QAvatar
---

<script import>
import ExampleApi from '@/.q-press/api/components/Example.json'
</script>

[Intro](/guides/intro)

<MarkdownExample title="Basic" file="BasicExample" />
`,
    })

    try {
      const result = await checkQPressProject({ cwd: root })

      expect(result.errors).toEqual([])
      expect(result.routes.map((route) => route.route)).toEqual(
        expect.arrayContaining(['/', '/guides/intro']),
      )
      expect(result.routes).toHaveLength(2)
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('reports related frontmatter routes that do not exist', async () => {
    const root = await createProject({
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
related:
  - guides/missing
---
`,
    })

    try {
      const result = await checkQPressProject({ cwd: root })
      const errors = result.errors.map((diagnostic) => diagnostic.code)

      expect(errors).toContain('frontmatter-route-missing')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('allows custom related frontmatter routes', async () => {
    const root = await createProject({
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
related:
  - theme-builder
---
`,
    })

    try {
      const result = await checkQPressProject({
        allowedRoutes: ['/theme-builder'],
        cwd: root,
      })

      expect(result.errors).toEqual([])
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('supports scalar related frontmatter routes', async () => {
    const root = await createProject({
      'src/markdown/guides/intro.md': `---
title: Intro
desc: Intro page.
---
`,
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
related: guides/intro
---
`,
    })

    try {
      const result = await checkQPressProject({ cwd: root })

      expect(result.errors).toEqual([])
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('reports stale configured generated API JSON', async () => {
    const root = await createProject({
      'src/.q-press/api/composables/example.json': '{"type":"component"}\n',
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
---
`,
      'src/utils/example.ts': `
/**
 * Returns a label.
 *
 * @returns Label text.
 */
export function getLabel(): string {
  return 'Label'
}
`,
    })

    try {
      const result = await checkQPressProject({
        apiEntries: [
          {
            input: 'src/utils/example.ts',
            output: 'src/.q-press/api/composables/example.json',
          },
        ],
        cwd: root,
      })

      expect(result.errors).toEqual([
        expect.objectContaining({
          code: 'api-output-stale',
          file: 'src/.q-press/api/composables/example.json',
        }),
      ])
      expect(result.errors[0]?.message).toContain('Field changes: 1 generated-only')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('skips configured generated API JSON when disabled', async () => {
    const root = await createProject({
      'src/.q-press/api/composables/example.json': '{"type":"component"}\n',
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
---
`,
      'src/utils/example.ts': `
/**
 * Returns a label.
 *
 * @returns Label text.
 */
export function getLabel(): string {
  return 'Label'
}
`,
    })

    try {
      const result = await checkQPressProject({
        apiEntries: [
          {
            input: 'src/utils/example.ts',
            output: 'src/.q-press/api/composables/example.json',
          },
        ],
        checkGeneratedApi: false,
        cwd: root,
      })

      expect(result.errors).toEqual([])
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('reports duplicate Markdown routes', async () => {
    const root = await createProject({
      'src/markdown/guides.md': `---
title: Guides
desc: Guides page.
---
`,
      'src/markdown/guides/guides.md': `---
title: Guides Index
desc: Duplicate page.
---
`,
    })

    try {
      const result = await checkQPressProject({ cwd: root })

      expect(result.errors.map((diagnostic) => diagnostic.code)).toContain('route-duplicate')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('ignores explicitly configured Markdown file patterns', async () => {
    const root = await createProject({
      'src/markdown/__fixture.md': '[Missing](/missing)',
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
---
`,
    })

    try {
      const result = await checkQPressProject({
        cwd: root,
        ignoreFiles: ['__*.md'],
      })

      expect(result.errors).toEqual([])
      expect(result.routes.map((route) => route.file)).toEqual(['landing-page.md'])
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('reports broken routes, missing examples, and missing API imports', async () => {
    const root = await createProject({
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
examples: Demo
---

<script import>
import MissingApi from '@/.q-press/api/components/Missing.json'
</script>

[Missing](/does-not-exist)

<MarkdownExample title="Missing" file="MissingExample" />
`,
    })

    try {
      const result = await checkQPressProject({ cwd: root })
      const codes = result.errors.map((diagnostic) => diagnostic.code)

      expect(codes).toContain('api-import-missing')
      expect(codes).toContain('example-source-missing')
      expect(codes).toContain('link-route-missing')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('reports siteConfig navigation routes that do not exist', async () => {
    const root = await createProject({
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
---
`,
      'src/siteConfig/index.ts': `export default {
  sidebar: [
    { name: 'Missing', path: '/missing-page' },
    { name: 'Source', link: 'https://github.com/md-plugins/md-plugins' },
  ],
}
`,
    })

    try {
      const result = await checkQPressProject({ cwd: root })
      const errors = result.errors.map((diagnostic) => diagnostic.code)

      expect(errors).toContain('navigation-route-missing')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('allows custom siteConfig navigation routes', async () => {
    const root = await createProject({
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
---
`,
      'src/siteConfig/index.ts': `export default {
  sidebar: [{ name: 'Theme Builder', path: '/theme-builder' }],
}
`,
    })

    try {
      const result = await checkQPressProject({
        allowedRoutes: ['/theme-builder'],
        cwd: root,
      })

      expect(result.errors).toEqual([])
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('can warn about Markdown routes that are not reachable from siteConfig navigation', async () => {
    const root = await createProject({
      'src/markdown/guides/hidden.md': `---
title: Hidden
desc: Hidden page.
---
`,
      'src/markdown/guides/intro.md': `---
title: Intro
desc: Intro page.
---
`,
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
---
`,
      'src/siteConfig/index.ts': `export default {
  sidebar: [{ name: 'Intro', path: '/guides/intro' }],
}
`,
    })

    try {
      const result = await checkQPressProject({
        checkUnreachable: true,
        cwd: root,
      })
      const warnings = result.warnings.map((diagnostic) => diagnostic.code)

      expect(result.errors).toEqual([])
      expect(warnings).toContain('navigation-route-unreachable')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('warns about missing frontmatter and SSG-risky example globals', async () => {
    const root = await createProject({
      'src/examples/Demo/BrowserOnly.vue': `<script setup lang="ts">
console.log(window.location.href)
</script>
`,
      'src/markdown/landing-page.md': 'Content without frontmatter.',
    })

    try {
      const result = await checkQPressProject({ cwd: root })
      const warnings = result.warnings.map((diagnostic) => diagnostic.code)

      expect(result.errors).toEqual([])
      expect(warnings).toContain('frontmatter-missing')
      expect(warnings).toContain('ssg-browser-global')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('does not treat Vue template component names as browser globals', async () => {
    const root = await createProject({
      'src/examples/QWindow/Basic.vue': `<template>
  <div class="q-pa-md q-window-demo-stage">
    <q-window title="Project Notes">Window content</q-window>
  </div>
</template>

<script setup lang="ts">
const title = 'QWindow'
const copy = 'Only side edges do not resize the window.'
</script>
`,
      'src/markdown/landing-page.md': `---
title: Home
desc: Landing page.
---
`,
    })

    try {
      const result = await checkQPressProject({ cwd: root })

      expect(result.warnings.map((diagnostic) => diagnostic.code)).not.toContain(
        'ssg-browser-global',
      )
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('formats errors and warnings for terminal output', async () => {
    const root = await createProject({
      'src/markdown/landing-page.md': '[Missing](/missing)',
    })

    try {
      const result = await checkQPressProject({ cwd: root })
      const output = formatQPressCheckResult(result)

      expect(output).toContain('Errors (1)')
      expect(output).toContain('Warnings (1)')
      expect(output).toContain('link-route-missing')
    } finally {
      await rm(root, { force: true, recursive: true })
    }
  })
})
