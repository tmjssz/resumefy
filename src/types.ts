export type Theme = {
  render: (resume: object) => string
}

// A type alias rather than an interface: resumed's Resume carries an index
// signature, and interfaces are not assignable to those.
export type Resume = {
  meta?: {
    theme?: string
  }
  [key: string]: unknown
}

export type RenderOptions = {
  // Directory to save output files
  outDir?: string
  // Theme name to use
  theme: string
}

export type ConsoleLog = typeof console.log
