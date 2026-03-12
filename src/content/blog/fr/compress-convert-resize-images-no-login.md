---
title: "Compresser, convertir et redimensionner des images sans s'inscrire"
description: "Les meilleurs outils d'images dans le navigateur pour la compression, la conversion de format et le redimensionnement — sans compte, sans logiciel, sans limites d'upload nécessitant une inscription."
publishedAt: 2026-03-12
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "guide"]
featured: false
locale: fr
originalSlug: compress-convert-resize-images-no-login
sourceHash: 9b4e1d2a7f8c3e6b
---

![Hero image](/blog/images/compress-convert-resize-images-no-login/hero.jpg)

Les images représentent environ la moitié du poids d'une page web ordinaire. Pas le JavaScript, pas le CSS — les images. Et pourtant, les outils auxquels la plupart des gens recourent quand ils ont besoin de compresser une photo, de convertir un PNG en WebP ou de redimensionner quelque chose pour une plateforme spécifique exigent tous un compte avant de te laisser bouger un curseur.

C'est un coût trop élevé pour une tâche de cinq secondes.

Il existe toute une catégorie d'outils d'images qui fonctionnent entièrement dans ton navigateur, traitent les fichiers côté client sans les télécharger sur un serveur et ne demandent rien de plus qu'ouvrir un onglet. Certains sont fabriqués par Google. D'autres sont des projets d'un seul développeur avec des millions d'utilisateurs mensuels. Tous sont gratuits et fonctionnent sans inscription.

## Pourquoi le choix du format compte plus que tu ne le crois

La plupart des gens compressent les images sans penser au format. Ils ont un JPEG, ils le rendent plus petit, c'est fini. Mais la sélection du format importe souvent plus que le réglage de compression lui-même.

[WebP](https://developers.google.com/speed/webp) — un format développé par Google — produit des fichiers environ 25 à 34 % plus petits que JPEG à qualité visuelle équivalente. AVIF, le format plus récent soutenu par Netflix et l'Alliance for Open Media, peut réduire la taille des fichiers jusqu'à 50 % par rapport à JPEG. Les deux formats sont maintenant pris en charge par tous les navigateurs majeurs. Si tu optimises des images pour un site web, passer simplement de JPEG à WebP peut réduire ta charge utile d'un tiers avant même d'ajuster un curseur de qualité.

C'est pourquoi un outil qui gère la conversion de format en plus de la compression est plus utile qu'un outil qui ne fait que réduire ton JPEG existant. Pour la plupart des travaux web, la réponse est simple : convertir en WebP, compresser à environ 80 % de qualité, et c'est fait. Deux outils sans login rendent ça vraiment facile.

## Squoosh : le premier à essayer

Quand tu dois compresser une image avec un vrai contrôle sur le résultat, [Squoosh](https://squoosh.app) est l'option la plus puissante dans ce domaine. C'est un outil open source créé par Google qui fonctionne entièrement en WebAssembly — ton fichier ne quitte jamais ton navigateur.

Le flux de travail est une vue comparée côte à côte : l'original à gauche, l'aperçu compressé à droite. Choisis un format de sortie (MozJPEG, WebP, AVIF, JPEG XL, PNG, OxiPNG et plus), fais glisser un curseur de qualité et regarde l'estimation de taille se mettre à jour en temps réel. L'affichage des différences montre exactement combien de kilooctets tu économises en pourcentage de l'original.

Ce qui rend Squoosh meilleur que la plupart des alternatives, c'est qu'il ne simplifie pas à l'excès. Tu peux ajuster le sous-échantillonnage chroma, choisir la vitesse d'encodage et affiner les paramètres avancés du codec si tu sais ce que ça signifie. Ou ignorer tout ça et juste bouger le curseur de qualité. De toute façon, tu obtiens un aperçu en direct avant de valider — ce qui est rare dans les outils sans login.

Il gère aussi le redimensionnement : largeur et hauteur avec verrouillage optionnel du ratio d'aspect, et plusieurs algorithmes de mise à l'échelle (Lanczos pour la netteté, Mitchell pour les photos avec un léger ringing sur les bords). Voir la [fiche Squoosh sur nologin.tools](/tool/squoosh-app) pour la liste complète des capacités. La seule limitation : il traite une image à la fois, ce qui est contraignant si tu as un dossier de 50 photos.

## TinyPNG : rapide et totalement automatique

[TinyPNG](https://tinypng.com) résout le problème du traitement par lots. Dépose jusqu'à 20 images à la fois (jusqu'à 5 Mo chacune, sans compte) et il les compresse via une optimisation avec perte qui réduit sélectivement la palette de couleurs de façons que la plupart des gens ne remarquent pas. Les fichiers PNG rétrécissent typiquement de 60 à 80 %. JPEG et WebP sont également pris en charge.

L'expérience est une zone de glisser-déposer, une barre de progression et un lien de téléchargement. Rien à configurer. C'est un choix de conception — l'algorithme prend les décisions à ta place, et c'est suffisamment bon pour que tu ne le remettes probablement pas en question.

Contrairement aux outils qui nécessitent une inscription pour le traitement par lots, la limite de 20 fichiers de TinyPNG s'applique par lot, pas par jour. Fais glisser 20 autres images quand le premier lot est terminé. Pour les photographes qui préparent une galerie avant l'upload, ou les développeurs qui nettoient les ressources images avant un déploiement, ce flux de travail tient sans jamais toucher à un compte.

La même qualité de compression que la version navigateur est disponible comme API développeur et plugin WordPress — mais la version web est l'option gratuite sans login. Le [profil TinyPNG sur nologin.tools](/tool/tinypng-com) couvre ce qui est inclus dans le niveau gratuit par rapport au plan payant.

## ezGIF : bien plus que son nom ne le laisse entendre

Le nom le sous-estime largement. [ezGIF](https://ezgif.com) est l'un des outils d'images les plus complets disponibles sans compte, et il gère bien plus que les GIFs animés.

Pour le travail sur les GIFs : créer à partir d'un fichier vidéo ou d'une séquence d'images, optimiser le timing des images, réduire les couleurs, recadrer, redimensionner, inverser, ajouter du texte. L'optimiseur de GIFs est particulièrement utile — les GIFs animés sont tristement célèbres pour leur taille, et l'optimisation d'ezGIF les réduit typiquement de 30 à 40 % sans perte de qualité visible.

Mais la liste des outils dépasse largement les GIFs. Il y a un optimiseur JPG/PNG/WebP, un redimensionneur qui gère les dimensions en pourcentage ou en pixels, un convertisseur de format (prend en charge AVIF, HEIC, BMP, TIFF et d'autres que beaucoup d'alternatives « modernes » ignorent discrètement), un convertisseur image-vers-PDF et un découpeur de feuilles de sprites pour le travail CSS sprites.

L'interface est fonctionnelle — onglets en haut, une zone d'upload, les résultats en dessous. Elle n'a pas été redessinée depuis environ 2014 et ça se voit. Mais chaque fonctionnalité fonctionne, et le support des types de fichiers est exceptionnellement large : HEIC des iPhones, TIFF des scanners, AVIF des appareils photo récents. Si un format existe, ezGIF le gère probablement. Profil complet sur [ezGIF chez nologin.tools](/tool/ezgif-com).

## Convertio et SVGOMG : pour les cas particuliers

Certaines conversions de format sont assez obscures pour que la plupart des outils ne les prennent pas en charge. [Convertio](https://convertio.co) couvre plus de 300 formats de fichiers entre images, documents, audio et vidéo. Pour le travail sur les images spécifiquement : il gère les formats RAW d'appareils photo (CR2, NEF, ARW), DDS (textures de jeux), TGA, EXR (format HDR des pipelines VFX) et d'autres que les outils spécialisés ignorent.

Les conversions gratuites sans inscription sont limitées à un plafond quotidien raisonnable et 100 Mo par fichier. Les fichiers sont téléchargés sur les serveurs de Convertio (contrairement au traitement côté client de Squoosh), donc pour les images sensibles, consulte leur [politique de confidentialité](https://convertio.co/privacy) avant de procéder. Pour convertir une maquette produit de RAW en JPG ou une icône de SVG en ICO, c'est parfait. Pour quelque chose de confidentiel, le traitement local de Squoosh est le choix le plus sûr. Voir [Convertio sur nologin.tools](/tool/convertio-co).

Les fichiers SVG sont un problème totalement différent. Les outils de design comme Figma et Adobe Illustrator exportent des SVGs chargés de métadonnées d'éditeur, d'éléments de groupe redondants, de nombres avec 8 décimales de précision et de styles en ligne qui pourraient être des attributs. [SVGOMG](https://jakearchibald.github.io/svgomg/) est le frontend basé sur navigateur pour SVGO — dépose un SVG et il supprime le bruit en affichant un aperçu en direct. Les économies typiques sur les exportations Figma sont de 40 à 70 %. Le panneau de basculement te permet de désactiver des optimisations individuelles si l'une d'elles casse un truc SVG spécifique. Sans upload, sans compte, tout en local. Profil sur [SVGOMG chez nologin.tools](/tool/jakearchibald-github-io-svgomg).

## Quel outil pour quelle tâche ?

Voici la carte honnête, parce que ces outils ne se font pas concurrence — ils couvrent des besoins différents :

| Tâche | Meilleur outil | Les fichiers quittent-ils le navigateur ? |
|-------|--------------|----------------------------------------|
| Compresser une image avec contrôle du format | Squoosh | Non |
| Compresser en lot PNG/JPEG/WebP | TinyPNG | Oui (côté serveur) |
| Créer ou optimiser des GIFs | ezGIF | Oui (côté serveur) |
| Redimensionner avec options d'algorithme | Squoosh ou ezGIF | Non / Oui |
| Conversion de format inhabituelle (RAW, DDS, EXR) | Convertio | Oui (côté serveur) |
| Optimiser un SVG depuis un outil de design | SVGOMG | Non |

La colonne « Les fichiers quittent-ils le navigateur ? » compte pour la vie privée. Squoosh et SVGOMG n'envoient jamais ton fichier nulle part — tout se passe en WebAssembly ou JavaScript dans ton onglet. TinyPNG, ezGIF et Convertio téléchargent sur leurs serveurs, traitent et renvoient les résultats. Les trois ont déclaré de courtes périodes de conservation (généralement 24 heures ou moins), mais tu fais confiance à leur politique.

Pour la plupart des tâches quotidiennes — compresser une photo produit, redimensionner une image d'en-tête, convertir un JPEG en WebP — le traitement côté serveur est un compromis raisonnable pour la commodité et le support de formats que ces outils offrent. Pour les images médicales, les documents juridiques ou tout ce qui est personnel que tu préférerais ne pas avoir sur le serveur de quelqu'un : Squoosh.

> Les outils qui survivent sans te verrouiller tendent à être ceux qui sont vraiment bons. Squoosh est construit et maintenu par l'équipe Google Chrome non pas comme un produit avec un plan de monétisation, mais comme une implémentation de référence pour les codecs d'images modernes. Cet alignement d'incentives — « rendre la compression d'images bonne pour le web » — produit un meilleur outil que « faire créer des comptes aux utilisateurs ».

Selon le [Web Almanac de HTTP Archive](https://almanac.httparchive.org), l'adoption de WebP sur le web a considérablement progressé, mais JPEG et PNG dominent toujours. L'écart entre ce que les navigateurs modernes prennent en charge et ce que la plupart des sites servent réellement représente des performances réelles laissées sur la table. Aucun des outils pour combler cet écart ne te demande de donner ton adresse mail d'abord.

Le répertoire plus large de [nologin.tools](/tool/nologin-tools) catalogue des outils respectueux de la vie privée vérifiés dans des dizaines de catégories. La section des outils d'images est l'un des coins les plus complets — les services qui ont compris que « sans inscription » est une fonctionnalité et non un compromis ne manquent pas, et la collection continue de s'agrandir.
