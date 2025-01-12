import { promises as fs } from 'fs'
import path from 'path'
import { render } from 'resumed'
import type { ResumeBrowser, ResumePage } from '../browser/index.js'
import { validate } from '../validate.js'
import { getTheme } from './utils.js'
import { Resume } from '../types.js'

export const loadFile = async (resumeFile: string): Promise<object> => {
  console.debug('📁', 'Loading resume file...')
  return JSON.parse(await fs.readFile(resumeFile, 'utf-8'))
}

export const validateResume = async (resume: object): Promise<object> => {
  console.debug('🔎', 'Validating resume...')
  validate(resume)
  return resume
}

export const generateHtml = (theme?: string) => async (resume: Resume) => {
  console.debug('📎', 'Render resume...')
  const themeModule = await getTheme(theme, resume)
  return render(resume, themeModule)
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
  return page.browser.writeFiles(dir, name)
}

export const printSuccess = (dir: string, name: string) => () => {
  console.log('🎉', 'Resume rendered successfully\n')
  console.log('Files written:')
  console.log(' - PDF:', path.resolve(path.join(dir, `${name}.pdf`)))
  console.log(' - HTML:', path.resolve(path.join(dir, `${name}.html`)))
}
