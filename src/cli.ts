import { program } from 'commander'
import { render } from './render/index.js'

type Options = {
  outDir: string
  theme: string
  watch?: boolean
  headless?: boolean
}

export const cli = program
  .version('1.1.0')
  .description('A CLI for effortlessly rendering your JSON Resume')
  .argument('[resume.json]', 'path to resume JSON file', 'resume.json')
  .option('-d, --outDir <outDir>', 'directory to save output files', 'result')
  .option('-t, --theme <theme>', 'theme to use for rendering (overrides theme specified in resume.json)')
  .option('-w, --watch', 'watch resume.json file for changes')
  .option('--headless', 'run browser in headless mode')
  .action(async (filename: string = 'resume.json', { outDir, theme, watch, headless }: Options) =>
    render(filename, { outDir, watch, headless, theme }),
  )
