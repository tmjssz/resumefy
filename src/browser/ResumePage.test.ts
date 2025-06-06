import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TimeoutError, type Page } from 'puppeteer'
import { writeFile } from 'fs/promises'
import { ResumePage } from './ResumePage'
import { log } from '../cli/log'
import { ResumeBrowser } from './ResumeBrowser'
import * as menu from './menu'

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
}))

vi.mock('../cli/log', () => ({
  log: {
    error: vi.fn(),
  },
}))

describe('ResumePage', () => {
  const page = {
    content: vi.fn(),
    setContent: vi.fn(),
    pdf: vi.fn(),
    goto: vi.fn(),
    exposeFunction: vi.fn(),
    evaluate: vi.fn(),
  }

  const htmlMock = '<html></html>'

  const menuSpy = vi.spyOn(menu, 'menu')

  let resumePage: ResumePage

  beforeEach(() => {
    page.content.mockResolvedValue(htmlMock)
    page.setContent.mockResolvedValue(undefined)
    page.pdf.mockResolvedValue(undefined)
    page.goto.mockResolvedValue(undefined)
    page.exposeFunction.mockResolvedValue(undefined)
    page.evaluate.mockResolvedValue(undefined)

    vi.mocked(writeFile).mockImplementation(() => Promise.resolve())
    page.pdf.mockResolvedValue(undefined)
    menuSpy.mockImplementation((fn) => () => {
      fn()
    })

    resumePage = new ResumePage(page as unknown as Page, {} as ResumeBrowser)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('content', () => {
    it('should get the content of the page', async () => {
      const content = await resumePage.content()
      expect(content).toBe(htmlMock)
      expect(page.content).toHaveBeenCalledTimes(1)
    })
  })

  describe('setContent', () => {
    it('should set the content of the page', async () => {
      const content = '<html><body>Test</body></html>'
      await resumePage.setContent(content)
      expect(page.setContent).toHaveBeenCalledWith(content, { waitUntil: 'networkidle0' })
    })
  })

  describe('html', () => {
    it('should write HTML file to the given directory', async () => {
      const dir = './test/dir'
      const name = 'test-file'
      await resumePage.html(dir, name)
      expect(writeFile).toHaveBeenCalledWith('test/dir/test-file.html', htmlMock)
    })
  })

  describe('pdf', () => {
    const dir = './test/dir'
    const name = 'test-file'

    it('should write PDF file to the given directory', async () => {
      await resumePage.pdf(dir, name)
      expect(page.pdf).toHaveBeenCalledWith({
        path: 'test/dir/test-file.pdf',
        format: 'a4',
        printBackground: true,
      })
    })

    it('should log an error if PDF generation times out', async () => {
      const error = new TimeoutError('Timeout error')
      page.pdf.mockRejectedValueOnce(error)

      await resumePage.pdf(dir, name)

      expect(log.error).toHaveBeenCalledWith(error.message)
    })

    it('should throw an error if PDF generation fails with a non-timeout error', async () => {
      const error = new Error('PDF generation error')
      page.pdf.mockRejectedValueOnce(error)

      await expect(() => resumePage.pdf(dir, name)).rejects.toThrow(error)
    })
  })

  describe('goto', () => {
    it('should go to a URL', async () => {
      const url = 'http://example.com'
      await resumePage.goto(url)
      expect(page.goto).toHaveBeenCalledWith(url, { waitUntil: 'networkidle0' })
    })
  })

  describe('addMenu', () => {
    const openPreview = () => {}

    it('should expose a method to open the PDF preview', async () => {
      await resumePage.addMenu(openPreview)
      expect(page.exposeFunction).toHaveBeenCalledTimes(1)
      expect(page.exposeFunction).toHaveBeenCalledWith('openPreview', openPreview)
    })

    it('should not throw if the passed function is already exposed', async () => {
      page.exposeFunction.mockRejectedValueOnce(new Error('Function already exposed'))
      await resumePage.addMenu(openPreview)
      expect(page.exposeFunction).toHaveBeenCalledTimes(1)
      expect(page.exposeFunction).toHaveBeenCalledWith('openPreview', openPreview)
    })

    it('should evaluate the function to open the PDF preview', async () => {
      const openPreview = () => {}
      await resumePage.addMenu(openPreview)

      expect(menuSpy).toHaveBeenCalledTimes(1)
      expect(menuSpy).toHaveBeenCalledWith(openPreview)

      expect(page.evaluate).toHaveBeenCalledTimes(1)
      expect(page.evaluate).toHaveBeenCalledWith(expect.any(Function))
    })
  })
})
