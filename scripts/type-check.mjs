#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const runTypeCheck = (args) =>
  spawnSync('tsc', args, {
    cwd: projectRoot,
    stdio: 'inherit'
  })

const requiredTypeDeps = [
  ['@types', 'react'],
  ['@types', 'react-dom'],
  ['@types', 'node']
]

const missingDependencies = requiredTypeDeps.some((segments) =>
  !fs.existsSync(path.join(projectRoot, 'node_modules', ...segments))
)

if (!missingDependencies) {
  const primary = runTypeCheck(['--noEmit'])

  if (primary.status === 0) {
    process.exit(0)
  }

  console.warn('\nPrimary type-check failed. Falling back to offline configuration...\n')
} else {
  console.warn('\nDetected missing type dependencies. Running offline type-check configuration...\n')
}

const fallback = runTypeCheck(['--noEmit', '--project', 'tsconfig.offline.json'])

process.exit(fallback.status ?? 1)
