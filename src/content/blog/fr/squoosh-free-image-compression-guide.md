---
title: "Compresser des images gratuitement avec Squoosh — Sans compte, sans upload"
description: "Guide pas à pas pour compresser des images avec Squoosh dans ton navigateur. Sans login, sans upload serveur — couvre les réglages AVIF, WebP, JPEG, PNG et l'utilisation du CLI en lot."
publishedAt: 2026-04-16
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "open-source"]
featured: false
locale: fr
originalSlug: squoosh-free-image-compression-guide
sourceHash: f54e1dbf39ce8747
heroImageQuery: "image compression browser WebAssembly optimize"
---

![Hero image](/blog/images/squoosh-free-image-compression-guide/hero.jpg)

T'as besoin de compresser une image. Idéalement maintenant, sans créer de compte, sans envoyer tes fichiers vers un serveur que tu ne contrôles pas, et sans jouer à la roulette de la qualité avec un outil qui crache juste « compressed ! » et ne t'explique rien. Les suspects habituels te limitent à 5 Mo en offre gratuite, foutent un filigrane sur le résultat, ou te laissent dans le noir total sur ce qu'ils ont vraiment fait à ton fichier.

[Squoosh](https://squoosh.app) règle tout ça. Tu l'ouvres dans un onglet, tu glisses ton image dedans, tu ajustes les réglages, tu télécharges le résultat. Pas de login. Pas d'upload vers un serveur distant. La compression se passe entièrement dans ton navigateur grâce à des modules WebAssembly compilés depuis les mêmes codecs qu'utilisent les systèmes en production — MozJPEG, libavif, OxiPNG, libwebp.

Ce guide te montre comment l'utiliser efficacement : quel format choisir selon les situations, quels réglages changent vraiment quelque chose, et comment traiter des lots de fichiers sans rien installer de permanent.

## Ce que Squoosh fait vraiment (et pourquoi c'est pas banal)

La plupart des compresseurs en ligne uploadent ton fichier sur un serveur backend, font tourner la compression là-bas, et te renvoient un fichier plus petit. Tes images — photos clients, maquettes confidentielles, visuels produit avant publication — traînent donc sur le serveur de quelqu'un d'autre pendant un moment. Tu fais confiance à leur politique de rétention. Leur sécurité.

Squoosh compile les codecs de compression en WebAssembly et les exécute localement dans ton onglet. Rien ne quitte ta machine. C'est pas du marketing — c'est une conséquence directe de l'architecture. Il n'y a pas de serveur vers lequel uploader.

L'outil est développé et maintenu par [Google Chrome Labs](https://github.com/GoogleChromeLabs/squoosh), open source sous licence Apache 2.0. Si tu veux un comparatif détaillé avec des alternatives comme TinyPNG et Convertio, la [revue Squoosh sur ce site](/blog/squoosh-beats-online-image-compressors) couvre ça en détail. Ce guide-ci est pratique : réglages, méthodes, décisions.

## Quel format utiliser ?

La première décision à prendre, c'est le format de sortie. Et c'est plus important que n'importe quel curseur de qualité, parce que les formats ont des forces fondamentalement différentes.

| Format | Idéal pour | Support navigateurs | Taille vs. JPEG |
|--------|------------|---------------------|-----------------|
| MozJPEG | Photos, images très colorées | Universel | Référence |
| OxiPNG | Graphiques transparents, captures d'écran | Universel | Plus lourd |
| WebP | Images web générales | Tous les navigateurs modernes | ~25% plus léger |
| AVIF | Images web, meilleure compression | Chrome, Firefox, Safari, Edge | ~50% plus léger |
| JPEG XL | Anticipation future | Limité (expérimental) | ~60% plus léger |

Pour la plupart des images web en 2026, **l'AVIF est le bon choix par défaut**. Il produit des fichiers 30 à 50 % plus légers que le WebP à qualité visuelle équivalente, et le support navigateur couvre désormais tous les grands acteurs. Si tu dois gérer de très vieux navigateurs ou exporter des images vers un outil qui ne gère pas les formats modernes, le WebP est la valeur sûre. Le JPEG reste pertinent pour la compatibilité universelle — n'importe quelle plateforme, n'importe quelle visionneuse.

Le PNG est sans perte. Tu le sortiras pour OxiPNG quand tu as besoin de transparence : icônes, logos avec fond transparent, captures d'interfaces où le rendu du texte au pixel près est crucial. Jamais du PNG pour des photos. Les fichiers seront énormes.

Le JPEG XL est techniquement impressionnant, mais son support navigateur reste trop inégal pour l'utiliser en production dans la plupart des cas.

## Les réglages qui changent vraiment quelque chose

Une fois le format choisi, le curseur de qualité est le principal levier. Mais « qualité » ne signifie pas la même chose selon les codecs, et les chiffres ne sont pas directement comparables.

**Photos web et images hero** : commence à AVIF qualité 60-70. Ça paraît agressif, mais l'AVIF gère bien mieux les réglages de qualité basse que le JPEG. À qualité 60, un JPEG montre généralement des artefacts de blocage visibles ; l'AVIF au même réglage nominal a l'air nettement plus propre. Utilise le curseur de comparaison (on y revient juste après) pour vérifier.

**Photos produit pour l'e-commerce** : WebP à qualité 75-80, ou MozJPEG à 75 si tu as besoin d'une compatibilité maximale. Les images produit nécessitent du détail fin sur les bords et les textures — descends en dessous de 70 et tu verras du flou sur les tissus, les textes en relief et les formes complexes.

**Captures d'écran et interfaces** : OxiPNG avec le niveau de compression à 3. Les niveaux supérieurs réduisent encore la taille mais prennent nettement plus longtemps. Le niveau 3 est le point d'équilibre pratique pour la plupart des captures. Si l'image comporte de grandes zones de couleur unie (fréquent dans les captures d'interfaces), OxiPNG surpassera souvent l'AVIF parce que la compression sans perte gère efficacement les zones uniformes.

**Miniatures et avatars** : WebP à qualité 80, redimensionné à la taille d'affichage réelle. Squoosh a un panneau de redimensionnement — utilise-le. Servir un original de 3 024 pixels pour une affichage à 120 px, c'est l'une des erreurs de performance image les plus courantes, et aucune compression ne règle le problème de fond.

**Images d'arrière-plan et textures** : elles tolèrent une compression agressive parce qu'elles sont vues avec une faible attention visuelle. AVIF à qualité 50-60, c'est généralement bien ; tu remarqueras à peine la différence quand une image est derrière du texte.

Règle générale : commence à qualité 75 pour AVIF/WebP, ou 80 pour JPEG. Ensuite utilise le curseur de comparaison pour voir jusqu'où tu peux pousser.

## Utiliser le curseur de comparaison efficacement

Le curseur de comparaison, c'est ce qui distingue Squoosh des outils qui te balancent un résultat sans explication. Tu vois l'original à gauche, la sortie compressée à droite, avec les tailles de fichiers en temps réel en bas. Glisse le séparateur pour révéler l'un ou l'autre.

La technique : centre le curseur, puis concentre-toi sur les zones de l'image qui compressent le moins bien — bords nets, texte fin, dégradés de couleur lisses, et visages humains. C'est là qu'apparaissent les artefacts en premier. Si tu ne vois pas de différence significative dans ces zones, le réglage de qualité actuel est approprié. Si tu vois du flou, du blocage ou du banding de couleur, remonte la qualité.

Avec l'AVIF en particulier, surveille les transitions de couleur plutôt que les bords seuls. L'AVIF peut introduire un léger banding de couleur dans les dégradés lisses à faible qualité — c'est plus visible sur les photos de ciel ou les fonds avec des changements de couleur doux, moins sur les photos produit détaillées.

Pour OxiPNG, le curseur de comparaison confirme surtout que la compression sans perte a bien fonctionné. La sortie doit être identique à l'original — si ce n'est pas le cas, quelque chose d'inattendu s'est produit (rare, mais ça mérite un rapide coup d'œil).

Une fois la qualité satisfaisante, vérifie la réduction de taille dans l'interface Squoosh. Un bon résultat pour des images web, c'est 60 à 80 % plus léger que l'original. Si tu obtiens moins de 40 % de réduction sur une photo JPEG convertie en AVIF, essaie de baisser encore la qualité — tu laisses presque certainement des économies sur la table.

## Redimensionner : l'étape que tout le monde zappe

Les réglages de qualité ne sont pas le seul levier. Redimensionner à la taille d'affichage réelle donne souvent de plus grandes économies de poids que n'importe quel ajustement de qualité.

Le panneau de redimensionnement de Squoosh te permet de définir une largeur ou hauteur cible. Quelques notes sur les algorithmes disponibles : **Lanczos3** produit le résultat le plus net avec un minimum d'aliasing — c'est le bon choix pour la plupart des photos. **Triangle** est plus rapide mais plus flou. **Mitchell** se situe entre les deux.

Avant de toucher au curseur de qualité, demande-toi si tu as besoin de la résolution originale. Si ton site affiche les images de tes articles à 800 px de large, servir un original de 3 024 px, c'est de la donnée gaspillée, même avec une compression maximale. Redimensionne d'abord, ensuite compresse. Les économies combinées sont presque toujours supérieures à l'une ou l'autre approche séparée.

Squoosh applique le redimensionnement avant la compression, ce qui est l'ordre correct. Tu définis les dimensions finales dans le panneau de redimensionnement, tu ajustes la qualité dans le panneau de compression, et le fichier téléchargé reflète les deux modifications.

## Aller au-delà d'un fichier à la fois

L'interface web de Squoosh gère une image à la fois. Pour compresser un dossier de fichiers en une seule passe, le CLI Squoosh est la solution — et il ne nécessite aucune installation permanente.

Avec Node.js installé, lance :

```bash
npx @squoosh/cli --avif '{"quality":65}' *.jpg
```

Ça compresse tous les JPEG du répertoire courant en AVIF à qualité 65, en écrivant les fichiers de sortie à côté des originaux avec une extension `.avif`. Pour WebP : `--webp '{"quality":80}'`. Pour MozJPEG : `--mozjpeg '{"quality":75}'`. Pour redimensionner en compressant : `--resize '{"width":1200}'`.

Le CLI utilise les mêmes modules WebAssembly que l'interface web, donc la sortie est identique. C'est particulièrement utile pour les workflows où tu as un dossier de photos brutes à préparer pour le web avant de les uploader dans un CMS ou un pipeline de publication. Pas d'installation permanente, pas d'abonnement, pas de serveur.

## Quand Squoosh n'est pas le bon outil

Squoosh gère les images matricielles. Pour les fichiers SVG, [SVGOMG](/tool/jakearchibald-github-io-svgomg) est l'équivalent — exécuté localement dans ton navigateur, pas de limite de taille, pas de compte requis. Ne fais pas passer des SVG dans Squoosh.

Pour des fichiers très volumineux — panoramas de 100+ mégapixels, fichiers TIFF issus d'appareils moyen format — Squoosh peut épuiser la mémoire du navigateur. Les outils desktop gèrent mieux ces cas.

Si tu as besoin d'une compression JPEG ou PNG rapide sans contrôle de qualité et que la confidentialité des fichiers ne t'inquiète pas, [TinyPNG](/tool/tinypng-com) est plus rapide pour cette tâche précise. Il automatise la décision et zappe le curseur. Utile quand tu t'en fous du compromis et que tu veux juste quelque chose de plus petit.

Pour la conversion de formats au-delà des images (documents, vidéo, audio), Squoosh ne t'aidera pas — il est conçu spécifiquement pour la compression d'images.

## Quelques bonnes pratiques à adopter

Renomme les fichiers avant de les télécharger. Squoosh génère des noms du type `image-compressed.avif`. Si tu traites plusieurs fichiers dans une session sans les renommer, tu te retrouves avec un dossier rempli de `image-compressed (1).avif`, `image-compressed (2).avif`, et ainsi de suite.

Garde l'original. La compression AVIF et WebP est avec perte. Si tu as besoin plus tard d'un niveau de qualité différent ou d'un autre format de sortie, tu voudras repartir de l'original — compresser un fichier déjà compressé empile la dégradation de qualité.

N'applique pas le même chiffre de qualité à toutes les images. Une photo en gros plan détaillée se compresse différemment d'un grand paysage au même réglage nominal. Une valeur de qualité qui donne une dégradation invisible sur une image peut être clairement visible sur une autre. Le curseur te donne la réponse ; fais-lui confiance plutôt qu'aux chiffres fixes.

---

L'optimisation des images, c'est une de ces tâches qui mérite d'être faite correctement — et le bon outil est gratuit, fonctionne sans compte, et tourne entièrement dans ton navigateur. Pour d'autres outils dans cette catégorie — sans login, sans upload, sans pistage — [nologin.tools](/tool/nologin-tools) en répertorie des centaines organisés par cas d'usage.
