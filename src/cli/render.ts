import { underline } from 'ansicolor'
import fs from 'fs'
import { Renderer } from '../render/Renderer'
import { log } from './log'
import { RenderCliOptions } from './types'

const PORT = 8080
const SERVER_URL = `http://localhost:${PORT}`

export const render = async (
  resumeFile: string,
  { watch = false, headless = !watch, theme, outDir = '.' }: RenderCliOptions = {},
) => {
  const renderer = await Renderer.launch(
    resumeFile,
    { theme: theme!, outDir },
    {
      timeout: 0,
      defaultViewport: null,
      headless,
      pipe: true,
      args: ['--no-sandbox'],
    },
    { watch, headless },
  )

  await renderer
    .render()
    .then(() => renderer.addMenu(SERVER_URL))
    .catch((err) => {
      log.error(err)
      if (!watch) {
        process.exit(1)
      }
    })

  if (watch) {
    log.dim(`\nWatching ${underline(resumeFile)} for changes...`)

    if (!headless) {
      renderer.startFileServer(PORT)
    }

    fs.watch(resumeFile, async (_event, filename) => {
      if (filename) {
        log.dim(`\n[${new Date().toISOString()}]`, underline(filename), 'changed', '\n')
        await renderer
          .render()
          .then(() => Promise.all([renderer.reloadPreview(), renderer.addMenu(SERVER_URL)]))
          .catch(() => {})
      }
      return
    })
  }
}
