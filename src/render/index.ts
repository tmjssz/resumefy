import puppeteer from 'puppeteer'
import { Renderer } from './Renderer.js'
import { RenderOptions } from '../types.js'

/**
 * Renders a resume from a JSON file to HTML and PDF.
 * @param resumeFile The path to the resume JSON file
 * @param options An options object with the following properties:
 * @param options.theme The theme to use for rendering
 * @param options.outDir The directory to save the output files (default: '.')
 * @returns a promise that resolves when rendering is complete
 */
export const render = async (resumeFile: string, options: RenderOptions) => {
  const browser = await puppeteer.launch({ defaultViewport: null, headless: true })
  const renderer = new Renderer(resumeFile, options, browser)
  return renderer.render()
}
