import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  moduleName: 'v',
  plugins: [
    buble({
      objectAssign: 'Object.assign'
    }),
    nodeResolve({
      jsnext: true
    })
  ]
};
