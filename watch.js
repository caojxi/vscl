const cp = require('child_process');
const chokidar = require('chokidar');

const exec = (cmd, args) => {
  const child = cp.spawn(cmd, args);
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
};

chokidar.watch('src/**/*.js')
  .on('change', () => exec('npm', ['run', 'build']));

chokidar.watch('dist/v.js')
  .on('change', () => exec('npm', ['run', 'uglify']));

exec('npm', ['run', 'build']);
