/**
 * Collection de versets bibliques sur la prière et le recueillement
 * Utilisés pour l'affichage aléatoire lors du spam clic sur l'icône de plateforme
 */

export interface BibleVerse {
  text: string;
  reference: string;
  translation?: string;
}

/**
 * Collection de versets sur la prière, le recueillement et la communion avec Dieu
 */
export const PRAYER_VERSES: BibleVerse[] = [
  {
    text: "Priez sans cesse.",
    reference: "1 Thessaloniciens 5:17",
    translation: "LSG"
  },
  {
    text: "Quand vous priez, entrez dans votre chambre, fermez votre porte, et priez votre Père qui est là dans le lieu secret.",
    reference: "Matthieu 6:6",
    translation: "LSG"
  },
  {
    text: "Demandez, et l'on vous donnera; cherchez, et vous trouverez; frappez, et l'on vous ouvrira.",
    reference: "Matthieu 7:7",
    translation: "LSG"
  },
  {
    text: "Tout ce que vous demanderez avec foi par la prière, vous le recevrez.",
    reference: "Matthieu 21:22",
    translation: "LSG"
  },
  {
    text: "Veillez et priez, afin que vous ne tombiez pas dans la tentation.",
    reference: "Matthieu 26:41",
    translation: "LSG"
  },
  {
    text: "Sept fois le jour je te loue à cause de tes justes ordonnances.",
    reference: "Psaume 119:164",
    translation: "LSG"
  },
  {
    text: "Le soir, le matin, et à midi, je soupire et je gémis, et il entendra ma voix.",
    reference: "Psaume 55:17",
    translation: "LSG"
  },
  {
    text: "Approchez-vous de Dieu, et il s'approchera de vous.",
    reference: "Jacques 4:8",
    translation: "LSG"
  },
  {
    text: "La prière fervente du juste a une grande efficacité.",
    reference: "Jacques 5:16",
    translation: "LSG"
  },
  {
    text: "Confessez donc vos péchés les uns aux autres, et priez les uns pour les autres, afin que vous soyez guéris.",
    reference: "Jacques 5:16",
    translation: "LSG"
  },
  {
    text: "Si vous demeurez en moi, et que mes paroles demeurent en vous, demandez ce que vous voudrez, et cela vous sera accordé.",
    reference: "Jean 15:7",
    translation: "LSG"
  },
  {
    text: "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux.",
    reference: "Matthieu 18:20",
    translation: "LSG"
  },
  {
    text: "L'Éternel est près de tous ceux qui l'invoquent, de tous ceux qui l'invoquent avec sincérité.",
    reference: "Psaume 145:18",
    translation: "LSG"
  },
  {
    text: "Invoque-moi, et je te répondrai; je t'annoncerai de grandes choses, des choses cachées que tu ne connais pas.",
    reference: "Jérémie 33:3",
    translation: "LSG"
  },
  {
    text: "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces.",
    reference: "Philippiens 4:6",
    translation: "LSG"
  },
  {
    text: "Et la paix de Dieu, qui surpasse toute intelligence, gardera vos cœurs et vos pensées en Jésus-Christ.",
    reference: "Philippiens 4:7",
    translation: "LSG"
  },
  {
    text: "Car mes pensées ne sont pas vos pensées, et vos voies ne sont pas mes voies, dit l'Éternel.",
    reference: "Ésaïe 55:8",
    translation: "LSG"
  },
  {
    text: "Cherchez l'Éternel pendant qu'il se trouve; invoquez-le, tandis qu'il est près.",
    reference: "Ésaïe 55:6",
    translation: "LSG"
  },
  {
    text: "L'Éternel est mon berger: je ne manquerai de rien.",
    reference: "Psaume 23:1",
    translation: "LSG"
  },
  {
    text: "Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles.",
    reference: "Psaume 23:2",
    translation: "LSG"
  },
  {
    text: "Il restaure mon âme, il me conduit dans les sentiers de la justice, à cause de son nom.",
    reference: "Psaume 23:3",
    translation: "LSG"
  },
  {
    text: "Quand je marche dans la vallée de l'ombre de la mort, je ne crains aucun mal, car tu es avec moi.",
    reference: "Psaume 23:4",
    translation: "LSG"
  },
  {
    text: "Tu dresses devant moi une table, en face de mes adversaires; tu oins d'huile ma tête, et ma coupe déborde.",
    reference: "Psaume 23:5",
    translation: "LSG"
  },
  {
    text: "Oui, le bonheur et la grâce m'accompagneront tous les jours de ma vie, et j'habiterai dans la maison de l'Éternel jusqu'à la fin de mes jours.",
    reference: "Psaume 23:6",
    translation: "LSG"
  },
  {
    text: "L'Éternel est ma lumière et mon salut: de qui aurais-je peur? L'Éternel est le soutien de ma vie: de qui aurais-je frayeur?",
    reference: "Psaume 27:1",
    translation: "LSG"
  },
  {
    text: "Une chose que j'ai demandée à l'Éternel, que je désire ardemment: c'est d'habiter toute ma vie dans la maison de l'Éternel, pour contempler la magnificence de l'Éternel et pour admirer son temple.",
    reference: "Psaume 27:4",
    translation: "LSG"
  },
  {
    text: "Car il me cache dans son tabernacle au jour du malheur, il me met à l'abri dans le lieu secret de sa tente.",
    reference: "Psaume 27:5",
    translation: "LSG"
  },
  {
    text: "Mon cœur dit de ta part: Cherchez ma face! Je cherche ta face, ô Éternel!",
    reference: "Psaume 27:8",
    translation: "LSG"
  },
  {
    text: "Ne me cache point ta face, ne repousse pas avec colère ton serviteur! Tu es mon secours, ne me laisse pas, ne m'abandonne pas, Dieu de mon salut!",
    reference: "Psaume 27:9",
    translation: "LSG"
  },
  {
    text: "Quand mon père et ma mère m'abandonneraient, l'Éternel me recueillera.",
    reference: "Psaume 27:10",
    translation: "LSG"
  },
  {
    text: "Enseigne-moi tes voies, ô Éternel! Conduis-moi dans le sentier de la droiture, à cause de mes ennemis.",
    reference: "Psaume 27:11",
    translation: "LSG"
  },
  {
    text: "Ne me livre pas au bon plaisir de mes adversaires, car de faux témoins et des gens qui respirent la violence se sont levés contre moi.",
    reference: "Psaume 27:12",
    translation: "LSG"
  },
  {
    text: "J'aurais perdu courage, si je n'avais pas cru que je verrais la bonté de l'Éternel sur la terre des vivants.",
    reference: "Psaume 27:13",
    translation: "LSG"
  },
  {
    text: "Espère en l'Éternel! Fortifie-toi et que ton cœur s'affermisse! Espère en l'Éternel!",
    reference: "Psaume 27:14",
    translation: "LSG"
  },
  {
    text: "L'Éternel est ma force et mon bouclier; en lui mon cœur se confie, et je suis secouru; j'ai de la joie dans le cœur, et je le loue par mes chants.",
    reference: "Psaume 28:7",
    translation: "LSG"
  },
  {
    text: "L'Éternel est la force de son peuple, il est le rocher des délivrances de son oint.",
    reference: "Psaume 28:8",
    translation: "LSG"
  },
  {
    text: "Sauve ton peuple et bénis ton héritage! Sois leur berger et leur soutien pour toujours!",
    reference: "Psaume 28:9",
    translation: "LSG"
  },
  {
    text: "Donnez à l'Éternel, vous qui êtes ses saints, donnez à l'Éternel gloire et force!",
    reference: "Psaume 29:1",
    translation: "LSG"
  },
  {
    text: "Donnez à l'Éternel la gloire due à son nom! Prosternez-vous devant l'Éternel avec des ornements sacrés!",
    reference: "Psaume 29:2",
    translation: "LSG"
  },
  {
    text: "L'Éternel donne la force à son peuple; l'Éternel bénit son peuple et le rend heureux.",
    reference: "Psaume 29:11",
    translation: "LSG"
  },
  {
    text: "Je t'exalte, ô Éternel! car tu m'as relevé, tu n'as pas laissé mes ennemis se réjouir à mon sujet.",
    reference: "Psaume 30:1",
    translation: "LSG"
  },
  {
    text: "Éternel, mon Dieu! j'ai crié à toi, et tu m'as guéri.",
    reference: "Psaume 30:2",
    translation: "LSG"
  },
  {
    text: "Éternel! tu as fait remonter mon âme du séjour des morts, tu m'as fait revivre loin de ceux qui descendent dans la fosse.",
    reference: "Psaume 30:3",
    translation: "LSG"
  },
  {
    text: "Chantez à l'Éternel, vous qui êtes ses saints! Célébrez la mémoire de sa sainteté!",
    reference: "Psaume 30:4",
    translation: "LSG"
  },
  {
    text: "Car sa colère dure un instant, mais sa grâce toute la vie; le soir arrivent les pleurs, et le matin l'allégresse.",
    reference: "Psaume 30:5",
    translation: "LSG"
  }
];

/**
 * Obtient un verset aléatoire de la collection
 */
export function getRandomVerse(): BibleVerse {
  const randomIndex = Math.floor(Math.random() * PRAYER_VERSES.length);
  return PRAYER_VERSES[randomIndex];
}

/**
 * Obtient un verset spécifique par index (pour éviter les répétitions)
 */
export function getVerseByIndex(index: number): BibleVerse {
  return PRAYER_VERSES[index % PRAYER_VERSES.length];
}
