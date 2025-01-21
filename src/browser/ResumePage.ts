import { TimeoutError, type Page } from 'puppeteer'
import { promises as fs } from 'fs'
import path from 'path'
import type { ResumeBrowser } from './ResumeBrowser'
import { log } from '../cli/log'
import { menu } from './menu'

/**
 * Represents a page in the browser
 */
export class ResumePage {
  page: Page
  browser: ResumeBrowser

  constructor(page: Page, browser: ResumeBrowser) {
    this.page = page
    this.browser = browser
  }

  /**
   * Get the content of the page
   * @returns Promise resolving with the content of the page
   */
  async content() {
    return this.page.content()
  }

  /**
   * Set the content of the page
   * @param content Content to set
   * @returns Promise resolving when content is set
   */
  async setContent(content: string) {
    await this.page.setContent(content, { waitUntil: 'networkidle0' })
  }

  /**
   * Write HTML file to the given directory
   * @param dir Directory to write file to
   * @param name Name of the file
   * @returns Promise resolving when file is written
   */
  async html(dir: string, name: string) {
    return fs.writeFile(path.join(dir, `${name}.html`), await this.content())
  }

  /**
   * Write PDF file to the given directory
   * @param dir Directory to write file to
   * @param name Name of the file
   * @returns Promise resolving when file is written
   */
  async pdf(dir: string, name: string) {
    return this.page.pdf({ path: path.join(dir, `${name}.pdf`), format: 'a4', printBackground: true }).catch((err) => {
      if (err instanceof TimeoutError) {
        log.error(err.message)
      } else {
        throw err
      }
    })
  }

  /**
   * Go to a URL
   * @param url URL to go to
   * @returns Promise resolving when page is loaded
   */
  async goto(url: string) {
    return this.page.goto(url, { waitUntil: 'networkidle0' })
  }

  /**
   * Add a menu to the page
   * @param page page to add menu to
   * @param openPreview callback to open preview
   */
  async addMenu(page: Page, openPreview: () => void) {
    try {
      await page.exposeFunction('openPreview', openPreview)
    } catch {
      // Function already exposed
    }

    page.evaluate(menu(openPreview))
  }
}
