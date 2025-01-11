/// <reference types="node" />

declare module '@jsonresume/schema' {
  import { ValidationError } from 'jsonschema'

  export function validate<T>(resumeJson: object, callback: (errors: ValidationError[], isValid: boolean) => T): T
}
