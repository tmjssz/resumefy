import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ValidationError } from 'jsonschema'
import { validateObject } from './validate'
import resumeSchema from '@jsonresume/schema'

describe('validateObject', () => {
  const resume = {
    name: 'John Doe',
    email: 'mail@john-doe.com',
    summary: 'A summary',
  }

  const validateSpy = vi.spyOn(resumeSchema, 'validate')

  beforeEach(() => {
    validateSpy.mockImplementation((_resume, callback) => {
      callback([], true)
      return true
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should validate a resume object', () => {
    const result = validateObject(resume)
    expect(result).toBeTruthy()

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(validateSpy).toHaveBeenCalledWith(resume, expect.any(Function))
  })

  it('should throw an error if resume object is invalid', () => {
    validateSpy.mockImplementationOnce((_resume, callback) => {
      callback([new ValidationError('Invalid resume')], false)
      return false
    })

    expect(() => validateObject(resume)).toThrowError('Validation of resume JSON file failed')

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(validateSpy).toHaveBeenCalledWith(resume, expect.any(Function))
  })
})
