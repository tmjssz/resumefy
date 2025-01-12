import { blue, red, yellow } from 'ansicolor'

export const log = {
  warn: (...args: unknown[]) => console.warn(yellow('[Warning]'), ...args),
  error: (...args: unknown[]) => console.error(red('[Error]'), ...args),
  debug: (...args: unknown[]) => console.error(blue('[Debug]'), ...args),
}
