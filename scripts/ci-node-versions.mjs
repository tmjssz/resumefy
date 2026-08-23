// Derives the CI node matrix from the two files that already define which Node versions this
// package supports, so the list cannot drift from them.
//
// It drifted once: the matrix still read ['20', '24'] with a comment calling 20 "the engines floor
// and the .node-version pin" after both had moved to >=22.18.0 and 24.19.0. CI was therefore
// testing a version the package no longer supports, and never testing the pin at all.
//
// Emits GITHUB_OUTPUT lines on stdout:
//   matrix=["22","24"]   every major to run build-test against
//   pin=24               the .node-version major, the canonical leg for uploading artifacts
//
// Runnable locally: node scripts/ci-node-versions.mjs

import { readFileSync } from 'node:fs'

/**
 * Lowest major mentioned in an engines range.
 *
 * Matching whole version tokens before splitting is what keeps ">=22.18.0" from yielding 0 — a
 * bare \d+ scan would see 22, 18 and 0 and pick the smallest of those.
 */
const lowestMajor = (range) => {
  const majors = (range.match(/\d+(?:\.\d+)*/g) ?? []).map((token) => Number(token.split('.')[0]))
  if (majors.length === 0) throw new Error(`no version found in engines.node: ${JSON.stringify(range)}`)
  return Math.min(...majors)
}

const enginesRange = JSON.parse(readFileSync('package.json', 'utf8')).engines?.node
if (!enginesRange) throw new Error('package.json has no engines.node')

const floor = lowestMajor(enginesRange)
const pin = Number(readFileSync('.node-version', 'utf8').trim().split('.')[0])
if (!Number.isInteger(pin)) throw new Error('.node-version does not start with a major version')

// A pin below the floor means the two files disagree about what is supported. That is a real
// misconfiguration and should stop CI rather than quietly produce a matrix that hides it.
if (pin < floor) {
  throw new Error(`.node-version (${pin}) is below the engines floor (${floor})`)
}

const matrix = [...new Set([floor, pin])].sort((a, b) => a - b).map(String)

console.log(`matrix=${JSON.stringify(matrix)}`)
console.log(`pin=${pin}`)
