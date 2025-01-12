import { bright, green, underline } from 'ansicolor'
import { promises as fs } from 'fs'
import path from 'path'
import { render } from 'resumed'
import type { ResumeBrowser, ResumePage } from '../browser/index.js'
import { validate } from '../validate.js'
import { getTheme } from './utils.js'
import { Resume } from '../types.js'
import { log } from '../log.js'

export type StepState = {
  current: number
  total: number
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export type StepFn<ReturnType = any, ArgsType extends Array<any> = Array<any>> = (
  step: StepState,
) => (...args: ArgsType) => Promise<ReturnType>

/**
 * Execute a series of steps
 * @param steps Step functions to execute
 * @returns Promise resolving with the result of the last step
 */
export const executeSteps = (steps: StepFn[]) => {
  return steps.reduce(async (prev, next, i) => {
    const nextStep = next({ current: i + 1, total: steps.length })
    return nextStep(await prev)
  }, Promise.resolve())
}

export const loadFileStep =
  (resumeFile: string): StepFn<object> =>
  (step) =>
  async () => {
    log.step(step, '📁 ', `Loading ${underline(resumeFile)}...`)
    return JSON.parse(await fs.readFile(resumeFile, 'utf-8'))
  }

export const validateResume: StepFn<object, [resume: object]> = (step) => async (resume) => {
  log.step(step, '🔎 ', 'Validating resume...')
  validate(resume)
  return resume
}

export const generateHtml =
  (theme?: string): StepFn<string, [resume: Resume]> =>
  (step) =>
  async (resume) => {
    log.step(step, '📎 ', 'Rendering resume...')
    const themeModule = await getTheme(theme, resume)
    return render(resume, themeModule)
  }

export const renderPage =
  (browser: ResumeBrowser): StepFn<ResumePage, [resumeHtml: string]> =>
  (step) =>
  async (resumeHtml) => {
    log.step(step, '🌐 ', 'Rendering browser page...')
    return browser.render(resumeHtml)
  }

export const writeFiles =
  (dir: string, name: string): StepFn<unknown, [page: ResumePage]> =>
  (step) =>
  (page) => {
    log.step(step, '💾 ', 'Writing files...')
    return page.browser.writeFiles(dir, name)
  }

export const renderError = (browser: ResumeBrowser) => async (err: unknown) => {
  log.error(err)
  return browser.error(err)
}

export const printSuccess = (dir: string, name: string) => {
  console.log('\n🎉', bright('Resume rendered successfully'))
  console.log('   Files written:')
  console.log(`    - ${green('[PDF]')}`, underline(path.resolve(path.join(dir, `${name}.pdf`))))
  console.log(`    - ${green('[HTML]')}`, underline(path.resolve(path.join(dir, `${name}.html`))))
}
