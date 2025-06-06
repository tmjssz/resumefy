import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFile } from 'fs/promises'
import { log } from './log'
import * as validateObject from '../validate/validate'
import { validate } from './validate'

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('./log', () => ({
  log: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('validate', () => {
  const filename = 'test-resume.json'
  const mockResumeObject = { basics: { name: 'John Doe' } }

  const validateObjectSpy = vi.spyOn(validateObject, 'validateObject')

  beforeEach(() => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockResumeObject))
    validateObjectSpy.mockReturnValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should log an error if reading the file fails', async () => {
    const error = new Error('File read error')
    vi.mocked(readFile).mockRejectedValueOnce(error)

    await validate(filename)

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith(filename, 'utf-8')

    expect(validateObjectSpy).not.toHaveBeenCalled()

    expect(log.error).toHaveBeenCalledTimes(2)
    expect(log.error).toHaveBeenNthCalledWith(1, 'Error reading file ❌')
    expect(log.error).toHaveBeenNthCalledWith(2, error)
  })

  it('should log an error if the resume is invalid', async () => {
    const error = new Error('Validation error')
    validateObjectSpy.mockRejectedValueOnce(error)

    await validate(filename)

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith(filename, 'utf-8')

    expect(validateObjectSpy).toHaveBeenCalledTimes(1)
    expect(validateObjectSpy).toHaveBeenCalledWith(mockResumeObject)

    expect(log.error).toHaveBeenCalledTimes(2)
    expect(log.error).toHaveBeenNthCalledWith(1, 'Resume is invalid ❌')
    expect(log.error).toHaveBeenNthCalledWith(2, error)
  })

  it('should log success if the resume is valid', async () => {
    validateObjectSpy.mockResolvedValue(true)

    await validate(filename)

    expect(readFile).toHaveBeenCalledTimes(1)
    expect(readFile).toHaveBeenCalledWith(filename, 'utf-8')

    expect(validateObjectSpy).toHaveBeenCalledTimes(1)
    expect(validateObjectSpy).toHaveBeenCalledWith(mockResumeObject)

    expect(log.success).toHaveBeenCalledTimes(1)
    expect(log.success).toHaveBeenCalledWith('Resume file is valid 🎉')
  })
})
