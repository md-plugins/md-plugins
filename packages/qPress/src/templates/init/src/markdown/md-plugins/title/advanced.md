---
title: Title Plugin Advanced Topics
desc: Title plugin advanced topics for Markdown.
---

## Title Plugin

The `title` plugin allows you to extract the title from your Markdown content and store it in the `env` object. This section will cover how the plugin works, the available options for customization, and examples of how to use it effectively.

### Type Information

```ts
import { PluginSimple } from 'markdown-it'

/**
 * Get markdown page title info
 *
 * Extract it into env
 */
declare const titlePlugin: PluginSimple

declare module '@md-plugins/shared' {
  interface MarkdownItEnv {
    /**
     * The title that extracted by `md-plugin-title`
     */
    title?: string
    heading?: boolean
  }
}

export { titlePlugin }
```

### How It Works

The `title` plugin processes the tokens in your Markdown content, extracting the first `h1` tag and storing its content as the title in the `env` object. This helps manage the title of your Markdown content programmatically.

### Default Behavior

By default, the `title` plugin extracts the content of the first `h1` tag and stores it in the `env.title` property. Here is an example of a Markdown file with a title:

```markdown
# My Awesome Post

This is the content of my awesome post.
```

### Plugin Options

The `title` plugin does not provide any options for customization. It is designed to work out of the box with the default behavior.

### Example Configuration

Here is an example of how you can use the `title` plugin:

```typescript
import MarkdownIt from 'markdown-it'
import { titlePlugin } from '@md-plugins/md-plugin-title'

const md = new MarkdownIt()

md.use(titlePlugin)
```

### Using the Extracted Title

Once the title is extracted, it is stored in the `env.title` property. How you handle this data and send it to the front-end is up to you.

### Integration with Frontmatter Plugin

If you are using the `frontmatter` plugin and one of the items in the frontmatter is `title:`, you do not need to use the `title` plugin. The `frontmatter` plugin will handle the extraction of the title for you. Here is an example of a Markdown file with frontmatter:

```markdown
---
title: My Awesome Post
date: 2023-10-01
tags: [markdown, title, plugin]
---

This is the content of my awesome post.
```

### Conclusion

The `title` plugin is a simple yet powerful tool for extracting the title from your Markdown content. By storing the title in the `env` object, you can manage the title programmatically and use it in your front-end application. If you are using the `frontmatter` plugin with a `title` field, you do not need to use the `title` plugin. Experiment with different configurations and find the one that works best for you.

Happy coding!
