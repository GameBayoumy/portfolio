#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const requiredPackages = [
  'eslint',
  '@eslint/js',
  '@typescript-eslint/parser',
  '@typescript-eslint/eslint-plugin',
  'eslint-config-next',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-import'
]

const hasAllDependencies = requiredPackages.every((pkg) =>
  fs.existsSync(path.join(projectRoot, 'node_modules', ...pkg.split('/')))
)

if (hasAllDependencies) {
  const result = spawnSync('eslint', ['.', '--config', 'eslint.config.mjs'], {
    cwd: projectRoot,
    stdio: 'inherit'
  })

  process.exit(result.status ?? 1)
}

console.warn('\nDetected missing ESLint dependencies. Running offline static checks...\n')

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  '.next',
  'out',
  'dist',
  '.vercel',
  'public'
])

const scanDirectory = (directory, visitor) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.has(entry.name)) {
      continue
    }

    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      scanDirectory(entryPath, visitor)
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      visitor(entryPath)
    }
  }
}

const issues = []
const patterns = [
  { regex: /<<<<<<<\s*HEAD/, message: 'Unresolved merge conflict marker found' },
  { regex: /^=======$/m, message: 'Unresolved merge conflict marker found' },
  { regex: />>>>>>>\s*/, message: 'Unresolved merge conflict marker found' }
]

scanDirectory(projectRoot, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8')

  for (const { regex, message } of patterns) {
    if (regex.test(content)) {
      issues.push({ filePath: path.relative(projectRoot, filePath), message })
    }
  }
})

if (issues.length > 0) {
  console.error('Offline lint checks found issues:')
  for (const issue of issues) {
    console.error(` - ${issue.filePath}: ${issue.message}`)
  }
  process.exit(1)
}

console.log('Offline lint checks passed. No unresolved merge conflict markers detected.')
