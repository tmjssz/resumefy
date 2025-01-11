import { program } from 'commander'
import { render } from './render'

type Options = {
  dir: string
  name: string
  watch?: boolean
  headless?: boolean
}

program.version('1.0.0')
program.description('A CLI for effortlessly rendering your JSON Resume')
program.argument('<resume.json>', 'Path to resume JSON file')
program.option('-d, --dir <dir>', 'Directory to save output files', 'result')
program.option('-n, --name <name>', 'Name of the output files', 'resume')
program.option('-w, --watch', 'Watch resume.json file for changes')
program.option('--headless', 'Run browser in headless mode')
program.parse()

const [resumeFile] = program.args
const { dir, name, watch, headless } = program.opts<Options>()

render(resumeFile!, { dir, name, watch, headless })
