import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as utils from '../render/utils'
import * as writeFile from '../init'
import { log } from './log'
import { init } from './init'
import { InitCliOptions } from './types'

vi.mock('ansicolor', () => ({
  underline: vi.fn((text) => text),
}))

vi.mock('../init', () => ({
  init: vi.fn(),
}))

vi.mock('./log', () => ({
  log: {
    warn: vi.fn(),
    success: vi.fn(),
  },
}))

describe('init', () => {
  const filename = 'test-resume.json'
  const options: InitCliOptions = { theme: 'jsonresume-theme-even' }

  const loadThemeSpy = vi.spyOn(utils, 'loadTheme')
  const writeFileSpy = vi.spyOn(writeFile, 'init')

  const successLog = 'Created file test-resume.json 🚀'

  beforeEach(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should load the theme if specified', async () => {
    await init(filename, options)

    expect(utils.loadTheme).toHaveBeenCalledWith(options.theme)
  })

  describe('when loading theme fails', () => {
    it('should log a warning with error message', async () => {
      const error = new Error('Theme load error')
      loadThemeSpy.mockRejectedValue(error)

      await init(filename, options)

      expect(log.warn).toHaveBeenCalledWith(error.message)
    })

    it('should log a warning with rejected value', async () => {
      const error = 'Theme load error'
      loadThemeSpy.mockRejectedValue(error)

      await init(filename, options)

      expect(log.warn).toHaveBeenCalledWith(error)
    })
  })

  it('should write the file with the specified theme', async () => {
    await init(filename, options)

    expect(writeFileSpy).toHaveBeenCalledWith(filename, options.theme)
    expect(log.success).toHaveBeenCalledWith(successLog)
  })

  it('should write the file without a theme if none is specified', async () => {
    const noThemeOptions: InitCliOptions = {}

    await init(filename, noThemeOptions)

    expect(writeFileSpy).toHaveBeenCalledWith(filename, undefined)
    expect(log.success).toHaveBeenCalledWith(successLog)
  })

  it('should throw an error if the theme write fails', async () => {
    const error = new Error('Write error')
    writeFileSpy.mockRejectedValue(error)

    await expect(() => init(filename, options)).rejects.toThrow(error)
    expect(log.success).not.toHaveBeenCalled()
  })
})
