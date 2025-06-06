import sampleResume from '@jsonresume/schema/sample.resume.json' with { type: 'json' }
import express from 'express'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFile } from 'fs/promises'
import { Renderer } from './Renderer'
import * as resumed from 'resumed'
import * as validateObject from '../validate/validate'
import { RenderOptions } from '../types'
import * as utils from './utils'
import { log } from '../cli/log'
import * as startServer from '../browser/server'
import { ResumeBrowser } from '../browser'

vi.mock('resumed')

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('../browser', () => ({
  ResumeBrowser: {
    launch: vi.fn().mockResolvedValue({ foo: 'bar' }),
  },
}))

describe('Renderer', () => {
  const getFilenameSpy = vi.spyOn(utils, 'getFilename')
  const loadThemeSpy = vi.spyOn(utils, 'loadTheme')
  const resumedRenderSpy = vi.spyOn(resumed, 'render')
  const validateObjectSpy = vi.spyOn(validateObject, 'validateObject')
  const stepLogSpy = vi.spyOn(log, 'step')
  const logSpy = vi.spyOn(log, 'log')
  const successLogSpy = vi.spyOn(log, 'success')
  const startServerSpy = vi.spyOn(startServer, 'startServer')

  const resumeFile = 'test-resume.json'
  const fileName = 'test-resume'
  const options: RenderOptions = {
    theme: 'jsonresume-theme-even',
    outDir: './output',
  }

  const mockResumeBrowser = {
    render: vi.fn(),
    writeFiles: vi.fn(),
    close: vi.fn(),
    error: vi.fn(),
    addMenu: vi.fn(),
    reloadPreview: vi.fn(),
  } as unknown as ResumeBrowser
  const mockRenderResult = '<span>rendered resume</span>'
  const mockThemeModule = { render: vi.fn() }
  const mockStepLogFn = vi.fn()

  beforeEach(() => {
    getFilenameSpy.mockReturnValue(fileName)
    loadThemeSpy.mockResolvedValue(mockThemeModule)
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(sampleResume))
    validateObjectSpy.mockReturnValue(true)
    resumedRenderSpy.mockResolvedValue(mockRenderResult)
    stepLogSpy.mockImplementation(() => mockStepLogFn)
    logSpy.mockImplementation(() => {})
    successLogSpy.mockImplementation(() => {})
    startServerSpy.mockImplementation(() => express())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with correct properties', () => {
    const renderer = new Renderer(resumeFile, options, mockResumeBrowser)
    expect(renderer).toBeDefined()
    expect(getFilenameSpy).toHaveBeenCalledWith(resumeFile)
  })

  describe('launch', () => {
    it('should initialize with correct properties', async () => {
      const renderer = await Renderer.launch(
        resumeFile,
        options,
        { defaultViewport: null, headless: true },
        { watch: true },
      )
      expect(renderer).toBeDefined()
      expect(ResumeBrowser.launch).toHaveBeenCalledTimes(1)
      expect(ResumeBrowser.launch).toHaveBeenCalledWith({ defaultViewport: null, headless: true })
      expect(getFilenameSpy).toHaveBeenCalledWith(resumeFile)
    })
  })

  describe('render', () => {
    it('should perform all render steps', async () => {
      const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

      const browserRenderSpy = vi.spyOn(mockResumeBrowser, 'render')

      await renderer.render()

      expect(readFile).toHaveBeenCalledTimes(1)
      expect(readFile).toHaveBeenCalledWith(resumeFile, 'utf-8')

      expect(validateObjectSpy).toHaveBeenCalledTimes(1)
      expect(validateObjectSpy).toHaveBeenCalledWith(sampleResume)

      expect(loadThemeSpy).toHaveBeenCalledTimes(1)
      expect(loadThemeSpy).toHaveBeenCalledWith(options.theme, sampleResume)

      expect(resumedRenderSpy).toHaveBeenCalledTimes(1)
      expect(resumedRenderSpy).toHaveBeenCalledWith(sampleResume, mockThemeModule)

      expect(browserRenderSpy).toHaveBeenCalledTimes(1)
      expect(browserRenderSpy).toHaveBeenCalledWith(mockRenderResult)

      expect(mockResumeBrowser.writeFiles).toHaveBeenCalledTimes(1)
      expect(mockResumeBrowser.writeFiles).toHaveBeenCalledWith(options.outDir, fileName)

      expect(mockResumeBrowser.close).toHaveBeenCalledTimes(1)
    })

    describe('if has cliOptions', () => {
      it('should print log for each render step', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser, { watch: true })

        await renderer.render()

        expect(stepLogSpy).toHaveBeenCalledTimes(6)
        expect(stepLogSpy).nthCalledWith(1, 1, 6)
        expect(stepLogSpy).nthCalledWith(2, 2, 6)
        expect(stepLogSpy).nthCalledWith(3, 3, 6)
        expect(stepLogSpy).nthCalledWith(4, 4, 6)
        expect(stepLogSpy).nthCalledWith(5, 5, 6)
        expect(stepLogSpy).nthCalledWith(6, 6, 6)

        expect(mockStepLogFn).toHaveBeenCalledTimes(6)
      })

      it('should print success log', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser, { watch: true })

        await renderer.render()

        expect(successLogSpy).toHaveBeenCalledTimes(1)
        expect(successLogSpy).toHaveBeenCalledWith('Resume rendered successfully 🎉')
        expect(logSpy).toHaveBeenCalledTimes(3)
        expect(logSpy).nthCalledWith(1, 'Files written:')
        expect(logSpy).nthCalledWith(
          2,
          expect.stringContaining('html'),
          expect.stringContaining('/output/test-resume.html'),
        )
        expect(logSpy).nthCalledWith(
          3,
          expect.stringContaining('pdf'),
          expect.stringContaining('/output/test-resume.pdf'),
        )
      })

      it('should NOT close browser if `watch` option is true', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser, { watch: true })

        await renderer.render()

        expect(mockResumeBrowser.close).not.toHaveBeenCalled()
      })

      it('should close browser if `watch` option is false', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser, { headless: true, watch: false })

        await renderer.render()

        expect(mockResumeBrowser.close).toHaveBeenCalledTimes(1)
      })

      it('should close browser if `watch` option is not present', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser, { headless: true })

        await renderer.render()

        expect(mockResumeBrowser.close).toHaveBeenCalledTimes(1)
      })

      it('should log error if any render step fails', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser, { watch: true })

        const renderError = new Error('render error')

        resumedRenderSpy.mockRejectedValueOnce(renderError)

        await expect(() => renderer.render()).rejects.toThrow('render error')
      })
    })

    describe('shoud throw error if any render step fails', () => {
      it('reading file fails', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

        const readFileError = new Error('read file error')

        vi.mocked(readFile).mockRejectedValueOnce(readFileError)

        await expect(() => renderer.render()).rejects.toThrow('read file error')

        expect(readFile).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledWith(readFileError)
      })

      it('validation fails', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

        const validateError = new Error('validation error')

        validateObjectSpy.mockRejectedValueOnce(validateError)

        await expect(() => renderer.render()).rejects.toThrow('validation error')

        expect(validateObjectSpy).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledWith(validateError)
      })

      it('loading theme fails', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

        const loadThemeError = new Error('loading theme error')

        loadThemeSpy.mockRejectedValueOnce(loadThemeError)

        await expect(() => renderer.render()).rejects.toThrow('loading theme error')

        expect(loadThemeSpy).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledWith(loadThemeError)
      })

      it('resume rendering fails', async () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

        const renderError = new Error('resume render error')

        resumedRenderSpy.mockRejectedValueOnce(renderError)

        await expect(() => renderer.render()).rejects.toThrow('resume render error')

        expect(resumedRenderSpy).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledWith(renderError)
      })

      it('browser rendering fails', async () => {
        const browserRenderSpy = vi.spyOn(mockResumeBrowser, 'render')

        const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

        const renderError = new Error('browser render error')

        browserRenderSpy.mockRejectedValueOnce(renderError)

        await expect(() => renderer.render()).rejects.toThrow('browser render error')

        expect(browserRenderSpy).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledWith(renderError)
      })

      it('writing files fails', async () => {
        const writeFilesSpy = vi.spyOn(mockResumeBrowser, 'writeFiles')

        const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

        const writeFilesError = new Error('write files error')

        writeFilesSpy.mockRejectedValueOnce(writeFilesError)

        await expect(() => renderer.render()).rejects.toThrow('write files error')

        expect(writeFilesSpy).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledTimes(1)
        expect(mockResumeBrowser.error).toHaveBeenCalledWith(writeFilesError)
      })
    })
  })

  describe('startFileServer', () => {
    it('should start file server listening on default port value', () => {
      const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

      renderer.startFileServer()

      expect(startServerSpy).toHaveBeenCalledTimes(1)
      expect(startServerSpy).toHaveBeenCalledWith(expect.stringContaining('/output'), 8080)
    })

    it('should start file server listening on passed port', () => {
      const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

      renderer.startFileServer(3333)

      expect(startServerSpy).toHaveBeenCalledTimes(1)
      expect(startServerSpy).toHaveBeenCalledWith(expect.stringContaining('/output'), 3333)
    })
  })

  describe('addMenu', () => {
    const serverUrl = 'http://localhost:8080'

    it('should add menu in browser if `watch` option is true', () => {
      const renderer = new Renderer(resumeFile, options, mockResumeBrowser, { watch: true })

      renderer.addMenu(serverUrl)

      expect(mockResumeBrowser.addMenu).toHaveBeenCalledTimes(1)
      expect(mockResumeBrowser.addMenu).toHaveBeenCalledWith('http://localhost:8080/test-resume.pdf')
    })

    describe('should NOT add menu in browser', () => {
      it('if `watch` option is false', () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser, { watch: false })

        renderer.addMenu(serverUrl)

        expect(startServerSpy).not.toHaveBeenCalled()
      })

      it('if `watch` option is not present', () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser, {})

        renderer.addMenu(serverUrl)

        expect(startServerSpy).not.toHaveBeenCalled()
      })

      it('if not cliOptions defined', () => {
        const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

        renderer.addMenu(serverUrl)

        expect(startServerSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe('reloadPreview', () => {
    it('should call `reloadPreview` on browser instance', () => {
      const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

      renderer.reloadPreview()

      expect(mockResumeBrowser.reloadPreview).toHaveBeenCalledTimes(1)
    })
  })

  describe('close', () => {
    it('should call `close` on browser instance', () => {
      const renderer = new Renderer(resumeFile, options, mockResumeBrowser)

      renderer.close()

      expect(mockResumeBrowser.close).toHaveBeenCalledTimes(1)
    })
  })
})
