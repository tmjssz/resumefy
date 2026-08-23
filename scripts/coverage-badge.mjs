// Renders the coverage badge that the README points at.
//
// This used to be a third-party action. It was replaced because the pinned version drove its
// commit through actions that declare `using: node16`, a runtime GitHub no longer provides, and
// because an action holding `contents: write` on this repository is a supply-chain surface that
// fifteen lines of SVG do not need.
//
// The output is deliberately byte-for-byte deterministic for a given percentage: CI commits only
// when `git diff` reports a change, so a stable renderer means no empty "update badges" commits.
//
// Runnable locally: node scripts/coverage-badge.mjs coverage/coverage-summary.json /tmp/cov.svg

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const [summaryPath, outputPath] = process.argv.slice(2)

if (!summaryPath || !outputPath) {
  console.error('usage: node scripts/coverage-badge.mjs <coverage-summary.json> <output.svg>')
  process.exit(1)
}

/** The badge reports the weakest of the four metrics, which is what the action this replaces did. */
const lowestPct = (total) => Math.min(...['lines', 'statements', 'functions', 'branches'].map((key) => total[key].pct))

// Geometry is badgen's flat style at 10x, so the committed badge keeps the look it already had.
// The label never changes, so its metrics are constants; only the value has to be measured.
const LABEL = 'coverage'
const LABEL_TEXT_LENGTH = 503
const LABEL_WIDTH = 603
// Taken from the badge this replaces, where "98.61%" measured 440 across six characters. The value
// is only ever digits, a dot and a percent sign, so one average covers every case it can produce.
const CHAR_WIDTH = 73.33

const badge = (pct) => {
  const value = `${pct}%`
  const valueTextLength = Math.round(value.length * CHAR_WIDTH)
  const valueWidth = valueTextLength + 100
  const width = LABEL_WIDTH + valueWidth
  const color = pct >= 95 ? '#3C1' : '#F73'

  return `<svg width="${width / 10}" height="20" viewBox="0 0 ${width} 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${LABEL}: ${value}">
  <title>${LABEL}: ${value}</title>
  <linearGradient id="gradient" x2="0" y2="100%">
    <stop offset="0" stop-opacity=".1" stop-color="#EEE"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="mask"><rect width="${width}" height="200" rx="30" fill="#FFF"/></mask>
  <g mask="url(#mask)">
    <rect width="${LABEL_WIDTH}" height="200" fill="#555"/>
    <rect width="${valueWidth}" height="200" fill="${color}" x="${LABEL_WIDTH}"/>
    <rect width="${width}" height="200" fill="url(#gradient)"/>
  </g>
  <g aria-hidden="true" text-anchor="start" font-family="Verdana,DejaVu Sans,sans-serif" font-size="110">
    <text x="60" y="148" textLength="${LABEL_TEXT_LENGTH}" fill="#000" opacity="0.25">${LABEL}</text>
    <text x="50" y="138" textLength="${LABEL_TEXT_LENGTH}" fill="#fff">${LABEL}</text>
    <text x="${LABEL_WIDTH + 55}" y="148" textLength="${valueTextLength}" fill="#000" opacity="0.25">${value}</text>
    <text x="${LABEL_WIDTH + 45}" y="138" textLength="${valueTextLength}" fill="#fff">${value}</text>
  </g>
</svg>
`
}

const { total } = JSON.parse(readFileSync(summaryPath, 'utf8'))
const pct = lowestPct(total)

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, badge(pct))

console.log(`coverage ${pct}% -> ${outputPath}`)
