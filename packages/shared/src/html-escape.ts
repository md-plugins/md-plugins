const htmlEscapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}

const htmlEscapeRegexp = /[&<>'"]/g

/**
 * Escapes HTML-sensitive characters so text can be safely injected into markup.
 */
export const htmlEscape = (str: string): string =>
  str.replace(htmlEscapeRegexp, (char) => htmlEscapeMap[char as keyof typeof htmlEscapeMap])
