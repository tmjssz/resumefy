export type Theme = {
  render: (resume: object) => string
}

export interface Resume {
  meta?: {
    theme?: string
  }
}
