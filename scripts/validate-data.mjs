// Validation technique des données de langues. Lancer : npm run validate
// Détecte : identifiants manquants ou en double, mots incomplets ou en double,
// catégories inconnues, ingrédients absents, nombres incomplets, références de région invalides.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'js', 'data');
const sandbox = { window: {} };
vm.createContext(sandbox);

const order = ['common.js', ...readdirSync(dataDir).filter(f => f.endsWith('.js') && !['common.js', 'regions.js'].includes(f)).sort(), 'regions.js'];
for (const f of order) vm.runInContext(readFileSync(join(dataDir, f), 'utf8'), sandbox, { filename: f });

const { langs, regions, GROUPS, PK } = sandbox.window.LCA;
const STATUTS = ['brouillon', 'verification', 'valide', 'publie'];
const errors = [], warnings = [];
const ids = new Set();
let totalWords = 0;

for (const [key, L] of Object.entries(langs)) {
  if (L.id !== key) errors.push(`${key} : identifiant « ${L.id} » différent de la clé`);
  if (ids.has(L.id)) errors.push(`Identifiant en double : ${L.id}`);
  ids.add(L.id);
  for (const champ of ['name', 'where', 'code', 'names', 'greet', 'drum', 'river', 'board', 'words', 'tales', 'recipes', 'trad', 'history']) {
    if (!L[champ]) errors.push(`${key} : champ manquant « ${champ} »`);
  }
  const regIds = regions.map(r => r.id);
  if (!regIds.includes(L.region)) errors.push(`${key} : région inconnue « ${L.region} »`);
  if (!regions.some(r => r.langs.includes(key))) errors.push(`${key} : absente de regions.js`);
  if (!L.geo || typeof L.geo.lon !== 'number' || typeof L.geo.lat !== 'number' || L.geo.lon < -20 || L.geo.lon > 55 || L.geo.lat < -37 || L.geo.lat > 38) errors.push(`${key} : position géographique absente ou hors de l'Afrique`);
  if (!L.history?.length) warnings.push(`${key} : histoire de la langue absente`);
  if (!L.figure) warnings.push(`${key} : personnalité honorée absente`);
  else for (const c of ['name', 'years', 'role', 'bio']) if (!L.figure[c]) errors.push(`${key} : personnalité, champ « ${c} » manquant`);
  const partial = (L.words || []).length < 30 || !(L.tales || []).length || !(L.recipes || []).length;
  if (partial) warnings.push(`${key} : contenu partiel (${(L.words || []).length} mots, ${(L.tales || []).length} conte(s), ${(L.recipes || []).length} recette(s))`);
  const soft = partial ? warnings : errors;
  const seen = new Set();
  (L.words || []).forEach((w, i) => {
    totalWords++;
    const [g, wo, fr, k] = w;
    if (!wo || !fr) errors.push(`${key} : mot incomplet n°${i + 1}`);
    if (!GROUPS[g]) errors.push(`${key} : catégorie inconnue « ${g} » pour « ${wo} »`);
    const low = String(wo).toLowerCase();
    if (seen.has(low)) warnings.push(`${key} : mot en double « ${wo} »`);
    seen.add(low);
  });
  for (const p of PK) if (!(L.words || []).some(w => w[3] === p)) soft.push(`${key} : l'ingrédient « ${p} » n'a pas de mot associé`);
  if ((L.words || []).filter(w => w[0] === 'c').length !== 10) soft.push(`${key} : les nombres de 1 à 10 sont incomplets`);
  (L.tales || []).forEach(t => { if (!t.title || !t.paras?.length || (!t.moral && t.kind !== 'proverbes')) errors.push(`${key} : conte incomplet « ${t.title || '?'} »`); });
  (L.recipes || []).forEach(r => { if (!r.name || !r.ing?.length || !r.steps?.length) errors.push(`${key} : recette incomplète « ${r.name || '?'} »`); });
  if (!L.sources?.length) warnings.push(`${key} : aucune source renseignée (statut conseillé : brouillon)`);
}
for (const r of regions) for (const l of r.langs) if (!langs[l]) errors.push(`Région « ${r.id} » : langue inconnue « ${l} »`);

console.log(`${Object.keys(langs).length} langues, ${totalWords} mots, ${regions.length} régions.`);
warnings.forEach(w => console.log('  avertissement :', w));
errors.forEach(e => console.error('  ERREUR :', e));
if (errors.length) { console.error(`\n${errors.length} erreur(s).`); process.exit(1); }
console.log('Aucune erreur technique. Les contenus restent à faire valider par des locuteurs et des sources.');
