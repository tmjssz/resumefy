import { watchFile } from 'fs'
import puppeteer from 'puppeteer'
import { generateHtml, loadFile, printSuccess, renderError, renderPage, validateResume, writeFiles } from './steps.js'
import { ResumeBrowser } from '../browser/index.js'
import { getFilename } from './utils.js'

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
  { watch = false, headless = !watch, theme, outDir = 'result' }: RenderOptions = {},
  browser?: ResumeBrowser,
) => {
  const filename = getFilename(resumeFile)

  let resumeBrowser = browser

  if (!resumeBrowser) {
    const browser = await puppeteer.launch({ defaultViewport: null, headless })
    resumeBrowser = new ResumeBrowser(browser)
  }

  await loadFile(resumeFile)
    .then(validateResume)
    .then(generateHtml(theme))
    .then(renderPage(resumeBrowser))
    .then(writeFiles(outDir, filename))
    .then(printSuccess(outDir, filename))
    .catch(renderError(resumeBrowser))

  if (!browser) {
    if (watch) {
      // Watch resume file for changes
      watchFile(resumeFile, () => {
        console.debug(`\n[${new Date().toISOString()}] ----------------------------------------\n`)
        return render(resumeFile, { outDir }, resumeBrowser)
      })
    } else {
      await resumeBrowser.close()
    }
  }
}
