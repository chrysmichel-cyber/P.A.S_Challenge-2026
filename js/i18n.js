/* Langue de l’interface du jeu : français (source), anglais, portugais.
   Principe : le texte du jeu est écrit en français ; ce module traduit à l’affichage les libellés d’interface connus
   (boutons, menus, titres, aides) par correspondance exacte, plus quelques motifs avec nombres.
   Il ne traduit PAS les contenus culturels et pédagogiques (contes, recettes, vocabulaire, notices de masques,
   histoire des langues) : ils restent en français tant qu’ils n’ont pas été relus par des personnes compétentes.
   Module UMD : navigateur (LCA.i18n) et Node (require) pour les tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.LCA = root.LCA || {}; root.LCA.i18n = api; if (typeof document !== 'undefined') api.boot(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const LANGS = { fr: 'Français', en: 'English', pt: 'Português' };
  /* [français, anglais, portugais] */
  const T = [
    ['N’Zassa', 'N’Zassa', 'N’Zassa'], ['Un continent, mille cultures', 'One continent, a thousand cultures', 'Um continente, mil culturas'],
    ['Invité', 'Guest', 'Convidado'], ['Carte', 'Map', 'Mapa'], ['trésors cachés', 'hidden treasures', 'tesouros escondidos'],
    ['Personnages', 'Characters', 'Personagens'], ['Objets', 'Objects', 'Objetos'], ['✦ Trésor proche', '✦ Treasure nearby', '✦ Tesouro por perto'],
    ['Joueurs', 'Players', 'Jogadores'], ['Envoyer', 'Send', 'Enviar'], ['Plus tard', 'Later', 'Mais tarde'], ['Fermer', 'Close', 'Fechar'],
    ['Quêtes', 'Quests', 'Missões'], ['Inventaire', 'Inventory', 'Inventário'], ['Contes', 'Tales', 'Contos'], ['Recettes', 'Recipes', 'Receitas'],
    ['Traditions', 'Traditions', 'Tradições'], ['Musée', 'Museum', 'Museu'], ['Apprendre', 'Learn', 'Aprender'], ['Pause', 'Pause', 'Pausa'],
    ['Reprendre', 'Resume', 'Retomar'], ['Mon personnage', 'My character', 'A minha personagem'], ['Changer de langue', 'Change language', 'Mudar de língua'],
    ['Menu principal', 'Main menu', 'Menu principal'], ['Menu principal (M)', 'Main menu (M)', 'Menu principal (M)'],
    ['Ta progression est enregistrée dans ce navigateur.', 'Your progress is saved in this browser.', 'O teu progresso é guardado neste navegador.'],
    ['Carte de l’Afrique', 'Map of Africa', 'Mapa de África'], ['Tu avances vers l’entrée du village…', 'You are walking to the village entrance…', 'Estás a caminho da entrada da aldeia…'],
    ['Nouvelle aventure', 'New adventure', 'Nova aventura'], ['Choisir un peuple sur la carte et créer ton personnage', 'Pick a people on the map and create your character', 'Escolhe um povo no mapa e cria a tua personagem'],
    ['Continuer', 'Continue', 'Continuar'], ['Aucune sauvegarde pour le moment', 'No saved game yet', 'Ainda não há jogo guardado'],
    ['Régions', 'Regions', 'Regiões'], ['Patrimoine oral', 'Oral heritage', 'Património oral'], ['Mon parcours', 'My journey', 'O meu percurso'],
    ['Collection', 'Collection', 'Coleção'], ['Relecture', 'Review', 'Revisão'], ['Profil', 'Profile', 'Perfil'], ['Paramètres', 'Settings', 'Definições'],
    ['Mode invité', 'Guest mode', 'Modo convidado'], ['Se connecter', 'Sign in', 'Entrar'], ['Mode de jeu', 'Game mode', 'Modo de jogo'],
    ['Solo', 'Solo', 'Individual'], ['Monde ouvert', 'Open world', 'Mundo aberto'], ['Crédits et licences', 'Credits and licences', 'Créditos e licenças'],
    ['langues', 'languages', 'línguas'], ['contes', 'tales', 'contos'], ['recettes', 'recipes', 'receitas'], ['mots', 'words', 'palavras'],
    ['Parcours des villages d’Afrique, rencontre leurs habitants et apprends 42 langues par les contes, la cuisine et la musique.', 'Travel through African villages, meet their people and learn 42 languages through tales, cooking and music.', 'Percorre aldeias africanas, conhece os seus habitantes e aprende 42 línguas através de contos, culinária e música.'],
    ['Ta progression est gardée sur cet appareil. Crée un profil pour en avoir plusieurs.', 'Your progress is kept on this device. Create a profile to have several.', 'O teu progresso fica neste aparelho. Cria um perfil para teres vários.'],
    ['Tu joues seul(e) dans ton village : rien n’est envoyé sur Internet.', 'You play alone in your village: nothing is sent over the Internet.', 'Jogas sozinho(a) na tua aldeia: nada é enviado pela Internet.'],
    ['Jouer en plein écran', 'Play full screen', 'Jogar em ecrã inteiro'], ['Passer en plein écran', 'Go full screen', 'Passar a ecrã inteiro'], ['Continuer quand même', 'Continue anyway', 'Continuar mesmo assim'],
    ['Village peint en 2D', 'Painted 2D village', 'Aldeia pintada em 2D'], ['Village virtuel en 3D', 'Virtual 3D village', 'Aldeia virtual em 3D'],
    ['Mon profil', 'My profile', 'O meu perfil'], ['Voir mes quêtes', 'See my quests', 'Ver as minhas missões'], ['Discussion du village', 'Village chat', 'Conversa da aldeia'],
    ['Discussion (T)', 'Chat (T)', 'Conversa (T)'], ['Fermer la discussion', 'Close chat', 'Fechar a conversa'], ['Écrire un message (texte seulement)…', 'Write a message (text only)…', 'Escreve uma mensagem (só texto)…'],
    ['Message', 'Message', 'Mensagem'], ['Heure et météo du village', 'Village time and weather', 'Hora e meteorologia da aldeia'], ['Carte du village : toucher pour agrandir', 'Village map: tap to enlarge', 'Mapa da aldeia: toca para ampliar'],
    ['Contrôle de déplacement', 'Movement control', 'Controlo de movimento'], ['Contrôle de la caméra', 'Camera control', 'Controlo da câmara'], ['caméra', 'camera', 'câmara'],
    ['Atelier de langue', 'Language workshop', 'Oficina de língua'], ['École du village', 'Village school', 'Escola da aldeia'], ['Gardien de la mémoire', 'Keeper of memory', 'Guardião da memória'],
    ['Le gardien de la mémoire', 'The keeper of memory', 'O guardião da memória'], ['Écouter', 'Listen', 'Ouvir'], ['Fermer la notice', 'Close the notice', 'Fechar a ficha'],
    ['Suivant', 'Next', 'Seguinte'], ['Contenu provisoire.', 'Provisional content.', 'Conteúdo provisório.'], ['Voir mes étoiles', 'See my stars', 'Ver as minhas estrelas'], ['Retour', 'Back', 'Voltar'], ['Réviser mes erreurs', 'Review my mistakes', 'Rever os meus erros'], ['Mon parcours', 'My progress', 'O meu percurso'], ['Rejouer', 'Play again', 'Jogar de novo'], ['Passer le quiz', 'Skip to the quiz', 'Ir para o questionário'], ['Reprendre le quiz', 'Resume the quiz', 'Retomar o questionário'], ['Le quiz sert à valider ce que tu viens d’apprendre. Tu peux revenir ici quand tu veux.', 'The quiz checks what you have just learned. You can come back here any time.', 'O questionário serve para validar o que acabaste de aprender. Podes voltar aqui quando quiseres.'], ['J’ai appris : passer au quiz', 'I have learned it: go to the quiz', 'Já aprendi: ir para o questionário'],
    ['Précédent', 'Previous', 'Anterior'], ['Chapitre suivant', 'Next chapter', 'Capítulo seguinte'],
    ['ZQSD ou flèches pour marcher · glisse pour tourner la vue · E pour parler · M pour le menu', 'WASD or arrows to walk · drag to turn the view · E to talk · M for the menu', 'WASD ou setas para andar · arrasta para rodar a vista · E para falar · M para o menu'],
    ['Joystick pour marcher · glisse pour tourner la vue', 'Joystick to walk · drag to turn the view', 'Joystick para andar · arrasta para rodar a vista'],
    ['ZQSD / WASD : marcher · Maj : courir · Espace : sauter · E : parler · M : menu · P : pause', 'WASD / ZQSD: walk · Shift: run · Space: jump · E: talk · M: menu · P: pause', 'WASD / ZQSD: andar · Shift: correr · Espaço: saltar · E: falar · M: menu · P: pausa'],
    ['Monde prêt.', 'World ready.', 'Mundo pronto.'],
    /* musée */
    ['Photo', 'Photo', 'Foto'], ['Modèle 3D', '3D model', 'Modelo 3D'], ['Collection permanente', 'Permanent collection', 'Coleção permanente'], ['Réduire ▾', 'Collapse ▾', 'Reduzir ▾'],
    ['Visite immersive · masques et instruments', 'Immersive visit · masks and instruments', 'Visita imersiva · máscaras e instrumentos'], ['Musée des masques', 'Mask museum', 'Museu das máscaras'],
    ['Sortir du musée', 'Leave the museum', 'Sair do museu'], ['Choisis un masque', 'Choose a mask', 'Escolhe uma máscara'],
    ['Voir la photo et zoomer', 'View the photo and zoom', 'Ver a foto e ampliar'], ['Manipuler ce masque en 3D', 'Handle this mask in 3D', 'Manipular esta máscara em 3D'],
    ['Glisse pour regarder autour · molette ou pincement pour zoomer · sélectionne une vitrine pour lire sa notice', 'Drag to look around · wheel or pinch to zoom · select a display to read its notice', 'Arrasta para olhar à volta · roda ou pinça para ampliar · seleciona uma vitrina para ler a ficha'],
    ['Façon d’observer le masque', 'How to view the mask', 'Como observar a máscara'], ['Zoom arrière', 'Zoom out', 'Reduzir'], ['Zoom avant', 'Zoom in', 'Ampliar'], ['Taille d’origine', 'Original size', 'Tamanho original'],
    ['Réinitialiser la vue 3D', 'Reset the 3D view', 'Repor a vista 3D'], ['Masque précédent', 'Previous mask', 'Máscara anterior'], ['Masque suivant', 'Next mask', 'Máscara seguinte'],
    ['Choisir une pièce de la salle', 'Choose a piece in the room', 'Escolher uma peça da sala'], ['Entrer dans le musée immersif', 'Enter the immersive museum', 'Entrar no museu imersivo'],
    ['Photo, notice et modèle 3D →', 'Photo, notice and 3D model →', 'Foto, ficha e modelo 3D →'], ['Le peuple de ce village', 'The people of this village', 'O povo desta aldeia'],
    ['Dans la région', 'In the region', 'Na região'], ['Ailleurs en Afrique', 'Elsewhere in Africa', 'Noutras partes de África'],
    /* carte et choix de langue */
    ['Fermer la carte', 'Close the map', 'Fechar o mapa'], ['Le contenu du jeu', 'Game content', 'Conteúdo do jogo'], ['← Retour', '← Back', '← Voltar'],
    ['Touche une pastille sur la carte pour choisir un peuple et sa langue. Chaque langue a son décor et sa propre progression.', 'Tap a dot on the map to choose a people and its language. Each language has its own setting and its own progress.', 'Toca num ponto do mapa para escolher um povo e a sua língua. Cada língua tem o seu cenário e o seu progresso.'],
    ['Toute l’Afrique', 'All of Africa', 'Toda a África'], ['Ouest', 'West', 'Oeste'], ['Nord', 'North', 'Norte'], ['Est', 'East', 'Leste'], ['Centrale', 'Central', 'Central'], ['Australe', 'Southern', 'Austral'],
    ['Langue', 'Language', 'Língua'], ['Choisie', 'Chosen', 'Escolhida'], ['Brouillon', 'Draft', 'Rascunho'], ['Choisir cette langue', 'Choose this language', 'Escolher esta língua'],
    ['Voir la liste des langues', 'See the list of languages', 'Ver a lista de línguas'], ['Chercher une langue…', 'Search for a language…', 'Procurar uma língua…'],
    ['Chercher une langue sur la carte', 'Search for a language on the map', 'Procurar uma língua no mapa'], ['Zoomer sur une région', 'Zoom on a region', 'Ampliar uma região'],
    ['Carte de l’Afrique avec les langues du jeu', 'Map of Africa with the game’s languages', 'Mapa de África com as línguas do jogo'], ['mots et phrases', 'words and phrases', 'palavras e frases'], ['quêtes', 'quests', 'missões'],
    ['Commencer l’aventure', 'Start the adventure', 'Começar a aventura'], ['Rester dans ce village', 'Stay in this village', 'Ficar nesta aldeia'],
    ['conte(s)', 'tale(s)', 'conto(s)'], ['recette(s)', 'recipe(s)', 'receita(s)'],
    /* personnage */
    ['Personnage', 'Character', 'Personagem'], ['Nom', 'Name', 'Nome'], ['Valider', 'Confirm', 'Confirmar'], ['Sexe', 'Sex', 'Sexo'], ['Féminin', 'Female', 'Feminino'], ['Masculin', 'Male', 'Masculino'],
    ['Couleur de peau', 'Skin colour', 'Cor da pele'], ['Coiffure', 'Hairstyle', 'Penteado'], ['Courts', 'Short', 'Curtos'], ['Afro', 'Afro', 'Afro'], ['Tresses', 'Braids', 'Tranças'], ['Chignon', 'Bun', 'Carrapito'], ['Longs', 'Long', 'Compridos'], ['Rasés', 'Shaved', 'Rapados'],
    ['Couleur des cheveux', 'Hair colour', 'Cor do cabelo'], ['Tenue', 'Outfit', 'Roupa'], ['Tenue simple', 'Simple outfit', 'Roupa simples'], ['Jupe', 'Skirt', 'Saia'], ['Pagne à motifs', 'Patterned wrap', 'Pano estampado'], ['Boubou', 'Boubou', 'Bubu'],
    ['Couleur du haut', 'Top colour', 'Cor de cima'], ['Couleur du bas', 'Bottom colour', 'Cor de baixo'], ['Couvre-chef', 'Headwear', 'Chapéu'], ['Aucun', 'None', 'Nenhum'], ['Bonnet', 'Beanie', 'Gorro'], ['Chapeau de paille', 'Straw hat', 'Chapéu de palha'], ['Foulard', 'Scarf', 'Lenço'], ['Casquette', 'Cap', 'Boné'],
    ['Accessoires', 'Accessories', 'Acessórios'], ['Lunettes', 'Glasses', 'Óculos'], ['Bijoux', 'Jewellery', 'Joias'], ['Barbe', 'Beard', 'Barba'], ['Sac à dos', 'Backpack', 'Mochila'], ['Réinitialiser', 'Reset', 'Repor'], ['Terminé', 'Done', 'Concluído'],
    ['Comment t’appelles-tu ?', 'What is your name?', 'Como te chamas?'], ['Nom du personnage', 'Character name', 'Nome da personagem'],
    ['Les changements s’affichent tout de suite dans le monde. Ils sont gardés dans ce navigateur.', 'Changes show up in the world right away. They are kept in this browser.', 'As alterações aparecem logo no mundo. Ficam guardadas neste navegador.'],
    ['Personnage provisoire, volontairement stylisé. Les tenues et coiffures proposées ne représentent aucune communauté en particulier.', 'Provisional character, deliberately stylised. The outfits and hairstyles offered do not represent any particular community.', 'Personagem provisória, propositadamente estilizada. As roupas e penteados propostos não representam nenhuma comunidade em particular.'],
    ['Peau', 'Skin', 'Pele'], ['Cheveux', 'Hair', 'Cabelo'], ['Haut', 'Top', 'Cima'], ['Bas', 'Bottom', 'Baixo'],
    /* quêtes, inventaire, panneaux */
    ['Ton inventaire', 'Your inventory', 'O teu inventário'], ['Ton carnet de voyage', 'Your travel journal', 'O teu diário de viagem'], ['À découvrir', 'To discover', 'Por descobrir'], ['Verrouillé', 'Locked', 'Bloqueado'], ['Ingrédients', 'Ingredients', 'Ingredientes'],
    ['Carnet de mots', 'Word book', 'Caderno de palavras'], ['Continuer d’apprendre', 'Keep learning', 'Continuar a aprender'], ['Écouter le conte', 'Listen to the tale', 'Ouvir o conto'], ['J’ai terminé ce conte', 'I have finished this tale', 'Terminei este conto'],
    ['Préparation', 'Preparation', 'Preparação'], ['personnes', 'people', 'pessoas'], ['Pour', 'For', 'Para'], ['Moins de parts', 'Fewer servings', 'Menos doses'], ['Plus de parts', 'More servings', 'Mais doses'],
    ['Cartes', 'Cards', 'Cartões'], ['Quiz', 'Quiz', 'Quiz'], ['Touche une carte pour voir la traduction.', 'Tap a card to see the translation.', 'Toca num cartão para ver a tradução.'], ['Recommencer cette langue', 'Restart this language', 'Recomeçar esta língua'],
    ['Les animaux · vocabulaire', 'Animals · vocabulary', 'Animais · vocabulário'], ['Mode petits (dès 3 ans)', 'Little ones mode (from age 3)', 'Modo pequeninos (a partir dos 3 anos)'],
    /* paramètres */
    ['Mode graphique', 'Graphics mode', 'Modo gráfico'], ['Rendu 2D peint (plus léger)', 'Painted 2D rendering (lighter)', 'Gráficos 2D pintados (mais leves)'], ['Rendu 3D (par défaut)', '3D rendering (default)', 'Gráficos 3D (predefinido)'],
    ['Univers illustré inspiré de l’animation japonaise, fluide même sur une petite machine.', 'Illustrated world inspired by Japanese animation, smooth even on a modest machine.', 'Mundo ilustrado inspirado na animação japonesa, fluido mesmo num aparelho modesto.'],
    ['Village explorable en trois dimensions, caméra à la troisième personne. Plus gourmand.', 'Village you can explore in three dimensions, third-person camera. More demanding.', 'Aldeia explorável em três dimensões, câmara na terceira pessoa. Mais exigente.'],
    ['Qualité graphique', 'Graphics quality', 'Qualidade gráfica'], ['Auto', 'Auto', 'Auto'], ['Bas', 'Low', 'Baixa'], ['Moyen', 'Medium', 'Média'], ['Élevé', 'High', 'Alta'],
    ['Son et confort', 'Sound and comfort', 'Som e conforto'], ['Son', 'Sound', 'Som'], ['Plein écran', 'Full screen', 'Ecrã inteiro'], ['Effacer toutes mes données', 'Erase all my data', 'Apagar todos os meus dados'],
    ['Changer et recharger', 'Change and reload', 'Mudar e recarregar'], ['Annuler', 'Cancel', 'Cancelar'], ['Langue de l’interface', 'Interface language', 'Língua da interface'],
    ['Le jeu va se recharger.', 'The game will reload.', 'O jogo vai recarregar.'],
    /* écran de démarrage */
    ['Bienvenue dans N’Zassa', 'Welcome to N’Zassa', 'Bem-vindo ao N’Zassa'], ['Choisis ta langue et la façon de jouer. Tu pourras tout changer plus tard dans les Paramètres.', 'Choose your language and how to play. You can change everything later in Settings.', 'Escolhe a tua língua e a forma de jogar. Podes mudar tudo mais tarde nas Definições.'],
    ['Langue du jeu', 'Game language', 'Língua do jogo'], ['Affichage', 'Display', 'Visualização'], ['Rendu 2D', '2D rendering', 'Gráficos 2D'], ['Rendu 3D', '3D rendering', 'Gráficos 3D'],
    ['Illustré, léger : idéal sur téléphone ou petit ordinateur.', 'Illustrated and light: ideal on a phone or a small computer.', 'Ilustrado e leve: ideal num telemóvel ou computador modesto.'],
    ['Village à explorer en 3D : plus beau, plus gourmand.', 'Village to explore in 3D: prettier, more demanding.', 'Aldeia para explorar em 3D: mais bonita, mais exigente.'],
    ['3D indisponible sur cet appareil.', '3D is not available on this device.', '3D indisponível neste aparelho.'], ['Commencer', 'Start', 'Começar'],
    ['L’interface est traduite ; les contenus culturels (contes, recettes, vocabulaire) restent en français pour l’instant.', 'The interface is translated; cultural content (tales, recipes, vocabulary) stays in French for now.', 'A interface está traduzida; os conteúdos culturais (contos, receitas, vocabulário) continuam em francês por agora.']
  ];
  const PATTERNS = [
    [/^Carte (\d+)\/(\d+)$/, 'Card $1/$2', 'Cartão $1/$2'],
    [/^Question (\d+)\/(\d+)$/, 'Question $1/$2', 'Pergunta $1/$2'],
    [/^Apprendre : (.+)$/, 'Learn: $1', 'Aprender: $1'],
    [/^Encore (\d+) carte\(s\) à voir$/, '$1 more card(s) to see', 'Mais $1 cartão(ões) para ver'],
    [/^Quête (\d+) sur (\d+)$/, 'Quest $1 of $2', 'Missão $1 de $2'],
    [/^À (\d+) m$/, '$1 m away', 'A $1 m'],
    [/^(\d+) mot\(s\) appris sur (\d+)$/, '$1 word(s) learned out of $2', '$1 palavra(s) aprendida(s) em $2'],
    [/^(\d+) sur (\d+) terminées?\./, '$1 of $2 done.', '$1 de $2 concluídas.'],
    [/^(\d+) trésors? trouvés?$/, '$1 treasure(s) found', '$1 tesouro(s) encontrado(s)'],
    [/^Village (.+) · (\d+) joueur\(s\)$/, '$1 village · $2 player(s)', 'Aldeia $1 · $2 jogador(es)'],
    [/^Musée des masques · (.+)$/, 'Mask museum · $1', 'Museu das máscaras · $1'],
    [/^Apprendre le (.+)$/, 'Learn $1', 'Aprender $1'],
    [/^Reprendre en (.+)$/, 'Resume in $1', 'Retomar em $1'],
    [/^Écouter (.+)$/, 'Listen to $1', 'Ouvir $1'],
    [/^(Dans la région|Ailleurs en Afrique|Le peuple de ce village) · (\d+) masques?$/, '$1 · $2 mask(es)', '$1 · $2 máscara(s)'],
    [/^(\d+) h · (.+)$/, '$1:00 · $2', '$1 h · $2'],
    [/^(.+) · (-?\d+) °C$/, '$1 · $2 °C', '$1 · $2 °C'],
    [/^(\d+) masques? · (\d+) instruments? · photos de collections en accès libre$/, '$1 mask(es) · $2 instrument(s) · photos from open-access collections', '$1 máscara(s) · $2 instrumento(s) · fotos de coleções de acesso livre'],
    [/^Aucun masque de ce peuple n’est encore dans la collection libre du jeu\. Voici d’abord (\d+) masques? de (.+), puis (\d+) d’autres régions\.$/, 'No mask of this people is in the game’s open collection yet. First, $1 mask(s) from $2, then $3 from other regions.', 'Ainda não há nenhuma máscara deste povo na coleção livre do jogo. Primeiro, $1 máscara(s) de $2, depois $3 de outras regiões.'],
    [/^Aucun masque de ce peuple ni de (.+) n’est encore dans la collection libre du jeu : la salle présente (\d+) masques? d’autres régions, signalés comme tels\.$/, 'No mask of this people or of $1 is in the game’s open collection yet: the room shows $2 mask(s) from other regions, labelled as such.', 'Ainda não há nenhuma máscara deste povo nem de $1 na coleção livre do jogo: a sala apresenta $2 máscara(s) de outras regiões, assinaladas como tal.'],
    [/^(\d+) masques? du peuple associé à ce village, puis (?:(\d+) de (.+) et )?(\d+) d’autres régions\.$/, '$1 mask(es) from the people tied to this village, then $2 from $3 and $4 from other regions.', '$1 máscara(s) do povo ligado a esta aldeia, depois $2 de $3 e $4 de outras regiões.']
  ];
  /* mots fréquents des bulles météo, de l’heure et des régions */
  const WORDS = [
    ['Matin', 'Morning', 'Manhã'], ['Midi', 'Noon', 'Meio-dia'], ['Après-midi', 'Afternoon', 'Tarde'], ['Soir', 'Evening', 'Noite'], ['Nuit', 'Night', 'Noite'],
    ['Ciel dégagé', 'Clear sky', 'Céu limpo'], ['Nuageux', 'Cloudy', 'Nublado'], ['Pluie', 'Rain', 'Chuva'], ['Orage', 'Storm', 'Tempestade'], ['Brume', 'Mist', 'Neblina'],
    ['Afrique de l’Ouest', 'West Africa', 'África Ocidental'], ['Afrique du Nord', 'North Africa', 'África do Norte'], ['Afrique de l’Est', 'East Africa', 'África Oriental'], ['Afrique centrale', 'Central Africa', 'África Central'], ['Afrique australe', 'Southern Africa', 'África Austral'],
    ['Afrique de l’Ouest', 'West Africa', 'África Ocidental']
  ];
  const WIDX = { en: new Map(), pt: new Map() };
  WORDS.forEach(r => { WIDX.en.set(r[0], r[1]); WIDX.pt.set(r[0], r[2]); });
  const IDX = { en: new Map(), pt: new Map() };
  T.forEach(r => { IDX.en.set(r[0], r[1]); IDX.pt.set(r[0], r[2]); });
  PATTERNS.forEach(p => { /* les titres de motifs réutilisent les libellés connus */ });

  /* Traduit une chaîne (français → lang). Renvoie la chaîne telle quelle si elle est inconnue. */
  function tr(str, lang) {
    if (!lang || lang === 'fr' || typeof str !== 'string') return str;
    const m = IDX[lang]; if (!m) return str;
    const s = str.trim(); if (!s) return str;
    let out = m.get(s);
    if (out === undefined) {
      for (const [re, en, pt] of PATTERNS) {
        if (re.test(s)) { out = s.replace(re, (lang === 'en' ? en : pt)); break; }
      }
      if (out !== undefined) out = out.replace(/^(Dans la région|Ailleurs en Afrique|Le peuple de ce village)/, x => m.get(x) || x);
    }
    if (out !== undefined) {
      const w = WIDX[lang]; out = out.replace(/ · ([^·:]+)$/, (x, a) => ' · ' + (w.get(a.trim()) || a)).replace(/^(.+?) · /, (x, a) => (w.get(a.trim()) || a) + ' · ');
      WORDS.forEach(r => { const tw = w.get(r[0]); if (tw && out.indexOf(r[0]) >= 0 && /^(No mask|Ainda|\d+ mask|\d+ máscara)/.test(out)) out = out.split(r[0]).join(tw); });
    }
    return out === undefined ? str : str.replace(s, out);
  }

  /* ---------- partie navigateur ---------- */
  let cur = 'fr', observer = null, queued = false, onChange = null;
  const orig = new WeakMap(), ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  function textNodes(rootEl, fn) {
    const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, null); let n;
    while ((n = w.nextNode())) { const p = n.parentNode && n.parentNode.nodeName; if (p !== 'SCRIPT' && p !== 'STYLE') fn(n); }
  }
  function applyTo(rootEl) {
    if (!rootEl) return;
    const lang = cur;
    textNodes(rootEl, n => {
      const o = orig.get(n);
      if (lang === 'fr') { if (o !== undefined && n.nodeValue !== o) n.nodeValue = o; return; }
      const src = o !== undefined ? o : n.nodeValue, t = tr(src, lang);
      if (t !== src) { if (o === undefined) orig.set(n, src); if (n.nodeValue !== t) n.nodeValue = t; }
    });
    const els = rootEl.querySelectorAll ? rootEl.querySelectorAll('[placeholder],[aria-label],[title],[alt]') : [];
    els.forEach(e => ATTRS.forEach(k => {
      const v = e.getAttribute(k); if (!v) return;
      const key = '__fr_' + k, was = e[key];
      if (lang === 'fr') { if (was !== undefined && v !== was) e.setAttribute(k, was); return; }
      const src = was !== undefined ? was : v, t = tr(src, lang);
      if (t !== src) { if (was === undefined) e[key] = src; if (v !== t) e.setAttribute(k, t); }
    }));
  }
  function schedule() {
    if (queued || cur === 'fr') return; queued = true;
    setTimeout(() => { queued = false; applyTo(document.body); }, 180);
  }
  function set(lang) {
    if (!LANGS[lang]) lang = 'fr';
    cur = lang; document.documentElement.lang = lang;
    applyTo(document.body); if (onChange) onChange(lang);
  }
  function get() { return cur; }
  function detect() {
    const n = ((typeof navigator !== 'undefined' && (navigator.language || '')) || '').slice(0, 2).toLowerCase();
    return LANGS[n] ? n : 'fr';
  }
  function boot() {
    if (typeof MutationObserver === 'undefined') return;
    observer = new MutationObserver(schedule);
    const go = () => observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  }
  return { LANGS, tr, set, get, detect, apply: applyTo, boot, onChange: f => { onChange = f; }, size: () => T.length };
});
