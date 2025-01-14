import puppeteer from 'puppeteer'
import { Renderer } from './Renderer.js'
import { RenderOptions } from '../types.js'

export const render = async (resumeFile: string, { theme, outDir = '.' }: RenderOptions) => {
  const browser = await puppeteer.launch({ defaultViewport: null, headless: true })
  const renderer = new Renderer(resumeFile, { theme, outDir }, browser)
  return renderer.render()
}
