import { RenderOptions } from '../types.js'

export type RenderCliOptions = {
  // Run browser in headless mode
  headless?: boolean
  // Watch resume file for changes
  watch?: boolean
} & Partial<RenderOptions>

export type InitCliOptions = {
  // Theme name to use
  theme?: string
}
