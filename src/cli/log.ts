import { blue, dim, green, red, yellow } from 'ansicolor'

/**
 * Custom log functions
 */
export const log = {
  log: console.log,
  warn: (...args: unknown[]) => console.warn(yellow('warning'), ...args),
  error: (...args: unknown[]) => console.error(red('error'), ...args),
  debug: (...args: unknown[]) => console.debug(blue('debug'), ...args),
  success: (...args: unknown[]) => console.log(green('success'), ...args),
  dim: (...args: (string | number | null | undefined)[]) => console.log(...args.map((arg) => dim(arg))),
  step:
    (step: number, total: number) =>
    (...args: unknown[]) => {
      const stepNumber = dim(`[${step}/${total}]`)
      console.log(stepNumber, ...args)
    },
}
