import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import puppeteer, { Browser } from 'puppeteer'
import { render } from './index'
import * as renderer from './Renderer'
import { RenderOptions } from '../types'

vi.mock('./Renderer', () => ({
  Renderer: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
  })),
}))

describe('render', () => {
  const resumeFile = 'test-resume.json'
  const options: RenderOptions = {
    theme: 'jsonresume-theme-even',
    outDir: './output',
  }

  const mockBrowser = { foo: 'bar' } as unknown as Browser
  const mockRender = vi.fn()

  const launchSpy = vi.spyOn(puppeteer, 'launch')
  const rendererSpy = vi.spyOn(renderer, 'Renderer')

  beforeEach(() => {
    launchSpy.mockResolvedValue(mockBrowser)
    rendererSpy.mockReturnValue({ render: mockRender } as unknown as renderer.Renderer)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should launch puppeteer and call Renderer.render', async () => {
    await render(resumeFile, options)

    expect(launchSpy).toHaveBeenCalledTimes(1)
    expect(launchSpy).toHaveBeenCalledWith({ defaultViewport: null, headless: true })
    expect(rendererSpy).toHaveBeenCalledTimes(1)
    expect(rendererSpy).toHaveBeenCalledWith(resumeFile, options, mockBrowser)
    expect(mockRender).toHaveBeenCalledTimes(1)
  })
})
