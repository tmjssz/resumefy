import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from './render'
import { init } from './init'
import { validate } from './validate'
import { cli } from './index'

vi.mock('./render', () => ({
  render: vi.fn(),
}))
vi.mock('./init', () => ({
  init: vi.fn(),
}))
vi.mock('./validate', () => ({
  validate: vi.fn(),
}))

describe('CLI', () => {
  beforeEach(() => {
    vi.mocked(render).mockResolvedValue(undefined)
    vi.mocked(init).mockResolvedValue(undefined)
    vi.mocked(validate).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('render', () => {
    const defaultOptions = { outDir: '.', port: '8080' }
    const renderCommand = cli.commands[0]

    it('should call render as default command', () => {
      cli.parse(['node', 'resumefy', 'myresume.json'])
      expect(render).toHaveBeenCalledTimes(1)
      expect(render).toHaveBeenCalledWith('myresume.json', defaultOptions, renderCommand)
    })

    it('should call render with "resume.json" as default if no file name is passed', () => {
      cli.parse(['node', 'resumefy', 'render'])
      expect(render).toHaveBeenCalledTimes(1)
      expect(render).toHaveBeenCalledWith('resume.json', defaultOptions, renderCommand)
    })

    it.each(['-d', '--outDir'])('should call render with passed outDir option using `%s`', (outDirOption) => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', outDirOption, 'output'])
      expect(render).toHaveBeenCalledTimes(1)
      expect(render).toHaveBeenCalledWith('myresume.json', { ...defaultOptions, outDir: 'output' }, renderCommand)
    })

    it.each(['-t', '--theme'])('should call render with passed theme option using `%s`', (themeOption) => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', themeOption, 'jsonresume-theme-even'])
      expect(render).toHaveBeenCalledTimes(1)
      expect(render).toHaveBeenCalledWith(
        'myresume.json',
        { ...defaultOptions, theme: 'jsonresume-theme-even' },
        renderCommand,
      )
    })

    it.each(['-p', '--port'])('should call render with passed port option using `%s`', (portOption) => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', portOption, '3333'])
      expect(render).toHaveBeenCalledTimes(1)
      expect(render).toHaveBeenCalledWith('myresume.json', { ...defaultOptions, port: '3333' }, renderCommand)
    })

    it.each(['-w', '--watch'])('should call render with passed watch option using `%s`', (watchOption) => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', watchOption])
      expect(render).toHaveBeenCalledTimes(1)
      expect(render).toHaveBeenCalledWith('myresume.json', { ...defaultOptions, watch: true }, renderCommand)
    })

    it('should call render with passed headless option', () => {
      cli.parse(['node', 'resumefy', 'render', 'myresume.json', '--headless'])
      expect(render).toHaveBeenCalledTimes(1)
      expect(render).toHaveBeenCalledWith('myresume.json', { ...defaultOptions, headless: true }, renderCommand)
    })
  })

  describe('init', () => {
    const initCommand = cli.commands[1]

    it('should call init with "resume.json" as default if no file name is passed', () => {
      cli.parse(['node', 'resumefy', 'init'])
      expect(init).toHaveBeenCalledTimes(1)
      expect(init).toHaveBeenCalledWith('resume.json', {}, initCommand)
    })

    it('should call init with passed file name', () => {
      cli.parse(['node', 'resumefy', 'init', 'myresume.json'])
      expect(init).toHaveBeenCalledTimes(1)
      expect(init).toHaveBeenCalledWith('myresume.json', {}, initCommand)
    })

    it.each(['-t', '--theme'])('should call render with passed theme option using `%s`', (themeOption) => {
      cli.parse(['node', 'resumefy', 'init', 'myresume.json', themeOption, 'jsonresume-theme-even'])
      expect(init).toHaveBeenCalledTimes(1)
      expect(init).toHaveBeenCalledWith('myresume.json', { theme: 'jsonresume-theme-even' }, initCommand)
    })
  })

  describe('validate', () => {
    const validateCommand = cli.commands[2]

    it('should call validate with "resume.json" as default if no file name is passed', () => {
      cli.parse(['node', 'resumefy', 'validate'])
      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate).toHaveBeenCalledWith('resume.json', {}, validateCommand)
    })

    it('should call validate with passed file name', () => {
      cli.parse(['node', 'resumefy', 'validate', 'myresume.json'])
      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate).toHaveBeenCalledWith('myresume.json', {}, validateCommand)
    })
  })
})
