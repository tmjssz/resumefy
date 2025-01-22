import { Renderer } from './Renderer'
import { RenderOptions } from '../types'

/**
 * Renders a resume from a JSON file to HTML and PDF.
 * @param resumeFile The path to the resume JSON file
 * @param options An options object with the following properties:
 * @param options.theme The theme to use for rendering
 * @param options.outDir The directory to save the output files (default: '.')
 * @returns A promise resolving when rendering is complete
 */
export const render = async (resumeFile: string, options: RenderOptions) => {
  const renderer = await Renderer.launch(resumeFile, options, { defaultViewport: null, headless: true })
  return renderer.render()
}
