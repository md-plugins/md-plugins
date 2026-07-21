import { isAbsolute, relative, resolve, sep } from 'node:path'

const windowsReservedPathSegmentRE = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i

/**
 * Returns whether a file path segment is invalid on at least one supported platform.
 */
function isInvalidOutputPathSegment(segment: string): boolean {
  return (
    Array.from(segment).some((character) => {
      const codePoint = character.codePointAt(0) ?? 0

      return codePoint <= 31 || '<>:"|?*'.includes(character)
    }) ||
    segment.includes('\\') ||
    segment.endsWith('.') ||
    segment.endsWith(' ') ||
    windowsReservedPathSegmentRE.test(segment)
  )
}

/**
 * Resolves a generated or consumed SSG file and ensures it remains inside outDir.
 */
export function resolveSsgOutDirFile(
  outDir: string,
  file: string,
  description = 'SSG file',
): string {
  const resolvedOutDir = resolve(outDir)
  const resolvedFile = resolve(resolvedOutDir, file)
  const relativeFile = relative(resolvedOutDir, resolvedFile)

  if (
    relativeFile === '' ||
    relativeFile === '..' ||
    relativeFile.startsWith(`..${sep}`) ||
    isAbsolute(relativeFile)
  ) {
    throw new Error(`${description} must resolve to a file inside outDir: ${file}`)
  }

  if (relativeFile.split(sep).some(isInvalidOutputPathSegment)) {
    throw new Error(`${description} contains a platform-invalid path segment: ${file}`)
  }

  return resolvedFile
}
