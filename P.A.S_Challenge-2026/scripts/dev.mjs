import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env, NZASSA_CORS: 'http://127.0.0.1:5173' };
const children = [
  spawn(process.execPath, ['server/server.cjs'], { cwd: root, env, stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5173', '--open'], { cwd: root, env, stdio: 'inherit' })
];

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach(child => { if (!child.killed) child.kill(); });
  process.exitCode = code;
}
children.forEach(child => child.on('exit', code => {
  if (!stopping) stop(code || 0);
}));
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
