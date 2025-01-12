import resumeSchema from '@jsonresume/schema'
import { yellow } from 'ansicolor'
import { ValidationError as ValidationErrorJsonSchema } from 'jsonschema'

export class ValidationError extends Error {
  errors: ValidationErrorJsonSchema[]

  constructor(errors: ValidationErrorJsonSchema[]) {
    const errorsWord = errors.length === 1 ? 'error' : 'errors'
    const messageTitle = `Validation of resume JSON file failed with ${yellow(`${errors.length} ${errorsWord}`)}`
    const errorList = errors.map((e) => ` - ${e.toString()}`).join('\n')

    super(`${messageTitle}:\n${errorList}`)

    this.errors = errors
  }
}

/**
 * Validate given resume object.
 * @param resume JSON object representing resume
 * @returns true if resume is valid
 * @throws {ValidationError[]} Error if resume is invalid
 */
export const validate = (resume: object) => {
  return resumeSchema.validate(resume, (errors, isValid) => {
    if (!isValid) {
      throw new ValidationError(errors)
    }
    return true
  })
}
