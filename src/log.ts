import { blue, dim, green, red, yellow } from 'ansicolor'

export const log = {
  warn: (...args: unknown[]) => console.warn(yellow('warning'), ...args),
  error: (...args: unknown[]) => console.error(red('error'), ...args),
  debug: (...args: unknown[]) => console.debug(blue('debug'), ...args),
  success: (...args: unknown[]) => console.log(green('success'), ...args),
  dim: (text: string | number | null | undefined) => console.log(dim(text)),
}
