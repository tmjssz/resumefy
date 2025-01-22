import { describe, expect, it } from 'vitest'
import { ValidationError as ValidationErrorJsonSchema } from 'jsonschema'
import { ValidationError } from './error'
import { yellow } from 'ansicolor'

describe('ValidationError', () => {
  const errors = [
    new ValidationErrorJsonSchema('is required', {}, undefined, 'field1'),
    new ValidationErrorJsonSchema('is invalid', {}, undefined, 'field2'),
  ]

  it('should construct a ValidationError instance wrapping a single error', () => {
    const error = new ValidationError([errors[0]])
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe(
      `Validation of resume JSON file failed with ${yellow('1 error')}:\n - field1 is required`,
    )
    expect(error.errors).toEqual([errors[0]])
  })

  it('should construct a ValidationError instance wrapping multiple errors', () => {
    const error = new ValidationError(errors)
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe(
      `Validation of resume JSON file failed with ${yellow('2 errors')}:\n - field1 is required\n - field2 is invalid`,
    )
    expect(error.errors).toEqual(errors)
  })
})
