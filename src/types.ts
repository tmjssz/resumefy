export type Theme = {
  render: (resume: object) => string
}

export interface Resume {
  meta?: {
    theme?: string
  }
}

export type RenderOptions = {
  // Directory to save output files
  outDir?: string
  // Run browser in headless mode
  headless?: boolean
  // Watch resume file for changes
  watch?: boolean
  // Theme name to use
  theme?: string
}

export type InitOptions = {
  // Theme name to use
  theme?: string
}
