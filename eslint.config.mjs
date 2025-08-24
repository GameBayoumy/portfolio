import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
})

export default [
  // Ignore patterns
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
  },
  
  // Apply Next.js configuration using compatibility layer
  ...compat.extends('next/core-web-vitals'),
  
  // Override rules that were causing issues
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Disable rules that cause issues with the current setup
      'react/no-unescaped-entities': 'off',
      'no-unused-vars': 'off',
      'react/display-name': 'off',
      '@next/next/no-img-element': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Keep these as warnings for code quality
      'prefer-const': 'warn',
      'import/no-anonymous-default-export': 'warn'
    }
  }
]