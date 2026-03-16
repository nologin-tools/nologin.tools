---
title: "Arrête de mémoriser les commandes Git : apprends les branches Git visuellement"
description: "Learn Git Branching transforme l'un des outils les plus déroutants de la programmation en un jeu de puzzles visuels et interactifs que tu peux jouer directement dans ton navigateur."
publishedAt: 2026-03-16
author: "nologin.tools"
tags: ["tools", "review", "education", "development"]
featured: false
heroImageQuery: "git branching visualization colorful diagram"
locale: fr
originalSlug: learngitbranching-js-org
sourceHash: 6064e4a6ec2e2740
---

![Hero image](/blog/images/learngitbranching-js-org/hero.jpg)

La plupart des développeurs ont un aveu à faire : ils utilisent Git depuis des années, mais les branches leur font encore tourner la tête. Tu tapes `git rebase`, quelque chose casse, tu fais `git reset --hard`, et tu jures de ne plus jamais toucher à rebase. Ça te parle ?

Le truc, c'est que le modèle sous-jacent de Git est en réalité élégant. La confusion vient du fait qu'on l'apprend à l'envers : on mémorise la syntaxe des commandes avant de comprendre ce que ces commandes font réellement à ton dépôt. **Learn Git Branching** (https://learngitbranching.js.org) renverse complètement cette approche, et tu peux commencer à l'utiliser en moins de trente secondes sans créer de compte.

## Ce qu'est vraiment Learn Git Branching

Ouvre le site et tu te retrouves directement dans un bac à sable interactif. À gauche, un terminal où tu tapes de vraies commandes Git. À droite, un graphe animé de ton dépôt — des nœuds pour les commits, des lignes pour les branches, des flèches indiquant où pointe HEAD. Tape `git commit` et regarde un nouveau nœud apparaître. Tape `git branch feature` et vois une nouvelle étiquette se ramifier. Tape `git checkout feature && git commit` deux fois et observe la divergence se former en temps réel.

C'est l'insight clé : le modèle mental de Git est un graphe acyclique dirigé (DAG), et voir ce graphe se mettre à jour instantanément au fur et à mesure que tu tapes des commandes rend les abstractions concrètes d'une façon qu'aucune quantité de lecture ne peut égaler.

L'outil organise le contenu en deux séquences principales : **Main** (couvrant les commits, le branchement, le merge, le rebase, les déplacements de HEAD, les refs relatives et l'annulation de changements) et **Remote** (couvrant le workflow complet push/pull/fetch avec les dépôts distants). Chaque séquence contient plusieurs niveaux, et chaque niveau présente un défi précis — « fais en sorte que le dépôt ressemble à cet état cible ».

Pas de connexion. Pas de synchronisation de progression vers un serveur. Tes avancements sont sauvegardés dans le localStorage, donc ils persistent entre les sessions du navigateur sur la même machine. Si tu veux essayer quelque chose de risqué, il existe une commande `reset` pour vider le bac à sable et recommencer le niveau en cours.

## Pourquoi la visualisation de Git est importante

Compare ces deux explications de `git rebase main` :

**Explication textuelle** : Rebase rejoue les commits de la branche courante sur la pointe de la branche cible, aboutissant à un historique linéaire.

**Explication visuelle** : Regarde les commits de ta branche feature se détacher, être réécrits avec de nouveaux hash SHA, et se rattacher comme une ligne propre au sommet de main — le tout animé en environ une demi-seconde.

Les deux disent la même chose. Seule l'une des deux accroche vraiment.

C'est le même principe derrière des outils comme [VisuAlgo](/tool/visualgo-net), qui visualise les algorithmes de tri et de graphes par animation, ou [Python Tutor](/tool/pythontutor-com), qui parcourt l'exécution du code Python ligne par ligne en affichant l'état des variables. Le schéma se confirme : pour les processus computationnels abstraits, la visualisation n'est pas une aide pédagogique — c'est l'explication elle-même.

Git se prête particulièrement bien à ce traitement parce que son modèle de données est genuinement visuel. Chaque dépôt est littéralement un graphe. Les commandes textuelles ne sont qu'une interface textuelle sur ce graphe. Quand tu le vois affiché, les commandes cessent d'être des incantations pour devenir des manipulations de graphe.

## Les niveaux : une visite guidée

La séquence d'introduction commence en douceur. Le niveau 1 te demande simplement de taper `git commit` deux fois. Les instructions expliquent ce qu'est un commit. Le graphe te montre une chaîne linéaire de trois nœuds. C'est tout.

Au niveau 5, tu fais déjà du cherry-pick de commits et tu déplaces des branches avec `git branch -f`. Quand tu atteins la section Remote, tu gères des historiques divergents entre local et origin, en résolvant les situations qui cassent réellement les développeurs en production.

Quelques exercices remarquables :

- **« Detach yo' HEAD »** — enseigne les refs relatives comme `HEAD~3` en t'obligeant à faire un checkout de commits par position plutôt que par nom de branche. Cela seul explique des dizaines de mystérieux avertissements `detached HEAD state`.
- **« Locally stacked commits »** — présente un scénario réaliste où tu as mélangé des commits de débogage avec une vraie fonctionnalité, et tu dois livrer la fonctionnalité sans le bruit de débogage. La solution implique soit `git rebase -i`, soit `git cherry-pick`, et le niveau accepte les deux.
- **« Push Main! »** — le niveau final de la section Remote, simulant la situation où ton push est rejeté parce qu'origin a avancé. Tu dois intégrer les changements distants avant de pouvoir pousser, en choisissant entre les stratégies de merge et de rebase.

> « The git parable [at learngitbranching.js.org] is one of the most useful things I've ever read for actually understanding git rather than just using it. » — sentiment récurrent dans les discussions Hacker News sur les ressources pour apprendre Git

## Comment ça se compare aux autres approches pour apprendre Git

| Approche | Temps pour démarrer | Interactivité | Couvre les remotes |
|----------|---------------------|---------------|--------------------|
| `man git-rebase` | Instantané | Aucune | Oui |
| Livre Git (git-scm.com) | Minutes | Aucune | Oui |
| Tutoriel interactif GitHub | Minutes | Partielle | Partielle |
| Learn Git Branching | Instantané | Complète | Oui |
| Cours vidéo | Minutes | Aucune | Oui |

Les pages de manuel et la documentation officielle font autorité, mais supposent que tu comprends déjà le modèle mental. Les tutoriels vidéo exigent une écoute passive. Le [Try Git](https://try.github.io) de GitHub a été déprécié plusieurs fois et redirigé ailleurs. Learn Git Branching est maintenu en continu depuis 2013 et reste la recommandation par défaut quand les développeurs demandent « comment est-ce que j'apprends vraiment les branches Git ? ».

Une limitation honnête : Learn Git Branching simule un dépôt ; il ne fonctionne pas avec de vrais fichiers. Tu ne pratiqueras pas la résolution de vrais conflits de merge dans du code. Pour ça, tu as besoin d'un vrai dépôt et de quelque chose comme [Compiler Explorer](/tool/godbolt-org) ou un environnement de développement local. Learn Git Branching répond à la question « qu'est-ce qui se passe dans la structure de mon dépôt ? » ; travailler sur la résolution réelle de conflits est une compétence à part.

## Open source et activement maintenu

Le projet se trouve sur [github.com/pcottle/learnGitBranching](https://github.com/pcottle/learnGitBranching) avec plus de 29 000 étoiles GitHub et des contributions sur plus d'une décennie. Le code est en JavaScript, et la visualisation tourne entièrement côté client — aucun serveur impliqué, aucune télémétrie pour collecter tes commandes.

C'est important pour les apprenants soucieux de leur vie privée : tu peux ouvrir l'onglet réseau du navigateur et constater qu'aucune requête ne part pendant que tu tapes des commandes et progresses dans les niveaux. Tout s'exécute dans le moteur JavaScript de ton navigateur. Le site se charge, puis tu travailles uniquement avec de l'état local.

Les traductions sont des contributions de la communauté ; le site supporte plus d'une douzaine de langues via des paramètres d'URL (par exemple, `?locale=zh_CN`). Cela le rend accessible aux apprenants du monde entier sans fragmentation — le même code sert tout le monde, et le bac à sable fonctionne de façon identique quelle que soit la langue configurée.

## Qui en bénéficie le plus

**Les développeurs junior** rencontrent Git tôt et s'en sortent souvent avec un petit ensemble de commandes : add, commit, push, pull. Ça marche jusqu'à ce que ça ne marche plus — jusqu'à ce qu'un rebase parte en vrille, ou qu'ils aient besoin de cherry-picker un fix depuis une branche de release, ou qu'on leur demande de nettoyer un historique de commits brouillon avant une revue de PR. Learn Git Branching est le chemin le plus rapide de « j'utilise Git » à « je comprends Git ».

**Les développeurs qui changent d'équipe** et qui doivent soudainement gérer une stratégie de branchement différente (Gitflow vs. trunk-based vs. GitHub flow) peuvent utiliser les sections rebase et merge pour intérioriser rapidement ce que le workflow de leur nouvelle équipe fait réellement à l'historique des commits.

**Les développeurs expérimentés** qui ont évité `git rebase -i` par superstition trouveront le niveau de rebase interactif genuinement éclairant. La boucle de feedback visuel supprime l'anxiété du « je ne sais pas ce qui va se passer ».

**Les formateurs** qui enseignent le contrôle de version en bootcamps ou dans des cours utilisent Learn Git Branching comme exercice en classe depuis des années — le feedback visuel facilite les discussions, et l'absence d'inscription signifie qu'aucun temps n'est perdu à créer des comptes pendant un atelier.

## Pour commencer maintenant

Va sur [learngitbranching.js.org](https://learngitbranching.js.org). Clique sur « Start ». Tape `git commit`. C'est tout le processus d'embarquement.

Si tu veux sauter directement à un concept précis, utilise le dialogue de sélection de niveau (clique sur le nom du niveau en haut de la page). Si tu es déjà à l'aise avec le branchement local et que tu veux te concentrer sur le workflow distant — la partie qui fait trébucher la plupart des équipes — saute directement à la section Remote.

Pour les équipes qui veulent standardiser leurs connaissances Git sans imposer des formations spécifiques ni des outils payants, Learn Git Branching est une référence naturelle : c'est gratuit, ça fonctionne dans le navigateur, ça ne nécessite pas de compte et ça couvre exactement les concepts qui causent le plus de confusion au quotidien. Partage un lien vers un niveau spécifique pour appuyer un point précis lors d'une discussion de revue de code.

L'outil enseigne aux développeurs comment Git fonctionne vraiment depuis 2013. Dans un domaine où la plupart des outils d'apprentissage vont et viennent, ce genre de longévité est un signal qui mérite attention.
