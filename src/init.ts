import sampleResume from '@jsonresume/schema/sample.resume.json' with { type: 'json' }
import { promises as fs } from 'fs'

/**
 * Initialize a new resume JSON file with sample data and optional theme.
 * @param resumeFile File name to write
 * @param theme Name of theme to write in JSON file's meta data (optional)
 */
export const init = async (resumeFile: string, theme?: string) => {
  const resume = theme ? { ...sampleResume, meta: { ...sampleResume.meta, theme } } : sampleResume
  return fs.writeFile(resumeFile, JSON.stringify(resume, null, 2))
}
