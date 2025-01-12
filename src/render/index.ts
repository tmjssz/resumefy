import { dim } from 'ansicolor'
import { watchFile } from 'fs'
import puppeteer from 'puppeteer'
import { generateHtml, loadFile, printSuccess, renderError, renderPage, validateResume, writeFiles } from './steps.js'
import { ResumeBrowser } from '../browser/index.js'
import { getFilename } from './utils.js'
import { RenderOptions } from '../types.js'

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
        console.log(dim(`\n[${new Date().toISOString()}] Resume file changed`), '\n')
        return render(resumeFile, { outDir }, resumeBrowser)
      })
    } else {
      await resumeBrowser.close()
    }
  }
}
