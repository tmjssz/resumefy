import { createRequire } from 'node:module'
import { program } from 'commander'
import { render } from './render'
import { init } from './init'
import { validate } from './validate'

// Read at runtime rather than imported: `import ... with { type: 'json' }` needs Node >= 20.10,
// below this package's engines floor, and tsconfig's rootDir of ./src makes tsc reject importing
// package.json from above src/ anyway. src/cli/ and dist/cli/ sit at the same depth, so this one
// relative path is correct for vitest, for the built output, and inside the packed tarball.
const { version, description } = createRequire(import.meta.url)('../../package.json')

export const cli = program.version(version).description(description)

cli
  .command('render', { isDefault: true })
  .description('render resume to PDF and HTML')
  .argument('[resume.json]', 'path to resume JSON file', 'resume.json')
  .option('-d, --outDir <outDir>', 'directory to save output files', '.')
  .option('-t, --theme <theme>', 'theme to use for rendering (overrides theme specified in resume.json)')
  .option('-p, --port <port>', 'port to run the file server on', '8080')
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
