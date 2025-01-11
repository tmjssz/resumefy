import { program } from 'commander'
import { render } from './render/index.js'

type Options = {
  dir: string
  name: string
  theme: string
  watch?: boolean
  headless?: boolean
}

export const cli = program
  .version('1.1.0')
  .description('A CLI for effortlessly rendering your JSON Resume')
  .argument('<resume.json>', 'Path to resume JSON file')
  .option('-d, --dir <dir>', 'Directory to save output files', 'result')
  .option('-t, --theme <theme>', 'Theme to use for rendering (overrides theme specified in resume.json)')
  .option('-n, --name <name>', 'Name of the output files', 'resume')
  .option('-w, --watch', 'Watch resume.json file for changes')
  .option('--headless', 'Run browser in headless mode')
  .action(async (filename: string = 'resume.json', { dir, name, theme, watch, headless }: Options) =>
    render(filename, { dir, name, watch, headless, theme }),
  )
