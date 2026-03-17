---
title: "PNG, JPEG ou WebP ? Le guide pratique d'optimisation d'images"
description: "Un guide axé sur le format pour compresser, convertir et redimensionner des images avec des outils de navigateur sans inscription — avec des réglages de qualité précis et les dimensions par plateforme."
publishedAt: 2026-03-17
author: "nologin.tools"
tags: ["tutorial", "tools", "browser", "guide"]
featured: false
locale: fr
originalSlug: png-jpeg-webp-image-optimization-tutorial
sourceHash: 4deafb9217a610ad
heroImageQuery: "image format comparison compression web optimization"
---

![Hero image](/blog/images/png-jpeg-webp-image-optimization-tutorial/hero.jpg)

La plupart des gens choisissent un format de fichier par hasard. Ils exportent depuis Figma, sauvegardent depuis Photoshop, ou prennent une capture d'écran — et quel que soit le format qui en sort, c'est celui qu'ils utilisent. Ensuite ils passent l'image dans un compresseur en espérant qu'elle rapetisse, sans comprendre pourquoi elle ne réduit parfois pas autant qu'espéré.

Le choix du format compte plus que les réglages de compression. Un JPEG compressé à qualité 85 sera plus petit qu'un PNG compressé à qualité 85 — pas parce que le compresseur a travaillé plus dur, mais parce que JPEG et PNG encodent les données d'image différemment à un niveau fondamental. Prendre la bonne décision avant même d'ouvrir un outil de compression te fera économiser plus d'octets que n'importe quel slider.

Ce tutoriel couvre d'abord la décision du format, puis des outils et réglages spécifiques pour la compression, la conversion et le redimensionnement. Tout fonctionne sans créer de compte.

## La décision de format à prendre avant tout le reste

Trois formats couvrent presque tous les cas d'usage web et quotidiens : JPEG, PNG et WebP. Voilà le tableau honnête :

**JPEG** est fait pour les photographies et les images avec des dégradés de tons continus — portraits, paysages, photos culinaires. Il utilise une compression avec perte qui exploite la façon dont la vision humaine perçoit la couleur par rapport à la luminosité. Résultat : une photo JPEG à qualité 80 est visuellement quasi identique à l'original, pour environ la moitié du poids. JPEG gère très bien les transitions de couleurs douces, mais se dégrade sur les bords durs (texte, logos, icônes), où apparaissent les fameux artefacts de blocs.

**PNG** est fait pour les captures d'écran, les illustrations, les logos, les icônes, et tout ce qui nécessite des valeurs de pixels exactes ou de la transparence. PNG est sans perte — il compresse sans supprimer aucune donnée. C'est pourquoi un PNG d'une photo est toujours plus lourd qu'un JPEG de la même photo. N'utilise jamais PNG pour des photographies. Utilise toujours PNG pour les éléments avec des bords nets, de la transparence ou du texte.

**WebP** est fait pour tout, en plus léger. [WebP](https://developers.google.com/speed/webp) produit des fichiers environ 25–35 % plus petits que JPEG pour les photos et environ 26 % plus petits que PNG pour les graphiques, à qualité visuelle équivalente. La prise en charge par les navigateurs est maintenant de [97 % au niveau mondial](https://caniuse.com/webp) — Safari a ajouté le support en 2020, le dernier à le faire. Pour le web, il y a rarement une bonne raison de livrer du JPEG ou du PNG quand on peut servir du WebP.

L'arbre de décision pratique : si tu enregistres pour le web, utilise WebP. Si quelque chose requiert spécifiquement du PNG (fond transparent, précision couleur exacte pour l'impression), utilise PNG. Si tu envoies à quelqu'un qui doit modifier l'image, utilise JPEG pour les photos ou PNG pour les graphiques. Si tu attaches à un email ou uploades sur une plateforme qui ne supporte pas WebP, replie-toi sur JPEG pour les photos et PNG pour tout le reste.

## Compresser avec Squoosh : les réglages qui comptent vraiment

Quand tu as une seule image qui nécessite une compression soignée — une image hero, une photo produit, une pièce de portfolio — [Squoosh](https://squoosh.app) est le bon outil. Il est développé par l'équipe Google Chrome, tourne entièrement en WebAssembly, et tes fichiers ne quittent jamais le navigateur.

Ouvre Squoosh et dépose ton image. L'interface se divise en une vue avant (gauche) et après (droite) avec un séparateur déplaçable. Dans le panneau droit, choisis ton format de sortie et ajuste les réglages.

Pour les images web, commence par **WebP à qualité 80**. Ce réglage couvre la plupart des cas — il produit un résultat visuellement quasi identique pour des tailles de fichier bien plus petites qu'un JPEG à la même valeur de qualité. L'estimation de taille en bas à droite se met à jour en temps réel quand tu déplaces le slider. Observe ce qui se passe entre qualité 75 et 85 : tu verras généralement une économie d'octets significative en descendant à 75 avec peu de changement visible, puis une dégradation plus marquée sous 70. La qualité 80 est le sweet spot pour la plupart des contenus photographiques.

Pour les images avec du texte, des lignes nettes ou de la transparence, passe le format de sortie sur **WebP (sans perte)**. Squoosh t'avertira que c'est plus lourd que la compression avec perte, mais les valeurs de pixels sont préservées exactement. Compare le résultat à une compression avec perte et vérifie si la différence est visible à ta taille d'affichage.

Squoosh gère aussi le redimensionnement dans le panneau « Modifier ». Saisis une largeur cible en pixels — ou clique sur le toggle pourcentage et entre 50 % pour diviser les dimensions par deux — et active le verrouillage du ratio. L'algorithme de redimensionnement **Lanczos3** est le bon choix pour les photographies ; il préserve mieux la netteté que le bilinéaire ou le box. Pour les icônes ou le pixel art en agrandissement, utilise « Plus proche voisin » pour préserver les bords durs plutôt que de les flouter.

Une chose que Squoosh ne fait pas : le traitement par lots. C'est un fichier à la fois, ce qui convient pour une image spécifique sur laquelle tu travailles, mais pas pour 40 photos produit.

## Compression en lot sans création de compte

Quand la quantité prime sur le contrôle image par image, [TinyPNG](https://tinypng.com) traite jusqu'à 20 images à la fois sans compte requis. Glisse un dossier d'images dans la zone d'upload, et il les traite toutes en parallèle.

L'algorithme de TinyPNG pour les fichiers PNG utilise la quantification sélective des couleurs : il réduit le nombre de couleurs distinctes de 16 millions au maximum à une palette plus petite, puis applique une compression standard sur le résultat. La différence visuelle est généralement imperceptible. Les fichiers PNG réduisent couramment de 60–80 % — parfois plus pour les graphiques simples avec de grandes zones de couleur unie.

Pour les fichiers JPEG, TinyPNG ré-encode avec une quantification plus agressive et supprime les métadonnées (données EXIF, profils couleur, commentaires intégrés). Une photo de téléphone de 3 Mo finit souvent sous 500 Ko. L'algorithme prend la décision de qualité pour toi, et il est bien calibré.

Il n'y a pas de limite quotidienne sur le tier gratuit de 20 fichiers — chaque lot de 20 est indépendant. Finis un lot, glisse 20 autres images. Pour un lot de 200 photos, c'est 10 glissés-déposés. Fastidieux, mais ça fonctionne sans créer de compte ni payer pour un accès API.

Une vraie limitation : TinyPNG upload les fichiers sur ses serveurs. Les images sont supprimées après un court délai, mais si tu compresses des images sensibles (documents juridiques, photos médicales, matériel privé), reste sur le traitement local de Squoosh. Pour les photos produit ou les images de blog, le traitement côté serveur est un compromis raisonnable.

## Redimensionner pour des plateformes spécifiques

« Redimensionner aux bonnes dimensions » semble simple jusqu'à ce que tu te retrouves à regarder huit tailles recommandées pour huit plateformes différentes. Voici les dimensions standards actuelles pour les cas les plus courants :

| Plateforme / Cas d'usage | Dimensions recommandées | Format |
|--------------------------|-------------------------|--------|
| Image hero web | 1920×1080 ou 1440×900 | WebP |
| Image d'article de blog | 1200×675 (16:9) | WebP ou JPEG |
| Open Graph / aperçu de lien | 1200×630 | JPEG (large compatibilité) |
| Image post Twitter/X | 1600×900 | JPEG ou WebP |
| Instagram carré | 1080×1080 | JPEG |
| Instagram Story / Reel | 1080×1920 | JPEG |
| Bannière LinkedIn | 1584×396 | JPEG |
| Image newsletter email | max 600px de large | JPEG |
| Favicon | 32×32, 180×180 (Apple) | PNG |

Pour le redimensionnement, les mêmes outils qui compressent redimensionnent aussi. Squoosh (avec le panneau Modifier ouvert) et [ezGIF](https://ezgif.com) permettent tous les deux de spécifier des dimensions exactes en pixels. Pour plus de contrôle — recadrage à un ratio exact, repositionnement du contenu dans un cadre — [Photopea](https://www.photopea.com) est l'option la plus complète sans login. Il charge un éditeur complet de type Photoshop dans le navigateur et te laisse utiliser les contrôles de taille de canevas, de recadrage et de taille d'image exactement comme dans Photoshop, sans aucun compte.

## Convertir le HEIC et autres formats récalcitrants

Les iPhones photographient en HEIC par défaut (parfois écrit HEIF). C'est un excellent format — plus petit que JPEG avec une meilleure qualité — mais il n'est pas encore largement accepté. WordPress le rejette. La plupart des navigateurs web ne l'affichent pas. Les clients email le gèrent de façon incohérente.

Pour la conversion HEIC vers JPEG, [ezGIF](https://ezgif.com) s'en charge sans inscription. Va dans l'onglet « Image Converter », upload un fichier HEIC, choisis JPEG comme sortie, et télécharge le résultat. La conversion fonctionne, même si ezGIF n'est pas le plus rapide pour les gros lots.

[Convertio](https://convertio.co) gère les formats RAW d'appareils photo (CR2, NEF, ARW), les textures de jeux (DDS), et les formats HDR comme EXR — des choses que la plupart des outils d'image ignorent silencieusement. Les conversions gratuites sans compte sont limitées à environ 10 par jour et 100 Mo par fichier, ce qui couvre un usage occasionnel. Les fichiers sont uploadés sur les serveurs de Convertio, donc vérifie leur [politique de confidentialité](https://convertio.co/privacy) pour le matériel sensible.

Pour les fichiers SVG spécifiquement : les outils de design comme Figma exportent des SVG chargés de métadonnées d'éditeur, de styles inline, et d'une précision numérique allant jusqu'à 8 décimales. Les fichiers sont techniquement valides mais inutilement lourds. Fais-les passer par [SVGOMG](/tool/jakearchibald-github-io-svgomg) — un optimiseur SVG basé navigateur — avant de les déployer. Les économies typiques sur un export Figma sont de 40–70 %, le tout traité côté client.

## Un workflow réaliste pour les cas courants

Pour la plupart des gens la plupart du temps, le bon workflow est :

**Photo de téléphone → site web** : Ouvre dans Squoosh, mets la sortie en WebP, qualité 80, redimensionne à 1200px de large. C'est tout. Le fichier sera sous 200 Ko pour quasiment n'importe quelle photo.

**Photos produit (en lot)** : Glisse jusqu'à 20 à la fois dans TinyPNG. Télécharge, recommence. Pas de conversion de format, juste une réduction de taille.

**Capture d'écran → article de blog** : Squoosh ou TinyPNG. Les captures d'écran d'interfaces sombres se compressent particulièrement bien avec WebP sans perte.

**HEIC d'iPhone → JPEG partageable** : Convertisseur d'images ezGIF, entrée HEIC, sortie JPEG.

**Logo ou icône pour site web** : Si tu as le SVG, optimise avec SVGOMG. Si tu as besoin d'un PNG, exporte depuis ton outil de design puis passe dans TinyPNG.

**Convertir quelque chose d'inhabituel** : Convertio pour les formats que les autres outils ne gèrent pas.

> La meilleure chose unique que la plupart des gens puissent faire avec leurs fichiers image est de passer du JPEG au WebP pour la sortie web. La deuxième meilleure chose est de redimensionner aux dimensions d'affichage réelles avant de compresser — ça ne sert à rien de livrer une image de 3000px de large qui sera affichée à 800px. Les deux étapes sont gratuites, instantanées, et ne nécessitent aucun compte.

Les outils décrits ici sont vérifiés dans le [répertoire nologin.tools](/tool/squoosh-app). L'[HTTP Archive Web Almanac](https://almanac.httparchive.org/en/2024/media) montre systématiquement que les images sont la catégorie d'actifs la plus lourde sur le web et que l'adoption de WebP/AVIF reste bien en deçà de ce que les navigateurs pourraient gérer. L'écart entre ce qui est techniquement possible et ce que la plupart des sites livrent est encore important — et il se comble un fichier à la fois.

Si tu veux un tour d'horizon plus large de ce que ces outils couvrent au-delà des bases décrites ici, l'article précédent sur les [outils de compression et conversion d'images](/blog/compress-convert-resize-images-no-login) approfondit les choix de format et les compromis entre outils.
