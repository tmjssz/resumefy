import express from 'express'
import { log } from '../cli/log.js'

export const startServer = (path: string, port: number) => {
  const app = express()

  app.use(express.static(path))

  app.listen(port, () => log.dim(`Server listening on port: ${port}`))

  return app
}
