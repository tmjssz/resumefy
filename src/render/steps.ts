import { promises as fs } from 'fs'
import path from 'path'
import { render as resumedRender } from 'resumed'
import type { ResumeBrowser, ResumePage } from '../browser/index.js'
import { validate } from '../validate.js'
import { Theme } from '../types.js'

export const loadFile = async (resumeFile: string): Promise<object> => {
  console.debug('📁', 'Loading resume file...')
  return JSON.parse(await fs.readFile(resumeFile, 'utf-8'))
}

export const validateResume = async (resume: object): Promise<object> => {
  console.debug('🔎', 'Validating resume...')
  validate(resume)
  return resume
}

interface Resume {
  meta?: {
    theme?: string
  }
}

export const generateHtml = (theme?: string) => async (resume: Resume) => {
  console.debug('📎', 'Render resume...')
  const themeName = theme ?? resume?.meta?.theme

  if (!themeName) {
    const helpText = `Use "--theme" option or set "meta.theme" in resume JSON file.`
    throw new Error(`No theme name specified. ${helpText}`)
  }

  let themeModule: Theme
  try {
    themeModule = await import(themeName)
  } catch {
    throw new Error(`Could not load theme "${themeName}". Is it installed?`)
  }

  return resumedRender(resume, themeModule)
}

export const renderPage = (browser: ResumeBrowser) => async (resumeHtml: string) => {
  console.debug('🌐', 'Render browser page...')
  return browser.render(resumeHtml)
}

export const renderError = (browser: ResumeBrowser) => async (err: unknown) => {
  console.error('❌', err)
  return browser.error(err)
}

export const writeFiles = (dir: string, name: string) => (page: ResumePage) => {
  console.debug('💾', 'Write files...')
  const browser = page.browser
  return browser.writeFiles(dir, name)
}

export const printSuccess = (dir: string, name: string) => () => {
  console.log('🎉', 'Resume rendered successfully\n')
  console.log('Files written:')
  console.log(' - PDF:', path.resolve(path.join(dir, `${name}.pdf`)))
  console.log(' - HTML:', path.resolve(path.join(dir, `${name}.html`)))
}
