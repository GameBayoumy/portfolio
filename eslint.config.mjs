import path from 'path'
import { fileURLToPath } from 'url'

const optionalImport = (specifier) =>
  import(specifier).then(
    (module) => module.default ?? module,
    () => null
  )

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const [
  eslintJs,
  tsParser,
  tsPlugin,
  reactPlugin,
  reactHooksPlugin,
  nextPlugin
] = await Promise.all([
  optionalImport('@eslint/js'),
  optionalImport('@typescript-eslint/parser'),
  optionalImport('@typescript-eslint/eslint-plugin'),
  optionalImport('eslint-plugin-react'),
  optionalImport('eslint-plugin-react-hooks'),
  optionalImport('@next/eslint-plugin-next')
])

const baseIgnores = [
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

const languageOptions = {
  ecmaVersion: 2023,
  sourceType: 'module',
  parserOptions: {
    ecmaFeatures: { jsx: true }
  }
}

if (!tsParser) {
  baseIgnores.push('**/*.ts', '**/*.tsx')
}

const configs = [
  { ignores: baseIgnores }
]

if (eslintJs?.configs?.recommended) {
  configs.push(eslintJs.configs.recommended)
}

const sharedRules = {
  'react/no-unescaped-entities': 'off',
  'no-unused-vars': 'off',
  'react/display-name': 'off',
  'prefer-const': 'warn',
  'no-console': ['warn', { allow: ['warn', 'error'] }]
}

if (reactHooksPlugin) {
  sharedRules['react-hooks/exhaustive-deps'] = 'warn'
}
if (nextPlugin) {
  sharedRules['@next/next/no-img-element'] = 'warn'
}

const mainConfig = {
  files: [tsParser ? '**/*.{js,jsx,ts,tsx}' : '**/*.{js,jsx}'],
  languageOptions: {
    ...languageOptions,
    ...(tsParser
      ? {
          parser: tsParser,
          parserOptions: {
            ...languageOptions.parserOptions,
            project: ['tsconfig.json'],
            tsconfigRootDir: __dirname
          }
        }
      : {})
  },
  rules: { ...sharedRules }
}

const pluginMap = {}
if (reactPlugin) {
  pluginMap.react = reactPlugin
}
if (reactHooksPlugin) {
  pluginMap['react-hooks'] = reactHooksPlugin
}
if (nextPlugin) {
  pluginMap['@next/next'] = nextPlugin
}
if (tsPlugin && tsParser) {
  pluginMap['@typescript-eslint'] = tsPlugin
  mainConfig.rules['@typescript-eslint/no-unused-vars'] = ['warn', { argsIgnorePattern: '^_' }]
}

if (Object.keys(pluginMap).length > 0) {
  mainConfig.plugins = pluginMap
}

configs.push(mainConfig)

configs.push({
  files: ['tests/**/*.{js,jsx,ts,tsx}'],
  rules: {
    'no-console': 'off'
  }
})

export default configs
