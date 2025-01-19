# Resumefy

[![NPM Version](https://img.shields.io/npm/v/resumefy)](https://www.npmjs.com/package/resumefy)
[![build status](https://github.com/tmjssz/resumefy/actions/workflows/build.yml/badge.svg)](https://github.com/tmjssz/resumefy/actions/workflows/build.yml)
[![coverage](https://tmjssz.github.io/resumefy/badges/coverage.svg)](https://github.com/tmjssz/resumefy/actions/workflows/test.yml)
![dependency status](https://img.shields.io/librariesio/github/tmjssz/resumefy)
![Node Current](https://img.shields.io/node/v/resumefy)

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
yarn add resumefy @tmjssz/jsonresume-theme-even # or your theme of choice
```

## CLI

### Usage

Resumefy provides three commands, `render`, `init` and `validate`, which can be used in the following way.

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
    validate [resume.json]          validate a resume.json file
    help [command]                  display help for command
```

### Commands

#### `render` (default)

Renders resume in a browser window and exports it to HTML and PDF. The `[resume.json]` argument specifies the path to your JSON resume file. If no file path is provided, it defaults to `resume.json` in the current directory. The command supports a watch mode for previewing the generated resume in a browser. The following options are available:

```shell
$ resumefy render --help

  Usage: resumefy render [options] [resume.json]

  render resume to PDF and HTML

  Arguments:
    resume.json            path to resume JSON file (default: "resume.json")

  Options:
    -d, --outDir <outDir>  directory to save output files (default: ".")
    -t, --theme <theme>    theme to use for rendering (overrides theme specified in resume.json)
    -p, --port <port>      port to run the file server on (default: "8080")
    -w, --watch            watch resume.json file for changes
    --headless             run browser in headless mode
    -h, --help             display help for command
```

##### Options

###### `-d, --outDir`

Target directory where the rendered HTML and PDF files will be stored. By default, it will be the same directory on which the command is run.

###### `-t, --theme`

Name of the theme to use for rendering, which overrides the `.meta.theme` field of your resume JSON file. Make sure that the theme is installed as dependency. For more info check the section [Theme resolution](#theme-resolution).

###### `-p, --port`

Defines the port on which the local file server will be listening. This is only applicable in combination with the watch mode, because the server is used to serve the generated PDF file for preview in watch mode.

###### `-w, --watch`

With this option the command will open the resume in a bowser window and watch for changes on the resume.json file.

###### `--headless`

With this option the command will render the resume in the background without opening a browser window.

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

##### Options

###### `-t, --theme`

Name of the theme to use for rendering. It will be set as `.meta.theme` field of the generated resume JSON file. For more info check the section [Theme resolution](#theme-resolution).

#### `validate`

Validate a resume JSON file. The `[resume.json]` argument specifies the file name.

```shell
$ resumefy init --help

  Usage: resumefy validate [options] [resume.json]

  validate a resume.json file

  Arguments:
    resume.json  path to resume JSON file (default: "resume.json")

  Options:
    -h, --help   display help for command
```

### Theme resolution

Resumefy does not provide a default theme. You must pick and install one yourself, and specify your choice via the `--theme` option or the `.meta.theme` field of your resume JSON file.

Make sure that the theme is installed as dependency. To use a local theme, just add the path for that theme to the dependencies. E.g. for a theme called "my-local-theme", this entry would be needed with the correct path to the local package:

```
"my-local-theme": "file:./my-local-theme"
```

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
