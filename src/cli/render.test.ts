import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Renderer } from '../render/Renderer'
import { log } from './log'
import { render } from './render'
import * as fs from 'fs'
import { ResumeBrowser } from '../browser'

vi.mock('ansicolor', () => ({
  underline: vi.fn((text) => text),
}))

vi.mock('./log', () => ({
  log: {
    error: vi.fn(),
    dim: vi.fn(),
  },
}))

vi.mock('fs')

describe('render', () => {
  const resumeFile = 'test-resume.json'
  const options = {
    watch: false,
    headless: true,
    theme: 'jsonresume-theme-even',
    outDir: './output',
  }

  const puppeteerOptions = {
    timeout: 0,
    defaultViewport: null,
    headless: options.headless,
    pipe: true,
    args: ['--no-sandbox'],
  }

  const watchSpy = vi.spyOn(fs, 'watch')
  const launchSpy = vi.spyOn(Renderer, 'launch')
  const renderSpy = vi.spyOn(Renderer.prototype, 'render')
  const addMenuSpy = vi.spyOn(Renderer.prototype, 'addMenu')
  const startFileServerSpy = vi.spyOn(Renderer.prototype, 'startFileServer')
  const reloadPreviewSpy = vi.spyOn(Renderer.prototype, 'reloadPreview')
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called')
  })

  let mockFileChange = async (_: string | null) => {}
  const fsWatchMock = (_: fs.PathLike, callback: fs.WatchListener<string> = () => {}) => {
    mockFileChange = async (file: string | null) => callback('change', file)
    return {} as fs.FSWatcher
  }

  beforeEach(() => {
    watchSpy.mockImplementation(fsWatchMock)
    launchSpy.mockImplementation(() => Promise.resolve(new Renderer(resumeFile, options, {} as ResumeBrowser)))
    renderSpy.mockImplementation(() => Promise.resolve())
    addMenuSpy.mockImplementation(() => Promise.resolve())
    startFileServerSpy.mockImplementation(() => {})
    reloadPreviewSpy.mockImplementation(() => Promise.resolve())
    exitSpy.mockImplementation(() => {
      throw new Error('process.exit called')
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should launch Renderer, call render and addMenu', async () => {
    await render(resumeFile, options)

    expect(Renderer.launch).toHaveBeenCalledWith(
      resumeFile,
      { theme: options.theme, outDir: options.outDir },
      puppeteerOptions,
      { watch: options.watch, headless: options.headless },
    )

    expect(Renderer.prototype.render).toHaveBeenCalledTimes(1)
    expect(Renderer.prototype.addMenu).toHaveBeenCalledTimes(1)
    expect(Renderer.prototype.addMenu).toHaveBeenCalledWith(`http://localhost:8080`)
    expect(Renderer.prototype.startFileServer).not.toHaveBeenCalled()
  })

  it('should log error and exit process if render fails and not in watch mode', async () => {
    const error = new Error('Render error')
    renderSpy.mockRejectedValueOnce(error)

    await expect(() => render(resumeFile, options)).rejects.toThrow('process.exit called')

    expect(log.error).toHaveBeenCalledTimes(1)
    expect(log.error).toHaveBeenCalledWith(error)
    expect(exitSpy).toHaveBeenCalledTimes(1)
    expect(exitSpy).toHaveBeenCalledWith(1)

    expect(Renderer.prototype.render).toHaveBeenCalledTimes(1)
    expect(Renderer.prototype.addMenu).not.toHaveBeenCalled()
    expect(Renderer.prototype.startFileServer).not.toHaveBeenCalled()
  })

  describe('watch mode', () => {
    const watchOptions = { ...options, watch: true, headless: false }

    it('should start file server and watch for changes', async () => {
      await render(resumeFile, watchOptions)

      expect(log.dim).toHaveBeenCalledWith('\nWatching test-resume.json for changes...')
      expect(Renderer.prototype.startFileServer).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.startFileServer).toHaveBeenCalledWith(8080)
      expect(fs.watch).toHaveBeenCalledWith(resumeFile, expect.any(Function))
    })

    it('should NOT start file server if is running in headless mode', async () => {
      await render(resumeFile, { ...watchOptions, headless: true })

      expect(log.dim).toHaveBeenCalledWith('\nWatching test-resume.json for changes...')
      expect(Renderer.prototype.startFileServer).not.toHaveBeenCalled()
      expect(fs.watch).toHaveBeenCalledWith(resumeFile, expect.any(Function))
    })

    it('should not exit process if render fails', async () => {
      const error = new Error('Render error')
      renderSpy.mockRejectedValueOnce(error)

      await render(resumeFile, watchOptions)

      expect(log.error).toHaveBeenCalledTimes(1)
      expect(log.error).toHaveBeenCalledWith(error)
      expect(exitSpy).not.toHaveBeenCalled()

      expect(Renderer.prototype.render).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.addMenu).not.toHaveBeenCalled()
      expect(Renderer.prototype.startFileServer).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.startFileServer).toHaveBeenCalledWith(8080)
    })

    it('should reload preview and add menu if resume file changes', async () => {
      const date = new Date(2000, 1, 1, 13)
      vi.setSystemTime(date)

      await render(resumeFile, watchOptions)

      expect(Renderer.prototype.addMenu).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.reloadPreview).not.toHaveBeenCalled()
      expect(log.dim).toHaveBeenCalledTimes(1)

      await mockFileChange(resumeFile)

      expect(log.dim).toHaveBeenCalledTimes(2)
      expect(log.dim).toHaveBeenCalledWith(`\n[${date.toISOString()}]`, resumeFile, 'changed', '\n')
      expect(Renderer.prototype.reloadPreview).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.addMenu).toHaveBeenCalledTimes(2)
    })

    it('should do nothing if watch callback receives filename = null', async () => {
      await render(resumeFile, watchOptions)

      expect(Renderer.prototype.addMenu).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.reloadPreview).not.toHaveBeenCalled()

      await mockFileChange(null)

      expect(log.dim).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.addMenu).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.reloadPreview).not.toHaveBeenCalled()
    })

    it('should not throw if reloading the preview on file change fails', async () => {
      await render(resumeFile, watchOptions)

      expect(Renderer.prototype.addMenu).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.reloadPreview).not.toHaveBeenCalled()

      reloadPreviewSpy.mockRejectedValueOnce(new Error('Reload preview error'))

      await mockFileChange(resumeFile)

      expect(Renderer.prototype.reloadPreview).toHaveBeenCalledTimes(1)
      expect(Renderer.prototype.addMenu).toHaveBeenCalledTimes(2)
    })
  })
})
