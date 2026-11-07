/* Collection du musée de chaque village.
   Module pur (navigateur : LCA.museum ; Node : require). Il ne crée aucune pièce : il choisit et ordonne
   des objets déjà documentés, du plus proche du village (son peuple) au plus lointain (autres régions). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.LCA = root.LCA || {}; root.LCA.museum = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TIERS = {
    people: { rank: 0, label: 'Le peuple de ce village' },
    region: { rank: 1, label: 'Dans la région' },
    other: { rank: 2, label: 'Ailleurs en Afrique' }
  };

  const has = (list, v) => Array.isArray(list) && list.indexOf(v) >= 0;

  /* Classe un masque pour une langue : peuple (la langue figure dans mask.langs), région, ou ailleurs. */
  function tierOf(mask, lang) {
    if (lang && has(mask.langs, lang.id)) return 'people';
    if (lang && lang.region && mask.region === lang.region) return 'region';
    return 'other';
  }

  /* lang : {id, name, region} ; masks et instruments : listes de notices ; regions : [{id, name}] */
  function forLang(lang, masks, instruments, regions) {
    lang = lang || {};
    masks = masks || []; instruments = instruments || []; regions = regions || [];
    const region = regions.find(r => r.id === lang.region) || null;
    const items = masks.map((m, i) => {
      const tier = tierOf(m, lang);
      return Object.assign({}, m, { kind: 'mask', tier, tierLabel: TIERS[tier].label, _i: i });
    }).sort((a, b) => TIERS[a.tier].rank - TIERS[b.tier].rank || a._i - b._i);
    items.forEach(m => { delete m._i; });
    const counts = { people: 0, region: 0, other: 0 };
    items.forEach(m => { counts[m.tier]++; });
    const name = lang.name || 'ce village';
    const regionName = region ? region.name : 'la région';
    let intro;
    if (counts.people) {
      intro = counts.people + ' masque' + (counts.people > 1 ? 's' : '') + ' du peuple associé à ce village, puis ' + (counts.region ? counts.region + ' de ' + regionName + ' et ' : '') + counts.other + ' d’autres régions.';
    } else if (counts.region) {
      intro = 'Aucun masque de ce peuple n’est encore dans la collection libre du jeu. Voici d’abord ' + counts.region + ' masque' + (counts.region > 1 ? 's' : '') + ' de ' + regionName + ', puis ' + counts.other + ' d’autres régions.';
    } else {
      intro = 'Aucun masque de ce peuple ni de ' + regionName + ' n’est encore dans la collection libre du jeu : la salle présente ' + counts.other + ' masque' + (counts.other > 1 ? 's' : '') + ' d’autres régions, signalés comme tels.';
    }
    return {
      langId: lang.id || null,
      title: 'Musée des masques · ' + name,
      region: region ? region.id : null,
      regionName: region ? region.name : '',
      intro,
      counts,
      hasOwn: counts.people > 0,
      masks: items,
      instruments: instruments.map(x => Object.assign({}, x)),
      /* masques puis instruments, dans l’ordre où la salle les accroche */
      exhibits: items.concat(instruments.map(x => Object.assign({}, x, { kind: 'instrument' })))
    };
  }

  /* Index du masque voisin dans la liste (boucle). dir = +1 ou -1. */
  function neighbour(list, id, dir) {
    if (!list || !list.length) return null;
    const i = list.findIndex(x => x.id === id);
    const j = ((i < 0 ? 0 : i + (dir < 0 ? -1 : 1)) % list.length + list.length) % list.length;
    return list[j];
  }

  /* Contrôle d’une notice : champs obligatoires et droits d’image. Renvoie la liste des problèmes. */
  function validate(mask) {
    const out = [];
    ['id', 'traditionalName', 'catalogName', 'people', 'place', 'region', 'image', 'description', 'source', 'url', 'rights'].forEach(k => {
      if (!mask[k] || !String(mask[k]).trim()) out.push('champ manquant : ' + k);
    });
    if (mask.url && !/^https:\/\//.test(mask.url)) out.push('url non https');
    if (mask.rights && !/(domaine public|cc0|open access)/i.test(mask.rights)) out.push('droits non reconnus comme libres');
    if (mask.langs && !Array.isArray(mask.langs)) out.push('langs doit être une liste');
    return out;
  }

  /* Empreinte pleine du bâtiment, en cercles de collision (centre du bâtiment cx,cz ; le même dans les mondes 2D et 3D).
     Corps 10,5 × 7,7 : grille de cercles r=1,5 espacés de 1,75 (aucun trou), de sorte qu’on ne traverse
     ni les murs ni les contreforts. La façade reste accessible : le joueur s’arrête à ~1 unité de la porte. */
  function footprint(cx, cz) {
    const out = [], xs = [-4.4, -2.65, -.9, .9, 2.65, 4.4], zs = [-2.6, -.85, .9, 2.65];
    zs.forEach(z => xs.forEach(x => out.push({ x: cx + x, z: cz + z, r: 1.5 })));
    return out;
  }

  return { TIERS, tierOf, forLang, neighbour, validate, footprint };
});
