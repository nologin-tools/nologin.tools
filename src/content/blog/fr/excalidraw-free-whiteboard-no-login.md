---
title: "Excalidraw : le tableau blanc en ligne gratuit, sans inscription"
description: "Excalidraw est un outil de tableau blanc libre et open source qui fonctionne dans le navigateur sans créer de compte. Dessine des diagrammes au look fait-main et collabore avec un chiffrement de bout en bout."
publishedAt: 2026-04-07
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source", "browser"]
featured: false
heroImageQuery: "whiteboard sketching digital drawing hand-drawn"
locale: "fr"
originalSlug: "excalidraw-free-whiteboard-no-login"
sourceHash: "ba7bcfac58d58f30"
---

![Hero image](/blog/images/excalidraw-free-whiteboard-no-login/hero.jpg)

La plupart des outils de tableau blanc te demandent de créer un compte avant même de tracer ta première ligne. Miro veut ton adresse e-mail. FigJam réclame ton compte Figma. Lucidchart dresse un mur payant dès la cinquième forme. Et si tu paies, ils voient tout ce que tu dessines.

[Excalidraw](https://excalidraw.com) s'ouvre directement sur une toile vierge, prête à l'emploi. Sans inscription. Sans connexion. Sans pop-up qui quémande ton e-mail. Juste un tableau blanc.

C'est la promesse, et après des millions d'utilisateurs et des années de développement actif, elle tient toujours.

## Ce que fait vraiment Excalidraw

Excalidraw est un outil de dessin qui tourne dans le navigateur et rend tout dans un style fait main. Les rectangles ont des bords légèrement tremblants. Les lignes ont cette imprécision naturelle qui donne aux diagrammes un air de croquis sur une serviette de table plutôt que de slide PowerPoint.

Cette esthétique est un choix délibéré, pas une limitation. Quand tu esquisses un diagramme d'architecture ou que tu expliques un concept à une équipe, le rendu brouillon signale «&#8239;c'est un brouillon, commenter librement&#8239;» bien mieux qu'une diapositive Keynote soignée. Les équipes d'ingénierie l'utilisent pour les entretiens de conception de systèmes. Les designers l'utilisent pour le wireframing avant d'ouvrir Figma. Les enseignants l'utilisent pour expliquer des concepts sans que le format diaporama n'alourdisse la présentation.

L'outil couvre les indispensables — rectangles, cercles, flèches, lignes, texte, dessin à main levée — ainsi que des images que tu peux intégrer directement sur la toile. Tu peux grouper des objets, les superposer, les verrouiller et les aligner sur une grille. Il y a un sélecteur de couleurs, un réglage de l'épaisseur de trait et des options de remplissage. Rien n'est caché derrière un niveau premium.

L'export fonctionne sans compte. Tu peux enregistrer en PNG (fond transparent optionnel), SVG, ou copier dans le presse-papiers. Le format `.excalidraw` est du JSON brut, ce qui signifie que tes dessins sont lisibles et récupérables même sans l'application — utile si le projet disparaît un jour.

## L'architecture de confidentialité

Voilà ce qui justifie de présenter Excalidraw spécifiquement comme un outil respectueux de la vie privée : le modèle de collaboration est chiffré de bout en bout par défaut.

Quand tu partages un dessin via le lien «&#8239;collaboration en direct&#8239;», l'identifiant de la salle et la clé de chiffrement sont tous deux intégrés dans le fragment de l'URL (la partie après le `#`). Le fragment n'est jamais envoyé au serveur — il reste dans le navigateur. Les serveurs d'Excalidraw relaient les données du dessin entre participants, mais ils ne reçoivent que des octets chiffrés. Ils ne peuvent pas lire ce que tu as dessiné.

C'est une garantie de confidentialité concrète. Avec des outils comme Miro ou Notion, la plateforme accède pleinement au contenu de ton tableau blanc. En mode collaboration d'Excalidraw, c'est impossible. Le [code source est sur GitHub](https://github.com/excalidraw/excalidraw) sous licence MIT, donc n'importe qui peut vérifier cette affirmation en le lisant — sans avoir à faire confiance.

Pour un usage solo, rien ne quitte ton navigateur. Les dessins sont sauvegardés dans `localStorage` et restent sur ton appareil à moins que tu ne les exportes explicitement.

> «Your data is end-to-end encrypted, meaning the Excalidraw server cannot read what you've drawn.» — Excalidraw documentation

C'est le même principe de conception que l'on retrouve dans d'autres outils qui respectent la vie privée : le serveur gère le transport, pas le contenu. L'utilisateur garde les clés.

## Excalidraw vs. tldraw vs. Diagrams.net

Dans la catégorie «&#8239;tableau blanc gratuit sans connexion&#8239;», il y a quelques concurrents solides. Voici comment ils se comparent :

| | Excalidraw | tldraw | Diagrams.net |
|---|---|---|---|
| Connexion requise | Non | Non | Non |
| Collaboration | Chiffrement E2E | Oui | Non (export seulement) |
| Style | Fait main | Propre/vectoriel | Technique/UML |
| Auto-hébergeable | Oui | Oui | Oui |
| Formats d'export | PNG, SVG, JSON | PNG, SVG, JSON | PNG, SVG, PDF, XML |
| Open source | MIT | MIT | Apache 2.0 |

[tldraw](/tool/tldraw-com) est le concurrent le plus proche. Lui aussi gratuit, sans connexion et open source. La différence principale est esthétique : tldraw utilise des formes vectorielles nettes tandis qu'Excalidraw assume pleinement le look fait main. Si la précision compte — disons, un diagramme qui va dans un document technique formel — le rendu plus propre de tldraw est plus facile à travailler.

[Diagrams.net](/tool/app-diagrams-net) cible un cas d'usage entièrement différent. Il propose des formes UML complètes, des modèles de diagrammes de flux, des icônes de topologie réseau et un format XML qui s'intègre à Confluence et à d'autres outils d'entreprise. Plus puissant pour les diagrammes structurés, moins adapté au croquis libre.

Miro est l'option entreprise — soigné, vraiment complet, et à partir de 16 dollars par mois et par utilisateur après épuisement du niveau gratuit. Il exige un compte, trace l'usage et a accès à tout ce que tu dessines. Pour une petite équipe qui fait des diagrammes à l'occasion, c'est cher payé pour ce qu'Excalidraw t'offre gratuitement.

## Collaborer sans céder ses données

Le produit de collaboration en temps réel typique fonctionne ainsi : tu crées un compte, ton contenu vit sur leurs serveurs, ils peuvent le lire. C'est un compromis connu, et pour beaucoup de produits, c'est acceptable.

Le modèle d'Excalidraw est différent. Deux personnes peuvent modifier la même toile en temps réel — les curseurs apparaissent avec les noms, les modifications se propagent instantanément — et le serveur intermédiaire est fonctionnellement aveugle au contenu. La clé de chiffrement ne touche jamais le serveur, donc même une ordonnance judiciaire ne produirait pas de données de dessin lisibles.

Pour démarrer une session collaborative, clique sur l'icône représentant une personne dans la barre d'outils et partage le lien. N'importe qui avec le lien peut rejoindre sans créer de compte. Les sessions persistent seulement tant que quelqu'un est connecté. Il n'y a pas de salle cloud persistante dans le niveau gratuit.

Cela signifie qu'il n'y a pas d'historique des versions, pas de synchronisation cloud entre appareils, et aucun moyen de revenir à une session des jours plus tard sans avoir exporté le fichier. Pour des sessions de croquis ponctuelles, c'est un compromis acceptable. Pour des tableaux blancs d'équipe continus, il faudra exporter régulièrement les fichiers `.excalidraw` vers un dossier partagé, ou se tourner vers [Excalidraw+](https://plus.excalidraw.com) — la version payante hébergée qui ajoute stockage cloud persistant, salles protégées par mot de passe et sauvegardes de scènes.

La version gratuite couvre ce dont la plupart des gens ont réellement besoin : esquisser un concept avec un collègue, l'exporter, passer à la suite.

## Raccourcis clavier et expérience power user

Excalidraw récompense l'apprentissage des raccourcis clavier. Une fois qu'ils sont dans tes doigts, dessiner devient très rapide.

Les raccourcis de formes sont sur une seule touche : `R` pour rectangle, `E` pour ellipse, `A` pour flèche, `L` pour ligne, `X` pour dessin libre, `T` pour texte. `V` revient à l'outil de sélection. `H` et `V` retournent horizontalement et verticalement. `Ctrl+A` sélectionne tout, `Ctrl+G` groupe les objets sélectionnés.

Pour le partage : `Ctrl+Shift+E` ouvre le dialogue d'export, depuis lequel tu peux copier dans le presse-papiers ou télécharger. `Ctrl+L` copie directement un lien partageable dans le presse-papiers.

Zoom : `Ctrl+défilement` zoome et dézoome, `Ctrl+Shift+H` fait tenir l'intégralité du dessin à l'écran. L'outil main (`Espace+glisser`) fait défiler la toile sans changer l'outil sélectionné.

Ces raccourcis réduisent l'écart entre penser et dessiner. Cette immédiateté est l'essentiel de ce qui rend Excalidraw efficace pour des diagrammes rapides — tu ne cherches pas dans les menus pendant que l'idée est encore fraîche.

## L'écosystème open source

L'une des vraies forces d'Excalidraw est ce que d'autres ont construit par-dessus. Parce qu'il est sous licence MIT et distribué comme paquet npm, il a été intégré dans un nombre surprenant d'outils.

[Excalideck](/tool/excalideck-com) transforme les dessins Excalidraw en diapositives de présentation — l'esthétique fait main dans un format diaporama, sans logiciel supplémentaire. Pour des présentations techniques où tu veux montrer des diagrammes d'architecture bruts sans changer d'outil, c'est vraiment utile.

Il existe des plugins Obsidian qui permettent de dessiner des diagrammes Excalidraw directement dans ta base de notes. Des extensions VS Code intègrent une toile à côté de ton code. Plusieurs outils de documentation et wikis ont ajouté une intégration Excalidraw, permettant aux équipes de garder les diagrammes au même endroit que le texte qu'ils illustrent.

Le système de bibliothèques mérite d'être mentionné. La communauté a contribué des centaines de collections de formes prêtes à l'emploi — icônes d'architecture AWS, diagrammes d'infrastructure Google Cloud, composants d'interface mobile, modèles de diagrammes de flux, schémas de bases de données. Ils s'installent depuis le navigateur de bibliothèques intégré à l'application, sans inscription.

Le projet a accumulé plus de 80 000 étoiles sur GitHub, ce qui le place parmi les outils de dessin open source les plus adoptés. Une maintenance active, un tracker d'issues réactif et un écosystème d'intégrations florissant sont le résultat de plusieurs années de développement régulier.

## À qui s'adresse Excalidraw

Si tu esquisse des diagrammes d'architecture, Excalidraw est difficile à battre. Le style fait main enlève la pression de devoir rendre les choses jolies avant que l'idée soit solide, et les raccourcis clavier te permettent de penser et de dessiner à la même vitesse.

Pour le wireframing UX en phase lo-fi — avant d'ouvrir Figma ou Sketch — Excalidraw convient très bien. L'esthétique brouillon communique clairement «&#8239;c'est de l'exploration&#8239;», ce qui tend à générer des retours plus honnêtes qu'une maquette pixel perfect.

Dans les contextes éducatifs, les enseignants l'utilisent pour dessiner des diagrammes lors d'appels vidéo, avec les étudiants qui rejoignent la toile partagée. Le modèle sans compte est important ici : on ne peut pas supposer que tous les étudiants ont ou veulent créer un compte sur encore une autre plateforme.

Pour tout ce qui nécessite un alignement précis, un formatage conditionnel ou un diagramme destiné à un document de spécification formel, utilise [Diagrams.net](/tool/app-diagrams-net) ou un outil vectoriel dédié. Le style fait main d'Excalidraw est aussi son plafond.

## Démarrer sans aucune configuration

Va sur [excalidraw.com](https://excalidraw.com). Commence à dessiner. C'est tout l'onboarding.

Ton dessin est enregistré automatiquement dans `localStorage` au fur et à mesure, donc fermer l'onglet et le rouvrir te ramène à ta dernière toile. Pour tout ce que tu veux garder sur le long terme, utilise `Ctrl+Shift+E` pour exporter — soit en fichier `.excalidraw` (à rouvrir et modifier plus tard), soit en PNG/SVG (à partager ou intégrer).

Pour collaborer, clique sur l'icône de personne et partage le lien de la salle. Tes collaborateurs n'ont besoin de rien installer, ni de compte, ni de téléchargement. Le lien suffit.

Si tu veux l'auto-héberger — pour un intranet d'entreprise, un réseau scolaire, ou juste parce que tu veux un contrôle total sur l'endroit où tes dessins sont stockés — l'image Docker est disponible et la documentation d'auto-hébergement est complète. La licence MIT signifie que tu peux le modifier et l'exploiter comme bon te semble.

D'autres outils respectueux de la vie privée sans connexion sont listés sur [nologin.tools](/tool/nologin-tools) si tu construis une boîte à outils qui évite systématiquement la création de compte.

La catégorie des tableaux blancs en ligne est l'un de ces rares cas où l'option gratuite, open source et privacy-first est genuinement la meilleure pour la plupart des utilisateurs. Ça n'arrive pas souvent. Excalidraw l'a mérité en traitant la confidentialité des données et la propriété locale comme des fonctionnalités à part entière, pas comme des ajouts de dernière minute.
