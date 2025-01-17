import { bright, underline } from 'ansicolor'
import { readFile } from 'fs/promises'
import path from 'path'
import { Browser } from 'puppeteer'
import { render as resumedRender } from 'resumed'
import { ResumeBrowser } from '../browser/index.js'
import { getFilename, loadTheme } from './utils.js'
import { ConsoleLog, RenderOptions, Resume, Theme } from '../types.js'
import { log } from '../cli/log.js'
import { validateObject } from '../validate/validate.js'
import { RenderCliOptions } from '../cli/types.js'

/**
 * Renderer class to render resume in browser and save PDF and HTML files.
 */
export class Renderer {
  #resumeFile: string
  #filename: string = 'resume'
  #options: Required<RenderOptions>
  #resume: Resume = {}
  #resumeHtml: string = ''
  #browser: ResumeBrowser
  #cliOptions: RenderCliOptions | undefined
  #themeModule: Theme | undefined

  constructor(
    resumeFile: string,
    { theme, outDir = '.' }: RenderOptions,
    browser: Browser,
    cliOptions?: RenderCliOptions,
  ) {
    this.#resumeFile = resumeFile
    this.#filename = getFilename(this.#resumeFile)
    this.#options = { theme, outDir }
    this.#browser = new ResumeBrowser(browser)
    this.#cliOptions = cliOptions
  }

  /**
   * Parse resume JSON file
   * @param log Optional log function
   */
  async parse(log: ConsoleLog = () => {}) {
    log('📁 ', `Loading ${underline(this.#resumeFile)}`)
    this.#resume = JSON.parse(await readFile(this.#resumeFile, 'utf-8'))
  }

  /**
   * Validate resume JSON
   * @param log Optional log function
   */
  async validate(log: ConsoleLog = () => {}) {
    log('🔎 ', 'Validating resume')
    validateObject(this.#resume)
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
        const logFn = this.#cliOptions ? log.step(i + 1, steps.length) : undefined
        return prev.then(() => step(logFn))
      }, Promise.resolve())
      .catch((err) => {
        this.#browser.error(err)

        if (this.#cliOptions) {
          log.error(err)
        }

        throw err
      })

    if (this.#cliOptions) {
      log.success('Resume rendered successfully 🎉')
      console.log('Files written:')

      const files = ['html', 'pdf']
      files.forEach((ext) => {
        console.log(
          `- ${bright(ext)}\t`,
          underline(path.resolve(path.join(this.#options.outDir, `${this.#filename}.${ext}`))),
        )
      })
    }

    if (!this.#cliOptions || !this.#cliOptions?.watch) {
      await this.close()
    }
  }

  /**
   * Add menu to browser
   */
  async addMenu() {
    if (this.#cliOptions?.watch) {
      await this.#browser.addMenu(path.join(this.#options.outDir, `${this.#filename}.pdf`))
    }
  }

  /**
   * Reload preview
   */
  async reloadPreview() {
    await this.#browser.reloadPreview()
  }

  /**
   * Close browser
   */
  async close() {
    await this.#browser.close()
  }
}
