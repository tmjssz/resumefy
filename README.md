# Resumefy

> A CLI for effortlessly rendering your [JSON Resume](https://jsonresume.org/)

Resumefy renders a JSON resume to HTML and PDF using Puppeteer. It uses [resumed](https://github.com/rbardini/resumed) to render the resume and supports themes and watching for changes.

## Installation

```shell
yarn add resumefy jsonresume-theme-even # or your theme of choice
```

## Usage

```shell
$ resumefy --help

  Usage: resumefy [options] <resume.json>

  A CLI for effortlessly rendering your JSON Resume

  Arguments:
    resume.json          Path to resume JSON file

  Options:
    -V, --version        output the version number
    -d, --dir <dir>      Directory to save output files (default: "result")
    -t, --theme <theme>  Theme to use for rendering (overrides theme specified in resume.json)
    -n, --name <name>    Name of the output files (default: "resume")
    -w, --watch          Watch resume.json file for changes
    --headless           Run browser in headless mode
    -h, --help           display help for command
```
