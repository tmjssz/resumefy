import { describe, it, expect, vi, afterEach } from 'vitest'
import { menu } from './menu'

describe('menu', () => {
  const appendChildMock = vi.fn()

  global.document = {
    createElement: vi.fn(() => ({
      appendChild: appendChildMock,
      style: {},
    })),
    body: { appendChild: vi.fn() },
  } as unknown as Document

  const openPreview = vi.fn()

  afterEach(() => {
    vi.resetAllMocks()
  })

  const addMenu = menu(openPreview)

  it('should create a container and button, and append them to the document body', () => {
    addMenu()

    expect(document.createElement).toHaveBeenCalledTimes(2)
    expect(document.createElement).toHaveBeenCalledWith('div')
    expect(document.createElement).toHaveBeenCalledWith('button')
    expect(document.body.appendChild).toHaveBeenCalledTimes(1)
    expect(appendChildMock).toHaveBeenCalledTimes(1)
  })

  it('should set the correct styles and attributes for the container and button', () => {
    addMenu()

    expect(document.body.appendChild).toHaveBeenCalledWith({
      appendChild: expect.any(Function),
      style: { position: 'fixed', bottom: '1rem', right: '1rem' },
    })

    expect(appendChildMock).toHaveBeenCalledWith({
      appendChild: appendChildMock,
      onclick: openPreview,
      textContent: 'PDF',
      style: { cursor: 'pointer' },
      title: 'Open PDF preview in a new tab',
    })
  })

  it('should call the openPreview function when the button is clicked', () => {
    addMenu()

    const simulateClick = appendChildMock.mock.calls[0][0].onclick

    simulateClick()

    expect(openPreview).toHaveBeenCalledTimes(1)
  })
})
