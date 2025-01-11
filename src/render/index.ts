import { watchFile } from 'fs'
import puppeteer from 'puppeteer'
import { generateHtml, loadFile, printSuccess, renderError, renderPage, validateResume, writeFiles } from './steps.js'
import { ResumeBrowser } from '../browser/index.js'

type RenderOptions = {
  // Directory to save output files
  outDir?: string
  // Run browser in headless mode
  headless?: boolean
  // Watch resume file for changes
  watch?: boolean
  // Theme name to use
  theme?: string
}

/**
 * Render resume in browser and save PDF and HTML files.
 * @param resume JSON object representing resume
 * @param name Name of the output files
 * @param dir Directory to save output files
 */
export const render = async (
  resumeFile: string,
  { watch = false, headless = !watch, theme, name = 'resume', outDir = 'result' }: RenderOptions = {},
  browser?: ResumeBrowser,
) => {
  let resumeBrowser = browser

  if (!resumeBrowser) {
    const browser = await puppeteer.launch({ defaultViewport: null, headless })
    resumeBrowser = new ResumeBrowser(browser)
  }

  await loadFile(resumeFile)
    .then(validateResume)
    .then(generateHtml(theme))
    .then(renderPage(resumeBrowser))
    .then(writeFiles(outDir, name))
    .then(printSuccess(outDir, name))
    .catch(renderError(resumeBrowser))

  if (!browser) {
    if (watch) {
      // Watch resume file for changes
      watchFile(resumeFile, () => {
        console.debug(`\n[${new Date().toISOString()}] ----------------------------------------\n`)
        return render(resumeFile, { name, outDir }, resumeBrowser)
      })
    } else {
      await resumeBrowser.close()
    }
  }
}
