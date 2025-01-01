---
title: Headers Plugin Advanced Topics
desc: Headers plugin advanced topics for Markdown.
---

## Headers Plugin

The `headers` plugin allows you to add custom classes to headers and generate a table of contents (TOC) in your Markdown content. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### How It Works

The `headers` plugin processes headers in your Markdown content, adding custom classes and generating a TOC. The TOC is stored in the `env` object passed to the Markdown renderer.

### Default Behavior

By default, the `headers` plugin adds custom classes to headers and generates a TOC for headers at levels 2 and 3. Here is an example of a Markdown file with headers:

```markdown
# My Awesome Post

## Introduction

## Details

### Subsection

## Conclusion
```

### Plugin Options

The `headers` plugin provides several options for customization. Here are the available options and their descriptions:

#### `level`

- **Type**: `number[]`
- **Default**: `[2, 3]`
- **Description**: The levels of headers to include in the TOC.

#### `slugify`

- **Type**: `function`
- **Default**: `defaultSlugify`
- **Description**: A custom function to generate slugs for the headers.

#### `format`

- **Type**: `function`
- **Description**: A custom function to format the header titles.

### Example Configuration

Here is an example of how you can configure the `headers` plugin with custom options:

```typescript
import MarkdownIt from 'markdown-it'
import { headersPlugin } from '@md-plugins/md-plugin-headers'
import { slugify as customSlugify } from './custom-slugify'

const md = new MarkdownIt()

md.use(headersPlugin, {
  level: [2, 3, 4],
  slugify: customSlugify,
  format: (str) => str.toUpperCase(),
})
```

### Using the TOC

Once the TOC is generated, it is stored in the `env` object. How you handle this data and send it to the front-end is up to you. Here is an example of how to use the TOC in a Vue component:

```vue
<template>
  <div>
    <h1>Table of Contents</h1>
    <ul>
      <li v-for="item in toc" :key="item.id">
        <a :href="'#' + item.id">{{ item.title }}</a>
        <ul v-if="item.sub">
          <li v-for="subItem in item.sub" :key="subItem.id">
            <a :href="'#' + subItem.id">{{ subItem.title }}</a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toc = ref([
  { id: 'introduction', title: 'Introduction' },
  { id: 'details', title: 'Details', sub: [{ id: 'subsection', title: 'Subsection' }] },
  { id: 'conclusion', title: 'Conclusion' },
])
</script>
```

### Default CSS

By default, the `headers` plugin applies specific CSS classes to different levels of headers. You can add these classes in your CSS to customize the appearance of headers.

```scss
.markdown-h1 {
  font-size: 2.4em;
  font-weight: 700;
  margin: 0 0 1em !important;
  display: flex;
  align-items: center;
}

.markdown-h2 {
  font-size: 1.8em;
  font-weight: 600;
  padding-bottom: 8px !important;
  border-bottom: 1px solid $separator-color;
}

.markdown-h3 {
  font-size: 1.6em;
  font-weight: 500;
}

.markdown-h4 {
  font-size: 1.4em;
  font-weight: 500;
  &:before {
    content: '» ';
    vertical-align: text-top;
  }
}

.markdown-h5 {
  font-size: 1em;
  font-weight: 500;
  &:before {
    content: '»» ';
    vertical-align: text-top;
  }
}

.markdown-h6 {
  font-size: 1em;
  font-weight: 400;
  &:before {
    content: '»»» ';
    vertical-align: text-top;
  }
}

@media (max-width: 850px) {
  .markdown-h1 {
    font-size: 1.7em;
  }
  .markdown-h2 {
    font-size: 1.4em;
  }
  .markdown-h3 {
    font-size: 1.3em;
  }
  .markdown-h4 {
    font-size: 1.2em;
  }
  .markdown-h5 {
    font-size: 1.1em;
  }
}
```

### Conclusion

The `headers` plugin is a powerful tool for adding custom classes to headers and generating a TOC in your Markdown content. By customizing the levels, slugify function, and format function, you can tailor the plugin to fit your specific needs. Remember, it is up to you to handle the generated TOC data and send it to the front-end in a way that suits your application. Experiment with different configurations and find the one that works best for you.

Happy coding!
