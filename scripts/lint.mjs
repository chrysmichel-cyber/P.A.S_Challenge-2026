// Contrôle léger sans dépendance : syntaxe de chaque fichier JS, pas de debugger/console.log oubliés, JSON valide.
import {readdirSync,readFileSync,statSync} from 'node:fs';import {join,dirname,extname} from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');let bad=0,n=0;
function walk(d){for(const f of readdirSync(d)){if(['node_modules','dist','vendor','.git'].includes(f))continue;const p=join(d,f),s=statSync(p);if(s.isDirectory())walk(p);else check(p)}}
function check(p){const e=extname(p),t=p.slice(root.length+1);
 if(e==='.js'||e==='.mjs'||e==='.cjs'){n++;const src=readFileSync(p,'utf8');
  const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});if(r.status!==0){bad++;console.log('erreur de syntaxe :',t,(r.stderr||'').split('\n').slice(0,4).join(' '))}
  if(/\bdebugger\b/.test(src)&&!t.startsWith('scripts')){bad++;console.log('debugger oublié :',t)}
  if(t.startsWith('js/')&&/console\.log\(/.test(src)){bad++;console.log('console.log oublié :',t)}}
 if(e==='.json'||e==='.webmanifest'){n++;try{JSON.parse(readFileSync(p,'utf8'))}catch(err){bad++;console.log('JSON invalide :',t)}}}
walk(root);console.log(n+' fichiers contrôlés, '+bad+' problème(s).');process.exit(bad?1:0);
