import sampleResume from '@jsonresume/schema/sample.resume.json' with { type: 'json' }
import { promises as fs } from 'fs'
import { InitOptions } from './types.js'

/**
 * Initialize a new resume file with sample data and optional theme.
 * @param filename file name to write
 * @param options init options
 */
export const init = async (filename: string, options: InitOptions) => {
  const { theme } = options
  const resume = theme ? { ...sampleResume, meta: { ...sampleResume.meta, theme } } : sampleResume

  return fs.writeFile(filename, JSON.stringify(resume, null, 2))
}
