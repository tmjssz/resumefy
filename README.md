# Resumefy

> A CLI for effortlessly rendering your [JSON Resume](https://jsonresume.org/)

Resumefy renders a JSON resume to HTML and PDF using Puppeteer. It uses [resumed](https://github.com/rbardini/resumed) to render the resume, can be used with any theme and supports watching for changes.

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

## Usage

Resumefy provides two commands, `render` and `init`, which can be used in the following way.

```shell
$ resumefy --help

  Usage: resumefy [options] [command]

  A CLI for effortlessly rendering your JSON Resume

  Options:
    -V, --version                   output the version number
    -h, --help                      display help for command

  Commands:
    render [options] [resume.json]  render resume to PDF and HTML
    init [options] [resume.json]    create a new resume.json file
    help [command]                  display help for command
```

## Commands

### `render` (default)

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

### `init`

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
