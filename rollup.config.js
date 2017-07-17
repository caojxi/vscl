import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  moduleName: 'v',
  plugins: [
    babel({
      exclude: 'node_modules/*'
    }),
    nodeResolve({
      jsnext: true
    })
  ]
};
