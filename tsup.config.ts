import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/main/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: './lib',
  clean: true,
  minifySyntax: true,
});
