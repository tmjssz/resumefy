import { program } from 'commander'
import { render } from './render'
import { yellow } from 'yoctocolors'

type Options = {
  dir: string
  name: string
  theme: string
  watch?: boolean
  headless?: boolean
}

export const cli = program
  .version('1.0.0')
  .description('A CLI for effortlessly rendering your JSON Resume')
  .argument('<resume.json>', 'Path to resume JSON file')
  .option('-d, --dir <dir>', 'Directory to save output files', 'result')
  .option('-t, --theme <theme>', 'Theme to use')
  .option('-n, --name <name>', 'Name of the output files', 'resume')
  .option('-w, --watch', 'Watch resume.json file for changes')
  .option('--headless', 'Run browser in headless mode')
  .action(async (resumeFile: string, { dir, name, theme, watch, headless }: Options) => {
    let themeModule
    try {
      themeModule = await import(theme)
    } catch {
      console.error(`Could not load theme ${yellow(theme)}. Is it installed?`)

      process.exitCode = 1
      return
    }
    return render(resumeFile!, { dir, name, watch, headless })
  })
