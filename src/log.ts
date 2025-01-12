import { blue, red, yellow } from 'ansicolor'

export const log = {
  warn: (message: unknown) => console.warn(yellow('[Warning]'), message),
  error: (message: unknown) => console.error(red('[Error]'), message),
  debug: (message: unknown) => console.error(blue('[Debug]'), message),
}
