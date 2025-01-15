# Resumefy

> A simple toolkit to bring your [JSON Resume](https://jsonresume.org/) to life

Resumefy renders a JSON resume to HTML and PDF with [Puppeteer](https://github.com/puppeteer/puppeteer). It uses [Resumed](https://github.com/rbardini/resumed) under the hood to render the resume and provides both a CLI and a direct Typescript API.

## Features

- 📎 Render from resume JSON file
- 🔎 Validate according to the [schema](https://jsonresume.org/schema)
- ✨ Theme resolution
- 🌐 Render in browser page
- 👀 Watch resume file for changes
- 💾 Export to HTML and PDF file

## Installation

To use Resumefy, first ensure you have installed it along with your desired theme.

```shell
yarn add resumefy jsonresume-theme-even # or your theme of choice
```

## CLI

### Usage

Resumefy provides two commands, `render` and `init`, which can be used in the following way.

```shell
$ resumefy --help

  Usage: resumefy [options] [command]

  A simple toolkit to bring your JSON Resume to life

  Options:
    -V, --version                   output the version number
    -h, --help                      display help for command

  Commands:
    render [options] [resume.json]  render resume to PDF and HTML
    init [options] [resume.json]    create a new resume.json file
    help [command]                  display help for command
```

### Commands

#### `render` (default)

Renders resume in a browser window and exports it to HTML and PDF. The `[resume.json]` argument specifies the path to your JSON resume file. If no file path is provided, it defaults to `resume.json` in the current directory. The following options are available:

```shell
$ resumefy render --help

  Usage: resumefy render [options] [resume.json]

  render resume to PDF and HTML

  Arguments:
    resume.json            path to resume JSON file (default: "resume.json")

  Options:
    -d, --outDir <outDir>  directory to save output files (default: ".")
    -t, --theme <theme>    theme to use for rendering (overrides theme specified in resume.json)
    -w, --watch            watch resume.json file for changes
    --headless             run browser in headless mode
    -h, --help             display help for command
```

#### `init`

Creates a new resume JSON file with sample data. The `[resume.json]` argument specifies the file name. The following options are available:

```shell
$ resumefy init --help

  Usage: resumefy init [options] [resume.json]

  create a new resume.json file

  Arguments:
    resume.json          filename to create (default: "resume.json")

  Options:
    -t, --theme <theme>  theme to use for rendering (sets theme in resume.json)
    -h, --help           display help for command
```

### Theme resolution

Resumefy does not provide a default theme. You must pick and install one yourself, and specify your choice via the `--theme` option or the `.meta.theme` field of your resume JSON file.

## API

### `render`

Renders a resume from a JSON file to HTML and PDF.

```typescript
import { render } from 'resumefy'

render('./resume.json', {
  theme: 'jsonresume-theme-even',
  outDir: './result',
})
```

#### Parameters

- `resumeFile` _(string)_: The path to the resume JSON file.
- `options` _(RenderOptions)_: An options object with the following properties:
  - `theme` _(string)_: The theme to use for rendering
  - `outDir` _(string)_: The directory to save the output files (default: '.')

#### Returns

`Promise<void>`: A promise resolving when rendering is complete.

### `validate`

Validate a resume JSON file.

```typescript
import { validate } from 'resumefy'

validate('./resume.json')
```

#### Parameters

- `resumeFile` _(string)_: The path to the resume JSON file.

#### Returns

`Promise<boolean>`: Promise resolving with a boolean whether resume JSON is valid.

### `init`

Initialize a new resume JSON file with sample data and optional theme.

```typescript
import { init } from 'resumefy'

init('my-resume.json', 'jsonresume-theme-even')
```

#### Parameters

- `resumeFile` _(string)_: File name to write
- `theme` _(string)_: Name of theme to write in JSON file's meta data (optional)

#### Returns

`Promise<void>`: A promise resolving when file is written.
