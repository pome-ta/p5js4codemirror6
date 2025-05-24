import { nodeResolve } from '@rollup/plugin-node-resolve';
export default {
  input: './docs/js/modules/srcBundles/codemirror.setup.js',
  output: {
    file: './docs/js/modules/codemirror.bundle.js',
    format: 'es',
  },
  plugins: [nodeResolve()],
};
