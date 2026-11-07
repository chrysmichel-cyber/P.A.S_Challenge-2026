#!/usr/bin/env node
/* Ajoute un masque à la collection du musée depuis l'API Open Access du Metropolitan Museum.
   Usage : node scripts/add-mask.mjs <objectID> [langId,langId…]
   Exemple : node scripts/add-mask.mjs 310343 yoruba
   Nécessite internet. Télécharge l'image dans img/masks/ et affiche la notice à coller dans js/museum/masks.js.
   Le texte français de « description » est à rédiger ou à relire : le script ne l'invente pas. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';

/* Transforme la réponse de l'API en notice. Pur, testé sans réseau. */
export function toEntry(o, langs = []) {
  const problems = [];
  if (!o || !o.objectID) problems.push('objet introuvable');
  if (o && !o.isPublicDomain) problems.push('objet non marqué « domaine public » : ne pas l’utiliser');
  if (o && !o.primaryImage) problems.push('pas d’image libre');
  const slug = String((o && (o.culture || o.title)) || 'masque').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const id = slug + '-' + (o && o.objectID);
  return {
    problems,
    entry: {
      id, langs,
      traditionalName: (o && o.title) || '',
      catalogName: (o && o.title) || '',
      nameNote: 'Nom donné par le catalogue du musée',
      people: (o && o.culture) || '[à compléter]',
      place: (o && o.country) || '[à compléter]',
      region: '[ouest|centrale|est|nord|australe]', regionName: '[à compléter]',
      image: 'img/masks/' + id + '.jpg',
      description: '[à rédiger à partir de la notice officielle]',
      source: 'The Metropolitan Museum of Art · objet ' + (o && o.objectID),
      url: (o && o.objectURL) || '',
      rights: 'Domaine public · The Met Open Access'
    },
    imageUrl: (o && o.primaryImage) || ''
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [id, langs] = process.argv.slice(2);
  if (!id) { console.error('Usage : node scripts/add-mask.mjs <objectID> [langId,…]'); process.exit(1); }
  const res = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + encodeURIComponent(id));
  const o = await res.json();
  const { problems, entry, imageUrl } = toEntry(o, langs ? langs.split(',') : []);
  if (problems.length) { console.error('Refusé : ' + problems.join(' ; ')); process.exit(2); }
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'img', 'masks');
  const img = await fetch(imageUrl);
  fs.writeFileSync(path.join(dir, path.basename(entry.image)), Buffer.from(await img.arrayBuffer()));
  console.log('Image enregistrée : ' + entry.image + '\nÀ coller dans js/museum/masks.js, puis compléter les champs entre crochets :\n');
  console.log(JSON.stringify(entry, null, 2));
}
