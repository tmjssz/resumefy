import { bright, underline } from 'ansicolor'
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import { execute, generateHtml, loadFile, renderPage, validateResume, writeFiles } from './steps.js'
import { ResumeBrowser } from '../browser/index.js'
import { getFilename } from './utils.js'
import { RenderOptions } from '../types.js'
import { log } from '../log.js'

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

  await execute([
    loadFile(resumeFile),
    validateResume,
    generateHtml(theme),
    renderPage(resumeBrowser),
    writeFiles(outDir, filename),
  ])
    .then(() => {
      log.success('Resume rendered successfully 🎉')
      console.log('Files written:')
      console.log(`- ${bright('html')}\t`, underline(path.resolve(path.join(outDir, `${filename}.html`))))
      console.log(`- ${bright('pdf')}\t`, underline(path.resolve(path.join(outDir, `${filename}.pdf`))))
    })
    .catch((err) => {
      log.error(err)
      if (!!resumeBrowser && !headless) {
        resumeBrowser.error(err)
      }
    })

  if (!browser) {
    if (watch) {
      // Watch resume file for changes
      fs.watch(resumeFile, (_event, filename) => {
        if (filename) {
          log.dim(`\n[${new Date().toISOString()}] ${underline(filename)} changed\n`)
          return render(resumeFile, { outDir }, resumeBrowser)
        }
        return
      })
      log.dim(`\nWatching ${underline(resumeFile)} for changes...`)
    } else {
      await resumeBrowser.close()
    }
  }
}
