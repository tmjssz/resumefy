import { underline } from 'ansicolor'
import { loadTheme } from '../render/utils.js'
import { init as writeFile } from '../init.js'
import { log } from './log.js'
import { InitCliOptions } from './types.js'

export const init = async (filename: string, options: InitCliOptions) => {
  const { theme } = options

  if (theme) {
    try {
      await loadTheme(theme)
    } catch (err) {
      if (err instanceof Error) {
        log.warn(err.message)
      }
    }
  }

  await writeFile(filename, options)
  log.success(`Created file ${underline(filename)} 🚀`)
}
