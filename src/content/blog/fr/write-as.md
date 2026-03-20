---
title: "Write.as : publie sur le web sans donner ton e-mail à personne"
description: "Write.as te permet de publier n'importe quoi sur le web instantanément — sans compte, sans pistage, sans friction. Ouvre l'éditeur et commence à écrire."
publishedAt: 2026-03-20
author: "nologin.tools"
tags: ["tools", "review", "writing", "privacy"]
featured: false
locale: fr
originalSlug: write-as
sourceHash: e85653ed2eabdd37
heroImageQuery: "minimal writing desk notebook pen"
---

![Hero image](/blog/images/write-as/hero.jpg)

La plupart des plateformes de publication démarrent toutes de la même façon : un champ e-mail, un champ mot de passe, et une case à cocher pour des conditions d'utilisation que tu ne liras jamais. Tu n'as pas encore écrit une seule ligne, et quelqu'un construit déjà un profil sur toi.

Write.as court-circuite tout ça. Tu ouvres le site, tu écris, tu appuies sur Publier. Tu récupères une URL permanente. C'est tout.

## Ce que fait vraiment Write.as

Write.as est une plateforme d'écriture et de publication minimaliste, bâtie sur une seule idée : ce que tu écris compte plus que ton identité. Quand tu arrives sur le site, tu atterris directement dans l'éditeur — une zone de texte plein écran, propre, sans barre latérale, sans pop-up te demandant de t'abonner à une newsletter.

Écris ce que tu veux. Clique sur « Publier ». La plateforme génère une URL unique du type `write.as/abc123xyz` et le billet est en ligne immédiatement, accessible à quiconque possède le lien. Pas de création de compte. Pas de vérification d'e-mail. Tu écris, c'est tout.

En coulisses, Write.as stocke un « token propriétaire » localement dans ton navigateur pour que tu puisses modifier ou supprimer le billet plus tard. Si tu veux revendiquer la propriété permanente sur plusieurs appareils, tu peux créer un compte — mais ce n'est jamais nécessaire pour l'usage de base.

L'interface elle-même est presque agressivement simple. Markdown est supporté. L'éditeur affiche du texte propre et lisible. Pas de barre d'outils de traitement de texte, pas de ruban de mise en forme, pas de rangée de réactions emoji. Pour ceux qui trouvent la plupart des éditeurs web visuellement épuisants, cette sobriété est le produit.

## Une architecture pensée pour la vie privée

La plupart des plateformes de contenu sont conçues pour en savoir le plus possible sur toi : quels billets tu lis, combien de temps tu passes sur chacun, sur quoi tu cliques ensuite. Ces données, c'est le modèle économique.

Write.as a été conçu avec le postulat inverse. La plateforme collecte un minimum de données, ne fait aucun pistage publicitaire et ne réclame aucune information personnelle pour publier. Ce n'est pas un argument marketing collé sur une plateforme publicitaire ordinaire — c'est intégré à l'architecture technique depuis le départ.

Le moteur open source derrière Write.as s'appelle **WriteFreely** et est disponible sur GitHub à [github.com/writefreely/writefreely](https://github.com/writefreely/writefreely). Concrètement, cela signifie :

- N'importe qui peut inspecter exactement comment le logiciel fonctionne
- Les organisations et les particuliers peuvent héberger leur propre instance
- Les promesses de confidentialité de la plateforme ne sont pas seulement des politiques — ce sont du code vérifiable

L'auto-hébergement de WriteFreely est de plus en plus populaire auprès des collectifs journalistiques, des groupes académiques et des communautés soucieuses de leur vie privée qui veulent une publication fédérée et décentralisée, sans dépendre des serveurs d'une seule entreprise.

> « Je veux un outil d'écriture qui ne me demande rien. » — Un sentiment qui revient souvent dans les communautés qui gravitent autour de Write.as

Cette phrase résume pourquoi cet outil a trouvé un public que les plateformes de blogging génériques n'ont jamais réussi à servir correctement.

## Comparaison avec d'autres outils d'écriture sans inscription

Notre répertoire contient plusieurs outils d'écriture utilisables sans compte, mais chacun répond à des besoins différents. Voici comment Write.as se situe parmi eux :

| Outil | Usage principal | Connexion requise ? | Publication sur le web ? |
|-------|----------------|--------------------|-----------------------|
| [ZenPen](/tool/zenpen-io) | Rédaction sans distraction | Non | Non — local uniquement |
| [Dillinger](/tool/dillinger-io) | Édition Markdown | Non | Export uniquement |
| [StackEdit](/tool/stackedit-io) | Markdown avec synchronisation | Optionnel | Pas d'URL directe |
| [Hemingway Editor](/tool/hemingwayapp-com) | Vérification de style et lisibilité | Non | Non |
| Write.as | Publication anonyme | Non | Oui — URL immédiate |

La distinction clé : tous les autres outils d'écriture sans inscription listés ci-dessus sont essentiellement des environnements de rédaction locale. Write.as est le seul où l'aboutissement naturel de ton travail est une URL publique sur le web ouvert, accessible à tous, créée sans aucun compte.

Cela le rend utile pour un ensemble de tâches spécifiques que les autres outils ne gèrent tout simplement pas :

- Partager un brouillon avec un collaborateur sans passer par Google Docs (qui requiert une connexion pour modifier)
- Publier une déclaration publique ou une lettre ouverte sans rattacher ton nom à un compte de plateforme
- Créer rapidement un document de référence partageable pour une réunion ou une conversation
- Écrire quelque chose que tu veux partager une seule fois, puis oublier

## Du freemium sans dark patterns

Write.as propose un niveau payant. Il ajoute des fonctionnalités comme les domaines personnalisés, plusieurs blogs nommés, les comptes d'équipe et les statistiques. Ce sont des options genuinement utiles pour ceux qui veulent construire une présence en ligne durable.

Mais ce niveau payant est clairement un upsell vers ceux qui ont déjà tiré de la valeur du niveau gratuit — pas une restriction conçue pour faire paraître le gratuit cassé. La boucle de base (ouvrir l'éditeur → écrire → publier → obtenir une URL) est entièrement gratuite et pleinement fonctionnelle sans aucun compte.

C'est une distinction importante. Beaucoup d'outils freemium conçoivent leur niveau gratuit pour être frustrant par nature, en utilisant les limitations pour te pousser vers un abonnement. Le niveau gratuit de Write.as fait exactement ce qu'il annonce. Si tu ne crées jamais de compte, tu disposes quand même d'un outil de publication entièrement fonctionnel.

Compare ça à l'expérience de la plupart des assistants d'écriture IA : des outils comme [QuillBot](/tool/quillbot-com) offrent un niveau gratuit fonctionnel mais te poussent constamment à passer à la version supérieure. Write.as n'interrompt pas l'expérience d'écriture avec des incitations à l'abonnement.

## Qui l'utilise vraiment

Write.as a trouvé son public dans plusieurs communautés qui ne se croisent guère dans d'autres espaces :

**Les défenseurs de la vie privée** l'utilisent pour publier sans construire d'identité numérique. La combinaison — aucun compte requis et collecte minimale de données — en fait l'une des rares plateformes qui correspondent réellement aux valeurs affichées par la communauté vie privée.

**Les journalistes et les lanceurs d'alerte** ont utilisé des instances WriteFreely pour publier des documents et des déclarations quand l'anonymat est crucial. L'option d'auto-hébergement signifie que la publication ne dépend pas de la société Write.as.

**Les développeurs** s'en servent pour des articles techniques rapides, des documents style RFC ou des annonces internes qui nécessitent un lien partageable sans monter un CMS complet.

**Les écrivains en exploration** y trouvent un espace sans pression. Sans compte, sans abonnés, sans statistiques, sans commentaires — la boucle de validation sociale disparaît entièrement. C'est libérateur ou terrifiant, selon ton rapport au public.

**Les communautés open source** gèrent des instances WriteFreely auto-hébergées pour des blogs communautaires et des journaux collectifs, avec un suivi fédéré rendu possible par le support ActivityPub intégré à la plateforme.

## ActivityPub et le web fédéré

Une fonctionnalité mérite d'être soulignée : Write.as supporte [ActivityPub](https://www.w3.org/TR/activitypub/), le standard ouvert qui fait fonctionner Mastodon, Pixelfed et d'autres plateformes sociales décentralisées. Autrement dit, si tu crées un compte sur Write.as (ou sur n'importe quelle instance WriteFreely auto-hébergée), ton blog devient suivable depuis Mastodon et d'autres plateformes fédérées.

Tes lecteurs peuvent suivre ton blog Write.as depuis leur compte Mastodon. Les nouveaux billets apparaissent dans leur timeline fédérée, dans l'ordre chronologique. Pas de flux algorithmique. Pas d'optimisation d'engagement. Juste des articles qui arrivent dans l'ordre, aux personnes qui ont choisi de te suivre.

Ce design fédéré reflète une philosophie plus large : ton contenu doit exister sur le web ouvert, pas enfermé dans le jardin clos d'une plateforme.

## Comment commencer

Aucun guide d'installation n'est nécessaire. Va sur [write.as](https://write.as) et l'éditeur est là. Commence à écrire. Quand tu es prêt, clique sur Publier. Garde l'URL de ton billet et le token propriétaire quelque part de sûr si tu veux pouvoir le modifier plus tard.

Si tu te retrouves à l'utiliser régulièrement, créer un compte gratuit vaut la peine — il te permet de gérer tous tes billets depuis un seul endroit et te donne une URL de blog permanente. Mais tu peux publier des dizaines de billets avant d'avoir à prendre cette décision.

Pour quiconque souhaite construire sa propre infrastructure de publication, le dépôt WriteFreely inclut le support Docker et une documentation complète pour l'auto-hébergement. Le logiciel est activement maintenu et utilisé par des communautés dans le monde entier.

Le web a accumulé beaucoup de poids. Processus d'inscription, pixels de pistage, bannières de consentement aux cookies, fils algorithmiques. Write.as est un rappel que publier sur le web a toujours été plus simple que ce que l'écosystème qui l'entoure laisse entendre — et que ça peut encore l'être, sans sacrifier quoi que ce soit d'important.
