---
title: "Excalidraw est-il privé ? Tableau blanc en ligne gratuit, sans connexion"
description: "Excalidraw chiffre la collaboration avec des clés qui ne quittent jamais ton navigateur. Découvre comment ce tableau blanc gratuit protège tes diagrammes par conception."
publishedAt: 2026-04-08
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source"]
featured: false
heroImageQuery: "privacy encryption whiteboard digital security"
locale: "fr"
originalSlug: "excalidraw-privacy-review"
sourceHash: "9dbf0a033cb42d45"
---

![Hero image](/blog/images/excalidraw-privacy-review/hero.jpg)

Pense au dernier diagramme que tu as dessiné dans un tableau blanc collaboratif en ligne. C'était peut-être une esquisse d'architecture pour un produit que tu n'as pas encore annoncé. Une carte de processus montrant comment ton équipe fonctionne vraiment. Une analyse concurrentielle. Un calendrier de levée de fonds.

Ce contenu vit quelque part. Sur la plupart des plateformes de tableau blanc, il vit sur leurs serveurs — lisible par leurs employés, accessible aux demandes légales, soumis à ce que dit la politique de confidentialité. La plupart des gens n'y pensent pas jusqu'à ce qu'ils le fassent.

Excalidraw gère ça différemment. Quand tu partages un dessin via un lien de collaboration, ton contenu est chiffré avant de quitter ton navigateur. Les serveurs d'Excalidraw relaient les données entre les participants mais ne peuvent pas lire ce que ces octets contiennent. La clé de chiffrement ne touche jamais leur infrastructure.

C'est un choix de conception significatif pour un outil web gratuit. Voilà ce que ça signifie concrètement et quand ça compte.

## Ce que la plupart des outils de tableau blanc font avec tes données

Les outils de tableau blanc populaires fonctionnent comme des services cloud. Ton contenu vit sur leurs serveurs, et la plateforme y a accès en lecture. Ce n'est pas nécessairement malveillant — c'est juste comme ça que fonctionne le logiciel cloud. Mais ça a des conséquences pratiques.

Miro stocke tes tableaux sur son infrastructure et ses conditions de service lui accordent le droit d'utiliser le contenu pour améliorer le produit. FigJam fait partie de la suite entreprise de Figma, soumise à la gestion des données de Figma. Lucidchart stocke tes diagrammes dans le cloud ; les options de résidence des données sont une fonctionnalité d'entreprise.

Les politiques de confidentialité ne sont pas cachées. Personne ne les lit, mais la situation qu'elles décrivent est : tout ce que tu dessines est stocké par une entreprise qui peut le voir. Pour un croquis rapide c'est probablement correct. Pour une feuille de route produit pré-lancement ou un diagramme de workflow médical, le calcul change.

L'alternative traditionnelle aux tableaux blancs cloud était « des outils qui stockent localement mais ne peuvent pas collaborer ». Excalidraw a cassé ce compromis.

## Comment fonctionne réellement l'architecture de confidentialité d'Excalidraw

Quand tu lances une session de collaboration dans [Excalidraw](https://excalidraw.com), l'appli génère deux choses : un ID de salle aléatoire et une clé de chiffrement aléatoire. Les deux sont intégrés dans l'URL après le symbole `#`.

Cet emplacement est significatif. Les navigateurs n'envoient jamais le fragment d'URL aux serveurs. Quand ton navigateur charge `https://excalidraw.com/#room=abc123,encryptionKey456`, il envoie une requête GET à `excalidraw.com/` sans aucune information de salle ou de clé incluse. Le serveur ne reçoit que la requête de base — il ne voit jamais le fragment.

Les données de dessin sont chiffrées dans le navigateur en utilisant l'[API Web Cryptography](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) avant la transmission. Le serveur stocke et transmet uniquement du texte chiffré. Sans la clé — qu'il n'a pas et ne peut pas obtenir — les données sont illisibles pour l'infrastructure d'Excalidraw.

C'est la même architecture utilisée par [Yopass](/tool/yopass-se) pour le partage de secrets chiffrés et [hat.sh](/tool/hat-sh) pour le chiffrement de fichiers dans le navigateur : le serveur gère le transport, l'utilisateur détient les clés.

Pour une utilisation solo, la situation est encore plus simple. Excalidraw stocke ton dessin actuel dans le `localStorage` du navigateur. Rien n'est téléchargé nulle part à moins que tu ne lances explicitement une session de collaboration ou n'exporetes un fichier.

## Vérifier les affirmations de confidentialité

Une affirmation de confidentialité d'un outil à source fermée nécessite de la confiance. N'importe qui peut dire « nous ne lisons pas vos données ».

Excalidraw est [sous licence MIT et publiquement disponible sur GitHub](https://github.com/excalidraw/excalidraw). L'implémentation du chiffrement est dans le code source, lisible par quiconque possède un navigateur et quelques minutes. Le code de session de collaboration, la génération de clés et le passage de messages peuvent tous être audités. Pas besoin de faire confiance — le code est la preuve.

Le projet a accumulé plus de 80 000 étoiles sur GitHub. Cela signifie qu'un grand nombre de développeurs ont regardé le code sur plusieurs années de développement actif. Si un problème de confidentialité existait dans l'implémentation, il serait trouvable.

C'est l'écart significatif entre « nous respectons votre vie privée » (langage marketing) et « voici le code qui implémente la confidentialité » (propriété vérifiable).

## Collaboration sans compte — et sans compromis

L'hypothèse typique sur les logiciels respectant la vie privée est qu'ils échangent des fonctionnalités contre de la protection. La collaboration en temps réel nécessite généralement des comptes, ce qui nécessite de fournir une adresse e-mail, ce qui lance une relation avec une plateforme qui a accès à ton contenu.

Le modèle de collaboration d'Excalidraw brise cette hypothèse. Deux personnes peuvent éditer le même canevas en temps réel — les curseurs apparaissent avec des noms, les changements se propagent immédiatement — sans qu'aucune n'ait de compte. Le lien chiffré est le mécanisme d'accès. Partage-le, et ton collaborateur rejoint. Ne le partage pas, et il ne peut pas.

Pour les cas d'utilisation où la création de compte est une barrière — obtenir des retours d'un client qui ne veut pas encore un autre login SaaS, ou conduire un entretien technique où tu veux que le candidat se concentre sur le problème, pas sur un processus d'inscription — ça compte pratiquement.

Les sessions sont éphémères par défaut. Quand la dernière personne ferme l'onglet, la session se termine. Il n'y a pas de salle cloud persistante à laquelle revenir sauf si tu exporetes le fichier `.excalidraw`. Pour un brainstorming ponctuel ou une seule session de travail, c'est bien. Pour un travail d'équipe continu, les exports réguliers vers un dossier partagé sont le workflow.

## Excalidraw vs les alternatives : une comparaison axée sur la vie privée

Quand la question porte spécifiquement sur la confidentialité des données, la comparaison n'est pas fonctionnalités contre fonctionnalités — c'est modèles de données.

| | Excalidraw | Miro | FigJam | tldraw |
|---|---|---|---|---|
| Le serveur lit le contenu | Non (E2E chiffré) | Oui | Oui | Non |
| Connexion requise | Non | Oui | Oui | Non |
| Auto-hébergeable | Oui (MIT) | Non | Non | Oui |
| Code source visible | Oui | Non | Non | Oui |
| Collaboration E2E chiffrée | Oui | Non | Non | Partiel |

[tldraw](/tool/tldraw-com) est le concurrent le plus proche en matière de confidentialité. Il est aussi open source, aussi sans connexion requise, et offre une expérience collaborative fluide. La principale différence est le modèle de chiffrement — l'architecture de tldraw n'utilise pas actuellement la même approche de fragment d'URL pour le chiffrement de bout en bout pendant la collaboration.

[Diagrams.net](/tool/app-diagrams-net) est une autre option sans connexion à noter pour des raisons de confidentialité. Il sauvegarde localement par défaut et ne nécessite pas de compte. Mais il n'offre pas de collaboration en temps réel de la même façon.

Miro est puissant et soigné. Si ton équipe le paie déjà et que la confidentialité n'est pas une préoccupation pour ton cas d'utilisation, il n'y a pas de raison impérieuse de changer. Mais si tu dessines quelque chose qui ne devrait pas être lisible par un tiers, la différence d'architecture est réelle.

## L'option d'auto-hébergement

Si « le serveur de collaboration est aveugle au contenu » implique encore trop de confiance envers un opérateur tiers — parce que tu es dans un secteur réglementé, ou que la politique de ton organisation exige que les outils tournent sur l'infrastructure de l'entreprise — Excalidraw est auto-hébergeable.

L'[image Docker officielle](https://hub.docker.com/r/excalidraw/excalidraw) facilite le déploiement. Tu fais tourner Excalidraw sur ton propre serveur, sans infrastructure Excalidraw impliquée. Tout le trafic passe par ton serveur, dans ta juridiction, derrière ton pare-feu.

Cette option existe parce que la licence MIT le permet explicitement. Des organisations de santé, de finance et gouvernementales ont déployé Excalidraw sur des réseaux internes précisément parce que l'alternative — un tableau blanc SaaS qui stocke les diagrammes sur des serveurs externes — crée une exposition à la conformité.

## Les limites du modèle de confidentialité

La précision compte ici. Le modèle de confidentialité d'Excalidraw est solide de façons spécifiques et bien définies. Il a des limites à connaître.

Si tu exporetes un PNG et le télécharges sur Slack, Google Drive, ou l'envoies par e-mail, les garanties d'Excalidraw s'arrêtent à l'export. Les plateformes par lesquelles tu partages ont un accès normal à ces fichiers.

Excalidraw+ — la version hébergée payante qui ajoute le stockage cloud persistant et les salles protégées par mot de passe — est un produit différent avec un modèle de stockage différent.

Le `localStorage` du navigateur n'est généralement pas chiffré au niveau du système d'exploitation. Si quelqu'un a accès physique à ta machine et sait où chercher, il pourrait extraire un dessin du stockage du navigateur. C'est une préoccupation lointaine pour la plupart des gens.

Les métadonnées ne sont pas chiffrées. Excalidraw sait quand tu accèdes au site, combien de temps durent les sessions, et quelles adresses IP ont participé. C'est une journalisation standard du serveur web.

Aucune de ces raisons ne devrait t'amener à éviter l'outil. Ce sont simplement le tableau précis de ce que « privé » signifie dans ce contexte.

## Pour commencer

Va sur [excalidraw.com](https://excalidraw.com). Commence à dessiner. Sans inscription. Sans installation.

Ton dessin s'auto-sauvegarde dans `localStorage` pendant que tu travailles. Fermer l'onglet et le rouvrir récupère ton dernier canevas. Pour un stockage permanent, exporte en `.excalidraw` (un fichier JSON que tu peux rouvrir et modifier plus tard), PNG ou SVG.

Pour la collaboration, clique sur l'icône de personne dans la barre d'outils et partage le lien généré. Ton collaborateur n'a besoin de rien d'installé, aucun compte, aucun téléchargement. Le lien est la session.

La chose intéressante avec Excalidraw n'est pas qu'il est gratuit. C'est que les gens qui l'ont construit ont choisi, par conception, de rendre le serveur aveugle au contenu. La collaboration en temps réel où l'intermédiaire ne peut pas lire les données était considérée comme un problème d'ingénierie. Ils l'ont résolu, puis ont rendu la solution open source.
