import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import sampleResume from '@jsonresume/schema/sample.resume.json' with { type: 'json' }
import { writeFile } from 'fs/promises'
import { init } from './init'

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
}))

describe('init', () => {
  const resumeFile = 'test-resume.json'

  beforeEach(() => {
    vi.mocked(writeFile).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should write sample resume to file without theme', async () => {
    await init(resumeFile)

    expect(writeFile).toHaveBeenCalledWith(resumeFile, JSON.stringify(sampleResume, null, 2))
  })

  it('should write sample resume to file with theme', async () => {
    const theme = 'jsonresume-theme-even'
    const expectedResume = { ...sampleResume, meta: { ...sampleResume.meta, theme } }

    await init(resumeFile, theme)

    expect(writeFile).toHaveBeenCalledWith(resumeFile, JSON.stringify(expectedResume, null, 2))
  })
})
