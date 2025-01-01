---
title: Imports Plugin Advanced Topics
desc: Imports plugin advanced topics for Markdown.
---

## Imports Plugin

The `imports` plugin allows you to extract and store script imports from your Markdown content. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### How It Works

The `imports` plugin processes script import blocks in your Markdown content, extracting the script content and storing it in the `env.pageScripts` set. This allows you to manage and use script imports in your Markdown content.

### Default Behavior

::: tip
Here we are adding a space after the first `<` to avoid parsing our examples. In your own code, be sure to remove that space when the functionality is required.
:::

By default, the `imports` plugin replaces script import blocks (delimited by `<script script import>` and `</script>`) with an empty string and adds the extracted script content to the `env.pageScripts` set. Here is an example of a Markdown file with script imports:

```markdown
< script import>
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'
</>

# My Awesome Post

This post uses some imported components.
```

### Plugin Options

The `imports` plugin does not provide any options for customization. It is designed to work out of the box with the default behavior.

### Example Configuration

Here is an example of how you can use the `imports` plugin:

```typescript
import MarkdownIt from 'markdown-it'
import { importsPlugin } from '@md-plugins/md-plugin-imports'

const md = new MarkdownIt()

md.use(importsPlugin)
```

### Using Extracted Scripts

Once the script imports are extracted, they are stored in the `env.pageScripts` set. How you handle this data and send it to the front-end is up to you. Here is an example of how to use the extracted scripts in a Vue component:

```vue
<template>
  <div>
    <h1>My Awesome Post</h1>
    <MyComponent />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

// The extracted scripts would be included here
</script>
```

### Handling Errors

The `imports` plugin includes error handling to ensure that any issues with parsing the script imports do not break the rendering process. If an error occurs, the plugin will log the error and continue rendering the content without the script imports.

### Conclusion

The `imports` plugin is a powerful tool for extracting and storing script imports from your Markdown content. By managing the extracted scripts in the `env.pageScripts` set, you can tailor the plugin to fit your specific needs. Remember, it is up to you to handle the extracted script data and send it to the front-end in a way that suits your application. Experiment with different configurations and find the one that works best for you.

Happy coding!
