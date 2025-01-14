import { underline } from 'ansicolor'
import { loadTheme } from '../render/utils.js'
import { init as writeFile } from '../init.js'
import { InitOptions } from '../types.js'
import { log } from './log.js'

export const init = async (filename: string, options: InitOptions) => {
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
