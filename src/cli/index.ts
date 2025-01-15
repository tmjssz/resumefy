import { program } from 'commander'
import { render } from './render.js'
import { init } from './init.js'
import { validate } from './validate.js'

export const cli = program.version('1.3.0').description('A simple toolkit to bring your JSON Resume to life')

cli
  .command('render', { isDefault: true })
  .description('render resume to PDF and HTML')
  .argument('[resume.json]', 'path to resume JSON file', 'resume.json')
  .option('-d, --outDir <outDir>', 'directory to save output files', '.')
  .option('-t, --theme <theme>', 'theme to use for rendering (overrides theme specified in resume.json)')
  .option('-w, --watch', 'watch resume.json file for changes')
  .option('--headless', 'run browser in headless mode')
  .action(render)

cli
  .command('init')
  .description('create a new resume.json file')
  .argument('[resume.json]', 'filename to create', 'resume.json')
  .option('-t, --theme <theme>', 'theme to use for rendering (sets theme in resume.json)')
  .action(init)

cli
  .command('validate')
  .description('validate a resume.json file')
  .argument('[resume.json]', 'path to resume JSON file', 'resume.json')
  .action(validate)
