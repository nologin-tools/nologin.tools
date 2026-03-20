---
title: "Le droit numérique à un logiciel qui ne te surveille pas"
description: "Les outils open source sans inscription ne sont pas seulement pratiques — ils mettent les droits numériques en pratique : communique et collabore sans être tracé."
publishedAt: 2026-03-20
author: "nologin.tools"
tags: ["open-source", "privacy", "analysis", "tools", "browser"]
featured: false
heroImageQuery: "digital rights open source privacy freedom"
locale: fr
originalSlug: "open-source-digital-rights"
sourceHash: "994e76dd1a720e0b"
---

![Hero image](/blog/images/open-source-digital-rights/hero.jpg)

Une question qui mérite qu'on s'y arrête : quand tu rejoins un appel vidéo sur Zoom, qu'as-tu accepté de partager ? Ton nom. Ton e-mail. Ton adresse IP. Les métadonnées de ton appareil. Tes habitudes d'utilisation. Le contenu de tes appels, selon le plan souscrit par l'hôte. Tout ça avant même que l'appel commence.

[Jitsi Meet](/tool/meet-jit-si) tourne entièrement dans ton navigateur. Pas de compte. Pas de téléchargement. Pas d'inscription. L'appel démarre dès que quelqu'un partage un lien. Jitsi est open source (licence Apache 2.0), auto-hébergeable, et utilisé par [des millions de personnes dans le monde](https://jitsi.org/) — y compris des organisations qui gèrent des communications vraiment sensibles. Le code source est public et a été audité de façon indépendante. L'architecture utilise WebRTC, ce qui signifie que les flux média voyagent en pair-à-pair quand c'est possible, sans passer par les serveurs de Jitsi.

Ce contraste n'est pas qu'une simple comparaison de produits. C'est une question de savoir à quel type de logiciel tu as le droit d'accéder.

## Les droits numériques ne sont pas abstraits

« Droits numériques » — ça sonne comme quelque chose qui ne concerne que les militants et les juristes. Ce n'est pas le cas. L'[Electronic Frontier Foundation](https://www.eff.org/issues/privacy) défend depuis trente ans l'idée que ton droit à communiquer de façon privée, à utiliser un logiciel sans être profilé, et à posséder tes propres données est une question de libertés civiles — pas une simple préférence de consommateur. Le RGPD a codifié une partie de tout ça dans la loi : l'article 5 exige que les données personnelles soient collectées pour « des finalités déterminées, explicites et légitimes » et ne soient pas traitées d'une manière incompatible avec ces finalités. L'article 25 exige la « protection des données dès la conception et par défaut ».

Les outils open source sans inscription, c'est à quoi ressemblent ces principes dans la pratique. Ils ne demandent pas de données parce qu'ils n'en ont pas besoin. Ils n'en ont pas besoin parce que l'architecture est construite autour de l'utilisateur, et non autour d'un modèle économique qui monétise ses données.

Les outils sans inscription qui comptent vraiment ne sont pas seulement ceux qui font l'impasse sur un champ de formulaire. Ce sont ceux où l'absence de connexion est la conséquence naturelle du fonctionnement du logiciel : traitement côté client, transfert pair-à-pair, zéro état côté serveur. L'absence d'inscription n'est pas une fonctionnalité qu'ils ont ajoutée. C'est une fonctionnalité dont ils n'ont jamais eu besoin.

## Quand tu dois partager sans laisser de trace

Quelqu'un t'envoie un mot de passe sensible, une clé API, un contrat. Tu dois le transmettre à un collègue. L'e-mail, c'est du texte en clair. Slack conserve des journaux. Les apps de messagerie stockent souvent l'historique des messages indéfiniment. L'instinct de « juste l'envoyer par message » est compréhensible — et souvent exactement faux.

[Yopass](/tool/yopass-se) résout ça proprement. Tu colles un secret, tu définis une expiration, et tu obtiens un lien à usage unique. Le destinataire ouvre le lien, lit le secret, et celui-ci est automatiquement supprimé. Le secret est chiffré côté client avant de quitter ton navigateur ; les serveurs de Yopass ne voient qu'un texte chiffré qu'ils ne peuvent pas lire. Quand le lien est utilisé (ou expire), les données chiffrées disparaissent. Pas de journaux, pas de persistance, pas de compte nécessaire des deux côtés. Le [code source](https://github.com/jhaals/yopass) est public — tu peux vérifier cette affirmation plutôt que de la prendre sur parole, et tu peux auto-héberger Yopass si tu préfères ne pas faire confiance à leur infrastructure.

Le contraste avec des produits comme la fonction de « partage » de LastPass (comptes requis des deux côtés) ou même l'envoi d'un mot de passe par e-mail est saisissant. Ces outils tracent qui a envoyé quoi à qui. Yopass, explicitement, ne le fait pas.

## Le transfert de fichiers qui contourne entièrement le serveur

La façon standard de partager un fichier, c'est de l'uploader sur un serveur — Google Drive, WeTransfer, Dropbox — et d'envoyer un lien. Ce serveur stocke ton fichier. Il peut être saisi par la justice, compromis, ou exploité pour de l'analytique. Le fichier existe quelque part que tu ne contrôles pas, plus longtemps que tu ne le crois.

[PairDrop](/tool/pairdrop-net) fait quelque chose de structurellement différent. Ton fichier va directement de ton appareil à celui de ton correspondant, via les canaux de données de WebRTC. Le serveur de PairDrop gère uniquement la signalisation — la brève négociation qui aide deux navigateurs à se trouver. Une fois la connexion établie, le serveur est hors jeu. Le fichier lui-même ne le touche jamais.

Ce n'est pas qu'une amélioration en termes de vie privée. C'est une architecture différente. Le serveur ne peut pas stocker ce qu'il ne reçoit jamais. Une fuite dans l'infrastructure de PairDrop n'exposerait pas tes fichiers transférés parce qu'ils n'y étaient tout simplement pas. [ShareDrop](/tool/sharedrop-io) fonctionne de la même façon — à garder en favori comme alternative qui ne nécessite pas non plus de connexion et gère le transfert P2P sans stockage intermédiaire.

Les deux sont open source. Les deux fonctionnent dans n'importe quel navigateur moderne. Aucun des deux ne te demande ton e-mail.

## Savoir ce que ton navigateur révèle

L'écart entre « sans inscription » et « non tracé » est plus grand que la plupart des gens ne le réalisent. Un outil peut sauter le formulaire d'inscription tout en prenant l'empreinte de ton navigateur, en journalisant ton IP, et en corrélant tes visites avec des pixels de tracking tiers. Certains le font. Tu peux vérifier que ton navigateur ne fuite pas des données d'une façon que tu n'as pas autorisée.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) — maintenu par l'EFF — teste si l'empreinte de ton navigateur est suffisamment unique pour te suivre sur différents sites. Il vérifie le blocage des trackers, la randomisation des empreintes, et si les scripts de fingerprinting courants peuvent identifier ta configuration de navigateur spécifique. Pas d'inscription. Méthodologie de test open source. L'EFF publie la méthodologie publiquement pour que tu puisses comprendre exactement ce qui est mesuré.

[BrowserLeaks](/tool/browserleaks-com) va plus loin : adresse IP, empreinte WebGL, empreinte Canvas, contexte audio, énumération des polices, APIs de géolocalisation. Chaque test te montre ce que les sites peuvent apprendre sur toi sans te demander quoi que ce soit. Les résultats sont souvent inconfortables. Savoir ce que ton navigateur révèle est une condition préalable pour prendre de bonnes décisions sur les outils sans inscription auxquels tu peux vraiment faire confiance.

| Outil | Données journalisées | Le serveur voit | Auto-hébergeable |
|------|-------------|-------------|---------------|
| Zoom (gratuit) | Compte, IP, métadonnées, contenu des appels | Tout | Non (propriétaire) |
| Jitsi Meet | Optionnel : nom d'affichage | Signalisation uniquement | Oui (Apache 2.0) |
| WeTransfer | IP, e-mail, contenu du fichier | Fichier + métadonnées | Non |
| PairDrop | Rien | Signalisation uniquement | Oui (MIT) |
| LastPass Share | Données de compte, journaux d'accès | Fichier chiffré | Non |
| Yopass | Rien | Secret chiffré | Oui (MIT) |

## Pourquoi l'open source est la couche de confiance

La phrase « nous respectons ta vie privée » ne coûte rien à publier. Elle figure dans pratiquement chaque politique de confidentialité jamais rédigée. La phrase « voici le code qui s'exécute quand tu utilises notre outil » signifie quelque chose.

Le code open source peut être audité. Des chercheurs en sécurité examinent régulièrement les outils open source et publient ce qu'ils trouvent. Quand [le code de Jitsi](https://github.com/jitsi/jitsi-meet) gère l'authentification, l'implémentation est visible. Quand Yopass effectue un chiffrement côté client, la [bibliothèque crypto qu'il utilise](https://github.com/jhaals/yopass) est spécifiée et consultable. Quand PairDrop établit une connexion WebRTC, tu peux lire exactement quelles données transitent par le serveur de signalisation.

Les outils propriétaires peuvent faire les mêmes déclarations et tu ne peux pas les vérifier. Tu peux inspecter leurs requêtes réseau avec les outils développeur du navigateur (ce qui t'en dit quelque chose), mais tu ne peux pas voir le code côté serveur qui traite tes données une fois transmises. Les outils open source avec traitement côté client court-circuitent ce problème : il n'y a pas de code côté serveur qui traite tes données, et le code côté client est public.

C'est cette combinaison qui compte. Open source mais côté serveur, c'est mieux que fermé, mais ça t'oblige quand même à faire confiance au serveur. Côté client mais code fermé, c'est mieux que côté serveur, mais ça reste opaque sur ce que le code fait localement. Open source *et* côté client signifie que ni le serveur ni le code ne nécessitent de confiance au-delà de ce que tu peux vérifier.

## La garantie de l'auto-hébergement

Il y a une couche supplémentaire qui mérite d'être comprise : l'auto-hébergement. Chaque outil mentionné ici peut être déployé sur une infrastructure que tu contrôles.

Jitsi Meet est documenté pour l'auto-hébergement sur Ubuntu avec un [guide étape par étape](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart). Yopass supporte Docker. L'architecture de PairDrop est suffisamment simple pour qu'un seul serveur gère la signalisation pour des milliers d'utilisateurs. Si tu es une organisation avec des exigences réglementaires spécifiques — santé, juridique, secteur public — ça compte. Les obligations de l'article 28 du RGPD sur les sous-traitants deviennent sans objet quand le sous-traitant, c'est toi-même.

Pour la plupart des individus, l'auto-hébergement ne vaut pas la charge de maintenance. Mais la *possibilité* de l'auto-hébergement change la relation de confiance avec la version hébergée. Un outil que tu pourrais faire tourner toi-même, fonctionnant de façon identique que tu utilises leur instance ou la tienne, est fondamentalement différent d'un outil où la version hébergée est la seule option. L'architecture doit être suffisamment propre pour fonctionner sans back end propriétaire, ce qui élimine beaucoup de choix de conception qui permettent la surveillance.

## La trajectoire va vers moins de confiance requise

Les logiciels respectueux de la vie privée, c'était autrefois faire tourner quelque chose sur ta propre machine, déconnectée du réseau. Ce n'est plus la seule option. WebAssembly, WebRTC et le chiffrement côté client ont collectivement rendu possible la création d'outils qui tournent dans le navigateur, communiquent entre eux, et gèrent des opérations sensibles — sans serveur qui accumule des données utilisateur.

Le projet [PrivacyTests.org](/tool/privacytests-org) suit quels navigateurs résistent au fingerprinting, au tracking et aux fuites de données. La tendance est positive : les navigateurs deviennent de plus en plus efficaces pour limiter ce que des tiers peuvent collecter, et les utilisateurs sont plus conscients de la distinction entre « gratuit » et « te coûte tes données ».

Les outils sans inscription qui méritent d'être utilisés sur le long terme sont ceux où l'architecture rend la surveillance structurellement impossible, pas seulement actuellement interdite par une politique. Les politiques changent. Les modèles économiques changent. L'architecture est plus difficile à changer — surtout quand le code est public et que la communauté le remarquerait.

Parcours les outils sur [nologin.tools](/tool/nologin-tools) pour trouver des options open source respectueuses de la vie privée, vérifiées pour le traitement côté client. Ceux marqués comme open source ont des dépôts publics que tu peux inspecter. C'est le standard qui signifie vraiment quelque chose.
