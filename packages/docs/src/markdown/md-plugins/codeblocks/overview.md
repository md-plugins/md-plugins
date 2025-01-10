---
title: Codeblocks Plugin
desc: Codeblocks plugin for Markdown.
---

Welcome to the Codeblocks Plugin documentation! This guide will provide you with an overview of the Codeblocks plugin and its features.

## What is the Codeblocks Plugin?

The Codeblocks Plugin is a powerful tool that enhances the standard code block functionality in Markdown. It allows you to create visually appealing and customizable code blocks that can be used to highlight code snippets in your documentation.

## Key Features

- **Syntax Highlighting**: Automatically highlight code syntax for various programming languages.
- **Line Numbers**: Display line numbers alongside your code blocks for better readability.
- **Line Highlighting**: Highlight specific lines of code for emphasis.
- **Add/Remove Lines**: Highlight add or remove lines of code with ease.
- **Tabs**: Organize your code blocks into tabs for easy navigation.
- **Copy to Clipboard**: Add a button to copy code snippets to the clipboard with a single click.
- **Customizable Styles**: Apply custom styles to your code blocks to match your documentation's theme.
- **Responsive Design**: Ensure your code blocks look great on all devices.
- **Fixed Height**: (optional) Maintain a consistent height for your code blocks.

## Supported Language Syntaxes

| Name       | Aliases | Comment                                                     |
| ---------- | ------- | ----------------------------------------------------------- |
| markup     |         | Default, when none applied. Allows codeblocks in codeblocks |
| bash       |         |                                                             |
| javascript | js      |                                                             |
| typescript | ts      |                                                             |
| sass       |         |                                                             |
| scss       |         |                                                             |
| css        |         |                                                             |
| json       |         |                                                             |
| xml        |         |                                                             |
| html       |         |                                                             |
| diff       |         | Special grammar                                             |

## Examples

Here are some examples of what you can achieve with the Codeblocks Plugin:

### Standard Code Block

```js
console.log('Hello, world!')
```

````markup
```js
console.log('Hello, world!')
```
````

### Code Block with Title

```js My Title
console.log('Hello, world!')
```

````markup
```js My Title
console.log('Hello, world!')
```
````

### Code Block with Restricted Height

```js [maxheight=300px]
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer == 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```

````markup
```js [maxheight=300px]
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer == 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```
````

### Code Block with Line Numbers

```js [numbered]
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer == 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```

````markup
```js [numbered]
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```
````

### Code Block with Highlighted Lines

```js [highlight=6-9,15]
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```

````markup
```js [highlight=6-9,15]
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```
````

### Code Block with Internal Highlights

```js
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) { [[! highlight]]
    console.warn('No containers provided to containersPlugin.') [[! highlight]]
    return [[! highlight]]
  } [[! highlight]]

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => { [[! highlight]]
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```

Look for the `[[! highlight]]` on individual lines.

````markup
```js
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) { [[! highlight]]
    console.warn('No containers provided to containersPlugin.') [[! highlight]]
    return [[! highlight]]
  } [[! highlight]]

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => { [[! highlight]]
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```
````

### Code Block with Add/Remove (add/rem) Lines

```js [add=6-9 rem=19]
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```

````markup
```js [add=6-9 rem=19]
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) {
    console.warn('No containers provided to containersPlugin.')
    return
  }

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error)
    }
  })
}
```
````

### Code Block with Internal Add/Remove (add/rem) Lines

```js
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) { [[! add]]
    console.warn('No containers provided to containersPlugin.') [[! add]]
    return [[! add]]
  } [[! add]]

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error) [[! rem]]
    }
  })
}
```

Look for the `[[! add]]` and `[[! rem]]` on individual lines.

````markup
```js
export function containersPlugin(
  md: MarkdownIt,
  containers: ContainerDetails[],
  createContainer: CreateContainerFn,
): void {
  if (!Array.isArray(containers) || containers.length === 0) { [[! add]]
    console.warn('No containers provided to containersPlugin.') [[! add]]
    return [[! add]]
  } [[! add]]

  if (typeof createContainer !== 'function') {
    throw new Error('Invalid createContainer function provided to containersPlugin.')
  }

  containers.forEach(({ type, defaultTitle }) => {
    try {
      md.use(...createContainer(container, type, defaultTitle))
    } catch (error) {
      console.error(`Failed to create container for type: ${type}`, error) [[! rem]]
    }
  })
}
```
````

### Tabs

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-codeblocks
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-codeblocks
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-codeblocks
```

````markup
```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-codeblocks
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-codeblocks
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-codeblocks
```
````

### Advanced Tabs

```tabs
<<| javascript [numbered highlight=2,4 add=3 rem=5] javascript |>>
console.log('Hello, world!'); // Line 1
const a = 10; // Line 2
const b = 20; // Line 3
console.log(a + b); // Line 4
console.log('This line will be removed'); // Line 5
<<| typescript [numbered highlight=2,4 add=3 rem=5] typescript |>>
console.log('Hello, TypeScript!'); // Line 1
const a: number = 10; // Line 2
const b: number = 20; // Line 3
console.log(a + b); // Line 4
console.log('This line will be removed'); // Line 5
<<| bash [numbered highlight=2,4 add=3 rem=5] bash |>>
echo 'Hello, Bash!' # Line 1
VAR1=10 # Line 2
VAR2=20 # Line 3
echo $((VAR1 + VAR2)) # Line 4
echo 'This line will be removed' # Line 5
```

````markup
```tabs
<<| javascript [numbered highlight=2,4 add=3 rem=5] javascript |>>
console.log('Hello, world!'); // Line 1
const a = 10; // Line 2
const b = 20; // Line 3
console.log(a + b); // Line 4
console.log('This line will be removed'); // Line 5
<<| typescript [numbered highlight=2,4 add=3 rem=5] typescript |>>
console.log('Hello, TypeScript!'); // Line 1
const a: number = 10; // Line 2
const b: number = 20; // Line 3
console.log(a + b); // Line 4
console.log('This line will be removed'); // Line 5
<<| bash [numbered highlight=2,4 add=3 rem=5] bash |>>
echo 'Hello, Bash!' # Line 1
VAR1=10 # Line 2
VAR2=20 # Line 3
echo $((VAR1 + VAR2)) # Line 4
echo 'This line will be removed' # Line 5
```
````

### Advanced Tabs with Title

```tabs Examples
<<| javascript [numbered highlight=2,4 add=3 rem=5] javascript |>>
console.log('Hello, world!'); // Line 1
const a = 10; // Line 2
const b = 20; // Line 3
console.log(a + b); // Line 4
console.log('This line will be removed'); // Line 5
<<| typescript [numbered highlight=2,4 add=3 rem=5] typescript |>>
console.log('Hello, TypeScript!'); // Line 1
const a: number = 10; // Line 2
const b: number = 20; // Line 3
console.log(a + b); // Line 4
console.log('This line will be removed'); // Line 5
<<| bash [numbered highlight=2,4 add=3 rem=5] bash |>>
echo 'Hello, Bash!' # Line 1
VAR1=10 # Line 2
VAR2=20 # Line 3
echo $((VAR1 + VAR2)) # Line 4
echo 'This line will be removed' # Line 5
```

````markup
```tabs Examples
<<| javascript [numbered highlight=2,4 add=3 rem=5] javascript |>>
console.log('Hello, world!'); // Line 1
const a = 10; // Line 2
const b = 20; // Line 3
console.log(a + b); // Line 4
console.log('This line will be removed'); // Line 5
<<| typescript [numbered highlight=2,4 add=3 rem=5] typescript |>>
console.log('Hello, TypeScript!'); // Line 1
const a: number = 10; // Line 2
const b: number = 20; // Line 3
console.log(a + b); // Line 4
console.log('This line will be removed'); // Line 5
<<| bash [numbered highlight=2,4 add=3 rem=5] bash |>>
echo 'Hello, Bash!' # Line 1
VAR1=10 # Line 2
VAR2=20 # Line 3
echo $((VAR1 + VAR2)) # Line 4
echo 'This line will be removed' # Line 5
```
````

## Name

The official NPM name is `@md-plugins/md-plugin-codeblocks`.

## Installation

You can install the Codeblocks plugin using npm, yarn, or pnpm. Choose your preferred method below:

```tabs
<<| bash npm |>>
npm install @md-plugins/md-plugin-codeblocks
<<| bash yarn |>>
yarn add @md-plugins/md-plugin-codeblocks
<<| bash pnpm |>>
pnpm add @md-plugins/md-plugin-codeblocks
```

## Configuration

After installing the plugin, you need to configure it in your Markdown-It setup. Here's an example of how to do that:

````javascript
import MarkdownIt from 'markdown-it'
import { codeblocksPlugin } from '@md-plugins/md-plugin-codeblocks'

const md = new MarkdownIt()

md.use(codeblocksPlugin, {
  defaultLang: 'javascript', // Optional: Set the default language
  containerComponent: 'MarkdownPrerender', // Optional: Customize the container component
  copyButtonComponent: 'MarkdownCopyButton', // Optional: Customize the copy button component
  tabPanelTagName: 'q-tab-panel', // Optional: Customize the tab panel tag name
  tabPanelTagClass: 'q-pa-none', // Optional: Customize the tab panel tag class
  preClass: 'markdown-code', // Optional: Customize the class for the pre tag
  codeClass: '', // Optional: Customize the class for the code tag
  pageScripts: [
    "import MarkdownPrerender from 'src/.q-press/components/MarkdownPrerender'", // ts file
    "import MarkdownCopyButton from 'src/.q-press/components/MarkdownCopyButton.vue'",
  ], // Optional: Include page scripts
  langList: [
    { name: 'javascript', aliases: 'javascript|js' },
    { name: 'typescript', aliases: 'typescript|ts' },
  ], // Optional: Customize Prism languages
})

// Now you can use the Codeblocks plugin in your Markdown content
const result = md.render("```javascript\nconsole.log('Hello, world!');\n```")
console.log(result)
````

### Options

The Codeblocks plugin accepts the following options:

- **defaultLang**: The default language to use if none is detected. Default is `markup`.
- **containerComponent**: The component used to wrap code blocks. Default is `MarkdownPrerender`.
- **copyButtonComponent**: The component used to render the copy button. Default is `MarkdownCopyButton`.
- **tabPanelTagName**: The component name for the tab panel. Default is `q-tab-panel`.
- **tabPanelTagClass**: The class(es) to be used with the tab panel. Default is `q-pa-none`.
- **preClass**: The class to be used for the pre tag. Default is `markdown-pre`.
- **codeClass**: The class to be used for the code tag. Default is `markdown-code`.
- **pageScripts**: An array of page scripts to be included.
- **langList**: Optional Prism languages configuration array. Each item can have a name, optional aliases, and customCopy boolean.

## Advanced Configuration

For more advanced configurations, you can combine the Codeblocks plugin with other Markdown-It plugins to enhance your Markdown content further. Here's an example:

````js
import MarkdownIt from 'markdown-it'
import { codeblocksPlugin } from '@md-plugins/md-plugin-codeblocks'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItToc from 'markdown-it-toc-done-right'

const md = new MarkdownIt()

md.use(codeblocksPlugin, {
  defaultLang: 'javascript', // Set the default language
  containerComponent: 'MarkdownPrerender', // Customize the container component
  copyButtonComponent: 'MarkdownCopyButton', // Customize the copy button component
  tabPanelTagName: 'q-tab-panel', // Customize the tab panel tag name
  tabPanelTagClass: 'q-pa-none', // Customize the tab panel tag class
  preClass: 'markdown-pre', // Customize the class for the pre tag
  codeClass: 'markdown-code', // Customize the class for the code tag
  pageScripts: [
    "import MarkdownPrerender from 'src/.q-presss/components/MarkdownPrerender'", // ts file
    "import MarkdownCopyButton from 'src/.q-press/components/MarkdownCopyButton.vue'",
  ], // Include page scripts
  langList: [
    { name: 'javascript', aliases: 'javascript|js' },
    { name: 'typescript', aliases: 'typescript|ts' },
  ], // Customize Prism languages
})
  .use(markdownItAnchor)
  .use(markdownItToc)

// Now you can use the Codeblocks plugin along with other plugins in your Markdown content
const result = md.render(
  "# Table of Contents\n\n[[toc]]\n\n```javascript\nconsole.log('Hello, world!');\n```",
)
console.log(result)
````

## Support

If you have any questions or need assistance, please refer to the FAQ or reach out to our support team.

Happy coding!
