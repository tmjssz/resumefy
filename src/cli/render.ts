import { underline } from 'ansicolor'
import fs from 'fs'
import puppeteer from 'puppeteer'
import { Renderer } from '../render/Renderer.js'
import { log } from './log.js'
import { RenderCliOptions } from './types.js'

export const render = async (
  resumeFile: string,
  { watch = false, headless = !watch, theme, outDir = '.' }: RenderCliOptions = {},
) => {
  const browser = await puppeteer.launch({
    timeout: 0,
    defaultViewport: null,
    headless,
    pipe: true,
    args: ['--no-sandbox'],
  })

  const renderer = new Renderer(resumeFile, { theme: theme!, outDir }, browser, { watch, headless })

  await renderer
    .render()
    .then(() => renderer.addMenu())
    .catch((err) => {
      log.error(err)
      if (!watch) {
        process.exit(1)
      }
    })

  if (watch) {
    log.dim(`\nWatching ${underline(resumeFile)} for changes...`)

    fs.watch(resumeFile, async (_event, filename) => {
      if (filename) {
        log.dim(`\n[${new Date().toISOString()}]`, underline(filename), 'changed', '\n')
        await renderer
          .render()
          .then(() => Promise.all([renderer.reloadPreview(), renderer.addMenu()]))
          .catch(() => {})
      }
      return
    })
  }
}
