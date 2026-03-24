---
title: "hat.sh : chiffre tes fichiers dans le navigateur sans faire confiance à personne"
description: "hat.sh chiffre et déchiffre des fichiers avec AES-256-GCM directement dans ton navigateur. Pas d'upload, pas de serveur, pas de compte — tes données ne quittent jamais ton appareil."
publishedAt: 2026-03-24
author: "nologin.tools"
tags: ["tools", "review", "privacy", "encryption"]
featured: false
locale: fr
originalSlug: hat-sh
sourceHash: 49157d5e315dbffb
heroImageQuery: "file encryption security lock browser"
---

![Hero image](/blog/images/hat-sh/hero.jpg)

Tous les services de stockage cloud, toutes les plateformes de partage de fichiers, tous les outils d'upload qui se prétendent « sécurisés » ont un point commun : tes fichiers transitent par l'ordinateur de quelqu'un d'autre. Tu fais confiance au chiffrement du prestataire, à sa gestion des clés, à ses employés, et à ses obligations légales vis-à-vis de quiconque pourrait demander accès à tes données. C'est beaucoup de confiance à accorder à une entreprise que tu n'as jamais rencontrée.

Et si le chiffrement se produisait avant que le fichier quitte ta machine — dans ton navigateur, sans qu'aucun serveur ne voie jamais le texte en clair ?

C'est exactement ce que fait [hat.sh](https://hat.sh).

## Ce que fait vraiment hat.sh

hat.sh est un outil de chiffrement de fichiers qui tourne dans le navigateur. Tu fais glisser un fichier sur la page, tu entres un mot de passe (ou tu fournis une clé publique), et il te crache un fichier `.enc` chiffré. Pour déchiffrer, tu fais glisser le `.enc` sur la même page, tu entres le mot de passe, et tu récupères ton fichier original. Tout se passe localement en JavaScript — pas de requête réseau avec le contenu de ton fichier, pas de backend, pas de base de données.

Le schéma de chiffrement utilisé est AES-256-GCM, le même algorithme que Signal, WhatsApp et la plupart des connexions TLS modernes. C'est du chiffrement authentifié : si le fichier a été modifié à un moment quelconque, le déchiffrement échoue — clairement, pas silencieusement. On ne peut pas altérer subtilement un fichier chiffré et espérer que hat.sh l'accepte.

hat.sh propose deux modes :

- **Chiffrement par mot de passe** : tu définis un mot de passe, l'outil dérive une clé de chiffrement via PBKDF2. Toute personne qui connaît le mot de passe peut déchiffrer.
- **Chiffrement par clé publique** : tu génères une paire de clés, tu partages ta clé publique, et n'importe qui peut chiffrer des fichiers que toi seul pourras ouvrir avec ta clé privée. Ça utilise l'échange de clés X25519 combiné à AES-256-GCM.

Le mode clé publique est particulièrement utile pour les équipes. Un journaliste peut publier sa clé publique ; ses sources peuvent utiliser hat.sh pour chiffrer des documents avant de les envoyer, sans aucune configuration du côté de l'expéditeur.

## Pas de login, pas d'upload, pas de compte

L'histoire de confidentialité ici est exceptionnellement propre. Le [code source est sur GitHub](https://github.com/sh-dv/hat.sh) sous licence MIT — tu peux lire exactement quel JavaScript s'exécute dans ton navigateur. Pas de télémétrie, pas d'appels analytics avec les métadonnées de tes fichiers, et aucun composant côté serveur à compromettre.

Comparé aux services typiques de partage « sécurisé » de fichiers :

| Fonctionnalité | Service d'upload chiffré classique | hat.sh |
|----------------|-----------------------------------|--------|
| Fichiers envoyés au serveur | Oui | Non |
| Compte requis | Souvent | Jamais |
| Le serveur voit le texte en clair | Selon l'implémentation | Non |
| Code source auditable | Rarement | Oui (MIT) |
| Fonctionne hors ligne | Non | Oui (après le premier chargement) |

Des outils comme [VirusTotal](/tool/virustotal-com) envoient tes fichiers vers des serveurs externes par conception — c'est leur raison d'être. hat.sh, c'est l'inverse : le contenu de tes fichiers ne va nulle part, c'est tout le principe.

## Quand tu aurais recours à hat.sh

Imagine un comptable indépendant qui doit envoyer des documents fiscaux à un client. Le mail, c'est du texte en clair. La plupart des liens de partage expirent ou sont indexés. Il lui faut quelque chose de simple : ouvrir une page web, chiffrer le fichier avec un mot de passe partagé, envoyer le résultat.

Ou un développeur qui fait tourner des identifiants dans un dépôt. Il doit partager un fichier `.env` avec un collègue — une seule fois, de façon sécurisée. Il n'a pas envie de mettre en place toute une infrastructure de clés GPG pour un seul transfert. hat.sh lui permet de chiffrer avec un mot de passe à usage unique et d'envoyer le `.enc` via Slack, Discord ou mail. Sans le mot de passe, le blob chiffré ne veut rien dire.

Pour les chercheurs en sécurité, le mode clé publique a une vraie utilité. Tu peux diffuser ta clé publique sur ton site et laisser n'importe qui t'envoyer des fichiers chiffrés sans rien installer. Pas de serveur de clés PGP, pas de client GPG, pas la complexité de la [Web of Trust](https://en.wikipedia.org/wiki/Web_of_trust).

## L'honnêteté technique du chiffrement côté client

Le chiffrement côté client a une limitation notable qui mérite d'être reconnue : si le site web lui-même est compromis, un JavaScript malveillant pourrait exfiltrer ton mot de passe ou ton fichier avant le chiffrement. C'est la tension fondamentale avec tout outil de crypto basé sur le navigateur.

hat.sh y répond de plusieurs façons. D'abord, le code open source permet à n'importe qui d'auditer le JavaScript. Ensuite, tu peux télécharger le dépôt et exécuter hat.sh localement, complètement en air gap. Enfin, pour les utilisateurs avec des exigences de sécurité très élevées, le projet inclut un Docker pour le self-hosting.

Pour la plupart des usages — envoyer des documents sensibles à un collègue, chiffrer une sauvegarde avant de la uploader dans le cloud, protéger un fichier de configuration — le modèle de menace n'inclut pas un CDN compromis. Le chiffrement navigateur est une amélioration substantielle par rapport à l'envoi de fichiers en clair.

Si tu veux comprendre comment ton navigateur gère la cryptographie, la [spécification de la Web Crypto API](https://www.w3.org/TR/WebCryptoAPI/) documente les primitives qu'utilise hat.sh sous le capot. C'est une fonctionnalité native du navigateur, pas une implémentation custom — les opérations cryptographiques s'exécutent en C++ optimisé, pas en JavaScript interprété.

## hat.sh comparé aux outils similaires sans login

Tu connais peut-être déjà [CyberChef](/tool/gchq-github-io-cyberchef), qui tourne aussi entièrement dans le navigateur et peut gérer le chiffrement AES. Mais CyberChef est un outil de transformation de données généraliste : il gère l'encodage, la compression, le hachage et des centaines d'autres opérations en plus du chiffrement. Cette étendue le rend puissant mais aussi complexe pour un utilisateur non technique.

hat.sh est fait pour une seule chose : chiffrer des fichiers pour un transport ou un stockage sécurisé. L'interface est suffisamment minimale pour qu'on puisse passer l'URL à quelqu'un qui ne sait pas ce qu'est AES, et il comprendra en moins d'une minute. La simplicité, c'est une feature.

[Wormhole](/tool/wormhole-app) résout un problème connexe — le transfert de fichiers P2P avec chiffrement de bout en bout — mais il nécessite que les deux parties soient en ligne simultanément, et les fichiers transitent par des serveurs relais. hat.sh produit un fichier chiffré statique que tu peux envoyer par n'importe quel canal, de façon asynchrone.

## Pour commencer

Utiliser hat.sh pour la première fois prend environ 30 secondes :

1. Va sur [hat.sh](https://hat.sh)
2. Glisse-dépose n'importe quel fichier sur la page (ou clique pour parcourir)
3. Choisis le mode « Password » et entre une phrase de passe solide
4. Clique sur **Encrypt** — tu télécharges un fichier `.enc`
5. Partage le `.enc` par n'importe quel canal ; partage le mot de passe séparément

Pour déchiffrer :

1. Va sur [hat.sh](https://hat.sh)
2. Glisse-dépose le fichier `.enc`
3. Entre le mot de passe
4. Ton fichier original se télécharge automatiquement

Tout ça sans compte, sans installation, sans faire confiance à un tiers. Le fichier chiffré, c'est juste des octets — tu peux le stocker dans Dropbox, l'envoyer par mail, ou le publier publiquement. Sans le mot de passe, c'est opaque.

---

Les outils de confidentialité viennent souvent avec un compromis : soit tu as une sécurité solide avec une complexité douloureuse (GPG), soit tu as de la facilité d'utilisation avec les données qui vont sur les serveurs de quelqu'un d'autre. hat.sh fait un pari différent — qu'une appli web bien conçue, transparente et open source peut t'offrir les deux. À mesure que les navigateurs deviennent plus capables et que la Web Crypto API mûrit, attends-toi à voir de plus en plus d'outils suivre ce schéma : le serveur se contente de livrer le code, et tout ce qui est sensible se passe sur ta machine.
