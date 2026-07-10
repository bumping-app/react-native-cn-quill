const fs = require('fs');
const path = require('path');

const initCwd = process.env.INIT_CWD
  ? path.resolve(process.env.INIT_CWD)
  : null;

const packageRoot = process.cwd();

if (!initCwd || initCwd === packageRoot) {
  process.exit(0);
}

for (const dir of ['node_modules', 'example/node_modules']) {
  fs.rmSync(path.join(packageRoot, dir), { recursive: true, force: true });
}
