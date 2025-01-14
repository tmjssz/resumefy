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
  const browser = await puppeteer.launch({ defaultViewport: null, headless })
  const renderer = new Renderer(resumeFile, { theme: theme!, outDir }, browser, true)

  await renderer.render().catch(() => {
    if (!watch) {
      process.exit(1)
    }
  })

  if (watch) {
    // Watch resume file for changes
    fs.watch(resumeFile, (_event, filename) => {
      if (filename) {
        log.dim(`\n[${new Date().toISOString()}] ${underline(filename)} changed\n`)
        return renderer.render().catch(() => {})
      }
      return
    })
    log.dim(`\nWatching ${underline(resumeFile)} for changes...`)
  }
}
