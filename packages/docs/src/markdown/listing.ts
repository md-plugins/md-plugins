import { createQPressRouteManifest } from '@/.q-press/router/manifest'

// Kept in this module so Vite produces short local keys and can update the
// Markdown route manifest during dev and build.
const mdPageList = import.meta.glob('./**/*.md')

export const qpressRouteManifest = createQPressRouteManifest(mdPageList)

export default mdPageList
