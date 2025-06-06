import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { launch } from 'puppeteer'
import ErrorHtmlRenderer from 'error-html'
import { Browser } from 'puppeteer'
import { ResumeBrowser } from './ResumeBrowser'
import { ResumePage } from './ResumePage'
import * as fs from 'fs'
import { mkdir } from 'fs/promises'
import * as ansicolor from 'ansicolor'

vi.mock('fs')
vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
}))
vi.mock('puppeteer', () => {
  const launch = vi.fn()
  return {
    launch,
    default: { launch }
  }
})
vi.mock('ansicolor')
vi.mock('./ResumePage')

describe('ResumeBrowser', () => {
  const firstPage = {
    addMenu: vi.fn(),
  }

  const browser = {
    _pages: [firstPage as unknown as ResumePage],
    pages: vi.fn(),
    newPage: vi.fn(),
    process: vi.fn(),
    close: vi.fn(),
  }

  let resumeBrowser: ResumeBrowser

  const errorHtmlRenderSpy = vi.spyOn(ErrorHtmlRenderer.prototype, 'render')
  const setContentSpy = vi.spyOn(ResumePage.prototype, 'setContent')
  const existsSyncSpy = vi.spyOn(fs, 'existsSync')
  const htmlSpy = vi.spyOn(ResumePage.prototype, 'html')
  const pdfSpy = vi.spyOn(ResumePage.prototype, 'pdf')
  const addMenuSpy = vi.spyOn(ResumePage.prototype, 'addMenu')
  const stripSpy = vi.spyOn(ansicolor, 'strip')

  const gotoMock = vi.fn()
  const isClosedMock = vi.fn()
  const bringToFrontMock = vi.fn()
  const reloadMock = vi.fn()

  let simulateOpenPreviewClick: () => void

  beforeEach(() => {
    browser.pages = vi.fn().mockResolvedValue(browser._pages)
    browser.newPage = vi.fn().mockImplementation(() => {
      const newPage = {
        i: browser._pages.length,
        goto: gotoMock,
        isClosed: isClosedMock,
        bringToFront: bringToFrontMock,
        reload: reloadMock,
      } as unknown as ResumePage
      browser._pages.push(newPage)
      return newPage
    })
    browser.process = vi.fn().mockReturnValue({ spawnargs: ['--headless'] })

    resumeBrowser = new ResumeBrowser(browser as unknown as Browser)

    vi.mocked(launch).mockResolvedValue(browser as unknown as Browser)
    errorHtmlRenderSpy.mockReturnValue('<html>Error</html>')
    setContentSpy.mockResolvedValue(undefined)
    existsSyncSpy.mockReturnValue(false)
    vi.mocked(mkdir).mockResolvedValue(undefined)
    htmlSpy.mockResolvedValue(undefined)
    pdfSpy.mockResolvedValue(undefined)
    addMenuSpy.mockImplementation((fn: () => void) => {
      simulateOpenPreviewClick = fn
      return Promise.resolve()
    })
    stripSpy.mockImplementation((text: string) => text)
    gotoMock.mockResolvedValue(null)
    isClosedMock.mockReturnValue(false)
    bringToFrontMock.mockResolvedValue(null)
    reloadMock.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('launch', () => {
    it('should launch a new browser instance', async () => {
      const options = { headless: true }

      const result = await ResumeBrowser.launch(options)

      expect(launch).toHaveBeenCalledWith(options)
      expect(result).toBeInstanceOf(ResumeBrowser)
    })
  })

  describe('isHeadless', () => {
    it('should return true if the browser is headless', () => {
      expect(resumeBrowser.isHeadless()).toBeTruthy()
    })

    it('should return false if the browser is NOT headless', () => {
      browser.process = vi.fn().mockReturnValue({ spawnargs: [] })
      expect(resumeBrowser.isHeadless()).toBeFalsy()
    })
  })

  describe('getPage', () => {
    it('should get a specific page of the browser', async () => {
      const page = await resumeBrowser.getPage(0)

      expect(browser.pages).toHaveBeenCalledTimes(1)
      expect(page).toBeInstanceOf(ResumePage)
      expect(ResumePage).toHaveBeenCalledWith(firstPage, resumeBrowser)
      expect(browser.newPage).not.toHaveBeenCalled()
    })

    it('should create a new page if the requested page does not exist', async () => {
      const page = await resumeBrowser.getPage(2)

      expect(browser.newPage).toHaveBeenCalledTimes(2)
      expect(page).toBeInstanceOf(ResumePage)
      expect(ResumePage).toHaveBeenCalledWith(browser._pages[2], resumeBrowser)
    })
  })

  describe('render', () => {
    it('should render content to the first page of the browser', async () => {
      const content = '<html><body>Test</body></html>'
      const page = await resumeBrowser.render(content)

      expect(page).toBeInstanceOf(ResumePage)
      expect(ResumePage).toHaveBeenCalledWith(firstPage, resumeBrowser)
      expect(setContentSpy).toHaveBeenCalledWith(content)
    })
  })

  describe('error', () => {
    describe('if running in headless mode', () => {
      beforeEach(() => {
        browser.process = vi.fn().mockReturnValue({ spawnargs: [] })
      })

      it('should render an error to the first page of the browser', async () => {
        const error = new Error('Test error')

        const page = await resumeBrowser.error(error)

        expect(page).toBeInstanceOf(ResumePage)
        expect(setContentSpy).toHaveBeenCalledWith('<html>Error</html>')

        expect(stripSpy).toHaveBeenCalledTimes(2)
        expect(stripSpy).toHaveBeenNthCalledWith(1, error.message)
        expect(stripSpy).toHaveBeenNthCalledWith(2, error.stack)

        expect(errorHtmlRenderSpy).toHaveBeenCalledWith(error)
      })

      it("should wrap thrown object if it's not instance of Error", async () => {
        const error = new Error('An error occurred while rendering the resume: Test error')

        const page = await resumeBrowser.error('Test error')

        expect(page).toBeInstanceOf(ResumePage)
        expect(setContentSpy).toHaveBeenCalledWith('<html>Error</html>')

        expect(stripSpy).toHaveBeenCalledTimes(2)
        expect(stripSpy).toHaveBeenNthCalledWith(1, error.message)
        expect(stripSpy).toHaveBeenNthCalledWith(2, expect.stringContaining(error.message))

        expect(errorHtmlRenderSpy).toHaveBeenCalledWith(error)
      })
    })

    it('should NOT render an error if in headless mode', async () => {
      const error = new Error('Test error')

      const page = await resumeBrowser.error(error)

      expect(page).toBeUndefined()
      expect(setContentSpy).not.toHaveBeenCalled()
      expect(errorHtmlRenderSpy).not.toHaveBeenCalled()
    })
  })

  describe('close', () => {
    it('should close the browser', async () => {
      await resumeBrowser.close()
      expect(browser.close).toHaveBeenCalledTimes(1)
    })
  })

  describe('writeFiles', () => {
    const dir = 'test/dir'
    const name = 'test-name'

    it("should create the provided directory if it doesn't exists", async () => {
      await resumeBrowser.writeFiles(dir, name)

      expect(existsSyncSpy).toHaveBeenCalledTimes(1)
      expect(existsSyncSpy).toHaveBeenCalledWith(dir)

      expect(mkdir).toHaveBeenCalledTimes(1)
      expect(mkdir).toHaveBeenCalledWith(dir)
    })

    it('should NOT create the provided directory if it does exists', async () => {
      existsSyncSpy.mockReturnValueOnce(true)
      await resumeBrowser.writeFiles(dir, name)

      expect(existsSyncSpy).toHaveBeenCalledTimes(1)
      expect(existsSyncSpy).toHaveBeenCalledWith(dir)
      expect(mkdir).not.toHaveBeenCalled()
    })

    it('should write HTML and PDF files to the provided directory', async () => {
      await resumeBrowser.writeFiles(dir, name)

      expect(browser.pages).toHaveBeenCalledTimes(1)
      expect(browser.newPage).not.toHaveBeenCalled()

      expect(htmlSpy).toHaveBeenCalledTimes(1)
      expect(htmlSpy).toHaveBeenCalledWith(dir, name)

      expect(pdfSpy).toHaveBeenCalledTimes(1)
      expect(pdfSpy).toHaveBeenCalledWith(dir, name)
    })

    it('should throw an error if writing the PDF file fails', async () => {
      const error = new Error('PDF write error')
      pdfSpy.mockRejectedValueOnce(error)

      await expect(() => resumeBrowser.writeFiles(dir, name)).rejects.toThrow(error)
    })

    it('should throw an error if writing the HTML file fails', async () => {
      const error = new Error('HTML write error')
      htmlSpy.mockRejectedValueOnce(error)

      await expect(() => resumeBrowser.writeFiles(dir, name)).rejects.toThrow(error)
    })
  })

  describe('addMenu', () => {
    const fileUrl = 'https://localhost:8080/menu.html'

    it('should do nothing if running in headless mode', async () => {
      await resumeBrowser.addMenu(fileUrl)

      expect(browser.pages).not.toHaveBeenCalled()
      expect(browser.newPage).not.toHaveBeenCalled()
      expect(addMenuSpy).not.toHaveBeenCalled()
    })

    describe('when running in headed mode', () => {
      beforeEach(() => {
        browser.process = vi.fn().mockReturnValue({ spawnargs: [] })
      })

      it('should add a menu to the first page of the browser', async () => {
        await resumeBrowser.addMenu(fileUrl)

        expect(browser.pages).toHaveBeenCalledTimes(1)
        expect(browser.newPage).not.toHaveBeenCalled()
        expect(addMenuSpy).toHaveBeenCalledTimes(1)
        expect(addMenuSpy).toHaveBeenCalledWith(expect.any(Function))
      })

      it('should open the preview in a new page', async () => {
        await resumeBrowser.addMenu(fileUrl)
        await simulateOpenPreviewClick()

        expect(browser.newPage).toHaveBeenCalledTimes(1)

        expect(gotoMock).toHaveBeenCalledTimes(1)
        expect(gotoMock).toHaveBeenCalledWith(fileUrl)
      })

      it('should open the preview in a new page if previous preview page was closed', async () => {
        await resumeBrowser.addMenu(fileUrl)
        await simulateOpenPreviewClick()

        expect(browser.newPage).toHaveBeenCalledTimes(1)
        isClosedMock.mockReturnValueOnce(true)
        expect(gotoMock).toHaveBeenCalledTimes(1)

        await simulateOpenPreviewClick()

        expect(browser.newPage).toHaveBeenCalledTimes(2)
        expect(gotoMock).toHaveBeenCalledTimes(2)
        expect(gotoMock).toHaveBeenCalledWith(fileUrl)
      })

      it('should open the preview page when clicked while the preview page is already opened', async () => {
        await resumeBrowser.addMenu(fileUrl)
        await simulateOpenPreviewClick()

        expect(browser.newPage).toHaveBeenCalledTimes(1)
        expect(gotoMock).toHaveBeenCalledTimes(1)

        await simulateOpenPreviewClick()

        expect(gotoMock).toHaveBeenCalledTimes(1)
        expect(browser.newPage).toHaveBeenCalledTimes(1)
        expect(bringToFrontMock).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('reloadPreview', () => {
    it('should do nothing if running in headless mode', async () => {
      await resumeBrowser.reloadPreview()

      expect(isClosedMock).not.toHaveBeenCalled()
      expect(reloadMock).not.toHaveBeenCalled()
    })

    describe('when running in headed mode', () => {
      beforeEach(async () => {
        browser.process = vi.fn().mockReturnValue({ spawnargs: [] })
        await resumeBrowser.addMenu('fileUrl')
        await simulateOpenPreviewClick()
      })

      it('should reload the preview page', async () => {
        await resumeBrowser.reloadPreview()

        expect(isClosedMock).toHaveBeenCalledTimes(1)
        expect(reloadMock).toHaveBeenCalledTimes(1)
      })

      it('should do nothing is preview page is closed', async () => {
        isClosedMock.mockReturnValueOnce(true)

        await resumeBrowser.reloadPreview()

        expect(isClosedMock).toHaveBeenCalledTimes(1)
        expect(reloadMock).not.toHaveBeenCalled()
      })

      it('should not throw if reload fails (page is already closed)', async () => {
        reloadMock.mockRejectedValueOnce(new Error('Page closed'))

        await resumeBrowser.reloadPreview()

        expect(isClosedMock).toHaveBeenCalledTimes(1)
        expect(reloadMock).toHaveBeenCalledTimes(1)
      })
    })
  })
})
