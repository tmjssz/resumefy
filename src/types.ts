export type Theme = {
  /**
   * Themes are free to render asynchronously, which is what resumed's render allowed for before
   * it was called directly. Declaring only `string` here would mistype every async theme.
   */
  render: (resume: object) => string | Promise<string>
}

// A type alias rather than an interface, and open at the top level: a resume carries the whole
// JSON Resume schema, of which only meta.theme is read here. It was widened for resumed's Resume,
// which is an index-signature intersection an interface cannot satisfy, and is kept that way now
// that resumed is gone because narrowing it again would be a second breaking change.
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
