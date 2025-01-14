import { dim, underline } from 'ansicolor'
import { promises as fs } from 'fs'
import path from 'path'
import { render } from 'resumed'
import type { ResumeBrowser, ResumePage } from '../browser/index.js'
import { validate } from '../validate.js'
import { getTheme } from './utils.js'
import { Resume } from '../types.js'

export type Step<ReturnType, ArgsType extends Array<unknown> = []> = {
  text: string
  icon: string
  fn: (...args: ArgsType) => Promise<ReturnType>
}

export const loadFile = (resumeFile: string): Step<object> => ({
  text: `Loading ${underline(resumeFile)}`,
  icon: '📁',
  fn: async () => JSON.parse(await fs.readFile(resumeFile, 'utf-8')),
})

export const validateResume: Step<Resume, [resume: object]> = {
  text: 'Validating resume',
  icon: '🔎',
  fn: async (resume) => {
    validate(resume)
    return resume
  },
}

export const generateHtml = (theme?: string): Step<string, [resume: Resume]> => ({
  text: 'Rendering resume',
  icon: '📎',
  fn: async (resume) => {
    const themeModule = await getTheme(theme, resume)
    return render(resume, themeModule)
  },
})

export const renderPage = (browser: ResumeBrowser): Step<ResumePage, [resumeHtml: string]> => ({
  text: 'Rendering browser page',
  icon: '🌐',
  fn: async (resumeHtml) => browser.render(resumeHtml),
})

export const writeFiles = (dir: string, name: string): Step<unknown, [page: ResumePage]> => ({
  text: 'Writing files',
  icon: '💾',
  fn: async (page) => page.browser.writeFiles(dir, name),
})

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type StepArray = Array<Step<any, any[]>>

/**
 * Execute a series of steps sequentially.
 * @param steps Step functions to execute
 * @returns Promise resolving with the result of the last step
 */
export const execute = (steps: StepArray) => {
  return steps.reduce(
    (prev, { icon, text, fn }, i) =>
      prev.then((...args) => {
        const stepNumber = dim(`[${i + 1}/${steps.length}]`)
        console.log(stepNumber, `${icon}  ${text}`)
        return fn(...args)
      }),
    Promise.resolve(),
  )
}
