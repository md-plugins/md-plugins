<template>
  <div class="landing-page markdown-brand">
    <header class="hero">
      <img
        src="https://raw.githubusercontent.com/md-plugins/md-plugins/refs/heads/main/media/markdown-1024x1024.png"
        alt="Markdown Plugins Logo"
        class="hero-logo"
      />
      <h1 class="hero-title">Markdown Plugins</h1>
      <h2 class="hero-subtitle">(@md-plugins)</h2>
      <div class="row justify-center">
        <p class="hero-subtitle2" style="max-width: 660px">
          MD-Plugins is a collection of Markdown and Vite plugins that make it easy to build
          markdown user interfaces in Vue and Quasar applications.
        </p>
      </div>

      <div class="hero-buttons">
        <router-link
          to="/getting-started/introduction"
          class="hero-button q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--rectangle q-btn--actionable q-focusable q-hoverable q-btn--no-uppercase q-btn--rounded q-btn--dense"
        >
          <span
            class="q-btn__content text-center col items-center q-anchor--skip justify-center row"
          >
            Get Started
          </span>
        </router-link>
        <a
          href="https://github.com/md-plugins/md-plugins"
          target="_blank"
          class="hero-button q-btn q-btn-item non-selectable no-outline q-btn--standard q-btn--rectangle q-btn--actionable q-focusable q-hoverable q-btn--no-uppercase q-btn--rounded q-btn--dense"
        >
          <span
            class="q-btn__content text-center col items-center q-anchor--skip justify-center row"
          >
            <q-icon :name="fabGithub" class="q-mr-sm" />
            GitHub Repo
          </span>
        </a>
      </div>
    </header>
    <div class="byline">
      <p>Discover the power of Markdown Plugins and enhance your documentation experience!</p>
    </div>
    <main class="content">
      <q-card v-for="section in sections" :key="section.title" flat class="section">
        <h2 class="text-h2">{{ section.title }}</h2>
        <ul>
          <li v-for="link in section.links" :key="link.text">
            <router-link :to="link.url">{{ link.text }}</router-link>
          </li>
        </ul>
      </q-card>
    </main>
    <div class="byline">
      <p>
        We hope you find this documentation helpful. If you have any questions or need further
        assistance, please don't hesitate to reach out to our support team.
      </p>
      <p>Happy coding!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QIcon } from 'quasar'
import { fabGithub } from '@quasar/extras/fontawesome-v6'

const sections = [
  {
    title: 'Getting Started',
    links: [
      { text: 'Introduction', url: '/getting-started/introduction' },
      { text: 'Installation', url: '/getting-started/installation' },
      { text: 'Configuration', url: '/getting-started/configuration' },
    ],
  },
  {
    title: 'Guides',
    links: [
      { text: 'Usage', url: '/guides/usage' },
      { text: 'Examples', url: '/guides/examples' },
      { text: 'Best Practices', url: '/guides/best-practices' },
    ],
  },
  {
    title: 'Reference',
    links: [
      { text: 'API Overview', url: '/reference/api/overview' },
      { text: 'CLI Commands', url: '/reference/cli' },
      { text: 'Configuration', url: '/reference/configuration' },
    ],
  },
  {
    title: 'Tutorials',
    links: [
      { text: 'Basic Tutorial', url: '/tutorials/basic-tutorial' },
      { text: 'Advanced Tutorial', url: '/tutorials/advanced-tutorial' },
      { text: 'Creating Custom Plugins', url: '/tutorials/custom-plugins' },
    ],
  },
  {
    title: 'FAQ',
    links: [
      { text: 'General FAQ', url: '/faq/general' },
      { text: 'Troubleshooting', url: '/faq/troubleshooting' },
      { text: 'Common Issues', url: '/faq/common-issues' },
    ],
  },
  {
    title: 'Plugins',
    links: [
      { text: 'Plugin 1', url: '/plugins/plugin1/overview' },
      { text: 'Plugin 2', url: '/plugins/plugin2/overview' },
      { text: 'Plugin 3', url: '/plugins/plugin3/overview' },
    ],
  },
  {
    title: 'Shared Utilities',
    links: [
      { text: 'Overview', url: '/shared/overview' },
      { text: 'Utilities', url: '/shared/utilities' },
      { text: 'Constants', url: '/shared/constants' },
      { text: 'Helpers', url: '/shared/helpers' },
    ],
  },
  {
    title: 'Vite Plugins',
    links: [
      { text: 'Overview', url: '/vite-plugins/overview' },
      { text: 'Vite Plugin 1', url: '/vite-plugins/plugin1/overview' },
      { text: 'Vite Plugin 2', url: '/vite-plugins/plugin2/overview' },
      { text: 'Vite Plugin 3', url: '/vite-plugins/plugin3/overview' },
    ],
  },
]
</script>

<style lang="scss" scoped>
.landing-page {
  font-family: 'Arial', sans-serif;
  color: #333;
}

.hero {
  background: linear-gradient(135deg, $brand-primary, #35495e);
  color: white;
  text-align: center;
  padding: 50px 20px;
}

.hero-logo {
  max-width: 200px;
  margin-bottom: 20px;
  border-radius: 50%;
}

.hero-title {
  font-size: 3.5em;
  line-height: 1.2em;
  font-weight: 700;
  margin: 0;
  padding: 0.2em 0;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.8);
}

.hero-subtitle {
  font-size: 1.8em;
  line-height: 1.8em;
  margin: 0;
}

.hero-subtitle2 {
  font-size: 1.2em;
  line-height: 1.2em;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.hero-button {
  background: white;
  color: $brand-primary;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s;
}

.hero-button:hover {
  background: #f0f0f0;
}

.byline {
  text-align: center;
  font-size: 1.2em;
  margin: 20px 0;
  color: #35495e;
}

body.body--dark .byline {
  color: #f0f0f0;
}

.content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 20px;
}

.section {
  flex: 1 1 300px;
  margin: 20px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.section:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.section h2 {
  margin-top: 0;
  color: $brand-primary;
}

.section ul {
  list-style: none;
  padding: 0;
}

.section ul li {
  margin: 10px 0;
}

.section ul li a {
  color: #35495e;
  text-decoration: none;
  transition: color 0.3s;
}

.section ul li a:hover {
  color: $brand-primary;
}

.footer {
  text-align: center;
  padding: 20px;
  background: #35495e;
  color: white;
}
</style>
