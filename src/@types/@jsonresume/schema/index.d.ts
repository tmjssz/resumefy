/// <reference types="node" />

declare module '@jsonresume/schema' {
  import { Validator, ValidationError } from 'jsonschema'
  import * as schema from '@jsonresume/schema/schema.json'
  import * as jobSchema from '@jsonresume/schema/job-schema.json'

  export function validate<T>(resumeJson: object, callback: (errors: ValidationError[], isValid: boolean) => T): T

  export type scheme = typeof schema
  export type jobSchema = typeof jobSchema
}
