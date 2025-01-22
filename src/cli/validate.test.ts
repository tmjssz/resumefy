import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fsPromises from 'fs/promises'
import { log } from './log'
import * as validateObject from '../validate/validate'
import { validate } from './validate'

vi.mock('fs/promises')

vi.mock('./log', () => ({
  log: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('validate', () => {
  const filename = 'test-resume.json'
  const mockResumeObject = { basics: { name: 'John Doe' } }

  const readFileSpy = vi.spyOn(fsPromises, 'readFile')
  const validateObjectSpy = vi.spyOn(validateObject, 'validateObject')

  beforeEach(() => {
    readFileSpy.mockResolvedValue(JSON.stringify(mockResumeObject))
    validateObjectSpy.mockReturnValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should log an error if reading the file fails', async () => {
    const error = new Error('File read error')
    readFileSpy.mockRejectedValueOnce(error)

    await validate(filename)

    expect(readFileSpy).toHaveBeenCalledTimes(1)
    expect(readFileSpy).toHaveBeenCalledWith(filename, 'utf-8')

    expect(validateObjectSpy).not.toHaveBeenCalled()

    expect(log.error).toHaveBeenCalledTimes(2)
    expect(log.error).toHaveBeenNthCalledWith(1, 'Error reading file ❌')
    expect(log.error).toHaveBeenNthCalledWith(2, error)
  })

  it('should log an error if the resume is invalid', async () => {
    const error = new Error('Validation error')
    validateObjectSpy.mockRejectedValueOnce(error)

    await validate(filename)

    expect(readFileSpy).toHaveBeenCalledTimes(1)
    expect(readFileSpy).toHaveBeenCalledWith(filename, 'utf-8')

    expect(validateObjectSpy).toHaveBeenCalledTimes(1)
    expect(validateObjectSpy).toHaveBeenCalledWith(mockResumeObject)

    expect(log.error).toHaveBeenCalledTimes(2)
    expect(log.error).toHaveBeenNthCalledWith(1, 'Resume is invalid ❌')
    expect(log.error).toHaveBeenNthCalledWith(2, error)
  })

  it('should log success if the resume is valid', async () => {
    validateObjectSpy.mockResolvedValue(true)

    await validate(filename)

    expect(readFileSpy).toHaveBeenCalledTimes(1)
    expect(readFileSpy).toHaveBeenCalledWith(filename, 'utf-8')

    expect(validateObjectSpy).toHaveBeenCalledTimes(1)
    expect(validateObjectSpy).toHaveBeenCalledWith(mockResumeObject)

    expect(log.success).toHaveBeenCalledTimes(1)
    expect(log.success).toHaveBeenCalledWith('Resume file is valid 🎉')
  })
})
