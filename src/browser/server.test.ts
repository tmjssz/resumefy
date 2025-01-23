import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import express from 'express'
import { log } from '../cli/log'
import { startServer } from './server'

vi.mock('express', () => {
  const use = vi.fn()
  const listen = vi.fn((_, callback) => callback())
  const staticMiddleware = vi.fn((path) => path)

  const app = {
    use,
    listen,
  }

  const express = () => app
  express.static = staticMiddleware

  return { default: express }
})

vi.mock('../cli/log', () => ({
  log: {
    dim: vi.fn(),
  },
}))

describe('startServer', () => {
  const path = 'test-path'
  const port = 8080
  let app: ReturnType<typeof express>

  beforeEach(() => {
    app = express()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should start an express server with the specified path and port', () => {
    startServer(path, port)

    expect(express.static).toHaveBeenCalledTimes(1)
    expect(express.static).toHaveBeenCalledWith(path)

    expect(app.use).toHaveBeenCalledTimes(1)
    expect(app.use).toHaveBeenCalledWith(express.static(path))

    expect(app.listen).toHaveBeenCalledTimes(1)
    expect(app.listen).toHaveBeenCalledWith(port, expect.any(Function))

    expect(log.dim).toHaveBeenCalledTimes(1)
    expect(log.dim).toHaveBeenCalledWith(`Server listening on port: ${port}`)
  })

  it('should return the express app instance', () => {
    const result = startServer(path, port)
    expect(result).toEqual(app)
  })
})
