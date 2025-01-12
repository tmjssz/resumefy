import { green, underline } from 'ansicolor'
import { promises as fs } from 'fs'
import path from 'path'
import { render } from 'resumed'
import type { ResumeBrowser, ResumePage } from '../browser/index.js'
import { validate } from '../validate.js'
import { getTheme } from './utils.js'
import { Resume } from '../types.js'
import { log } from '../log.js'

export const loadFile = async (resumeFile: string): Promise<object> => {
  console.log('📁', `Load resume file ${underline(resumeFile)}`)
  return JSON.parse(await fs.readFile(resumeFile, 'utf-8'))
}

export const validateResume = async (resume: object): Promise<object> => {
  console.log('🔎', 'Validate resume')
  validate(resume)
  return resume
}

export const generateHtml = (theme?: string) => async (resume: Resume) => {
  console.log('📎', 'Render resume')
  const themeModule = await getTheme(theme, resume)
  return render(resume, themeModule)
}

export const renderPage = (browser: ResumeBrowser) => async (resumeHtml: string) => {
  console.log('🌐', 'Render browser page')
  return browser.render(resumeHtml)
}

export const renderError = (browser: ResumeBrowser) => async (err: unknown) => {
  log.error(err)
  return browser.error(err)
}

export const writeFiles = (dir: string, name: string) => (page: ResumePage) => {
  console.log('💾', 'Write files')
  return page.browser.writeFiles(dir, name)
}

export const printSuccess = (dir: string, name: string) => () => {
  console.log('🎉', green('Resume rendered successfully'), '\n')
  console.log('Files written:')
  console.log(' - PDF:', underline(path.resolve(path.join(dir, `${name}.pdf`))))
  console.log(' - HTML:', underline(path.resolve(path.join(dir, `${name}.html`))))
}
