import { describe, it, expect } from 'vitest'
import * as indexModule from './index'

describe('index', () => {
  it('should export all modules correctly', async () => {
    expect(indexModule).toHaveProperty('cli')
    expect(indexModule).toHaveProperty('render')
    expect(indexModule).toHaveProperty('init')
    expect(indexModule).toHaveProperty('validate')
  })
})
