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

You can render your resume by running the command `resumefy <resume.json>`, where `<resume.json>` is the path to your JSON resume file. It can be customized wth the following options.

```shell
$ resumefy --help

  Usage: resumefy [options] <resume.json>

  A CLI for effortlessly rendering your JSON Resume

  Arguments:
    resume.json          path to resume JSON file

  Options:
    -V, --version        output the version number
    -d, --outDir <dir>   directory to save output files (default: "result")
    -t, --theme <theme>  theme to use for rendering (overrides theme specified in resume.json)
    -w, --watch          watch resume.json file for changes
    --headless           run browser in headless mode
    -h, --help           display help for command
```

### Theme resolution

Resumefy does not provide a default theme. You must pick and install one yourself, and specify your choice via the `--theme` option or the `.meta.theme` field of your resume JSON file.
