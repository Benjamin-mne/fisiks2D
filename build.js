import { build } from 'esbuild';

build({
    entryPoints: ['./src/index.ts'],
    outfile: './dist/bundle.js',
    bundle: true,
    format: 'esm',
    target: ['es2020'],
    sourcemap: true,
    loader: { '.ts': 'ts' },
    logLevel: 'info',
  }).catch(() => process.exit(1));
  