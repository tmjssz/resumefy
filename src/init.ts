import { createRequire } from 'node:module'
import { writeFile } from 'fs/promises'

// Not a JSON import attribute: `with { type: 'json' }` needs Node >= 20.10, and this package's
// engines floor is >= 20, so the built CLI would fail to load on 20.0-20.9 — on every command,
// not just init, because this module is in the load path of all of them.
const sampleResume = createRequire(import.meta.url)('@jsonresume/schema/sample.resume.json')

/**
 * Initialize a new resume JSON file with sample data and optional theme.
 * @param resumeFile File name to write
 * @param theme Name of theme to write in JSON file's meta data (optional)
 */
export const init = async (resumeFile: string, theme?: string) => {
  const resume = theme ? { ...sampleResume, meta: { ...sampleResume.meta, theme } } : sampleResume
  return writeFile(resumeFile, JSON.stringify(resume, null, 2))
}
