import { defineConfig } from 'vitest/config'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', restoreMocks: true, clearMocks: true },
  plugins: mode === 'analyze' ? [visualizer({ filename: 'dist/bundle-analysis.html', open: false, gzipSize: true, brotliSize: true })] : [],
}))

