import { afterEach, describe, it, expect, vi } from 'vitest'
import { render } from './index'
import { Renderer } from './Renderer'
import { RenderOptions } from '../types'

vi.mock('./Renderer', () => ({
  Renderer: {
    launch: vi.fn().mockResolvedValue({
      render: vi.fn(() => Promise.resolve()),
      addMenu: vi.fn(),
      startFileServer: vi.fn(),
      reloadPreview: vi.fn(),
    }),
  },
}))

describe('render', () => {
  const resumeFile = 'test-resume.json'
  const options: RenderOptions = {
    theme: 'jsonresume-theme-even',
    outDir: './output',
  }

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should launch puppeteer and call Renderer.render', async () => {
    await render(resumeFile, options)

    expect(Renderer.launch).toHaveBeenCalledTimes(1)
    expect(Renderer.launch).toHaveBeenCalledWith(resumeFile, options, { defaultViewport: null, headless: true })

    const renderer = await Renderer.launch(resumeFile, options, { defaultViewport: null, headless: true })
    expect(renderer.render).toHaveBeenCalledTimes(1)
  })
})
