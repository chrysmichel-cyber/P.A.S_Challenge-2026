/* `langs` : identifiants des langues du jeu dont le peuple est celui du masque (liste vide si aucune langue du jeu ne correspond).
   Notices courtes fondées sur les catalogues des musées prêteurs.
   Un nom rituel n'est jamais inventé lorsque la notice ne le donne pas. */
window.LCA = window.LCA || {};
window.LCA.maskCollection = [
  {
    id: 'dogon-imina-na',
    langs: [],
    traditionalName: 'Imina Na · grande masque',
    catalogName: 'Imina Na (Great Mask)',
    nameNote: 'Nom donné par le catalogue du musée',
    people: 'Dogon', place: 'Mali', region: 'ouest', regionName: 'Afrique de l’Ouest',
    image: 'img/masks/dogon-great-mask.jpg',
    description: 'Le Metropolitan Museum identifie cet objet comme une grande Imina Na Dogon. Sa notice présente l’Imina Na comme une figure majeure des célébrations du sigui, organisées environ tous les soixante ans. Cette information décrit la tradition, sans affirmer que cet exemplaire précis a été porté lors d’un sigui.',
    source: 'The Metropolitan Museum of Art · objet 310343',
    url: 'https://www.metmuseum.org/art/collection/search/310343',
    rights: 'Domaine public · The Met Open Access'
  },
  {
    id: 'fang-ngontang',
    langs: [],
    traditionalName: 'Ngontang · casque à plusieurs visages',
    catalogName: 'Helmet Mask',
    nameNote: 'Ngontang désigne une tradition de masque Fang décrite par le musée',
    people: 'Fang', place: 'Gabon', region: 'centrale', regionName: 'Afrique centrale',
    image: 'img/masks/fang-ngontang.jpg',
    description: 'Le Met catalogue cette pièce comme un casque-masque Fang. Il rapproche les masques multi-faces Ngontang de traditions de mascarade Fang au Gabon, en Guinée équatoriale et dans le sud du Cameroun. La notice ne donne pas à cet exemplaire un rôle rituel unique.',
    source: 'The Metropolitan Museum of Art · objet 312196',
    url: 'https://www.metmuseum.org/art/collection/search/312196',
    rights: 'Domaine public · The Met Open Access'
  },
  {
    id: 'yoruba-mask',
    langs: ['yoruba'],
    traditionalName: 'Nom traditionnel non indiqué',
    catalogName: 'Mask',
    nameNote: 'Attribution stylistique Yoruba dans la notice',
    people: 'Yoruba (attribution de style)', place: 'Nigeria', region: 'ouest', regionName: 'Afrique de l’Ouest',
    image: 'img/masks/yoruba-mask.jpg',
    description: 'Le Cleveland Museum of Art décrit un masque sculpté et peint, attribué au style Yoruba, réalisé au Nigeria vers 1910. Son catalogue ne précise pas de nom traditionnel ni de fonction pour cet objet : le musée ne lui en attribue donc pas ici.',
    source: 'Cleveland Museum of Art · objet 1921.1531',
    url: 'https://www.clevelandart.org/art/1921.1531',
    rights: 'Image et notice CC0 · Cleveland Museum of Art Open Access'
  },
  {
    id: 'senufo-helmet-mask',
    langs: [],
    traditionalName: 'Nom traditionnel non indiqué',
    catalogName: 'Helmet Mask',
    nameNote: 'Attribution stylistique Senufo dans la notice',
    people: 'Senufo (attribution de style)', place: 'Côte d’Ivoire', region: 'ouest', regionName: 'Afrique de l’Ouest',
    image: 'img/masks/senufo-helmet-mask.jpg',
    description: 'Le Cleveland Museum of Art attribue ce masque-casque à un sculpteur de style Senufo. La notice explique que ce type de masque à cornes accompagnait des rites marquant le passage entre classes d’âge, avant l’initiation au Poro.',
    source: 'Cleveland Museum of Art · objet 1975.152',
    url: 'https://www.clevelandart.org/art/1975.152',
    rights: 'Image et notice CC0 · Cleveland Museum of Art Open Access'
  },
  {
    id: 'pende-gambanda',
    langs: [],
    traditionalName: 'Gambanda · Kambanda',
    catalogName: 'Female Mask (Gambanda)',
    nameNote: 'Nom transcrit dans le catalogue du musée',
    people: 'Pende (attribution de style)', place: 'République démocratique du Congo', region: 'centrale', regionName: 'Afrique centrale',
    image: 'img/masks/pende-gambanda.jpg',
    description: 'Le musée décrit un masque féminin Gambanda (ou Kambanda), de style Pende. Il pourrait représenter l’épouse d’un chef; la notice associe cette figure à une performance collective mêlant plusieurs formes d’expression. L’identification du personnage reste présentée comme probable.',
    source: 'Cleveland Museum of Art · objet 2008.150',
    url: 'https://www.clevelandart.org/art/2008.150',
    rights: 'Image et notice CC0 · Cleveland Museum of Art Open Access'
  },
  {
    id: 'kuba-bwoom',
    langs: [],
    traditionalName: 'Bwoom',
    catalogName: 'Mask (Bwoom)',
    nameNote: 'Nom de personnage indiqué dans le catalogue',
    people: 'Kuba (Bushoong)', place: 'République démocratique du Congo', region: 'centrale', regionName: 'Afrique centrale',
    image: 'img/masks/kuba-bwoom.jpg',
    description: 'Le Bwoom est l’un des personnages d’un trio de masques lié aux récits de fondation du royaume Kuba. Le Cleveland Museum of Art explique qu’il peut aussi apparaître dans des contextes non royaux; son rôle ne se réduit donc pas à une seule cérémonie.',
    source: 'Cleveland Museum of Art · objet 1935.304',
    url: 'https://www.clevelandart.org/art/1935.304',
    rights: 'Image et notice CC0 · Cleveland Museum of Art Open Access'
  }
];
