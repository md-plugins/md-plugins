<template>
  <div class="qpress-theme-gallery">
    <article
      v-for="theme in themes"
      :key="theme.name"
      class="qpress-theme-preview"
      :style="getThemeStyle(theme)"
    >
      <div class="qpress-theme-preview__header">
        <span class="qpress-theme-preview__eyebrow">{{ theme.name }}</span>
        <strong>{{ theme.tagline }}</strong>
      </div>
      <div class="qpress-theme-preview__body">
        <div class="qpress-theme-preview__swatches" aria-label="Theme color swatches">
          <span class="qpress-theme-preview__swatch qpress-theme-preview__swatch--primary"></span>
          <span class="qpress-theme-preview__swatch qpress-theme-preview__swatch--secondary"></span>
          <span class="qpress-theme-preview__swatch qpress-theme-preview__swatch--accent"></span>
        </div>
        <p>{{ theme.description }}</p>
        <code class="qpress-theme-preview__code">markdown-token</code>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
type ThemePalette = {
  primary: string
  secondary: string
  accent: string
  lightBg: string
  lightText: string
  darkBg: string
  darkText: string
  codeBg: string
  codeText: string
  shadow: string
}

type ThemePreview = {
  name: string
  tagline: string
  description: string
  palette: ThemePalette
}

const themes: ThemePreview[] = [
  {
    name: 'Default',
    tagline: 'Clean technical docs',
    description: 'A crisp blue and orange palette with neutral surfaces.',
    palette: {
      primary: '#00bfff',
      secondary: '#4b555c',
      accent: '#ea5e13',
      lightBg: '#fefefe',
      lightText: '#4d4d4d',
      darkBg: '#080e1a',
      darkText: '#cbcbcb',
      codeBg: '#f5f5f5',
      codeText: '#4d4d4d',
      shadow: 'rgba(0, 191, 255, 0.22)',
    },
  },
  {
    name: 'Mystic',
    tagline: 'Vivid reference sites',
    description: 'A purple, cyan, and ember palette with a more expressive voice.',
    palette: {
      primary: '#8a2be2',
      secondary: '#00ced1',
      accent: '#ff4500',
      lightBg: '#e6e6fa',
      lightText: '#4b0082',
      darkBg: '#171122',
      darkText: '#e6e6fa',
      codeBg: '#f8f8ff',
      codeText: '#9370db',
      shadow: 'rgba(138, 43, 226, 0.32)',
    },
  },
  {
    name: 'Newspaper',
    tagline: 'Editorial documentation',
    description: 'A restrained black, white, and slate palette for classic docs.',
    palette: {
      primary: '#8793fc',
      secondary: '#333333',
      accent: '#666666',
      lightBg: '#f5f5f5',
      lightText: '#333333',
      darkBg: '#000000',
      darkText: '#ffffff',
      codeBg: '#f5f5f5',
      codeText: '#333333',
      shadow: 'rgba(0, 0, 0, 0.24)',
    },
  },
  {
    name: 'Sunrise',
    tagline: 'Warm product guides',
    description: 'A red, blue, and amber palette with bright approachable contrast.',
    palette: {
      primary: '#e74c3c',
      secondary: '#5186bb',
      accent: '#f39c12',
      lightBg: '#ecf0f1',
      lightText: '#2c3e50',
      darkBg: '#34495e',
      darkText: '#ecf0f1',
      codeBg: '#ecf0f1',
      codeText: '#2c3e50',
      shadow: 'rgba(231, 76, 60, 0.26)',
    },
  },
  {
    name: 'Tawny',
    tagline: 'Earthy knowledge bases',
    description: 'A grounded brown and sand palette for warm, calm documentation.',
    palette: {
      primary: '#8b4513',
      secondary: '#a0522d',
      accent: '#d2691e',
      lightBg: '#f5f5dc',
      lightText: '#5c4033',
      darkBg: '#3e2723',
      darkText: '#f5f5dc',
      codeBg: '#fdfdfd',
      codeText: '#5c4033',
      shadow: 'rgba(139, 69, 19, 0.3)',
    },
  },
]

function getThemeStyle(theme: ThemePreview): Record<string, string> {
  return {
    '--qpress-theme-primary': theme.palette.primary,
    '--qpress-theme-secondary': theme.palette.secondary,
    '--qpress-theme-accent': theme.palette.accent,
    '--qpress-theme-light-bg': theme.palette.lightBg,
    '--qpress-theme-light-text': theme.palette.lightText,
    '--qpress-theme-dark-bg': theme.palette.darkBg,
    '--qpress-theme-dark-text': theme.palette.darkText,
    '--qpress-theme-code-bg': theme.palette.codeBg,
    '--qpress-theme-code-text': theme.palette.codeText,
    '--qpress-theme-shadow': theme.palette.shadow,
  }
}
</script>

<style scoped lang="scss">
.qpress-theme-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 24px 0 32px;
}

.qpress-theme-preview {
  overflow: hidden;
  border: 1px solid var(--qpress-theme-accent);
  border-radius: 14px;
  color: var(--qpress-theme-light-text);
  background: var(--qpress-theme-light-bg);
  box-shadow: 0 18px 36px -28px var(--qpress-theme-shadow);

  &__header {
    display: grid;
    gap: 4px;
    padding: 18px;
    color: var(--qpress-theme-dark-text);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 42%),
      var(--qpress-theme-dark-bg);
    border-bottom: 5px solid var(--qpress-theme-accent);
  }

  &__eyebrow {
    color: var(--qpress-theme-primary);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  &__body {
    display: grid;
    gap: 12px;
    padding: 18px;
  }

  &__swatches {
    display: flex;
    gap: 8px;
  }

  &__swatch {
    width: 34px;
    height: 34px;
    border: 2px solid rgba(0, 0, 0, 0.16);
    border-radius: 50%;

    &--primary {
      background: var(--qpress-theme-primary);
    }

    &--secondary {
      background: var(--qpress-theme-secondary);
    }

    &--accent {
      background: var(--qpress-theme-accent);
    }
  }

  &__code {
    width: fit-content;
    padding: 5px 8px;
    color: var(--qpress-theme-code-text);
    background: var(--qpress-theme-code-bg);
    border: 1px solid var(--qpress-theme-primary);
    border-radius: 6px;
  }
}
</style>
