import { underline } from 'ansicolor'
import { loadTheme } from '../render/utils'
import { init as writeFile } from '../init'
import { log } from './log'
import { InitCliOptions } from './types'

export const init = async (filename: string, options: InitCliOptions) => {
  const { theme } = options

  if (theme) {
    try {
      await loadTheme(theme)
    } catch (err) {
      log.warn(err instanceof Error ? err.message : err)
    }
  }

  await writeFile(filename, theme)
  log.success(`Created file ${underline(filename)} 🚀`)
}
