import typescript from '@rollup/plugin-typescript';

const external = [
  '@mapbox/unitbezier',
  'gl-matrix',
  'mapbox-gl'
];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external,
    plugins: [typescript()],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true,
    },
    external,
    plugins: [typescript()],
  }
];
