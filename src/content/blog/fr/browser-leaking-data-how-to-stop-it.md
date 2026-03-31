---
title: "Ton navigateur fuit des données — voilà comment y remédier"
description: "Ton navigateur expose ton IP réelle, ton GPU, tes polices et ton fuseau horaire à chaque site que tu visites. Voici ce qui fuit et comment l'en empêcher."
publishedAt: 2026-03-31
updatedAt: 2026-03-31
author: nologin.tools
tags: ["privacy", "browser", "guide", "analysis"]
featured: false
heroImageQuery: "browser privacy fingerprinting data leak surveillance"
locale: fr
originalSlug: browser-leaking-data-how-to-stop-it
sourceHash: fd14e428ffc082f9
---

![Hero image](/blog/images/browser-leaking-data-how-to-stop-it/hero.jpg)

Ouvre un onglet en navigation privée. Pas de cookies, pas d'historique, pas de connexion. Tu te sens anonyme.

Eh bien non. Pas du tout, même.

La [recherche Panopticlick de l'EFF](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) a révélé que **83,6 % des navigateurs ont une empreinte unique** — suffisante pour t'identifier sur chaque site que tu visites sans déposer le moindre cookie. Ajoute les extensions du navigateur et ce chiffre grimpe à 94,2 %. La navigation privée n'y change rien. Vider les cookies non plus.

Voici ce qui fuit réellement, et ce que tu peux faire pour y remédier.

## Ce que ton navigateur envoie vraiment

À chaque chargement de page, ton navigateur révèle un véritable roman sur lui-même. Avant même que JavaScript ne s'exécute, les en-têtes HTTP exposent le nom et la version de ton navigateur, ton système d'exploitation, tes langues préférées et la prise en charge des encodages. Tout ça automatiquement — sans avertissement, sans consentement.

JavaScript empire considérablement les choses. Les sites peuvent lire ta résolution d'écran (y compris l'espace occupé par ta barre des tâches), ton fuseau horaire exact, le nombre de cœurs CPU de ta machine, la quantité de RAM de ton appareil (arrondie à la puissance de deux la plus proche, mais toujours exploitable) et ton schéma de couleurs préféré. Rien de tout ça ne nécessite la moindre autorisation.

En chiffres : les bibliothèques modernes de fingerprinting comme FingerprintJS collectent **plus de 100 attributs individuels** par navigateur. Combinés en un hash, ils produisent un identifiant qui persiste entre les sessions, entre les navigateurs sur la même machine, et même en navigation privée. FingerprintJS revendique une précision de 99,5 % pour réidentifier les visiteurs de retour, même après avoir effacé les cookies.

La vérité inconfortable : la plupart des choses censées te rendre « privé » en ligne — vider les cookies, utiliser un VPN, ouvrir la navigation privée — ne touchent pas du tout au fingerprinting. Ce sont des solutions à un autre problème.

## Le problème WebRTC (et pourquoi ton VPN ne t'aide pas)

WebRTC est l'API du navigateur qui alimente les appels vidéo en ligne — Google Meet, Discord, Zoom web. Elle fonctionne en établissant des connexions directes entre navigateurs, ce qui signifie qu'elle a besoin de connaître ton adresse réseau réelle.

Le problème : n'importe quel site peut déclencher une tentative de connexion WebRTC avec quelques lignes de JavaScript, sans interaction de l'utilisateur ni permission. Pour trouver le chemin le plus rapide entre les pairs, WebRTC utilise un protocole appelé ICE (Interactive Connectivity Establishment), qui contacte un serveur STUN public. La réponse de ce serveur STUN inclut ton **adresse IP publique réelle**.

Ton VPN n'intercepte pas ça. Le trafic WebRTC utilise UDP et est géré au niveau du système d'exploitation différemment du trafic HTTP du navigateur. La plupart des implémentations VPN ne l'interceptent tout simplement pas. Donc, même avec un VPN actif, un site peut exécuter ce code et découvrir ton IP réelle en moins d'une seconde :

```js
const pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
pc.createDataChannel("");
pc.createOffer().then(o => pc.setLocalDescription(o));
pc.onicecandidate = e => { /* ton IP réelle est dans e.candidate.candidate */ };
```

C'est ce qu'on appelle une fuite WebRTC, et elle est documentée dans des SDK de fingerprinting commerciaux, des plateformes adtech et des systèmes antifraude.

**Comment la bloquer :** Firefox te permet de désactiver complètement WebRTC en passant `media.peerconnection.enabled` à `false` dans `about:config`. Ça casse les appels vidéo en ligne, c'est donc un compromis. Les paramètres avancés d'uBlock Origin incluent une option « Empêcher WebRTC de divulguer les adresses IP locales » qui est moins radicale — elle bloque l'exposition de l'IP locale tout en laissant WebRTC fonctionner. Brave bloque par défaut la fuite d'IP locale depuis son panneau Shields.

Tu peux vérifier si tu fuites avec [IPLeak](/tool/ipleak-net), qui affiche tous les candidats ICE WebRTC que ton navigateur expose en ce moment.

## Les fuites DNS : l'autre trou dans ton VPN

Quand tu tapes un nom de domaine dans ton navigateur, un résolveur DNS le transforme en adresse IP. Si tu utilises un VPN, cette requête devrait passer par le tunnel VPN jusqu'au résolveur de ton fournisseur — pas jusqu'à celui de ton FAI.

Une fuite DNS, c'est quand la requête passe quand même par ton FAI, lui révélant chaque domaine que tu visites malgré le VPN. Le contenu de ton trafic reste chiffré, mais ton FAI peut voir que tu as visité `exemple.com` mardi à 21h14. Assez pour construire un profil comportemental détaillé.

Les fuites DNS surviennent pour plusieurs raisons d'infrastructure assez rébarbatives. Windows dispose d'une fonctionnalité appelée Smart Multi-Homed Name Resolution qui envoie les requêtes DNS à **tous** les adaptateurs réseau disponibles simultanément et utilise la réponse la plus rapide. Les requêtes partent donc à la fois vers le résolveur du VPN et celui du FAI. Beaucoup de clients VPN ne gèrent pas ce comportement correctement.

L'IPv6 est un autre coupable fréquent. Beaucoup de VPN ne tunnelisent que le trafic IPv4. Si ton routeur et ton OS supportent l'IPv6, les requêtes DNS passant par cette voie contournent complètement le tunnel VPN.

Certains FAI aggravent les choses en déployant des proxies DNS transparents — ils interceptent tout le trafic UDP sortant sur le port 53 et le redirigent vers leurs propres résolveurs, même si tu as configuré un serveur DNS différent comme 1.1.1.1 ou 8.8.8.8.

**Pour tester si tu fuis :** Lance un test étendu sur [DNS Leak Test](/tool/dnsleaktest-com). Il envoie des requêtes DNS vers un ensemble de sous-domaines uniques et observe quels résolveurs les récupèrent. Si les résultats montrent les serveurs de ton FAI plutôt que ceux de ton fournisseur VPN, tu as une fuite confirmée.

La solution dépend de ta configuration, mais activer DNS-over-HTTPS (DoH) dans ton navigateur est un bon point de départ qui contourne complètement le résolveur système. Dans Firefox, c'est dans Paramètres → Vie privée et sécurité → DNS via HTTPS. Passe-le en « Protection maximale » pour éviter le repli sur le résolveur système.

## Canvas et audio fingerprinting (le truc vraiment flippant)

Même avec WebRTC bloqué et DNS sécurisé, il existe une catégorie de fingerprinting qui ne dépend pas du tout de ton réseau. Elle exploite les infimes différences dans la façon dont ton matériel restitue les graphiques.

Le canvas fingerprinting fonctionne ainsi : un script dessine du texte et des formes sur un élément `<canvas>` invisible, puis lit les données pixel en retour. Le résultat varie — subtilement mais de façon mesurable — selon le modèle de GPU, la version du pilote, le système d'exploitation et le moteur de rendu des polices. macOS utilise CoreText, Windows utilise DirectWrite, Linux utilise FreeType. Chacun produit un anticrénelage sous-pixel légèrement différent. Chaque pilote GPU a son propre comportement d'arrondi en virgule flottante. L'article académique de 2014 [« The Web Never Forgets »](https://dl.acm.org/doi/10.1145/2660267.2660347) a trouvé le canvas fingerprinting déployé sur 5 % des 100 000 sites les plus visités à l'époque — et c'était il y a plus d'une décennie.

L'audio fingerprinting est similaire. Un script crée un `AudioContext`, fait passer un oscillateur dans un analyseur et lit les valeurs de sortie. Les infimes différences en virgule flottante dans la façon dont ton matériel traite l'audio sont suffisamment cohérentes pour t'identifier d'une session à l'autre. Aucun accès au microphone requis.

Ces deux signaux combinés — canvas + empreinte WebGL — portent chacun environ 15 bits d'entropie ou plus. Cela signifie qu'environ 1 navigateur sur 32 768 partage la même empreinte canvas de façon isolée. Combinée à ta résolution d'écran, ton fuseau horaire, le nombre de cœurs CPU et ton User-Agent, tu te retrouves avec un échantillon d'un seul individu.

> L'ironie gênante : avoir des extensions de confidentialité peut te rendre *plus* identifiable. Si tu es l'une des rares personnes à faire tourner uBlock Origin en « mode moyen » avec un ensemble spécifique d'extensions, cette configuration elle-même devient un signal distinctif.

## Comment te tester maintenant

Avant de changer quoi que ce soit, il vaut le coup de voir ce que tu exposes réellement.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) de l'EFF est le meilleur point de départ. Il teste ton navigateur contre une base de données de millions d'empreintes réelles et te dit à quel point la tienne est unique, avec des scores d'entropie par attribut. « Ton navigateur a une empreinte unique » signifie que tu peux être identifié. « Protection forte » signifie que ton navigateur ressemble à beaucoup d'autres — ce qui est l'objectif réel.

[BrowserLeaks](/tool/browserleaks-com) va plus loin, avec des pages séparées pour les fuites WebRTC, les empreintes canvas, les détails WebGL, les polices installées, le fingerprinting TLS et bien plus. Lance d'abord le test WebRTC — c'est là que la surprise est la plus probable.

[PrivacyTests](/tool/privacytests-org), créé par un ancien ingénieur vie privée de Firefox, compare les navigateurs entre eux sur plus de 20 tests de confidentialité. C'est moins pour tester ton navigateur spécifique que pour comparer Chrome, Firefox, Brave, Safari et Tor Browser sur des scénarios standardisés. À lire avant de décider si tu changes de navigateur.

## Ce qui aide vraiment

La réponse honnête, c'est qu'aucun réglage unique ne règle tout. Mais ces changements ont des effets mesurables et documentés :

**Change de navigateur.** C'est le changement le plus impactant. Brave bloque par défaut l'exposition de l'IP locale par WebRTC et le canvas fingerprinting — il ajoute du bruit aléatoire à la sortie canvas/audio à chaque session, rendant impossible la corrélation inter-sites sans casser le web. Firefox avec `privacy.resistFingerprinting = true` adopte une approche différente : il normalise tout pour ressembler à un navigateur générique (résolution fixe à 1000×900, fuseau UTC, chaîne UA générique). Cela te fait ressembler à tous les autres utilisateurs Firefox avec ce paramètre activé — ce qui est le bon modèle.

| Navigateur | Canvas FP | IP WebRTC | DNS-over-HTTPS | Cookies tiers |
|---|---|---|---|---|
| Chrome | Aucune | Fuite | Optionnel | Blocages partiels |
| Firefox (défaut) | Aucune | Fuite | Optionnel | Strict (ETP) |
| Firefox (RFP) | Aléatoire | Désactivée | Optionnel | Strict |
| Brave | Aléatoire | Bloquée | Optionnel | Bloqués |
| Tor Browser | Uniforme | Désactivée | N/A (utilise Tor) | Bloqués |

**Installe uBlock Origin.** Sur Firefox, utilise le mode moyen (bloque tous les scripts tiers par défaut, whitelist au besoin). Active « Empêcher WebRTC de divulguer les adresses IP locales » dans les paramètres avancés. Ça bloque la majorité des scripts de fingerprinting avant même qu'ils s'exécutent. Sur Chrome, installe-le avant que les changements Manifest V3 de Google ne limitent davantage les capacités des extensions.

**Active DNS-over-HTTPS.** Firefox et Chrome le supportent nativement. Utilise Cloudflare (1.1.1.1) ou NextDNS. NextDNS en particulier te permet de voir exactement quels domaines ton navigateur résout — utile pour auditer ce qui tourne sur une page.

**Fige ton User-Agent.** Ta chaîne UA seule transporte environ 10,5 bits d'entropie, selon la recherche Panopticlick originale. `privacy.resistFingerprinting` de Firefox gère ça automatiquement. Sur Chrome, l'API UA-CH (User-Agent Client Hints) remplace progressivement l'ancienne chaîne UA — l'intention était de réduire l'entropie, mais le déploiement a été irrégulier.

Tor Browser reste l'étalon-or en matière de résistance au fingerprinting. Il normalise chaque attribut fingerprintable pour qu'il soit identique chez tous les utilisateurs Tor — même UA, même taille d'écran, mêmes polices, même fuseau horaire. L'objectif est l'uniformité, pas le blocage. Chaque utilisateur de Tor Browser est identique aux autres. C'est la seule approche qui défait vraiment le fingerprinting plutôt que d'en augmenter simplement le coût.

Pour la plupart des gens, Brave ou Firefox avec uBlock Origin couvre 80 % du chemin sans casser les sites que tu utilises vraiment. C'est un compromis raisonnable.

Ce que tu ne peux pas résoudre complètement seul, c'est le fingerprinting TLS — l'ordre des suites de chiffrement et les valeurs des extensions TLS que ton navigateur envoie lors de la poignée de main HTTPS sont suffisamment caractéristiques pour identifier ton navigateur au niveau réseau, avant tout HTTP. Cloudflare et d'autres CDN utilisent déjà les hashes JA3 (une empreinte TLS standardisée) pour la détection de bots. Aucune extension navigateur ne touche à ça. C'est un problème soluble, mais seuls les navigateurs eux-mêmes peuvent le corriger.

Le web intègre bien plus d'infrastructure de surveillance que la plupart des utilisateurs ne le réalisent. La bonne nouvelle, c'est que quelques changements concrets — un meilleur navigateur, une extension, DNS-over-HTTPS activé — réduisent significativement ce que tu laisses fuiter. Commence par Cover Your Tracks. Vois ce qu'il dit. Puis décide avec quoi tu es à l'aise.

Une dernière chose à noter : les outils qui respectent le plus ta vie privée sont ceux qui ne te demandent pas de t'identifier. Les outils respectueux de la vie privée qui fonctionnent sans inscription ne peuvent pas corréler les données de ta session à un profil, parce qu'il n'y a pas de profil à corréler. Si tu veux avoir une idée du nombre d'outils capables existant sans login, [nologin.tools](/tool/nologin-tools) maintient une liste curatée — des éditeurs d'image au partage de fichiers en passant par les utilitaires pour développeurs, tout utilisable sans créer de compte. C'est une façon pratique de réduire ton empreinte en ligne tout en restant productif.
