<template>
  <div class="qpress-theme-gallery">
    <article
      v-for="theme in themes"
      :key="theme.name"
      class="qpress-theme-preview"
      :style="getThemeStyle(theme)"
    >
      <div class="qpress-theme-preview__heading">
        <span class="qpress-theme-preview__eyebrow">{{ theme.name }}</span>
        <strong>{{ theme.tagline }}</strong>
        <p>{{ theme.description }}</p>
      </div>

      <div class="qpress-theme-preview__pair">
        <section class="qpress-theme-preview__panel qpress-theme-preview__panel--light">
          <span class="qpress-theme-preview__surface">Light</span>
          <div class="qpress-theme-preview__swatches" aria-label="Light theme color swatches">
            <span class="qpress-theme-preview__swatch qpress-theme-preview__swatch--primary"></span>
            <span
              class="qpress-theme-preview__swatch qpress-theme-preview__swatch--secondary"
            ></span>
            <span class="qpress-theme-preview__swatch qpress-theme-preview__swatch--accent"></span>
          </div>
          <p>Light surface, body text, and inline token treatment.</p>
          <code class="qpress-theme-preview__code qpress-theme-preview__code--light"
            >markdown-token</code
          >
          <div class="qpress-theme-preview__step qpress-theme-preview__step--light">
            <span class="qpress-theme-preview__step-marker qpress-theme-preview__step-marker--light"
              >1</span
            >
            <div class="qpress-theme-preview__step-body">
              <strong>Install package</strong>
              <p>Run the install command and keep markdown content readable.</p>
            </div>
          </div>
        </section>

        <section class="qpress-theme-preview__panel qpress-theme-preview__panel--dark">
          <span class="qpress-theme-preview__surface">Dark</span>
          <div class="qpress-theme-preview__swatches" aria-label="Dark theme color swatches">
            <span class="qpress-theme-preview__swatch qpress-theme-preview__swatch--primary"></span>
            <span
              class="qpress-theme-preview__swatch qpress-theme-preview__swatch--secondary"
            ></span>
            <span class="qpress-theme-preview__swatch qpress-theme-preview__swatch--accent"></span>
          </div>
          <p>Dark surface, body text, and inline token treatment.</p>
          <code class="qpress-theme-preview__code qpress-theme-preview__code--dark"
            >markdown-token</code
          >
          <div class="qpress-theme-preview__step qpress-theme-preview__step--dark">
            <span class="qpress-theme-preview__step-marker qpress-theme-preview__step-marker--dark"
              >2</span
            >
            <div class="qpress-theme-preview__step-body">
              <strong>Configure docs</strong>
              <p>Steps should feel like another Q-Press panel, not a separate theme.</p>
            </div>
          </div>
        </section>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
type ThemePalette = {
  primary: string
  secondary: string
  accent: string
  medium: string
  lightBorder: string
  darkBorder: string
  lightBg: string
  lightText: string
  lightCodeBg: string
  lightCodeText: string
  darkBg: string
  darkText: string
  darkCodeBg: string
  darkCodeText: string
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
      medium: '#6b7f86',
      lightBorder: '#ea5e13',
      darkBorder: 'rgba(107, 127, 134, 0.68)',
      lightBg: '#fefefe',
      lightText: '#4d4d4d',
      lightCodeBg: '#f5f5f5',
      lightCodeText: '#4d4d4d',
      darkBg: '#080e1a',
      darkText: '#cbcbcb',
      darkCodeBg: '#121212',
      darkCodeText: '#e6e6e6',
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
      medium: '#9370db',
      lightBorder: '#ff4500',
      darkBorder: 'rgba(147, 112, 219, 0.68)',
      lightBg: '#e6e6fa',
      lightText: '#4b0082',
      lightCodeBg: '#f8f8ff',
      lightCodeText: '#9370db',
      darkBg: '#171122',
      darkText: '#e6e6fa',
      darkCodeBg: '#4b0082',
      darkCodeText: '#e6e6fa',
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
      medium: '#808080',
      lightBorder: '#666666',
      darkBorder: 'rgba(128, 128, 128, 0.68)',
      lightBg: '#f5f5f5',
      lightText: '#333333',
      lightCodeBg: '#f5f5f5',
      lightCodeText: '#333333',
      darkBg: '#000000',
      darkText: '#ffffff',
      darkCodeBg: '#1a1a1a',
      darkCodeText: '#e6e6e6',
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
      medium: '#95a5a6',
      lightBorder: '#f39c12',
      darkBorder: 'rgba(236, 240, 241, 0.28)',
      lightBg: '#ecf0f1',
      lightText: '#2c3e50',
      lightCodeBg: '#ecf0f1',
      lightCodeText: '#2c3e50',
      darkBg: '#34495e',
      darkText: '#ecf0f1',
      darkCodeBg: '#2c3e50',
      darkCodeText: '#ecf0f1',
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
      medium: '#c19a6b',
      lightBorder: '#8b4513',
      darkBorder: 'rgba(210, 105, 30, 0.62)',
      lightBg: '#f5f5dc',
      lightText: '#5c4033',
      lightCodeBg: '#fdfdfd',
      lightCodeText: '#5c4033',
      darkBg: '#3e2723',
      darkText: '#f5f5dc',
      darkCodeBg: '#5c4033',
      darkCodeText: '#f5f5dc',
      shadow: 'rgba(139, 69, 19, 0.3)',
    },
  },
  {
    name: 'Evergreen',
    tagline: 'Durable field manuals',
    description: 'A spruce, moss, and amber palette for calm long-lived docs.',
    palette: {
      primary: '#14b8a6',
      secondary: '#3f8f68',
      accent: '#f59e0b',
      medium: '#6b8f7a',
      lightBorder: '#f59e0b',
      darkBorder: 'rgba(107, 143, 122, 0.68)',
      lightBg: '#f3faf6',
      lightText: '#173b2f',
      lightCodeBg: '#e6f6ee',
      lightCodeText: '#0f5132',
      darkBg: '#071914',
      darkText: '#d7f3e6',
      darkCodeBg: '#0e2a22',
      darkCodeText: '#b8f5d4',
      shadow: 'rgba(20, 184, 166, 0.28)',
    },
  },
]

function getThemeStyle(theme: ThemePreview): Record<string, string> {
  return {
    '--qpress-theme-primary': theme.palette.primary,
    '--qpress-theme-secondary': theme.palette.secondary,
    '--qpress-theme-accent': theme.palette.accent,
    '--qpress-theme-medium': theme.palette.medium,
    '--qpress-theme-light-border': theme.palette.lightBorder,
    '--qpress-theme-dark-border': theme.palette.darkBorder,
    '--qpress-theme-light-bg': theme.palette.lightBg,
    '--qpress-theme-light-text': theme.palette.lightText,
    '--qpress-theme-light-code-bg': theme.palette.lightCodeBg,
    '--qpress-theme-light-code-text': theme.palette.lightCodeText,
    '--qpress-theme-dark-bg': theme.palette.darkBg,
    '--qpress-theme-dark-text': theme.palette.darkText,
    '--qpress-theme-dark-code-bg': theme.palette.darkCodeBg,
    '--qpress-theme-dark-code-text': theme.palette.darkCodeText,
    '--qpress-theme-shadow': theme.palette.shadow,
  }
}
</script>

<style scoped lang="scss">
.qpress-theme-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
  gap: 18px;
  margin: 24px 0 32px;
}

.qpress-theme-preview {
  overflow: hidden;
  border: 1px solid var(--qpress-theme-light-border);
  border-radius: 16px;
  background: var(--qpress-theme-light-bg);
  box-shadow: 0 18px 36px -28px var(--qpress-theme-shadow);

  &__heading {
    display: grid;
    gap: 6px;
    padding: 18px 20px;
    color: var(--qpress-theme-dark-text);
    background:
      linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent 42%),
      var(--qpress-theme-dark-bg);
    border-bottom: 5px solid var(--qpress-theme-dark-border);

    p {
      margin: 0;
      opacity: 0.86;
    }
  }

  &__eyebrow,
  &__surface {
    color: var(--qpress-theme-primary);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  &__pair {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &__panel {
    display: grid;
    align-content: start;
    gap: 12px;
    min-height: 230px;
    padding: 18px;

    p {
      margin: 0;
    }

    &--light {
      color: var(--qpress-theme-light-text);
      background: var(--qpress-theme-light-bg);
    }

    &--dark {
      color: var(--qpress-theme-dark-text);
      background: var(--qpress-theme-dark-bg);
      border-left: 1px solid var(--qpress-theme-dark-border);

      .qpress-theme-preview__swatch {
        border-color: rgba(255, 255, 255, 0.22);
      }
    }
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
    border: 1px solid var(--qpress-theme-primary);
    border-radius: 6px;

    &--light {
      color: var(--qpress-theme-light-code-text);
      background: var(--qpress-theme-light-code-bg);
    }

    &--dark {
      color: var(--qpress-theme-dark-code-text);
      background: var(--qpress-theme-dark-code-bg);
    }
  }

  &__step {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding: 14px;
    border: 1px solid transparent;
    border-radius: 10px;
    box-shadow: 0 10px 20px -18px var(--qpress-theme-shadow);

    p {
      margin: 4px 0 0;
      line-height: 1.45;
    }

    &--light {
      color: var(--qpress-theme-light-text);
      background: var(--qpress-theme-light-code-bg);
      border-color: var(--qpress-theme-light-border);
    }

    &--dark {
      color: var(--qpress-theme-dark-text);
      background: var(--qpress-theme-dark-code-bg);
      border-color: var(--qpress-theme-dark-border);
    }
  }

  &__step-marker {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-weight: 700;
    line-height: 1;

    &--light {
      color: var(--qpress-theme-light-bg);
      background: var(--qpress-theme-primary);
    }

    &--dark {
      color: var(--qpress-theme-dark-bg);
      background: var(--qpress-theme-primary);
    }
  }

  &__step-body {
    min-width: 0;
  }
}

@media (max-width: 600px) {
  .qpress-theme-gallery {
    grid-template-columns: 1fr;
  }

  .qpress-theme-preview__pair {
    grid-template-columns: 1fr;
  }

  .qpress-theme-preview__panel--dark {
    border-top: 1px solid var(--qpress-theme-dark-border);
    border-left: 0;
  }
}
</style>
