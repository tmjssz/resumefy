export type Theme = {
  render: (resume: object) => string
}

export interface Resume {
  meta?: {
    theme?: string
  }
}

export type RenderOptions = { theme: string; outDir: string }

export type ConsoleLog = typeof console.log
