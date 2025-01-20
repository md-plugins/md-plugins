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
          {{ siteConfig.description }}
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
      <p>
        Markdown Plugins go beyond the standard Markdown syntax.<br />Discover the power of Markdown
        Plugins and enhance your documentation experience!
      </p>
    </div>
    <div class="row justify-center hero">
      <div class="hero-title">Markdown-It! Plugins</div>
    </div>
    <main class="content grid-container">
      <div
        v-for="plugin in mdPlugins"
        :key="plugin.name"
        class="section grid-item"
        @click="navigate(plugin.path)"
      >
        <q-card flat style="background: transparent">
          <h2>{{ plugin.name }}</h2>
          <p>{{ plugin.desc }}</p>
        </q-card>
      </div>
    </main>
    <div class="row justify-center hero">
      <div class="hero-title">Vite Plugins</div>
    </div>
    <main class="content grid-container">
      <div
        v-for="plugin in vitePlugins"
        :key="plugin.name"
        class="section grid-item"
        @click="navigate(plugin.path)"
      >
        <h2>{{ plugin.name }}</h2>
        <p>{{ plugin.desc }}</p>
      </div>
    </main>
    <div class="row justify-center hero">
      <div class="hero-title">Quasar App Extensions</div>
    </div>
    <main class="content grid-container">
      <div
        v-for="ext in appExtensions"
        :key="ext.name"
        class="section grid-item"
        @click="navigate(ext.path)"
      >
        <h2>{{ ext.name }}</h2>
        <p>{{ ext.desc }}</p>
      </div>
    </main>
    <q-separator />
    <div class="byline">
      <p>
        Don't forget to check out the Q-Press app extension for Quasar to create beautiful
        documentation sites.
      </p>
      <p>
        This site is built with Q-Press! Install it, set it up, choose a theme and start your own
        site!
      </p>
    </div>
    <q-separator />
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
import { useRouter } from 'vue-router'
import siteConfig from '../../siteConfig'

const router = useRouter()

const mdPlugins = [
  {
    name: 'Blockquote Plugin',
    desc: 'Adds support for creating Markdown blockquotes.',
    path: '/md-plugins/blockquote/overview',
  },
  {
    name: 'Codeblocks Plugin',
    desc: 'Adds support for creating Markdown code blocks.',
    path: '/md-plugins/codeblocks/overview',
  },
  {
    name: 'Container Plugin',
    desc: 'Adds support for creating Markdown containers.',
    path: '/md-plugins/containers/overview',
  },
  {
    name: 'Frontmatter Plugin',
    desc: 'Adds support for getting frontmatter data into your Markdown.',
    path: '/md-plugins/frontmatter/overview',
  },
  {
    name: 'Headers Plugin',
    desc: "Adds support for creating ToC's inMarkdown.",
    path: '/md-plugins/headers/overview',
  },
  {
    name: 'Image Plugin',
    desc: 'Adds support for creating Markdown images.',
    path: '/md-plugins/image/overview',
  },
  {
    name: 'Imports Plugin',
    desc: 'Adds support for creating custom imports for your Markdown.',
    path: '/md-plugins/imports/overview',
  },
  {
    name: 'Inlinecode Plugin',
    desc: 'Adds support for creating Markdown inline code.',
    path: '/md-plugins/inline-code/overview',
  },
  {
    name: 'Link Plugin',
    desc: 'Adds support for creating Markdown links.',
    path: '/md-plugins/link/overview',
  },
  {
    name: 'Table Plugin',
    desc: 'Adds support for creating Markdown tables.',
    path: '/md-plugins/table/overview',
  },
  {
    name: 'Title Plugin',
    desc: 'Adds support for creating Markdown titles.',
    path: '/md-plugins/title/overview',
  },
]

const vitePlugins = [
  {
    name: 'Vite MD Plugin',
    desc: 'Adds support for creating Vue SFCs from Markdown files.',
    path: '/vite-plugins/vite-md-plugin/overview',
  },
  {
    name: 'Vite Examples Plugin',
    desc: 'Adds support for importing Vue files as raw source.',
    path: '/vite-plugins/vite-examples-plugin/overview',
  },
]

const appExtensions = [
  {
    name: 'viteMdPluginAppExt',
    desc: 'Adds support for creating Vue SFCs from Markdown files.',
    path: '/quasar-app-extensions/vite-md-plugin-app-ext/overview',
  },
  {
    name: 'Q-Press (app-ext)',
    desc: 'Create beautiful documentation sites with Q-Press.',
    path: '/quasar-app-extensions/qpress/overview',
  },
]

function navigate(path: string) {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.landing-page {
  font-family: 'Arial', sans-serif;
  color: #333;
}

.hero {
  background: linear-gradient(135deg, $brand-primary, $brand-secondary);
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

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 10px;
  width: 100%;
  max-width: 100%;
  justify-content: center;
  align-content: center;
}

.grid-item {
  // aspect-ratio: 1 / 1;
  cursor: pointer;
}

.section {
  flex: 1 1 300px;
  margin: 20px;
  padding: 20px;
  color: white;
  text-decoration: none;
  background: linear-gradient(135deg, $brand-primary, $brand-secondary);
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.section:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  // change mouseover effects
  cursor: pointer;
}

.section h2 {
  margin-top: 0;
  color: white;
  font-size: 2.125rem;
  font-weight: 400;
  line-height: 2.5rem;
  letter-spacing: 0.00735em;
  font-weight: 700;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.8);
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
