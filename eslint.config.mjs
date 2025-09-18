import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let compat

try {
  const js = await import('@eslint/js')
  const eslintrc = await import('@eslint/eslintrc')
  const FlatCompat = eslintrc.FlatCompat

  if (FlatCompat) {
    compat = new FlatCompat({
      baseDirectory: __dirname,
      recommendedConfig: js?.default?.configs?.recommended ?? js?.configs?.recommended,
      allConfig: js?.default?.configs?.all ?? js?.configs?.all
    })
  }
} catch (error) {
  console.warn(
    'Falling back to a minimal ESLint configuration because optional dependencies are unavailable.',
    error
  )
}

const config = [
  {
    ignores: [
      '.next/**',
      '.vercel/**',
      'out/**',
      'dist/**',
      'node_modules/**',
      '.git/**',
      'coverage/**',
      '.nyc_output/**',
      '.cache/**',
      'public/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
      '.eslintrc.js',
      '.prettierrc.js',
      'instrumentation.ts',
      'instrumentation-client.ts',
      '*.generated.*',
      '**/*.generated.*',
      'jest.setup.js',
      'scripts/**/*',
      '.claude/**/*',
      'docs/**/*'
    ]
  }
]

const sharedRuleConfig = {
  'no-unused-vars': 'off',
  'prefer-const': 'warn'
}

const pluginRuleConfig = {
  'react/no-unescaped-entities': 'off',
  'react/display-name': 'off',
  '@next/next/no-img-element': 'warn',
  'react-hooks/exhaustive-deps': 'warn',
  'import/no-anonymous-default-export': 'warn'
}

if (compat) {
  config.push(...compat.extends('next/core-web-vitals'))
  config.push({
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      ...sharedRuleConfig,
      ...pluginRuleConfig
    }
  })
} else {
  config.push({
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: sharedRuleConfig
  })
}

export default config