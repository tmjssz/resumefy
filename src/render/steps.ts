import { promises as fs } from 'fs'
import path from 'path'
import * as theme from '@tmjssz/jsonresume-theme-even'
import { render as resumedRender } from 'resumed'
import type { ResumeBrowser, ResumePage } from '../browser'
import { validate } from '../validate'

type Theme = {
  render: (resume: object) => string
}

export const loadFile = async (resumeFile: string): Promise<object> => {
  console.debug('📁', 'Loading resume file...')
  return JSON.parse(await fs.readFile(resumeFile, 'utf-8'))
}

export const validateResume = async (resume: object): Promise<object> => {
  console.debug('🔎', 'Validating resume...')
  validate(resume)
  return resume
}

export const generateHtml = async (resume: object) => {
  console.debug('📎', 'Render resume...')
  return resumedRender(resume, theme as Theme)
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
