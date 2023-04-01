import { nodeResolve } from '@rollup/plugin-node-resolve';
export default {
  input: './src/js/cmEditor.js',
  output: {
    file: './src/js/modules/cmEditor.bundle.js',
    format: 'es',
  },
  plugins: [nodeResolve()],
};
