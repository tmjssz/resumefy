import { watchFile } from 'fs'
import puppeteer from 'puppeteer'
import { generateHtml, loadFile, printSuccess, renderError, renderPage, validateResume, writeFiles } from './steps'
import { ResumeBrowser } from '../browser'

type RenderOptions = {
  // Directory to save output files
  dir?: string
  // Run browser in headless mode
  headless?: boolean
  // Name of the output files
  name?: string
  // Watch resume file for changes
  watch?: boolean
}

/**
 * Render resume in browser and save PDF and HTML files.
 * @param resume JSON object representing resume
 * @param name Name of the output files
 * @param dir Directory to save output files
 */
export const render = async (
  resumeFile: string,
  { watch = false, headless = !watch, name = 'resume', dir = 'result' }: RenderOptions = {},
  browser?: ResumeBrowser,
) => {
  let resumeBrowser = browser

  if (!resumeBrowser) {
    const browser = await puppeteer.launch({ defaultViewport: null, headless })
    resumeBrowser = new ResumeBrowser(browser)
  }

  await loadFile(resumeFile)
    .then(validateResume)
    .then(generateHtml)
    .then(renderPage(resumeBrowser))
    .then(writeFiles(dir, name))
    .then(printSuccess(dir, name))
    .catch(renderError(resumeBrowser))

  if (!browser) {
    if (watch) {
      // Watch resume file for changes
      watchFile(resumeFile, () => {
        console.debug(`\n[${new Date().toISOString()}] ----------------------------------------\n`)
        return render(resumeFile, { name, dir }, resumeBrowser)
      })
    } else {
      await resumeBrowser.close()
    }
  }
}
