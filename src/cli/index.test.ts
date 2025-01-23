import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as render from './render'
import * as init from './init'
import * as validate from './validate'
import { cli } from './index'

vi.mock('./render')
vi.mock('./init')
vi.mock('./validate')

describe('CLI', () => {
  const renderSpy = vi.spyOn(render, 'render')
  const initSpy = vi.spyOn(init, 'init')
  const validateSpy = vi.spyOn(validate, 'validate')

  beforeEach(() => {
    renderSpy.mockResolvedValue()
    initSpy.mockResolvedValue()
    validateSpy.mockResolvedValue()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('render', () => {
    const defaultOptions = { outDir: '.' }
    const renderCommand = cli.commands[0]

    it('should call render as default command', () => {
      cli.parse(['node', 'resumefy', 'myresume.json'])
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(renderSpy).toHaveBeenCalledWith('myresume.json', defaultOptions, renderCommand)
    })

    it('should call render with "resume.json" as default if no file name is passed', () => {
      cli.parse(['node', 'resumefy', 'render'])
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(renderSpy).toHaveBeenCalledWith('resume.json', defaultOptions, renderCommand)
    })

    it.each(['-d', '--outDir'])('should call render with passed outDir option using `%s`', (outDirOption) => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', outDirOption, 'output'])
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(renderSpy).toHaveBeenCalledWith('myresume.json', { outDir: 'output' }, renderCommand)
    })

    it.each(['-t', '--theme'])('should call render with passed theme option using `%s`', (themeOption) => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', themeOption, 'jsonresume-theme-even'])
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(renderSpy).toHaveBeenCalledWith(
        'myresume.json',
        { ...defaultOptions, theme: 'jsonresume-theme-even' },
        renderCommand,
      )
    })

    it.each(['-w', '--watch'])('should call render with passed watch option using `%s`', (watchOption) => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', watchOption])
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(renderSpy).toHaveBeenCalledWith('myresume.json', { ...defaultOptions, watch: true }, renderCommand)
    })

    it('should call render with passed headless option', () => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', '--headless'])
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(renderSpy).toHaveBeenCalledWith('myresume.json', { ...defaultOptions, headless: true }, renderCommand)
    })
  })

  describe('init', () => {
    const initCommand = cli.commands[1]

    it('should call init with "resume.json" as default if no file name is passed', () => {
      cli.parse(['node', 'resumefy', 'init'])
      expect(initSpy).toHaveBeenCalledTimes(1)
      expect(initSpy).toHaveBeenCalledWith('resume.json', {}, initCommand)
    })

    it('should call init with passed file name', () => {
      cli.parse(['node', 'resumefy', 'init', 'myresume.json'])
      expect(initSpy).toHaveBeenCalledTimes(1)
      expect(initSpy).toHaveBeenCalledWith('myresume.json', {}, initCommand)
    })

    it.each(['-t', '--theme'])('should call render with passed theme option using `%s`', (themeOption) => {
      cli.parse(['node', 'resumefy', 'init', 'myresume.json', themeOption, 'jsonresume-theme-even'])
      expect(initSpy).toHaveBeenCalledTimes(1)
      expect(initSpy).toHaveBeenCalledWith('myresume.json', { theme: 'jsonresume-theme-even' }, initCommand)
    })
  })

  describe('validate', () => {
    const validateCommand = cli.commands[2]

    it('should call validate with "resume.json" as default if no file name is passed', () => {
      cli.parse(['node', 'resumefy', 'validate'])
      expect(validateSpy).toHaveBeenCalledTimes(1)
      expect(validateSpy).toHaveBeenCalledWith('resume.json', {}, validateCommand)
    })

    it('should call validate with passed file name', () => {
      cli.parse(['node', 'resumefy', 'validate', 'myresume.json'])
      expect(validateSpy).toHaveBeenCalledTimes(1)
      expect(validateSpy).toHaveBeenCalledWith('myresume.json', {}, validateCommand)
    })
  })
})
