<template>
  <section class="landing-page markdown-brand">
    <header class="hero">
      <div class="hero__mesh hero__mesh--left" />
      <div class="hero__mesh hero__mesh--right" />

      <div class="hero__grid">
        <div class="hero__copy">
          <div class="hero__eyebrow">{{ heroEyebrow }}</div>
          <img :src="logoSrc" :alt="logoAlt" class="hero-logo" />
          <h1 class="hero-title">{{ productName }}</h1>

          <p class="hero-subtitle">{{ siteConfig.description }}</p>
          <p class="hero-lede">{{ heroLede }}</p>

          <div class="hero-buttons">
            <q-btn
              to="/getting-started/introduction"
              no-caps
              rounded
              unelevated
              class="hero-button hero-button--solid"
            >
              <div class="hero-button__content q-anchor--skip">
                <span class="hero-button__slot hero-button__slot--empty" aria-hidden="true" />
                <span class="hero-button__label">Get Started</span>
                <span class="hero-button__slot">
                  <q-icon :name="biArrowRightCircle" />
                </span>
              </div>
            </q-btn>

            <q-btn
              to="/other/upgrade-guide"
              no-caps
              rounded
              unelevated
              class="hero-button hero-button--ghost"
            >
              <div class="hero-button__content q-anchor--skip">
                <span class="hero-button__slot hero-button__slot--empty" aria-hidden="true" />
                <span class="hero-button__label">Upgrade Guide</span>
                <span class="hero-button__slot">
                  <q-icon name="upgrade" />
                </span>
              </div>
            </q-btn>

            <q-btn
              :href="githubRepoUrl"
              target="_blank"
              rel="noopener noreferrer"
              no-caps
              rounded
              unelevated
              class="hero-button hero-button--ghost"
            >
              <div class="hero-button__content q-anchor--skip">
                <span class="hero-button__slot">
                  <q-icon :name="fabGithub" />
                </span>
                <span class="hero-button__label">GitHub Repo</span>
                <span class="hero-button__slot hero-button__slot--empty" aria-hidden="true" />
              </div>
            </q-btn>
          </div>

          <div class="hero-pills">
            <span v-for="pill in heroPills" :key="pill" class="hero-pill">
              {{ pill }}
            </span>
          </div>
        </div>

        <div class="hero__visual">
          <div class="preview-panel">
            <div class="preview-panel__header">
              <span class="preview-panel__kicker">{{ previewKicker }}</span>
              <span class="preview-panel__note">Plugin-powered docs</span>
            </div>

            <div class="preview-panel__body">
              <div class="preview-panel__copy">
                <h2>{{ previewTitle }}</h2>
                <p>{{ previewBody }}</p>
              </div>

              <div class="preview-highlights">
                <article
                  v-for="highlight in familyHighlights"
                  :key="highlight.label"
                  class="highlight-card"
                >
                  <div class="highlight-card__value">{{ highlight.value }}</div>
                  <div class="highlight-card__label">{{ highlight.label }}</div>
                  <p class="highlight-card__body">{{ highlight.body }}</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="feature-section">
      <div class="section-heading">
        <div class="section-heading__eyebrow">Included</div>
        <h2 class="section-heading__title">{{ sectionTitle }}</h2>
        <p class="section-heading__text">{{ sectionText }}</p>
      </div>

      <div class="feature-grid">
        <article v-for="feature in featureCards" :key="feature.title" class="feature-card">
          <div class="feature-card__icon">
            <q-icon :name="feature.icon" />
          </div>
          <h3 class="feature-card__title">{{ feature.title }}</h3>
          <p class="feature-card__body">{{ feature.body }}</p>
        </article>
      </div>
    </section>

    <section class="plugin-sections">
      <article v-for="group in pluginGroups" :key="group.title" class="plugin-group">
        <div class="plugin-group__header">
          <div class="plugin-group__eyebrow">{{ group.eyebrow }}</div>
          <h2 class="plugin-group__title">{{ group.title }}</h2>
          <p class="plugin-group__body">{{ group.body }}</p>
        </div>

        <div class="plugin-grid">
          <router-link
            v-for="item in group.items"
            :key="item.name"
            :to="item.path"
            class="plugin-tile"
          >
            <div class="plugin-tile__name">{{ item.name }}</div>
            <p class="plugin-tile__body">{{ item.desc }}</p>
            <div class="plugin-tile__meta">
              <span>Open docs</span>
              <q-icon :name="biArrowRightCircle" />
            </div>
          </router-link>
        </div>
      </article>
    </section>

    <section class="resource-section">
      <article class="resource-card resource-card--primary">
        <div class="resource-card__eyebrow">Ecosystem</div>
        <h2 class="resource-card__title">
          Markdown authoring, Vite transforms, and Quasar docs tooling in one stack
        </h2>
        <p class="resource-card__body">
          Use the Markdown-it and Vite plugins directly in Vue and Vite projects, or move up to the
          Quasar app extensions when you want docs-site scaffolding, examples, and Q-Press
          integration.
        </p>

        <div class="resource-card__actions">
          <a :href="githubRepoUrl" target="_blank" rel="noopener noreferrer" class="resource-link">
            <q-icon :name="fabGithub" />
            <span>md-plugins Repo</span>
          </a>

          <a
            href="https://www.npmjs.com/package/@md-plugins/quasar-app-extension-q-press"
            target="_blank"
            rel="noopener noreferrer"
            class="resource-link"
          >
            <q-icon name="description" />
            <span>Q-Press</span>
          </a>

          <a
            href="https://www.npmjs.com/search?q=%40md-plugins"
            target="_blank"
            rel="noopener noreferrer"
            class="resource-link"
          >
            <q-icon name="inventory_2" />
            <span>NPM Packages</span>
          </a>
        </div>
      </article>

      <article class="resource-card resource-card--secondary">
        <div class="resource-card__eyebrow">Need Help?</div>
        <h2 class="resource-card__title">
          Start with introduction, then pick the layer you actually need
        </h2>
        <p class="resource-card__body">
          Most teams only need one or two pieces of the stack. The docs are organized so you can
          start with the overview, then jump straight to plugin-specific pages or the Q-Press path.
        </p>

        <div class="resource-list">
          <div v-for="item in supportItems" :key="item.title" class="resource-list__item">
            <div class="resource-list__title">{{ item.title }}</div>
            <div class="resource-list__body">{{ item.body }}</div>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { fabGithub } from '@quasar/extras/fontawesome-v7'
import { biArrowRightCircle } from '@quasar/extras/bootstrap-icons'
import siteConfig from '../../siteConfig'

const productName = 'Markdown Plugins'
const logoSrc =
  'https://raw.githubusercontent.com/md-plugins/md-plugins/refs/heads/main/media/markdown-1024x1024.png'
const logoAlt = 'Markdown Plugins Logo'
const githubRepoUrl = 'https://github.com/md-plugins/md-plugins'
const heroEyebrow = 'Markdown + Vue + Quasar'
const heroLede =
  'Build richer Markdown experiences with a layered toolset: authoring plugins, Vite transforms, example loaders, and Quasar documentation scaffolding that all speak the same language.'
const previewKicker = 'Plugin Families'
const previewTitle = 'Start small with a single plugin, or grow into a full documentation workflow'
const previewBody =
  'MD Plugins covers multiple layers of the stack, from Markdown syntax helpers and imported content to Vue SFC generation and full Q-Press documentation sites.'
const sectionTitle =
  'One toolkit for authored content, markdown-driven UI, and documentation workflows'
const sectionText =
  'MD Plugins stays useful at different scales: a single Markdown-it enhancement, a Vite pipeline for docs-style content, or a complete Quasar docs site with shared conventions and examples.'

const heroPills = [
  'Markdown-it',
  'Vite',
  'Vue SFCs',
  'Q-Press',
  'Quasar App Extensions',
  'Docs Tooling',
]

const familyHighlights = [
  {
    value: '13',
    label: 'Markdown-it Plugins',
    body: 'Authoring helpers for quotes, code, containers, imports, Mermaid, tables, shared helpers, and more.',
  },
  {
    value: '3',
    label: 'Vite Plugins',
    body: 'Transform Markdown, import example source, and generate static route output.',
  },
  {
    value: '2',
    label: 'Quasar App Extensions',
    body: 'Add the Vite markdown flow to Quasar or scaffold a full documentation site with Q-Press.',
  },
]

const featureCards = [
  {
    icon: 'article',
    title: 'Authoring Primitives',
    body: 'Extend plain Markdown with targeted plugins instead of inventing one-off content rules for each project.',
  },
  {
    icon: 'description',
    title: 'Markdown to Vue',
    body: 'Convert Markdown into Vue SFC content when authored pages need richer structure, components, and slots.',
  },
  {
    icon: 'code',
    title: 'Examples Workflow',
    body: 'Keep live examples and readable source side by side without duplicating the same content by hand.',
  },
  {
    icon: 'route',
    title: 'Static Route Output',
    body: 'Inventory docs routes and emit static HTML files so deep links can work cleanly on static hosts.',
  },
  {
    icon: 'integration_instructions',
    title: 'Vue and Quasar Fit',
    body: 'Use the lower-level plugins in Vite apps or move into Quasar app extensions when the project needs more scaffolding.',
  },
  {
    icon: 'web',
    title: 'Q-Press Docs Sites',
    body: 'Create documentation sites with shared navigation, landing pages, markdown utilities, and theming conventions.',
  },
  {
    icon: 'architecture',
    title: 'Layered Adoption',
    body: 'Adopt one plugin or the whole stack, depending on whether the job is authoring content, building examples, or shipping docs.',
  },
]

const mdPlugins = [
  {
    name: 'Blockquote Plugin',
    desc: 'Adds support for authored blockquote content and richer quote presentation in Markdown.',
    path: '/md-plugins/blockquote/overview',
  },
  {
    name: 'Codeblocks Plugin',
    desc: 'Adds support for fenced code blocks and code-focused authoring flows.',
    path: '/md-plugins/codeblocks/overview',
  },
  {
    name: 'Containers Plugin',
    desc: 'Create structured content containers for notes, warnings, tips, and custom callouts.',
    path: '/md-plugins/containers/overview',
  },
  {
    name: 'Frontmatter Plugin',
    desc: 'Expose frontmatter data cleanly so Markdown pages can drive richer app and docs behavior.',
    path: '/md-plugins/frontmatter/overview',
  },
  {
    name: 'Headers Plugin',
    desc: 'Work with headings and table-of-contents style content more deliberately.',
    path: '/md-plugins/headers/overview',
  },
  {
    name: 'Image Plugin',
    desc: 'Improve Markdown image handling for documentation pages and content-heavy interfaces.',
    path: '/md-plugins/image/overview',
  },
  {
    name: 'Imports Plugin',
    desc: 'Pull external authored content into Markdown-driven pages without manual duplication.',
    path: '/md-plugins/imports/overview',
  },
  {
    name: 'Inline Code Plugin',
    desc: 'Handle inline code formatting for technical writing and product guidance.',
    path: '/md-plugins/inline-code/overview',
  },
  {
    name: 'Link Plugin',
    desc: 'Create and manage Markdown links with a more deliberate content pipeline.',
    path: '/md-plugins/link/overview',
  },
  {
    name: 'Mermaid Plugin',
    desc: 'Render diagrams directly from authored Markdown when documentation needs visual structure.',
    path: '/md-plugins/mermaid/overview',
  },
  {
    name: 'Table Plugin',
    desc: 'Add support for Markdown tables in pages that need denser structured content.',
    path: '/md-plugins/table/overview',
  },
  {
    name: 'Title Plugin',
    desc: 'Support Markdown title handling for cleaner content metadata and rendering.',
    path: '/md-plugins/title/overview',
  },
  {
    name: 'Shared Helpers',
    desc: 'Common utilities that tie the Markdown plugin family together.',
    path: '/md-plugins/shared/overview',
  },
]

const vitePlugins = [
  {
    name: 'Vite MD Plugin',
    desc: 'Turn Markdown files into Vue SFCs for authored pages that need components and richer layout control.',
    path: '/vite-plugins/vite-md-plugin/overview',
  },
  {
    name: 'Vite Examples Plugin',
    desc: 'Import example source alongside live demos so docs can show both behavior and implementation.',
    path: '/vite-plugins/vite-examples-plugin/overview',
  },
  {
    name: 'Vite SSG Plugin',
    desc: 'Inventory docs routes, emit static route HTML, and bridge Vue or Quasar build-time rendering.',
    path: '/vite-plugins/vite-ssg-plugin/overview',
  },
]

const appExtensions = [
  {
    name: 'viteMdPluginAppExt',
    desc: 'Bring the Vite Markdown workflow directly into Quasar CLI projects.',
    path: '/quasar-app-extensions/vite-md-plugin-app-ext/overview',
  },
  {
    name: 'Q-Press',
    desc: 'Create refined Quasar documentation sites with shared page structure, navigation, and tooling.',
    path: '/quasar-app-extensions/qpress/overview',
  },
]

const pluginGroups = [
  {
    eyebrow: 'Markdown-it',
    title: 'Authoring plugins for structure, content transforms, and richer Markdown',
    body: 'Use targeted Markdown-it plugins when you need better authoring primitives without changing the entire publishing stack.',
    items: mdPlugins,
  },
  {
    eyebrow: 'Vite',
    title: 'Build Markdown-driven Vue pages, example systems, and static route output',
    body: 'Move from authored text to app-ready content when pages need components, embedded demos, raw source visibility, or SSG-friendly deep links.',
    items: vitePlugins,
  },
  {
    eyebrow: 'Quasar App Extensions',
    title: 'Bring the stack into Quasar and scaffold documentation sites faster',
    body: 'Use app extensions when the project needs tighter Quasar integration or a full docs-site workflow with Q-Press.',
    items: appExtensions,
  },
]

const supportItems = [
  {
    title: 'Pick the Smallest Useful Layer',
    body: 'Start with the introduction, then choose whether the job is a Markdown-it plugin, a Vite transform, or a full Q-Press site.',
  },
  {
    title: 'Use Plugin Pages as Reference',
    body: 'Each plugin section is the fastest way to understand what problem it solves and how deeply it affects the content pipeline.',
  },
  {
    title: 'Issues and Discussions',
    body: 'Questions, bugs, and feature ideas are easiest to track in the md-plugins repo and related GitHub discussions.',
  },
]
</script>

<style lang="scss" scoped>
.landing-page {
  --landing-border: rgba(240, 248, 240, 0.14);
  --landing-border-strong: rgba(240, 248, 240, 0.22);
  --landing-surface: rgba(25, 41, 33, 0.76);
  --landing-surface-strong: rgba(34, 55, 43, 0.88);
  --landing-text-soft: rgba(240, 248, 240, 0.82);
  --landing-shadow: 0 28px 60px rgba(13, 21, 17, 0.28);
  padding: 28px clamp(16px, 2.4vw, 34px) 42px;
  color: #203126;
}

.hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
  padding: clamp(24px, 4vw, 44px);
  border: 1px solid var(--landing-border);
  border-radius: 34px;
  background:
    radial-gradient(circle at top left, rgba(168, 222, 141, 0.22), transparent 34%),
    radial-gradient(circle at 82% 20%, rgba(252, 246, 227, 0.09), transparent 20%),
    linear-gradient(145deg, rgba(31, 49, 38, 0.96), rgba(17, 27, 20, 0.96));
  box-shadow: var(--landing-shadow);
}

.hero__mesh {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(252, 246, 227, 0.12), transparent 68%);
  filter: blur(10px);
  pointer-events: none;
}

.hero__mesh--left {
  top: -90px;
  left: -70px;
}

.hero__mesh--right {
  right: -40px;
  bottom: -90px;
}

.hero__grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 24px;
  align-items: center;
  grid-template-columns: minmax(0, 1.04fr) minmax(320px, 0.96fr);
}

.hero__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.hero__eyebrow,
.section-heading__eyebrow,
.resource-card__eyebrow,
.preview-panel__kicker,
.plugin-group__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 14px;
  border: 1px solid var(--landing-border-strong);
  border-radius: 999px;
  background: rgba(252, 246, 227, 0.08);
  color: #ffe5a5;
  font-family: 'Space Grotesk', 'Sora', 'Segoe UI', sans-serif;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.plugin-group__eyebrow,
.resource-card__eyebrow {
  margin-bottom: 14px;
}

.hero-logo {
  width: clamp(92px, 12vw, 132px);
  border-radius: 30px;
  box-shadow: 0 24px 48px rgba(10, 17, 12, 0.3);
}

.hero-title {
  margin: 0;
  font-family: 'Space Grotesk', 'Sora', 'Segoe UI', sans-serif;
  font-size: clamp(3.1rem, 8vw, 5.8rem);
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: -0.05em;
  color: #fcfbf3;
}

.hero-subtitle {
  max-width: 640px;
  margin: 0;
  font-family: 'Space Grotesk', 'Sora', 'Segoe UI', sans-serif;
  font-size: clamp(1.12rem, 2vw, 1.42rem);
  line-height: 1.45;
  font-weight: 700;
  color: #f4fce9;
}

.hero-lede {
  max-width: 620px;
  margin: 0;
  font-size: 1rem;
  line-height: 1.72;
  color: var(--landing-text-soft);
}

.hero-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
  padding-top: 6px;
  margin-bottom: 6px;
}

.hero-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 6px;
}

.hero-button {
  min-height: 50px;
  padding: 0 18px;
  border: 1px solid transparent;
  text-decoration: none;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease,
    box-shadow 0.22s ease;
}

.hero-button:hover,
.resource-link:hover,
.plugin-tile:hover {
  transform: translateY(-1px);
}

.hero-button :deep(.q-btn__content) {
  width: 100%;
  min-width: 0;
}

.hero-button--solid {
  background: #fff6dc;
  color: #1f2f24;
  box-shadow: 0 18px 30px rgba(10, 17, 12, 0.18);
}

.hero-button--ghost {
  background: rgba(252, 246, 227, 0.08);
  border-color: var(--landing-border-strong);
  color: #fcfbf3;
}

.hero-button__content {
  display: grid;
  grid-template-columns: 1.5rem minmax(0, 1fr) 1.5rem;
  align-items: center;
  column-gap: 12px;
  min-width: 0;
  width: 100%;
  font-family: 'Space Grotesk', 'Sora', 'Segoe UI', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
}

.hero-button__slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
}

.hero-button__slot--empty {
  visibility: hidden;
}

.hero-button__slot :deep(.q-icon) {
  font-size: 1.3rem;
}

.hero-button__label {
  white-space: nowrap;
  text-align: center;
}

.hero-pill {
  padding: 8px 12px;
  border: 1px solid rgba(252, 246, 227, 0.12);
  border-radius: 999px;
  background: rgba(252, 246, 227, 0.05);
  color: #f2e3b6;
  font-size: 0.84rem;
  font-weight: 600;
}

.preview-panel,
.feature-card,
.resource-card,
.plugin-group {
  overflow: hidden;
  border: 1px solid var(--landing-border);
  border-radius: 24px;
  background: var(--landing-surface);
  box-shadow: var(--landing-card-shadow);
}

.preview-panel {
  width: 100%;
  padding: 20px;
  background:
    linear-gradient(180deg, rgba(252, 246, 227, 0.08), rgba(252, 246, 227, 0.02)),
    rgba(18, 29, 22, 0.54);
  backdrop-filter: blur(8px);
}

.preview-panel__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.preview-panel__note,
.section-heading__text,
.feature-card__body,
.plugin-group__body,
.resource-card__body,
.resource-list__body,
.highlight-card__body,
.plugin-tile__body {
  color: var(--landing-text-soft);
}

.preview-panel__note {
  color: var(--landing-note-text);
  font-size: 0.84rem;
  font-weight: 600;
}

.preview-panel__body {
  display: grid;
  gap: 20px;
}

.preview-panel__copy h2,
.section-heading__title,
.feature-card__title,
.plugin-group__title,
.resource-card__title,
.plugin-tile__name {
  font-family: 'Space Grotesk', 'Sora', 'Segoe UI', sans-serif;
  color: #fcfbf3;
}

.preview-panel__copy h2 {
  margin: 0 0 10px;
  font-size: clamp(1.35rem, 2vw, 1.7rem);
  line-height: 1.2;
}

.preview-panel__copy p,
.section-heading__text,
.feature-card__body,
.plugin-group__body,
.resource-card__body,
.resource-list__body,
.highlight-card__body,
.plugin-tile__body {
  margin: 0;
  line-height: 1.68;
}

.preview-highlights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.highlight-card {
  padding: 18px;
  border: 1px solid rgba(252, 246, 227, 0.1);
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(252, 246, 227, 0.08), rgba(252, 246, 227, 0.03)),
    rgba(252, 246, 227, 0.03);
}

.highlight-card__value {
  margin-bottom: 8px;
  font-family: 'Space Grotesk', 'Sora', 'Segoe UI', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #ffe5a5;
}

.highlight-card__label {
  margin-bottom: 8px;
  font-family: 'Space Grotesk', 'Sora', 'Segoe UI', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fcfbf3;
}

.feature-section,
.plugin-sections,
.resource-section {
  margin-top: 28px;
}

.section-heading,
.plugin-group__header {
  max-width: 860px;
}

.section-heading {
  margin: 0 auto 20px;
  text-align: center;
}

.section-heading__title {
  margin: 14px 0 10px;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.12;
  text-wrap: balance;
}

.feature-grid,
.resource-section,
.plugin-sections,
.plugin-grid {
  display: grid;
  gap: 18px;
}

.feature-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.plugin-sections {
  grid-template-columns: 1fr;
}

.plugin-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 18px;
}

.resource-section {
  display: grid;
  gap: 16px;
  align-items: start;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
}

.feature-card,
.resource-card,
.plugin-group {
  position: relative;
  padding: 20px;
}

.feature-card::before,
.plugin-group::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(168, 222, 141, 0.55), transparent 65%);
}

.feature-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-bottom: 14px;
  border-radius: 14px;
  background: rgba(168, 222, 141, 0.14);
  color: #f8e4a3;
  font-size: 1.35rem;
}

.feature-card__title,
.plugin-group__title,
.resource-card__title {
  margin: 0 0 10px;
  font-size: 1.16rem;
  line-height: 1.3;
}

.plugin-tile {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
  padding: 18px;
  border: 1px solid rgba(252, 246, 227, 0.1);
  border-radius: 18px;
  background: rgba(252, 246, 227, 0.04);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease;
}

.plugin-tile:hover {
  border-color: rgba(255, 229, 165, 0.38);
  background: rgba(252, 246, 227, 0.07);
  box-shadow: 0 14px 28px rgba(13, 21, 17, 0.18);
}

.plugin-tile__name {
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.32;
}

.plugin-tile__meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  color: #ffe5a5;
  font-size: 0.88rem;
  font-weight: 700;
}

.resource-card--primary {
  background:
    radial-gradient(circle at top right, rgba(255, 229, 165, 0.18), transparent 30%),
    var(--landing-surface-strong);
}

.resource-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.resource-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--landing-border-strong);
  border-radius: 999px;
  background: rgba(252, 246, 227, 0.05);
  color: #f4fce9;
  text-decoration: none;
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background-color 0.22s ease;
}

.resource-list {
  display: grid;
  gap: 0;
  margin-top: 16px;
}

.resource-list__item {
  padding: 12px 0;
  border-top: 1px solid var(--landing-resource-item-border);
}

.resource-list__item:first-child {
  padding-top: 0;
  border-top: 0;
}

.resource-list__title {
  margin-bottom: 6px;
  font-family: 'Space Grotesk', 'Sora', 'Segoe UI', sans-serif;
  font-size: 0.96rem;
  font-weight: 700;
  color: #f8e4a3;
}

.feature-card__body,
.plugin-group__body,
.resource-card__body,
.highlight-card__body,
.plugin-tile__body {
  color: var(--landing-body-text);
  font-size: 0.97rem;
}

.resource-list__body {
  color: var(--landing-body-text);
  font-size: 0.93rem;
  line-height: 1.55;
}

@media (max-width: 1180px) {
  .hero__grid,
  .resource-section,
  .feature-grid,
  .plugin-grid,
  .preview-highlights {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .landing-page {
    padding: 18px 12px 30px;
  }

  .hero {
    padding: 24px 18px;
    border-radius: 24px;
  }

  .hero__copy {
    align-items: stretch;
  }

  .hero-buttons,
  .resource-card__actions {
    flex-direction: column;
  }

  .hero-button,
  .resource-link {
    justify-content: center;
  }

  .feature-card,
  .resource-card,
  .plugin-group {
    padding: 18px;
    border-radius: 20px;
  }
}

/* codex-theme-override:start */
.landing-page {
  --landing-page-text: #{$brand-light-text};
  --landing-heading: #{$brand-light-text};
  --landing-body-text: #{rgba($brand-light-text, 0.84)};
  --landing-note-text: #{rgba($brand-light-text, 0.66)};
  --landing-border: #{rgba($brand-secondary, 0.16)};
  --landing-border-strong: #{rgba($brand-secondary, 0.24)};
  --landing-surface: #{rgba($brand-light, 0.78)};
  --landing-surface-strong: #{rgba($brand-light, 0.92)};
  --landing-text-soft: #{rgba($brand-light-text, 0.78)};
  --landing-shadow: 0 28px 60px #{rgba($brand-primary, 0.14)};
  --landing-card-shadow: 0 16px 34px #{rgba($brand-secondary, 0.12)};
  --landing-chip-bg: #{rgba($brand-light, 0.52)};
  --landing-chip-text: #{$brand-primary};
  --landing-solid-bg: #{$brand-primary};
  --landing-solid-text: #{$brand-light};
  --landing-solid-shadow: 0 18px 30px #{rgba($brand-primary, 0.24)};
  --landing-ghost-bg: #{rgba($brand-light, 0.46)};
  --landing-ghost-text: #{$brand-light-text};
  --landing-pill-border: #{rgba($brand-secondary, 0.14)};
  --landing-pill-bg: #{rgba($brand-light, 0.44)};
  --landing-pill-text: #{$brand-primary};
  --landing-panel-gradient-top: #{rgba($brand-light, 0.7)};
  --landing-panel-gradient-bottom: #{rgba($brand-light, 0.22)};
  --landing-panel-bg: #{rgba($brand-light-bg, 0.88)};
  --landing-highlight-border: #{rgba($brand-secondary, 0.16)};
  --landing-highlight-bg: #{rgba($brand-light, 0.52)};
  --landing-highlight-value: #{$brand-primary};
  --landing-highlight-label: #{$brand-light-text};
  --landing-accent-line: #{rgba($brand-primary, 0.4)};
  --landing-icon-bg: #{rgba($brand-primary, 0.1)};
  --landing-icon-color: #{$brand-primary};
  --landing-tile-border: #{rgba($brand-secondary, 0.12)};
  --landing-tile-bg: #{rgba($brand-light, 0.42)};
  --landing-tile-hover-border: #{rgba($brand-primary, 0.28)};
  --landing-tile-hover-bg: #{rgba($brand-light, 0.56)};
  --landing-tile-hover-shadow: 0 14px 28px #{rgba($brand-secondary, 0.12)};
  --landing-meta-text: #{$brand-primary};
  --landing-spot-accent: #{rgba($brand-primary, 0.14)};
  --landing-resource-link-bg: #{rgba($brand-light, 0.48)};
  --landing-resource-link-text: #{$brand-light-text};
  --landing-resource-item-border: #{rgba($brand-secondary, 0.1)};
  --landing-resource-item-bg: #{rgba($brand-light, 0.42)};
  --landing-accent-text: #{$brand-primary};
  --landing-mesh-color: #{rgba($brand-primary, 0.16)};
  --landing-hero-glow-1: #{rgba($brand-primary, 0.18)};
  --landing-hero-glow-2: #{rgba($brand-secondary, 0.12)};
  --landing-hero-start: #{rgba($brand-light, 0.96)};
  --landing-hero-end: #{rgba($brand-light-bg, 0.96)};
  color: var(--landing-page-text);
}

body.body--dark .landing-page {
  --landing-page-text: #{$brand-dark-text};
  --landing-heading: #{$brand-dark-text};
  --landing-body-text: #{rgba($brand-dark-text, 0.8)};
  --landing-note-text: #{rgba($brand-dark-text, 0.64)};
  --landing-border: #{rgba($brand-light, 0.12)};
  --landing-border-strong: #{rgba($brand-light, 0.2)};
  --landing-surface: #{rgba($dark-pill, 0.74)};
  --landing-surface-strong: #{rgba($dark-pill, 0.88)};
  --landing-text-soft: #{rgba($brand-dark-text, 0.82)};
  --landing-shadow: 0 28px 60px #{rgba($brand-dark-bg, 0.28)};
  --landing-card-shadow: 0 16px 34px #{rgba($brand-dark-bg, 0.24)};
  --landing-chip-bg: #{rgba($brand-light, 0.08)};
  --landing-chip-text: #{$brand-primary};
  --landing-solid-bg: #{$brand-light};
  --landing-solid-text: #{$brand-dark-bg};
  --landing-solid-shadow: 0 18px 30px #{rgba($brand-dark-bg, 0.28)};
  --landing-ghost-bg: #{rgba($brand-light, 0.08)};
  --landing-ghost-text: #{$brand-dark-text};
  --landing-pill-border: #{rgba($brand-light, 0.12)};
  --landing-pill-bg: #{rgba($brand-light, 0.05)};
  --landing-pill-text: #{$brand-primary};
  --landing-panel-gradient-top: #{rgba($brand-light, 0.08)};
  --landing-panel-gradient-bottom: #{rgba($brand-light, 0.02)};
  --landing-panel-bg: #{rgba($brand-dark-bg, 0.56)};
  --landing-highlight-border: #{rgba($brand-light, 0.08)};
  --landing-highlight-bg: #{rgba($brand-light, 0.05)};
  --landing-highlight-value: #{$brand-primary};
  --landing-highlight-label: #{$brand-dark-text};
  --landing-accent-line: #{rgba($brand-primary, 0.55)};
  --landing-icon-bg: #{rgba($brand-primary, 0.16)};
  --landing-icon-color: #{$brand-primary};
  --landing-tile-border: #{rgba($brand-light, 0.08)};
  --landing-tile-bg: #{rgba($brand-light, 0.04)};
  --landing-tile-hover-border: #{rgba($brand-primary, 0.34)};
  --landing-tile-hover-bg: #{rgba($brand-light, 0.08)};
  --landing-tile-hover-shadow: 0 14px 28px #{rgba($brand-dark-bg, 0.2)};
  --landing-meta-text: #{$brand-primary};
  --landing-spot-accent: #{rgba($brand-primary, 0.18)};
  --landing-resource-link-bg: #{rgba($brand-light, 0.06)};
  --landing-resource-link-text: #{$brand-dark-text};
  --landing-resource-item-border: #{rgba($brand-light, 0.08)};
  --landing-resource-item-bg: #{rgba($brand-light, 0.04)};
  --landing-accent-text: #{$brand-primary};
  --landing-mesh-color: #{rgba($brand-light, 0.12)};
  --landing-hero-glow-1: #{rgba($brand-primary, 0.22)};
  --landing-hero-glow-2: #{rgba($brand-light, 0.08)};
  --landing-hero-start: #{rgba($brand-dark-bg, 0.96)};
  --landing-hero-end: #{rgba($dark-pill, 0.96)};
}

.hero {
  background:
    radial-gradient(circle at top left, var(--landing-hero-glow-1), transparent 34%),
    radial-gradient(circle at 82% 20%, var(--landing-hero-glow-2), transparent 20%),
    linear-gradient(145deg, var(--landing-hero-start), var(--landing-hero-end));
  box-shadow: var(--landing-shadow);
}

.hero__mesh {
  background: radial-gradient(circle, var(--landing-mesh-color), transparent 68%);
}

.hero__eyebrow,
.section-heading__eyebrow,
.resource-card__eyebrow,
.preview-panel__kicker,
.plugin-group__eyebrow {
  border-color: var(--landing-border-strong);
  background: var(--landing-chip-bg);
  color: var(--landing-chip-text);
}

.hero-title,
.hero-subtitle,
.preview-panel__copy h2,
.section-heading__title,
.feature-card__title,
.plugin-group__title,
.resource-card__title,
.plugin-tile__name,
.highlight-card__label {
  color: var(--landing-heading);
}

.hero-button--solid {
  background: var(--landing-solid-bg);
  color: var(--landing-solid-text);
  box-shadow: var(--landing-solid-shadow);
}

.hero-button--ghost {
  background: var(--landing-ghost-bg);
  border-color: var(--landing-border-strong);
  color: var(--landing-ghost-text);
}

.hero-pill {
  border-color: var(--landing-pill-border);
  background: var(--landing-pill-bg);
  color: var(--landing-pill-text);
}

.preview-panel,
.feature-card,
.resource-card,
.plugin-group {
  background: var(--landing-surface);
  box-shadow: var(--landing-card-shadow);
}

.preview-panel {
  background:
    linear-gradient(
      180deg,
      var(--landing-panel-gradient-top),
      var(--landing-panel-gradient-bottom)
    ),
    var(--landing-panel-bg);
}

.highlight-card {
  border-color: var(--landing-highlight-border);
  background: var(--landing-highlight-bg);
}

.highlight-card__value {
  color: var(--landing-highlight-value);
}

.feature-card::before,
.plugin-group::before {
  background: linear-gradient(90deg, var(--landing-accent-line), transparent 65%);
}

.feature-card__icon {
  background: var(--landing-icon-bg);
  color: var(--landing-icon-color);
}

.plugin-tile {
  border-color: var(--landing-tile-border);
  background: var(--landing-tile-bg);
}

.plugin-tile:hover {
  border-color: var(--landing-tile-hover-border);
  background: var(--landing-tile-hover-bg);
  box-shadow: var(--landing-tile-hover-shadow);
}

.plugin-tile__meta {
  color: var(--landing-meta-text);
}

.resource-card--primary {
  background:
    radial-gradient(circle at top right, var(--landing-spot-accent), transparent 30%),
    var(--landing-surface-strong);
}

.resource-link {
  border-color: var(--landing-border-strong);
  background: var(--landing-resource-link-bg);
  color: var(--landing-resource-link-text);
}

.resource-list__item {
  border-color: var(--landing-resource-item-border);
}

.resource-list__title {
  color: var(--landing-accent-text);
}
/* codex-theme-override:end */
</style>
