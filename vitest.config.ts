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
      exclude: [
        '**/*.test.ts',
        // Its `main` spawns ffmpeg once per tool; running it under coverage
        // would re-encode ten GIFs on every test run. The pure parts — the
        // paths, the filter chain, the argument list — are covered.
        'scripts/sync-demos.ts',
        // A React hook: it needs a DOM and a renderer, which this project does
        // not otherwise pull in. Its behaviour is asserted end-to-end instead,
        // in `e2e/motion.e2e.ts` — every demo still under reduced motion, every
        // demo playing without it. That matters more now that the grid plays
        // ten clips at once.
        'lib/use-prefers-reduced-motion.ts',
      ],
      /**
       * A floor. These ratchet UP as tests land and are never lowered to make
       * a build pass.
       *
       * This site had no unit tests at all a day ago; the floor was set at 10%
       * so the gate could exist while the suite was written, and has moved to
       * where the suite actually reaches. The four uncovered lines are the
       * network call in the Open VSX check and its error path — asserting them
       * would test the stub, not the code.
       */
      thresholds: { lines: 98, functions: 98, statements: 98, branches: 93 },
    },
  },
})
