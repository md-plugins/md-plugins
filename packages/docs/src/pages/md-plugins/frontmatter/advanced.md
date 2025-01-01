---
title: Frontmatter Plugin Advanced Topics
desc: Frontmatter plugin advanced topics for Markdown.
---

## Frontmatter Plugin

The `frontmatter` plugin allows you to extract and process frontmatter content from your Markdown files. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### How It Works

Frontmatter is a block of metadata at the top of a Markdown file, enclosed by triple dashes (`---`). The `frontmatter` plugin parses this block and makes the metadata available for use in your Markdown content.

### Default Behavior

By default, the `frontmatter` plugin extracts the frontmatter content and makes it available in the `env` object passed to the Markdown renderer. Here is an example of a Markdown file with frontmatter:

```markdown
---
title: My Awesome Post
date: 2023-10-01
tags: [markdown, frontmatter, plugin]
---
```

### Plugin Options

The frontmatter plugin provides several options for customization. Here are the available options and their descriptions:

#### `grayMatterOptions`

- **Type**: `object`
- **Description**: Options to pass to the `gray-matter` library for parsing frontmatter.

#### `renderExcerpt`

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Whether to render the excerpt using the original `markdown-it` render method.

### Example Configuration

Here is an example of how you can configure the frontmatter plugin with custom options:

```typescript
import MarkdownIt from 'markdown-it'
import { frontmatterPlugin } from '@md-plugins/md-plugin-frontmatter'

const md = new MarkdownIt()

md.use(frontmatterPlugin, {
  grayMatterOptions: {
    excerpt: true,
    excerpt_separator: '<!-- more -->',
  },
  renderExcerpt: true,
})
```

### Using Frontmatter in Templates

Once the frontmatter is extracted and validated, it is stored in the `env` object. How you handle this data and send it to the front-end is up to you. Here is an example of how to use frontmatter in a Vue component:

```html
<template>
  <div>
    <h1>{{ frontmatter.title }}</h1>
    <p>Published on: {{ frontmatter.date }}</p>
    <p>Tags: {{ frontmatter.tags.join(', ') }}</p>
  </div>
</template>

<script setup>
  import { ref } from 'vue'

  const frontmatter = ref({
    title: 'My Awesome Post',
    date: '2023-10-01',
    tags: ['markdown', 'frontmatter', 'plugin'],
  })
</script>
```

### Handling Errors

The frontmatter plugin includes error handling to ensure that any issues with parsing the frontmatter do not break the rendering process. If an error occurs, the plugin will log the error and continue rendering the content without the frontmatter.

```typescript
try {
  // Parse frontmatter and content
  ;({ data, content } = grayMatter(src, grayMatterOptions))
} catch (error) {
  console.error('Failed to parse frontmatter:', error)
  data = {}
  content = src
  excerpt = undefined
}
```

### Conclusion

The frontmatter plugin is a powerful tool for extracting and processing metadata from your Markdown files. By customizing the parsing and validation logic, you can tailor the plugin to fit your specific needs. Remember, it is up to you to handle the extracted frontmatter data and send it to the front-end in a way that suits your application. Experiment with different configurations and find the one that works best for you.

Happy coding!
