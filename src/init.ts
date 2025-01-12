import sampleResume from '@jsonresume/schema/sample.resume.json' with { type: 'json' }
import { promises as fs } from 'fs'
import { InitOptions } from './types.js'
import { getTheme } from './render/utils.js'

export const init = async (filename: string, options: InitOptions) => {
  const { theme } = options

  if (theme) {
    try {
      await getTheme(theme)
    } catch (err) {
      if (err instanceof Error) {
        console.warn(err.message)
      }
    }
  }

  const resume = theme ? { ...sampleResume, meta: { ...sampleResume.meta, theme } } : sampleResume

  await fs.writeFile(filename, JSON.stringify(resume, null, 2))
  console.log('🚀', `Created file ${filename}`)
}
