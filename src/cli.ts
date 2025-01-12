import { program } from 'commander'
import { render } from './render/index.js'
import { InitOptions, RenderOptions } from './types.js'
import { init } from './init.js'

export const cli = program.version('1.2.0').description('A CLI for effortlessly rendering your JSON Resume')

cli
  .command('render', { isDefault: true })
  .description('render resume to PDF and HTML')
  .argument('[resume.json]', 'path to resume JSON file', 'resume.json')
  .option('-d, --outDir <outDir>', 'directory to save output files', 'result')
  .option('-t, --theme <theme>', 'theme to use for rendering (overrides theme specified in resume.json)')
  .option('-w, --watch', 'watch resume.json file for changes')
  .option('--headless', 'run browser in headless mode')
  .action((filename: string = 'resume.json', options: RenderOptions) => render(filename, options))

cli
  .command('init')
  .description('create a new resume.json file')
  .argument('[resume.json]', 'filename to create', 'resume.json')
  .option('-t, --theme <theme>', 'theme to use for rendering (sets theme in resume.json)')
  .action((filename: string = 'resume.json', options: InitOptions) => init(filename, options))
