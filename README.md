# Resumefy

[![NPM Version](https://img.shields.io/npm/v/resumefy)](https://www.npmjs.com/package/resumefy)
[![build status](https://github.com/tmjssz/resumefy/actions/workflows/build.yml/badge.svg)](https://github.com/tmjssz/resumefy/actions/workflows/build.yml?query=branch%3Amain)
[![coverage](https://tmjssz.github.io/resumefy/badges/coverage.svg)](https://github.com/tmjssz/resumefy/actions/workflows/test.yml?query=branch%3Amain)
![dependency status](https://img.shields.io/librariesio/github/tmjssz/resumefy)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
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

## Getting started

To get started with Resumefy, follow these steps:

1. **Install Resumefy and a Theme**
   
   First, install Resumefy along with your desired theme (in this case `@tmjssz/jsonresume-theme-even`) using Yarn or npm:
   ```shell
   # Yarn
   yarn add resumefy @tmjssz/jsonresume-theme-even
   # NPM
   npm install resumefy @tmjssz/jsonresume-theme-even
   ```

2. **Create a resume JSON file**
   
   Create a resume.json file with your resume data. You can use the [init](#init) command to generate a sample resume JSON file:
   ```shell
   resumefy init -t @tmjssz/jsonresume-theme-even
   ```  
   The generated file will include a `.meta.theme` field specifying the `@tmjssz/jsonresume-theme-even` theme to be used when rendering. Note that the theme option is optional during initialization, as you can also specify the theme in the render step if preferred.

3. **Validate JSON file**
   
   While editing the JSON resume file, you can use the [validate](#validate) command to ensure it conforms to the JSON Resume schema:
   ```shell
   resumefy validate resume.json
   ```

4. **Render the resume**
   
   Use the [render](#render-default) command to generate HTML and PDF versions of your resume:
   ```shell
   resumefy render resume.json -t @tmjssz/jsonresume-theme-even -d ./output
   ```
   This command will render the resume using the specified theme and save the output files in the `./output` directory. Note that the theme option (`-t @tmjssz/jsonresume-theme-even`) is optional if the theme has already been specified in the `.meta.theme` field of the resume JSON file.

## CLI

### Usage

Resumefy provides three commands: `render`, `init`, and `validate`. These commands can be used as follows:

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

Renders the resume in a browser window and exports it to HTML and PDF. The `[resume.json]` argument specifies the path to your JSON resume file. If no file path is provided, it defaults to `resume.json` in the current directory. The command supports a watch mode for previewing the generated resume in a browser. The following options are available:

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

Specifies the target directory where the rendered HTML and PDF files will be written to. By default, the files will be saved in the current working directory.

###### `-t, --theme`

Specifies the theme to use for rendering, overriding the `.meta.theme` field in your resume JSON file (if present). Ensure that the theme is installed as a dependency. For more information, refer to the [Theme Resolution](#theme-resolution) section.

###### `-p, --port`

Specifies the port on which the local file server will listen. This option is only applicable when used in combination with the [`--watch`](#-w---watch) and **without** the [`--headless`](#--headless) option, as the server is used to serve the generated PDF file for preview in headed watch mode.

###### `-w, --watch`

Enables watch mode, which opens the resume in a browser window and watches for changes to the `resume.json` file. The resume will be automatically re-rendered upon changes.

###### `--headless`

Runs the process in headless mode, rendering the resume in the background without opening a browser window.

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

Specifies the name of the theme to use for rendering. This will be set as the `.meta.theme` field of the generated resume JSON file. For more information, refer to the [Theme resolution](#theme-resolution) section.

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

Resumefy does not provide a default theme. You must select and install one yourself, specifying your choice via the [`--theme`](#-t---theme) option or the `.meta.theme` field in your resume JSON file. For example, to use the `@tmjssz/jsonresume-theme-even` theme, you can add the following to your `resume.json` file, which allows you to omit the `--theme` CLI option:

```json
"meta": {
  "theme": "@tmjssz/jsonresume-theme-even"
}
```

#### Use a local theme

Ensure that the theme is installed as a dependency. To use a local theme, add the path to that theme in the dependencies. For example, for a theme called `my-local-theme`, include the correct path to the local package in your `package.json`:

```json
"dependencies": {
  "my-local-theme": "file:./my-local-theme"
}
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
