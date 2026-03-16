---
title: "Hör auf, Git-Befehle auswendig zu lernen: Lerne Git-Branching visuell"
description: "Learn Git Branching verwandelt eines der verwirrendsten Werkzeuge der Programmierung in ein interaktives visuelles Puzzlespiel, das du direkt im Browser spielen kannst."
publishedAt: 2026-03-16
author: "nologin.tools"
tags: ["tools", "review", "education", "development"]
featured: false
heroImageQuery: "git branching visualization colorful diagram"
locale: de
originalSlug: learngitbranching-js-org
sourceHash: 6064e4a6ec2e2740
---

![Hero image](/blog/images/learngitbranching-js-org/hero.jpg)

Die meisten Entwickler haben ein Geständnis: Sie benutzen Git seit Jahren, aber Branches bringen sie immer noch zum Verzweifeln. Du tippst `git rebase`, irgendetwas bricht, du machst `git reset --hard`, und schwörst, nie wieder Rebase anzufassen. Kommt dir das bekannt vor?

Die Sache ist: Gits zugrunde liegendes Modell ist eigentlich elegant. Die Verwirrung entsteht dadurch, dass man es rückwärts lernt — man memoriert die Befehlssyntax, bevor man versteht, was diese Befehle tatsächlich mit dem Repository machen. **Learn Git Branching** (https://learngitbranching.js.org) dreht diesen Ansatz komplett um, und du kannst in unter dreißig Sekunden loslegen — ohne Account-Erstellung.

## Was Learn Git Branching wirklich ist

Du öffnest die Seite und landest direkt in einer interaktiven Sandbox. Links ein Terminal, in dem du echte Git-Befehle eingibst. Rechts ein animierter Graph deines Repositorys — Knoten für Commits, Linien für Branches, Pfeile die zeigen, wohin HEAD zeigt. Tippe `git commit` und beobachte, wie ein neuer Knoten erscheint. Tippe `git branch feature` und sieh, wie ein neues Label abzweigt. Tippe `git checkout feature && git commit` zweimal und schau, wie die Divergenz sich in Echtzeit bildet.

Das ist der entscheidende Gedanke: Gits mentales Modell ist ein gerichteter azyklischer Graph (DAG), und zu sehen, wie dieser Graph sich sofort aktualisiert, während du Befehle tippst, macht die Abstraktionen auf eine Weise konkret, die kein noch so viel Lesen erreichen kann.

Das Tool organisiert den Inhalt in zwei Hauptsequenzen: **Main** (mit Commits, Branching, Merging, Rebasing, Navigation mit HEAD, relativen Refs und dem Rückgängigmachen von Änderungen) und **Remote** (mit dem vollständigen Push/Pull/Fetch-Workflow mit Remote-Repositories). Jede Sequenz enthält mehrere Level, und jedes Level stellt eine konkrete Aufgabe: „Bring das Repository in diesen Zielzustand."

Kein Login. Keine Synchronisierung des Fortschritts zu einem Server. Deine abgeschlossenen Level werden im localStorage gespeichert und bleiben damit über Browser-Sitzungen auf demselben Rechner erhalten. Wenn du etwas Riskantes ausprobieren möchtest, gibt es einen `reset`-Befehl, der die Sandbox leert und das aktuelle Level von vorne startet.

## Warum die Visualisierung von Git wichtig ist

Vergleich diese beiden Erklärungen von `git rebase main`:

**Texterklärung**: Rebase spielt die Commits des aktuellen Branches auf die Spitze des Zielbranches wieder ab, was zu einem linearen Verlauf führt.

**Visuelle Erklärung**: Schau zu, wie die Commits deines Feature-Branches sich ablösen, mit neuen SHA-Hashes neu geschrieben werden und sich als saubere Linie auf main wieder anfügen — alles animiert in etwa einer halben Sekunde.

Beide sagen dasselbe. Nur eine davon landet wirklich.

Das ist dasselbe Prinzip hinter Tools wie [VisuAlgo](/tool/visualgo-net), das Sortier- und Graphalgorithmen durch Animation visualisiert, oder [Python Tutor](/tool/pythontutor-com), das die Python-Codeausführung Zeile für Zeile mit Anzeige des Variablenzustands durchläuft. Das Muster hält: Bei abstrakten Berechnungsprozessen ist Visualisierung keine Unterrichtshilfe — sie ist die Erklärung.

Git eignet sich besonders für diese Behandlung, weil sein Datenmodell wirklich visuell ist. Jedes Repository ist buchstäblich ein Graph. Die Textbefehle sind nur eine textuelle Schnittstelle zu diesem Graphen. Wenn du ihn dargestellt siehst, hören die Befehle auf, Beschwörungsformeln zu sein, und werden zu Graphmanipulationen.

## Die Level: Ein Rundgang

Die Einführungssequenz beginnt behutsam. Level 1 bittet dich, einfach zweimal `git commit` zu tippen. Die Anleitung erklärt, was ein Commit ist. Der Graph zeigt dir eine lineare Kette aus drei Knoten. Das war's.

In Level 5 machst du bereits Cherry-Picking von Commits und bewegst Branches mit `git branch -f`. Wenn du den Remote-Abschnitt erreichst, verwaltest du divergierende Historien zwischen lokal und origin und löst die Situationen, die Entwickler in der Produktion wirklich zum Straucheln bringen.

Ein paar herausragende Übungen:

- **„Detach yo' HEAD"** — lehrt relative Refs wie `HEAD~3`, indem es dich zwingt, Commits nach Position statt nach Branch-Namen auszuchecken. Allein das erklärt Dutzende mysteriöser `detached HEAD state`-Warnungen.
- **„Locally stacked commits"** — präsentiert ein realistisches Szenario, in dem du Debug-Commits mit einem echten Feature vermischt hast und das Feature ohne den Debug-Lärm deployen musst. Die Lösung beinhaltet entweder `git rebase -i` oder `git cherry-pick`, und das Level akzeptiert beide Ansätze.
- **„Push Main!"** — der Abschluss der Remote-Sektion, der die Situation simuliert, in der dein Push abgelehnt wird, weil origin vorgerückt ist. Du musst die Remote-Änderungen integrieren, bevor du pushen kannst, und dabei zwischen Merge- und Rebase-Strategien wählen.

> „The git parable [at learngitbranching.js.org] is one of the most useful things I've ever read for actually understanding git rather than just using it." — wiederkehrendes Sentiment in Hacker-News-Diskussionen über Git-Lernressourcen

## Im Vergleich zu anderen Git-Lernansätzen

| Ansatz | Startzeit | Interaktivität | Deckt Remotes ab |
|--------|-----------|----------------|------------------|
| `man git-rebase` | Sofort | Keine | Ja |
| Git-Buch (git-scm.com) | Minuten | Keine | Ja |
| GitHubs interaktives Tutorial | Minuten | Partiell | Partiell |
| Learn Git Branching | Sofort | Vollständig | Ja |
| Videokurse | Minuten | Keine | Ja |

Die Manpages und die offizielle Dokumentation sind maßgeblich, setzen aber voraus, dass du das mentale Modell bereits verstehst. Videotutorials erfordern passives Zuschauen. GitHubs [Try Git](https://try.github.io) wurde mehrfach eingestellt und weitergeleitet. Learn Git Branching wird seit 2013 kontinuierlich gepflegt und bleibt die Standardempfehlung, wenn Entwickler fragen: „Wie lerne ich Git-Branching eigentlich richtig?"

Eine ehrliche Einschränkung: Learn Git Branching simuliert ein Repository; es arbeitet nicht mit echten Dateien. Du wirst keine echten Merge-Konflikte in Code auflösen üben. Dafür brauchst du ein echtes Repository und etwas wie [Compiler Explorer](/tool/godbolt-org) oder eine lokale Entwicklungsumgebung. Learn Git Branching beantwortet die Frage „Was passiert gerade mit meiner Repository-Struktur?"; das Durcharbeiten echter Konfliktlösung ist eine separate Fähigkeit.

## Open Source und aktiv gepflegt

Das Projekt lebt auf [github.com/pcottle/learnGitBranching](https://github.com/pcottle/learnGitBranching) mit über 29.000 GitHub-Stars und Beiträgen über mehr als ein Jahrzehnt. Die Codebasis ist JavaScript, und die Visualisierung läuft vollständig clientseitig — kein Server involviert, keine Telemetrie, die deine Befehle sammelt.

Das ist für datenschutzbewusste Lernende wichtig: Du kannst den Netzwerk-Tab des Browsers öffnen und beobachten, wie keine einzige Anfrage ausgelöst wird, während du Befehle tippst und Level abschließt. Alles läuft in der JavaScript-Engine deines Browsers. Die Seite lädt, dann arbeitest du nur mit lokalem Zustand.

Übersetzungen werden von der Community beigesteuert; die Seite unterstützt über ein Dutzend Sprachen über URL-Parameter (z.B. `?locale=zh_CN`). Das macht sie für Lernende weltweit zugänglich, ohne Fragmentierung — dieselbe Codebasis dient allen, und die Sandbox funktioniert unabhängig von der Spracheinstellung identisch.

## Wer am meisten profitiert

**Junior-Entwickler** begegnen Git früh und kommen oft mit einem kleinen Satz von Befehlen aus: add, commit, push, pull. Das funktioniert, bis es nicht mehr funktioniert — bis ein Rebase schiefgeht, oder bis sie einen Fix aus einem Release-Branch cherry-picken müssen, oder bis sie gebeten werden, eine unordentliche Commit-Historie vor einem PR-Review aufzuräumen. Learn Git Branching ist der schnellste Weg von „Ich benutze Git" zu „Ich verstehe Git".

**Entwickler, die das Team wechseln** und plötzlich mit einer anderen Branching-Strategie umgehen müssen (Gitflow vs. trunk-based vs. GitHub flow), können die Rebase- und Merge-Abschnitte nutzen, um schnell zu verinnerlichen, was der Workflow ihres neuen Teams tatsächlich mit der Commit-Historie macht.

**Erfahrene Entwickler**, die `git rebase -i` aus Aberglauben gemieden haben, werden das interaktive Rebase-Level als wirklich erhellend empfinden. Die visuelle Feedbackschleife nimmt die Angst vor „Ich weiß nicht, was passieren wird."

**Lehrende**, die Versionskontrolle in Bootcamps oder Kursen unterrichten, nutzen Learn Git Branching seit Jahren als Übung im Unterricht — das visuelle Feedback erleichtert Diskussionen, und die fehlende Anmeldepflicht bedeutet, dass während eines Workshops keine Zeit mit der Kontoerstellung verloren geht.

## Jetzt sofort loslegen

Geh auf [learngitbranching.js.org](https://learngitbranching.js.org). Klick auf „Start". Tippe `git commit`. Das ist der gesamte Onboarding-Prozess.

Wenn du zu einem bestimmten Konzept springen möchtest, nutze den Level-Auswahldialog (klick auf den Level-Namen oben auf der Seite). Wenn du mit lokalem Branching bereits vertraut bist und dich auf den Remote-Workflow konzentrieren willst — den Teil, der die meisten Teams stolpern lässt — spring direkt zur Remote-Sektion.

Für Teams, die Git-Wissen standardisieren wollen, ohne bestimmte Kurse oder kostenpflichtige Tools vorzuschreiben, ist Learn Git Branching eine natürliche Referenz: kostenlos, browserbasiert, kein Account erforderlich, und es deckt genau die Konzepte ab, die im Alltag die meiste Verwirrung stiften. Teile einen Link zu einem bestimmten Level, um in einer Code-Review-Diskussion einen gezielten Punkt zu machen.

Das Tool bringt Entwicklern seit 2013 bei, wie Git wirklich funktioniert. In einem Bereich, in dem die meisten Lernwerkzeuge kommen und gehen, ist diese Art von Langlebigkeit ein Signal, das es wert ist, beachtet zu werden.
