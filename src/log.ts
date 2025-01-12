import { blue, dim, red, yellow } from 'ansicolor'
import { StepState } from './render/steps'

export const log = {
  warn: (...args: unknown[]) => console.warn(yellow('[Warning]'), ...args),
  error: (...args: unknown[]) => console.error(red('[Error]'), ...args),
  debug: (...args: unknown[]) => console.error(blue('[Debug]'), ...args),
  step: ({ current, total }: StepState, ...args: unknown[]) => console.log(dim(`[${current}/${total}]`), ...args),
}
