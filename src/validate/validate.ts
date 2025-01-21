import resumeSchema from '@jsonresume/schema'
import { ValidationError } from './error'

/**
 * Validate given resume object.
 * @param resume JSON object representing resume
 * @returns true if resume is valid
 * @throws {ValidationError[]} Error if resume is invalid
 */
export const validateObject = (resume: object) => {
  return resumeSchema.validate(resume, (errors, isValid) => {
    if (!isValid) {
      throw new ValidationError(errors)
    }
    return true
  })
}
