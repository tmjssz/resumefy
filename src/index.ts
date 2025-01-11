import { program } from 'commander'

type Options = {
  dir: string
  name: string
  watch?: boolean
  headless?: boolean
}

program.option('-d, --dir <dir>', 'Directory to save output files', 'result')
program.option('-n, --name <name>', 'Name of the output files', 'resume')
program.option('-w, --watch', 'Watch resume.json file for changes')
program.option('--headless', 'Run browser in headless mode')
program.parse()

const { dir, name, watch, headless } = program.opts<Options>()

console.log(dir, name, watch, headless)
