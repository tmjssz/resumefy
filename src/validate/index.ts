import fsPromises from 'fs/promises'
import { validateObject } from './validate.js'

/**
 * Validate a resume JSON file.
 * @param resumeFile The path to the resume JSON file
 * @returns true if resume is valid
 * @throws {ValidationError[]} Error if resume is invalid
 */
export const validate = async (resumeFile: string) => {
  const resumeObject = JSON.parse(await fsPromises.readFile(resumeFile, 'utf-8'))
  return validateObject(resumeObject)
}
