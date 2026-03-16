---
title: "Le vrai prix des comptes gratuits : ce que tu cèdes en échange"
description: "Les comptes gratuits ne sont pas gratuits — Meta gagne 233 $ par utilisateur américain chaque année. Voici ce qui est vraiment collecté, comment c'est utilisé, et ce que tu peux faire."
publishedAt: 2026-03-14
author: "nologin.tools"
tags: ["privacy", "analysis", "tools"]
featured: false
heroImageQuery: "digital privacy data collection surveillance"
locale: fr
originalSlug: hidden-cost-free-accounts
sourceHash: 6cafff4f6ab83823
---

![Hero image](/blog/images/hidden-cost-free-accounts/hero.jpg)

En 2024, Meta a généré environ 233 $ par utilisateur américain et canadien. Pas via des abonnements. En vendant l'accès à des profils comportementaux construits à partir de tout ce que tu as tapé, cliqué, survolé ou ignoré sur leurs produits « gratuits ».

Ce chiffre vient directement de leurs rapports financiers trimestriels. C'est ce que le marché publicitaire pense que ton attention et tes données comportementales valent — et ça augmente chaque année.

Alors quand un service est gratuit, tu ne fais pas une affaire. Tu es l'affaire.

## Ce qui est vraiment collecté quand tu t'inscris

L'adresse e-mail, c'est le cadet de leurs soucis. Dès le moment où tu crées un compte — et souvent avant, via des pixels de tracking et des scripts tiers — une entreprise commence à construire ton profil.

L'évident, c'est le contenu explicite : nom, e-mail, date de naissance, localisation. Mais les données comportementales, c'est là que se trouve la vraie valeur. Chaque scroll, chaque pause, chaque recherche, chaque contenu sur lequel tu t'attardes est enregistré et injecté dans des modèles qui déduisent des choses que tu n'as jamais dites à personne. Que tu sois anxieux. Que tu sois enceinte. Que tu sois sur le point d'acheter une voiture.

Sous tout ça tourne le fingerprinting technique. Type de navigateur, résolution d'écran, polices installées, comportement de la carte graphique — combinés, ces éléments créent un identifiant quasi unique qui te suit d'un site à l'autre même quand tu n'es pas connecté et même si tu vides tes cookies. L'outil [Cover Your Tracks](https://coveryourtracks.eff.org) de l'EFF ([disponible sans inscription](/tool/coveryourtracks-eff-org)) peut te montrer exactement à quel point ton navigateur est unique pour les sites que tu visites. La plupart des gens sont surpris.

La dimension cross-site, c'est ce qui rend l'évasion particulièrement difficile. Les boutons « Se connecter avec Google » et « Se connecter avec Facebook » présents sur des sites tiers rapportent à Google et Meta même quand tu ne cliques pas dessus. Le widget de connexion se charge, et le tracking se produit quoi qu'il arrive. Tu n'as rien signé sur ce site, mais ta visite est quand même enregistrée.

## La vente aux enchères en temps réel derrière chaque chargement de page

Quand tu charges une page web qui affiche de la pub programmatique, une enchère a lieu en environ 100 millisecondes. Ton profil — données démographiques inférées, signaux d'intention d'achat, historique de navigation — est diffusé à des centaines d'annonceurs potentiels. Ils enchérissent. Le gagnant sert une pub. Tu ne vois rien de tout ça, mais tes données ont été partagées avec chaque enchérisseur, pas seulement le gagnant.

C'est ce qu'on appelle le real-time bidding, et c'est le fondement de l'économie publicitaire. Les implications pour la vie privée ne sont pas accidentelles — elles sont structurelles. Partager tes données avec des centaines de parties simultanément, c'est le fonctionnement normal du système.

La division publicitaire de Google a engrangé environ 237 milliards de dollars en 2024. Alphabet ne vend pas des pubs sur la seule notoriété de la marque ; il vend un ciblage qui n'est possible que parce qu'il traque les comportements sur Search, Gmail, YouTube, Maps, Android et Chrome simultanément. Une étude de l'Université Vanderbilt en 2022 a estimé que des téléphones Android en veille envoient des données aux serveurs de Google environ 14 fois par heure.

## Le problème des fuites de données est plus grand que tu ne le crois

Les comptes gratuits s'accumulent. Avec le temps, la plupart des gens en ont des dizaines — inscriptions sur des forums, essais gratuits, apps téléchargées et oubliées. Chacun est une cible potentielle en cas de fuite.

La base de données [Have I Been Pwned](https://haveibeenpwned.com) de Troy Hunt ([accessible sans inscription](/tool/haveibeenpwned-com)) avait recensé plus de 14 milliards de comptes compromis début 2025. Ce chiffre représente des milliers de fuites individuelles, des petits forums aux grandes plateformes. Il y a de bonnes chances que ton adresse e-mail y figure plusieurs fois.

La vraie catastrophe, ce ne sont pas les fuites individuelles — c'est ce qui se passe après. Les data brokers agrègent des enregistrements de différentes sources, les fusionnent et vendent des profils complets. La fuite de National Public Data en 2024 a exposé environ 2,9 milliards d'enregistrements, dont des numéros de sécurité sociale et des adresses. Cette entreprise était un data broker. Elle avait collecté toutes ces informations précisément parce que les données des gens fuient constamment des services gratuits, et qu'il existe un marché pour les acheter, les nettoyer et les revendre.

Le rapport IBM 2024 Cost of a Data Breach évalue le coût moyen mondial d'une fuite à 4,88 millions de dollars par incident. Mais c'est le coût pour l'entreprise. Pour les individus dont les données sont exposées, le coût se traduit autrement : tentatives de phishing, attaques de credential stuffing sur d'autres comptes, usurpation d'identité des années plus tard.

> « Les données ne disparaissent pas après une fuite — elles circulent. Un ensemble d'identifiants exposés en 2016 peut encore être utilisé dans des campagnes de credential stuffing actives en 2026. »

## Ce qu'on fait avec les données que tu pensais sans importance

Les cas de détournement les plus alarmants ne sont pas hypothétiques. Ils ont été investigués, sanctionnés et parfois avoués.

Le pixel publicitaire de Meta a été retrouvé intégré sur au moins 33 des 100 principaux sites hospitaliers américains, envoyant des données sur les recherches médicales des patients — recherches de conditions spécifiques, interactions de prise de rendez-vous — vers les systèmes de ciblage publicitaire de Facebook. C'est The Markup qui l'a signalé en 2022. Ces données n'auraient jamais dû quitter le système de l'hôpital.

BetterHelp, une plateforme de thérapie en ligne, a payé un accord de 7,8 millions de dollars avec la FTC en 2023 pour avoir partagé les informations de santé mentale sensibles de ses utilisateurs avec Facebook et Snapchat à des fins de ciblage publicitaire — malgré des promesses explicites de ne pas partager ces données.

Twitter (avant le rachat) a réglé une affaire à 150 millions de dollars en 2023 pour un schéma bien précis : il avait collecté des numéros de téléphone pour la sécurité de l'authentification à deux facteurs, puis avait utilisé ces mêmes numéros pour le ciblage publicitaire. Des numéros donnés pour la sécurité ont fini par servir la monétisation.

Google a payé un accord multiétat de 391 millions de dollars en 2022 après qu'une enquête de l'Associated Press ait révélé qu'il suivait la localisation précise des utilisateurs même quand ils avaient explicitement désactivé « Historique des positions ». Le paramètre disait une chose. Le comportement en faisait une autre.

Aucun de ces cas n'est anecdotique. Ce sont des actions d'application documentées par des régulateurs fédéraux contre certaines des plus grandes entreprises technologiques au monde.

## Pourquoi le RGPD aide (et où il ne suffit pas)

Le RGPD de l'UE donne aux utilisateurs européens des droits significatifs : accès à leurs données, suppression, portabilité, et l'obligation pour les entreprises de démontrer une base légale pour le traitement des données personnelles. Les amendes RGPD peuvent atteindre 4 % du chiffre d'affaires annuel mondial — c'est pourquoi Meta a payé plus d'1,2 milliard d'euros d'amendes RGPD depuis 2018.

Le CCPA californien offre des droits similaires aux résidents de Californie. Si tu es californien, tu peux techniquement demander aux data brokers de supprimer tes enregistrements. Le problème : une étude de Consumer Reports a constaté que les brokers réacquéraient souvent les données supprimées en quelques mois via d'autres sources. Les demandes de suppression fonctionnent une fois. L'économie des données comble automatiquement les lacunes.

Les États-Unis n'ont toujours pas de loi fédérale complète sur la vie privée en 2026. Les protections varient selon l'État, le secteur et la bonne volonté des entreprises. Pour la plupart des utilisateurs en dehors de la Californie et de l'UE, les protections légales sont maigres.

## La comparaison que tu devrais vraiment faire

| Outil | Compte requis | Données collectées | Modèle économique |
|---|---|---|---|
| Google Docs | Oui | Contenu des documents, comportement, métadonnées | Ciblage publicitaire |
| Microsoft 365 Free | Oui | Télémétrie d'usage, analyse de contenu | Upsell + données |
| Photopea (sans compte) | Non | Données de session minimales | Pubs display (non ciblées) |
| Excalidraw (sans compte) | Non | Rien de stocké côté serveur | Open source / dons |
| PDF24 Tools (sans compte) | Non | Contenu des fichiers (traité, non conservé) | Pubs |

[Photopea](/tool/photopea-com) gère les fichiers PSD au niveau d'une application desktop. [Excalidraw](/tool/excalidraw-com) est un tableau blanc collaboratif complet. Aucun des deux ne nécessite de compte. Aucun des deux ne construit un profil comportemental sur toi. L'écart de fonctionnalités entre ces outils et leurs équivalents nécessitant un compte s'est considérablement réduit.

La comparaison ne favorise pas toujours les outils sans compte — Google Docs a des fonctionnalités que Photopea n'a pas. Mais pour une grande partie des tâches quotidiennes, la différence de fonctionnalités est soit négligeable soit inexistante, et le compromis bascule entièrement.

## Ce que tu peux concrètement faire

Utiliser des outils sans compte pour les tâches qui ne nécessitent pas de persistance, c'est l'approche la plus directe. Pour l'édition d'images rapide, la conversion de formats, les outils PDF, les tableaux blancs, la correction grammaticale, et des dizaines d'autres usages, des outils qui fonctionnent sans inscription existent et fonctionnent bien. [nologin.tools](/tool/nologin-tools) maintient un répertoire d'options vérifiées et triées sur le volet.

Pour les cas où tu as vraiment besoin d'un compte, les [services d'e-mail temporaire](/tool/temp-mail-org) te permettent de créer une adresse jetable pour les inscriptions, empêchant ta vraie boîte de devenir un point de données lié à des dizaines de services. Ça n'aide pas contre le tracking comportemental après connexion, mais ça limite l'agrégation de ta vraie identité.

L'hygiène du navigateur compte. Des navigateurs séparés pour des contextes séparés, un blocage de contenu agressif, et comprendre ce que ton navigateur expose — tout ça a un sens réel. [BrowserLeaks](/tool/browserleaks-com) peut te montrer quelles données de fingerprinting sont visibles depuis ta configuration actuelle.

L'outil lancé récemment sur Hacker News — Ichinichi, une app de note-par-jour chiffrée de bout en bout et local-first — représente une direction architecturale plus large qui mérite attention. Les applications local-first qui traitent les données sur ton appareil plutôt que dans le cloud évitent entièrement le problème d'accumulation de données côté serveur. La tendance vers les outils local-first, zero-knowledge et privacy-by-design s'accélère. Pas par victoire morale, mais parce que suffisamment d'utilisateurs ont commencé à le demander pour qu'il existe un marché pour ça.

## Le changement est déjà en cours

La pression réglementaire augmente. Les sanctions deviennent plus lourdes. Les amendes RGPD ont franchi le milliard d'euros. La FTC sous les administrations récentes a été plus active sur les pratiques de données que dans la décennie précédente. La législation au niveau des États se multiplie. Le coût légal du détournement de données augmente, ce qui change le calcul pour les entreprises qui ont traité les données utilisateurs comme du pur profit.

Les alternatives techniques sont meilleures qu'elles ne l'ont jamais été. Des outils respectueux de la vie privée pour presque tous les workflows courants existent désormais, souvent construits sur des fondations open source qui les rendent fiables d'une manière que les services propriétaires ne peuvent pas égaler.

Par défaut, pourtant, c'est toujours la surveillance. La plupart des gens continueront à créer des comptes, à accepter des conditions qu'ils ne lisent pas, et à alimenter inconsciemment des écosystèmes de pub comportementale avec l'enregistrement de leur vie numérique quotidienne. Changer ce défaut — un échange d'outil à la fois — n'est pas une solution parfaite, mais c'est une solution réelle.

La question n'est pas de savoir si tu peux te passer complètement de comptes. Tu ne peux probablement pas. La question, c'est quels comptes sont vraiment nécessaires, et lesquels tu as créés parce que c'était plus rapide que chercher une alternative.
