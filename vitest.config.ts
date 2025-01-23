import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'bin/**', 'scripts/**'],
    coverage: { exclude: [...configDefaults.coverage.exclude!, 'bin/**', 'scripts/**'] },
  },
})
