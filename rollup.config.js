import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  moduleName: 'v',
  plugins: [
    babel({
      babelrc: false,
      presets: [[
        'es2015', {
          modules: false
        }
      ]],
      plugins: [
        "external-helpers"
      ],
      exclude: 'node_modules/**'
    }),
    nodeResolve({
      jsnext: true
    })
  ]
};
