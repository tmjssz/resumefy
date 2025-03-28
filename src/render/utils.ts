import { underline, yellow } from 'ansicolor'
import { basename, extname } from 'path'
import { Resume, Theme } from '../types'

/**
 * Get the filename from a path
 * @param path Path to file
 * @returns filename without extension
 */
export const getFilename = (path: string) => {
  const fileBasename = basename(path)
  const extension = extname(path)
  const filename = fileBasename.match(new RegExp(`(.+)${extension}`))?.[1]

  if (!filename) {
    throw new Error(`Could not get filename from path: ${underline(path)}`)
  }

  return filename
}

/**
 * Get the theme to use for rendering
 * @param theme Theme name
 * @param resume Resume object
 * @returns Theme object
 */
export const loadTheme = async (theme?: string, resume?: Resume): Promise<Theme> => {
  const themeName = theme ?? resume?.meta?.theme

  if (!themeName) {
    const helpText = `Use "${yellow('--theme')}" option or set "${yellow('meta.theme')}" in resume JSON file.`
    throw new Error(`No theme name specified. ${helpText}`)
  }

  try {
    const themeModule = await import(themeName)
    return themeModule
  } catch {
    throw new Error(`Could not load theme "${yellow(themeName)}". Is it installed?`)
  }
}
