import { RenderOptions } from '../types'

export type RenderCliOptions = {
  // Run browser in headless mode
  headless?: boolean
  // Watch resume file for changes
  watch?: boolean
  // Port to run the file server on
  port?: number
} & Partial<RenderOptions>

export type InitCliOptions = {
  // Theme name to use
  theme?: string
}
