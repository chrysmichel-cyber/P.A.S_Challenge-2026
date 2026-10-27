/* Configuration des services en ligne. Laisser apiBase vide = jeu 100 % local (comportement par défaut).
   Exemple : window.LCA.config={apiBase:'https://api.exemple.org'}; (serveur de référence : server/server.cjs) */
window.LCA=window.LCA||{};window.LCA.config=Object.assign({apiBase:''},window.LCA.config||{});
