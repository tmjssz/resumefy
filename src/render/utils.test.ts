import { describe, it, expect, vi, afterEach } from 'vitest'
import { underline, yellow } from 'ansicolor'
import { getFilename, loadTheme } from './utils'
import { Resume } from '../types'

vi.mock('ansicolor', () => ({
  underline: vi.fn((text) => text),
  yellow: vi.fn((text) => text),
}))

describe('getFilename', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return the filename without extension', () => {
    const path = '/path/to/file/resume.json'
    const filename = getFilename(path)
    expect(filename).toBe('resume')
  })

  it('should throw an error if filename cannot be determined', () => {
    const path = ''
    expect(() => getFilename(path)).toThrow(`Could not get filename from path: ${underline(path)}`)
  })
})

describe('loadTheme', () => {
  const themeName = 'jsonresume-theme-even'

  vi.mock('jsonresume-theme-even', () => ({ foo: 'bar' }))

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should load the theme specified by the theme parameter', async () => {
    const theme = await loadTheme(themeName)
    expect(theme).toBeDefined()
  })

  it('should load the theme specified in the resume meta', async () => {
    const resume: Resume = { meta: { theme: themeName } } as Resume

    const theme = await loadTheme(undefined, resume)
    expect(theme).toBeDefined()
  })

  it('should throw an error if no theme is specified', async () => {
    await expect(() => loadTheme()).rejects.toThrow(
      `No theme name specified. Use "${yellow('--theme')}" option or set "${yellow('meta.theme')}" in resume JSON file.`,
    )
  })

  it('should throw an error if the theme cannot be loaded', async () => {
    const themeName = 'non-existent-theme'
    await expect(() => loadTheme(themeName)).rejects.toThrow(
      `Could not load theme "${yellow(themeName)}". Is it installed?`,
    )
  })
})
