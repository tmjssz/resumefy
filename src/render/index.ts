import { dim, underline } from 'ansicolor'
import fs from 'fs'
import puppeteer from 'puppeteer'
import {
  executeSteps,
  generateHtml,
  loadFileStep,
  printSuccess,
  renderError,
  renderPage,
  validateResume,
  writeFiles,
} from './steps.js'
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
  { watch = false, headless = !watch, theme, outDir = '.' }: RenderOptions = {},
  browser?: ResumeBrowser,
) => {
  const filename = getFilename(resumeFile)

  let resumeBrowser = browser

  if (!resumeBrowser) {
    const browser = await puppeteer.launch({ defaultViewport: null, headless })
    resumeBrowser = new ResumeBrowser(browser)
  }

  await executeSteps([
    loadFileStep(resumeFile),
    validateResume,
    generateHtml(theme),
    renderPage(resumeBrowser),
    writeFiles(outDir, filename),
  ])
    .then(() => printSuccess(outDir, filename))
    .catch(renderError(resumeBrowser))

  if (!browser) {
    if (watch) {
      // Watch resume file for changes
      fs.watch(resumeFile, (_event, filename) => {
        if (filename) {
          console.log(dim(`\n[${new Date().toISOString()}] ${underline(filename)} changed`), '\n')
          return render(resumeFile, { outDir }, resumeBrowser)
        }
        return
      })
      console.log(dim(`\nWatching ${underline(resumeFile)} for changes...`))
    } else {
      await resumeBrowser.close()
    }
  }
}
