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
  // Theme name to use
  theme: string
}

export type ConsoleLog = typeof console.log
