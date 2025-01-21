import fsPromises from 'fs/promises'
import { ValidationError as ValidationErrorJsonSchema } from 'jsonschema'
import * as validateObject from './validate'
import { validate } from './index'
import { ValidationError } from './error'

describe('validate', () => {
  const resume = {
    name: 'John Doe',
    email: 'mail@john-doe.com',
    summary: 'A summary',
  }

  const readFileSpy = jest.spyOn(fsPromises, 'readFile')
  const validateObjectSpy = jest.spyOn(validateObject, 'validateObject')

  beforeEach(() => {
    jest.clearAllMocks()
    readFileSpy.mockResolvedValue(JSON.stringify(resume))
    validateObjectSpy.mockReturnValue(true)
  })

  it('should validate a resume object', async () => {
    const result = await validate('resume.json')
    expect(result).toBeTruthy()

    expect(readFileSpy).toHaveBeenCalledTimes(1)
    expect(readFileSpy).toHaveBeenCalledWith('resume.json', 'utf-8')
    expect(validateObjectSpy).toHaveBeenCalledTimes(1)
    expect(validateObjectSpy).toHaveBeenCalledWith(resume)
  })

  it('should return false if resume is invalid', async () => {
    validateObjectSpy.mockImplementation(() => {
      throw new ValidationError([new ValidationErrorJsonSchema('is invalid', {}, undefined, 'field1')])
    })

    const result = await validate('resume.json')
    expect(result).toBeFalsy()
  })

  it('should throw an error if reading the file fails', async () => {
    readFileSpy.mockRejectedValueOnce(new Error('Failed to read file'))

    await expect(validate('resume.json')).rejects.toThrow('Failed to read file')
  })

  it('should throw an error if the file is not valid JSON', async () => {
    readFileSpy.mockResolvedValueOnce('invalid json')

    await expect(validate('resume.json')).rejects.toThrow('Unexpected token \'i\', "invalid json" is not valid JSON')
  })
})
