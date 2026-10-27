// Copie le site statique dans dist/ (aucun bundler nécessaire). Lancer : npm run build
import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of ['index.html', 'css', 'js', 'vendor']) cpSync(join(root, p), join(out, p), { recursive: true });
console.log('Site statique prêt dans dist/ (à servir avec n’importe quel serveur de fichiers).');
