import { Notify } from 'quasar'

export function copyToClipboard(text: string): void {
  const textArea = document.createElement('textarea')
  textArea.className = 'fixed-top'
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
  } catch (err) {
    console.error('Unable to copy to clipboard', err)
  } finally {
    document.body.removeChild(textArea)
  }
}

export function copyHeading(id: string): void {
  const text = `${location.origin}${location.pathname}#${id}`
  const el = document.getElementById(id)

  if (el) {
    el.id = '' // Temporarily clear the ID to avoid jumping
  }

  if ('replaceState' in history) {
    history.replaceState(history.state, '', `${location.pathname}#${id}`)
  } else {
    location.hash = `#${id}`
  }

  if (el) {
    setTimeout(() => {
      el.id = id // Restore the ID
    }, 300)
  }

  copyToClipboard(text)

  Notify.create({
    message: 'Anchor has been copied to clipboard.',
    position: 'top',
    actions: [{ icon: 'cancel', color: 'white', dense: true, round: true }],
    timeout: 2000,
  })
}
