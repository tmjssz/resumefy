import { readFile } from 'fs/promises'
import { log } from './log'
import { validateObject } from '../validate/validate'

export const validate = async (filename: string) => {
  let resumeObject

  try {
    resumeObject = JSON.parse(await readFile(filename, 'utf-8'))
  } catch (err) {
    log.error('Error reading file ❌')
    log.error(err)
    return
  }

  try {
    await validateObject(resumeObject)
    log.success('Resume file is valid 🎉')
  } catch (err) {
    log.error('Resume is invalid ❌')
    log.error(err)
  }
}
