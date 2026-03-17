---
title: "La règle des 4% n'est qu'un point de départ. cFIREsim teste si ton plan survit vraiment."
description: "cFIREsim fait tourner ton portefeuille de retraite sur 150 ans d'historique boursier réel pour montrer ce qui compte vraiment pour l'indépendance financière — sans inscription requise."
publishedAt: 2026-03-17
author: "nologin.tools"
tags: ["tools", "review", "finance", "retirement"]
featured: false
heroImageQuery: "retirement financial planning calculator investment chart"
locale: fr
originalSlug: cfiresim-com
sourceHash: bd8fc70bc57933a3
---

![Hero image](/blog/images/cfiresim-com/hero.jpg)

La « règle des 4% » est l'un des conseils de retraite les plus répétés sur internet. Retire 4% de ton portefeuille la première année, ajuste chaque année à l'inflation, et ton argent devrait tenir 30 ans. Simple. Net. Facile à retenir.

Pas nécessairement vrai pour ta situation, cela dit.

La règle vient de [l'étude Trinity](https://en.wikipedia.org/wiki/Trinity_study), un article de 1998 qui analysait les rendements historiques des actions et obligations sur des périodes de 30 ans. C'est le premier problème : 30 ans. Si tu prévois de prendre ta retraite à 45 ans, tu as besoin de 45 à 50 ans de piste, et les calculs changent considérablement. L'étude utilisait une répartition actions/obligations spécifique. Elle ne prenait pas en compte la Sécurité Sociale, les revenus à temps partiel, ni l'évolution bien documentée des habitudes de dépenses avec l'âge.

Ce que la règle des 4% t'offre, c'est une base utile tirée d'une analyse historique précise et simplifiée. Ce dont la plupart des gens ont réellement besoin, c'est de savoir si leur situation concrète tient la route — la taille réelle de leur portefeuille, leurs dépenses réelles anticipées, leur horizon de retraite réel.

C'est exactement ce que fait **cFIREsim**.

## Ce que cFIREsim fait, et que les calculateurs simples ne peuvent pas faire

cFIREsim (le « c » signifie « collaboratif ») est un simulateur de portefeuille de retraite fonctionnant dans le navigateur, développé de façon itérative avec les contributions de la communauté FIRE — Financial Independence, Retire Early (Indépendance Financière, Retraite Anticipée). Il prend tes données réelles et les exécute contre chaque séquence historique du marché dans [le jeu de données long terme de Robert Shiller](http://www.econ.yale.edu/~shiller/data.htm), qui couvre les rendements des actions américaines, des obligations et l'inflation IPC depuis 1871.

Le résultat n'est pas un chiffre rassurant unique. C'est un **taux de réussite** : le pourcentage des périodes historiques de 30 ans (ou 40, ou 50) où ton portefeuille a survécu sans atteindre zéro. Tu peux aussi voir quelles périodes historiques précises ont échoué, et pourquoi.

Fixe un taux de retrait de 3,5% sur un portefeuille 60/40 sur 40 ans, et cFIREsim pourrait t'afficher un taux de réussite historique de 96%. Monte à 5% et tu pourrais voir 73% — ce qui signifie qu'environ un scénario historique sur quatre mène à l'épuisement des fonds. La différence entre savoir « la règle des 4% dit que je suis tranquille » et savoir « mon plan concret échoue dans 27% des scénarios historiques » est la différence entre une heuristique et une vraie analyse.

Soumettre ton plan à 150 ans d'histoire le teste contre des périodes qui se sont réellement produites :

- La Grande Dépression (1929–1933), avec des pertes sur actions dépassant 80%
- Les années 70 stagflationnistes, où l'inflation a érodé le pouvoir d'achat tandis que les rendements stagnaient
- La « décennie perdue » de 2000–2009, avec deux krachs majeurs en dix ans
- Des marchés haussiers prolongés où même les mauvaises stratégies de retrait ont réussi

Le risque de séquence des rendements — le danger qu'un krach en début de retraite puisse endommager définitivement un portefeuille qu'un krach ultérieur aurait laissé intact — devient concret quand on le voit dans des scénarios historiques réels.

## Sans compte, sans obstacle

cFIREsim est totalement gratuit et ne nécessite aucune inscription. Visite [cfiresim.com](https://cfiresim.com), entre tes chiffres et lance la simulation. L'outil complet — analyse historique, mode Monte Carlo, toutes les options de configuration — fonctionne sans s'inscrire.

C'est particulièrement important pour la planification de la retraite. Les données de ta simulation sont financièrement sensibles : valeur du portefeuille, dépenses annuelles prévues, âge de la retraite. Les outils qui exigent un compte associent ces informations à ton identité et les stockent sur leurs serveurs. cFIREsim traite tout dans ton navigateur. Tes données financières ne quittent pas ton appareil.

Il existe une fonction de compte optionnelle pour sauvegarder des scénarios de simulation entre les sessions, mais le simulateur principal fonctionne entièrement sans. Cela place cFIREsim dans la catégorie des outils respectueux de la vie privée sans connexion — la même catégorie que [FICalc](/tool/ficalc-app) pour les calculs FIRE et [The Measure of a Plan](/tool/themeasureofaplan-com) pour les modèles de planification financière.

## Une configuration qui colle vraiment à la réalité

La profondeur de configuration est ce qui distingue cFIREsim d'un simple calculateur d'intérêts composés. Les données de base sont la valeur du portefeuille, les dépenses annuelles et la durée de la retraite. Mais l'outil va plus loin.

**Stratégies de retrait.** La règle standard des 4% utilise le « dollar constant » — un montant fixe ajusté à l'inflation chaque année. Les vrais retraités dépensent rarement ainsi. cFIREsim supporte :

- **Dollar constant** — la règle classique ; dépense le même montant ajusté à l'inflation chaque année
- **Pourcentage constant** — dépense un pourcentage fixe de ton portefeuille restant ; les dépenses fluctuent avec la valeur du portefeuille
- **Retrait à Pourcentage Variable (VPW)** — dépense plus dans les bons marchés, moins dans les mauvais, selon ton horizon temporel
- **Garde-fous de Guyton-Klinger** — maintiens ton retrait cible sauf si le portefeuille franchit des seuils définis, puis réduis ou augmente en conséquence
- **Pourcentage du portefeuille restant** — divise le portefeuille par les années restantes chaque année

Passer du dollar constant à une stratégie variable améliore souvent spectaculairement les taux de réussite historiques. La raison : les dépenses en dollar constant maintiennent des retraits identiques pendant un krach, t'obligeant à vendre plus d'actions à des prix déprimés. Les stratégies adaptatives réduisent les dépenses quand le marché baisse, laissant le temps au portefeuille de se rétablir.

**Sources de revenus.** Sécurité Sociale, retraites, revenus locatifs, travail à temps partiel. Tu peux ajouter des flux de revenus qui démarrent à des années précises — par exemple, 24 000 $/an de revenus de Sécurité Sociale à partir de l'année 20 de retraite. Pour les retraités anticipés avec un écart avant les prestations gouvernementales, c'est une variable critique. Un portefeuille qui échoue sans Sécurité Sociale pourrait afficher plus de 95% de réussite une fois qu'on intègre les revenus démarrant à 70 ans.

**Ajustements des dépenses.** Les recherches sur les dépenses réelles des retraités montrent qu'elles tendent à diminuer dans les années ultérieures. Tu peux modéliser une réduction des dépenses après un certain âge — dépenses plus élevées dans les premières années actives, plus basses ensuite.

**Allocation d'actifs et trajectoires d'évolution.** Définis ta répartition actions/obligations/cash, et configure optionnellement une trajectoire qui fait évoluer progressivement l'allocation dans le temps.

## Monte Carlo vs. analyse historique

cFIREsim propose deux modes de simulation, et comprendre la différence est important.

| Mode | Base | Scénarios | Idéal pour |
|------|------|-----------|------------|
| Historique | Séquences réelles du marché depuis 1871 | ~100–130 périodes | Comprendre les vrais pires cas |
| Monte Carlo | Séquences aléatoires basées sur les statistiques historiques | 5 000+ scénarios | Explorer les risques extrêmes de faible probabilité |

Le mode historique est littéral : il teste ton plan contre chaque période chevauchante du jeu de données. Les scénarios sont réels. Les krachs et les hausses se sont vraiment produits.

Monte Carlo génère des milliers de séquences de rendements aléatoires en utilisant des statistiques dérivées des données historiques. Il peut faire émerger des risques qui ne se sont pas produits historiquement mais sont statistiquement plausibles — des baisses plus profondes ou plus longues, des patterns de corrélation différents entre actions et obligations.

Faire tourner les deux modes pour le même scénario et comparer les résultats te dit quelque chose d'utile : si Monte Carlo affiche un taux de réussite notablement inférieur à l'historique, ton plan est peut-être sensible à des séquences pires que tout ce qu'on a connu. S'ils sont proches, ton plan est robuste face à un éventail plus large de futurs possibles.

## Comparaison avec FICalc

[FICalc](/tool/ficalc-app) est un autre simulateur FIRE sans connexion qui mérite d'être mentionné directement, puisque les deux outils s'adressent à un public similaire. FICalc est plus épuré et plus rapide pour une vérification basique du taux de retrait — entre portefeuille, dépenses et années, obtiens un résultat visuel clair.

cFIREsim va plus en profondeur sur la configuration. La comparaison n'est pas une question de qualité ; c'est une question de ce à quoi tu veux répondre.

> Utilise FICalc pour tester rapidement un taux de retrait et voir une répartition historique claire succès/échec.
>
> Utilise cFIREsim quand tu as besoin de modéliser des phases de revenus de Sécurité Sociale, comparer des stratégies de retrait face à face, faire tourner Monte Carlo en parallèle de l'analyse historique, ou tenir compte d'un pattern de dépenses qui évolue dans le temps.

Pour la plupart des gens qui commencent à réfléchir à la simulation de retraite, FICalc est le bon premier outil. Une fois que tu veux pousser les hypothèses ou modéliser des structures de revenus plus complexes, cFIREsim a la profondeur de configuration qu'il te faut.

## Open source, validé par la communauté

cFIREsim est open source. Le code est publiquement disponible, ce qui signifie que tu peux vérifier exactement ce que fait le simulateur — quel jeu de données il utilise, comment il définit le « succès », quelles hypothèses sont intégrées dans chaque stratégie de retrait.

C'est particulièrement important pour les outils de planification de retraite. Quand un simulateur te dit que ton plan a un taux de réussite de 89%, ce chiffre n'est utile que si tu comprends ce qu'il signifie. Qu'est-ce qui compte comme succès ? Quelles données alimentent la simulation ? Un outil propriétaire te demande de faire confiance à son résultat. Un outil open source te permet de vérifier.

L'outil a été largement discuté dans les communautés FIRE pendant de nombreuses années — sur le r/financialindependence de Reddit, les forums Bogleheads et autres espaces similaires. Cet engagement communautaire soutenu a validé la méthodologie et mis en lumière des cas limites. L'ensemble de fonctionnalités reflète les besoins réels des utilisateurs au fil du temps.

## Pour commencer

Visite [cfiresim.com](https://cfiresim.com) et commence par une simulation minimale :

1. Règle **Portfolio** sur tes économies de retraite actuelles ou projetées
2. Règle **Spending** sur tes dépenses annuelles de retraite prévues en dollars d'aujourd'hui
3. Règle **Retirement Length** sur le nombre d'années que tu prévois d'être à la retraite
4. Clique sur **Run**

Le premier résultat te donne un taux de réussite de base et un graphique montrant quels points d'entrée historiques ont échoué. À partir de là, teste une variable à la fois : réduis les dépenses de 10% et observe l'évolution du taux de réussite ; ajoute 18 000 $/an de Sécurité Sociale à partir de l'année 15 ; passe du retrait en dollar constant au pourcentage variable.

Chaque changement te montre exactement à quel point ton résultat est sensible à cette hypothèse précise. Cette analyse de sensibilité est la vraie valeur — pas un pourcentage unique, mais une compréhension de quelles variables dans ton plan comptent vraiment.

Pour une vérification de tes chiffres avant de lancer des simulations de retraite, [Omni Calculator](/tool/omnicalculator-com) couvre la croissance composée, les taux d'épargne et les projections de portefeuille pendant tes années d'accumulation.

La planification de la retraite a longtemps nécessité des logiciels coûteux, un conseiller financier, ou la volonté de construire des feuilles de calcul sophistiquées from scratch. cFIREsim met une simulation véritablement rigoureuse dans un onglet de navigateur, gratuitement et sans inscription, s'appuyant sur 150 ans de données réelles du marché.

La vraie question n'est pas de savoir si ton plan semble confortable dans une feuille de calcul. C'est de savoir s'il survit aux années 70.
