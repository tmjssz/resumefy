import fsPromises from 'fs/promises'
import { validateObject } from './validate.js'

/**
 * Validate a resume JSON file.
 * @param resumeFile The path to the resume JSON file
 * @returns Promise resolving with a boolean whether resume JSON is valid
 */
export const validate = async (resumeFile: string) => {
  const resumeObject = JSON.parse(await fsPromises.readFile(resumeFile, 'utf-8'))
  try {
    return validateObject(resumeObject)
  } catch (err) {
    return false
  }
}
