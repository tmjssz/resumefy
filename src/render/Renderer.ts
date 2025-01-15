import { bright, underline } from 'ansicolor'
import fsPromises from 'fs/promises'
import path from 'path'
import { Browser } from 'puppeteer'
import { render as resumedRender } from 'resumed'
import { ResumeBrowser } from '../browser/index.js'
import { getFilename, loadTheme } from './utils.js'
import { ConsoleLog, RenderOptions, Resume, Theme } from '../types.js'
import { log } from '../cli/log.js'
import { validate } from '../validate.js'

/**
 * Renderer class to render resume in browser and save PDF and HTML files.
 */
export class Renderer {
  #resumeFile: string
  #filename: string = 'resume'
  #options: RenderOptions
  #resume: Resume = {}
  #resumeHtml: string = ''
  #browser: ResumeBrowser
  #isCli: boolean = false
  #themeModule: Theme | undefined

  constructor(resumeFile: string, options: RenderOptions, browser: Browser, isCli: boolean = false) {
    this.#resumeFile = resumeFile
    this.#filename = getFilename(this.#resumeFile)
    this.#options = options
    this.#browser = new ResumeBrowser(browser)
    this.#isCli = isCli
  }

  /**
   * Parse resume JSON file
   * @param log Optional log function
   */
  async parse(log: ConsoleLog = () => {}) {
    log('📁 ', `Loading ${underline(this.#resumeFile)}`)
    this.#resume = JSON.parse(await fsPromises.readFile(this.#resumeFile, 'utf-8'))
  }

  /**
   * Validate resume JSON
   * @param log Optional log function
   */
  async validate(log: ConsoleLog = () => {}) {
    log('🔎 ', 'Validating resume')
    validate(this.#resume)
  }

  /**
   * Load theme module
   * @param log Optional log function
   */
  async loadTheme(log: ConsoleLog = () => {}): Promise<void> {
    log('✨ ', 'Loading theme')
    this.#themeModule = await loadTheme(this.#options.theme, this.#resume)
  }

  /**
   * Generate HTML from resume JSON
   * @param log Optional log function
   */
  async generateHtml(log: ConsoleLog = () => {}) {
    log('📎 ', 'Rendering resume')
    if (!this.#themeModule) {
      throw new Error('Theme not loaded')
    }
    this.#resumeHtml = await resumedRender(this.#resume, this.#themeModule)
  }

  /**
   * Render browser page
   * @param log Optional log function
   */
  async renderPage(log: ConsoleLog = () => {}) {
    log('🌐 ', 'Rendering browser page')
    await this.#browser.render(this.#resumeHtml)
  }

  /**
   * Write HTML and PDF files
   * @param log Optional log function
   */
  async writeFiles(log: ConsoleLog = () => {}) {
    log('💾 ', 'Writing files')
    await this.#browser.writeFiles(this.#options.outDir, this.#filename)
  }

  /**
   * Render resume in browser and save PDF and HTML files.
   */
  async render() {
    const steps = [
      this.parse.bind(this),
      this.validate.bind(this),
      this.loadTheme.bind(this),
      this.generateHtml.bind(this),
      this.renderPage.bind(this),
      this.writeFiles.bind(this),
    ]

    await steps
      .reduce(async (prev, step, i) => {
        const logFn = this.#isCli ? log.step(i + 1, steps.length) : undefined
        return prev.then(() => step(logFn))
      }, Promise.resolve())
      .catch((err) => {
        this.#browser.error(err)

        if (this.#isCli) {
          log.error(err)
        }

        throw err
      })

    if (this.#isCli) {
      log.success('Resume rendered successfully 🎉')
      console.log('Files written:')

      const files = ['html', 'pdf']
      files.forEach((ext) => {
        console.log(
          `- ${bright(ext)}\t`,
          underline(path.resolve(path.join(this.#options.outDir, `${this.#filename}.${ext}`))),
        )
      })
    } else {
      await this.close()
    }
  }

  /**
   * Close browser
   */
  async close() {
    await this.#browser.close()
  }
}
