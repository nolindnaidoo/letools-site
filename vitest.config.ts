import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Next resolves `@/*` from tsconfig; Vitest does not read that, so without
  // this any module using the alias is untestable — which is how `lib/` came
  // to have no tests at all.
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  test: {
    include: ['lib/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      /**
       * Behaviour only. Components are markup over frozen content, and a
       * coverage number across them measures templating rather than logic —
       * a figure that gets gamed instead of a gate that catches anything.
       * Their assurance is the Playwright suite against the real export.
       */
      include: ['lib/**/*.ts', 'scripts/**/*.ts'],
      exclude: ['**/*.test.ts'],
      /**
       * A floor, set at where this repo actually is — not where it should be.
       *
       * This site had no unit tests at all. A threshold of 100 here would fail
       * every build until the whole suite exists, so it would be deleted
       * within a day and the gate would be worth nothing. These numbers ratchet
       * UP as tests land and are never lowered to make a build pass. The
       * sibling repos sit at 100/100/100 with branches at 95-98; that is the
       * destination.
       */
      thresholds: { lines: 10, functions: 27, statements: 10, branches: 0 },
    },
  },
})
