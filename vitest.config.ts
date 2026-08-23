import { configDefaults, defineConfig } from 'vitest/config'

// Vitest 4 trimmed its default excludes down to node_modules and .git, so the
// build output and the non-source directories have to be listed explicitly.
const excluded = ['dist/**', 'bin/**', 'scripts/**']

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, ...excluded],
    coverage: { exclude: [...configDefaults.coverage.exclude!, ...excluded, '**/*.test.ts', '*.config.ts'] },
  },
})
