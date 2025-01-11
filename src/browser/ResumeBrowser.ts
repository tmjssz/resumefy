import type { Browser } from 'puppeteer'
import ErrorHtmlRenderer from 'error-html'
import { existsSync, promises as fs } from 'fs'
import { ResumePage } from './ResumePage.js'

/**
 * Represents a browser to render resume
 */
export class ResumeBrowser {
  #browser: Browser
  #errorHtmlRenderer: ErrorHtmlRenderer

  constructor(browser: Browser) {
    this.#browser = browser
    this.#errorHtmlRenderer = new ErrorHtmlRenderer({ appPath: process.cwd() })
  }

  /**
   * Get first page of the browser
   * @returns Promise resolving with first page of the browser
   */
  async getFirstPage() {
    const pages = await this.#browser.pages()
    const firstPage = pages[0] || (await this.#browser.newPage())
    return new ResumePage(firstPage, this)
  }

  /**
   * Render given content to the first page of the browser
   * @param content Content to render
   * @returns Promise resolving with first page of the browser
   */
  async render(content: string) {
    const page = await this.getFirstPage()
    await page.setContent(content)
    return page
  }

  /**
   * Render given error to the first page of the browser
   * @param err Error to render
   * @returns Promise resolving with first page of the browser
   */
  async error(err: unknown) {
    const error = err instanceof Error ? err : new Error(`An error occurred while rendering the resume: ${err}`)
    const htmlError = this.#errorHtmlRenderer.render(error)
    return this.render(htmlError)
  }

  /**
   * Close the browser
   * @returns Promise resolving when browser is closed
   */
  async close() {
    return this.#browser.close()
  }

  /**
   * Write HTML and PDF files to the given directory
   * @param dir Directory to write files to
   * @param name Name of the files
   * @returns Promise resolving when files are written
   */
  async writeFiles(dir: string, name: string) {
    if (!existsSync(dir)) {
      await fs.mkdir(dir)
    }
    const page = await this.getFirstPage()
    return Promise.all([page.html(dir, name), page.pdf(dir, name)])
  }
}
