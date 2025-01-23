import { strip } from 'ansicolor'
import type { Browser, LaunchOptions, Page } from 'puppeteer'
import puppeteer from 'puppeteer'
import ErrorHtmlRenderer from 'error-html'
import { existsSync, promises as fs } from 'fs'
import { ResumePage } from './ResumePage'

/**
 * Represents a browser to render resume
 */
export class ResumeBrowser {
  #browser: Browser
  #errorHtmlRenderer: ErrorHtmlRenderer
  #previewPage: Page | undefined

  constructor(browser: Browser) {
    this.#browser = browser
    this.#errorHtmlRenderer = new ErrorHtmlRenderer({ appPath: process.cwd() })
  }

  static async launch(options?: LaunchOptions) {
    const puppeteerBrowser = await puppeteer.launch(options)
    return new ResumeBrowser(puppeteerBrowser)
  }

  isHeadless() {
    return !!this.#browser.process()?.spawnargs?.some((arg) => arg.includes('--headless'))
  }

  /**
   * Get a specific page of the browser. If the page does not exist, create it.
   * @returns Promise resolving with the requested page of the browser
   */
  async getPage(number: number = 0): Promise<ResumePage> {
    const pages = await this.#browser.pages()
    if (pages.length > number) {
      return new ResumePage(pages[number], this)
    }
    await this.#browser.newPage()
    return this.getPage(number)
  }

  /**
   * Render given content to the first page of the browser
   * @param content Content to render
   * @returns Promise resolving with first page of the browser
   */
  async render(content: string) {
    const page = await this.getPage(0)
    await page.setContent(content)
    return page
  }

  /**
   * Render given error to the first page of the browser (if not in headless mode)
   * @param err Error to render
   * @returns Promise resolving with first page of the browser
   */
  async error(err: unknown) {
    if (this.isHeadless()) {
      // Do not render error in headless mode
      return
    }

    const error = err instanceof Error ? err : new Error(`An error occurred while rendering the resume: ${err}`)
    error.message = strip(error.message)
    error.stack = error.stack ? strip(error.stack) : error.stack
    const htmlError = this.#errorHtmlRenderer.render(error)
    return this.render(htmlError)
  }

  /**
   * Close the browser
   * @returns Promise resolving when browser is closed
   */
  async close() {
    await this.#browser.close()
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

    const page = await this.getPage(0)
    return Promise.all([page.html(dir, name), page.pdf(dir, name)])
  }

  /**
   * Add a preview button to the first page of the browser to open the given file
   * in a new tab (if not in headless mode)
   * @param fileUrl URL to the file to preview
   * @returns Promise resolving when button is added
   */
  async addMenu(fileUrl: string) {
    if (this.isHeadless()) {
      // Do not add menu in headless mode
      return
    }

    const resumePage = await this.getPage(0)

    const openFileInNewPage = async () => {
      if (this.#previewPage && !this.#previewPage.isClosed()) {
        // Bring preview page to front if it is already open
        await this.#previewPage.bringToFront()
      } else {
        // Otherwise open new preview page and navigate to file
        const previewPage = await this.#browser.newPage()
        previewPage.goto(fileUrl)
        this.#previewPage = previewPage
      }
    }

    await resumePage.addMenu(resumePage.page, openFileInNewPage)
  }

  /**
   * Reload the preview page (if not in headless mode)
   * @returns Promise resolving when page is reloaded
   */
  async reloadPreview() {
    if (this.isHeadless()) {
      // Do not reload preview in headless mode
      return
    }

    if (this.#previewPage && !this.#previewPage.isClosed()) {
      try {
        await this.#previewPage.reload()
      } catch {
        // Page has been closed
      }
    }
  }
}
