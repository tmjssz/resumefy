import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { log } from './log'

vi.mock('ansicolor', () => ({
  blue: vi.fn((text) => `BLUE ${text}`),
  dim: vi.fn((text) => `DIM ${text}`),
  green: vi.fn((text) => `GREEN ${text}`),
  red: vi.fn((text) => `RED ${text}`),
  yellow: vi.fn((text) => `YELLOW ${text}`),
}))

describe('log', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should log a message', () => {
    log.log('test message')
    expect(console.log).toHaveBeenCalledWith('test message')
  })

  it('should log a warning message', () => {
    log.warn('test warning')
    expect(console.warn).toHaveBeenCalledWith('YELLOW warning', 'test warning')
  })

  it('should log an error message', () => {
    log.error('test error')
    expect(console.error).toHaveBeenCalledWith('RED error', 'test error')
  })

  it('should log a debug message', () => {
    log.debug('test debug')
    expect(console.debug).toHaveBeenCalledWith('BLUE debug', 'test debug')
  })

  it('should log a success message', () => {
    log.success('test success')
    expect(console.log).toHaveBeenCalledWith('GREEN success', 'test success')
  })

  it('should log a dim message', () => {
    log.dim('test dim')
    expect(console.log).toHaveBeenCalledWith('DIM test dim')
  })

  it('should log a step message', () => {
    const stepLogger = log.step(1, 3)
    stepLogger('test step')
    expect(console.log).toHaveBeenCalledWith('DIM [1/3]', 'test step')
  })
})
