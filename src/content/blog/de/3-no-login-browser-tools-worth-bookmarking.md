---
title: "3 No-Login-Browser-Tools, die einen Lesezeichen verdienen"
description: "ExplainShell erklärt kryptische Shell-Befehle, PairDrop überträgt Dateien per Peer-to-Peer und Markmap verwandelt Notizen in Mindmaps. Kein Account, keine Anmeldung."
publishedAt: 2026-03-25
author: "nologin.tools"
tags: ["tools", "review", "browser", "roundup"]
featured: false
heroImageQuery: "browser productivity tools discovery"
locale: de
originalSlug: 3-no-login-browser-tools-worth-bookmarking
sourceHash: 237d50ead8218112
---

![Hero image](/blog/images/3-no-login-browser-tools-worth-bookmarking/hero.jpg)

Die nützlichsten Tools machen keine Werbung für sich selbst. Sie tauchen als Link in einer Stack-Overflow-Antwort auf, werden beiläufig in einem Thread erwähnt oder kommen als Empfehlung von einem Kollegen, der einfach davon ausgeht, dass du sie längst kennst. Du probierst es einmal aus — es funktioniert genau so wie beschrieben — und plötzlich ist es Teil deines Arbeitsablaufs.

Hier sind drei datenschutzfreundliche No-Login-Tools, die diesen Status verdient haben. Kein Schnickschnack, kein Account, kein Tracking.

## ExplainShell: Der Decoder für Terminal-Befehle

Wenn du einen Shell-Befehl findest, der dein Problem löst — etwa `tar -xzf archive.tar.gz --strip-components=1 -C /usr/local` — hast du grob zwei Möglichkeiten: Du führst ihn blind aus und vertraust darauf, dass die Person, die ihn gepostet hat, wusste, was sie tat. Oder du fügst ihn in [ExplainShell](https://explainshell.com) ein.

ExplainShell zerlegt Shell-Befehle und ordnet jeden Teil dem entsprechenden Abschnitt der Man-Page zu. Keine Zusammenfassung, keine Paraphrase — sondern die dokumentierte Erklärung für jedes Flag, jedes Argument, jeden Unterbefehl. Das Flag `--strip-components=1` im obigen tar-Befehl? ExplainShell erklärt dir genau, was es tut (führendes Pfadverzeichnis beim Extrahieren entfernen) und zitiert dabei direkt aus der tar-Man-Page.

Das Tool wurde von Idan Kamara entwickelt und ist auf [GitHub](https://github.com/idank/explainshell) open source. Der Mechanismus ist clever: Es indexiert Man-Pages und nutzt einen Parser, um Befehle in ihre Bestandteile zu zerlegen, die dann jeweils mit ihrer Dokumentation verknüpft werden. Keine KI, die rät — ein direktes Matching gegen die kanonische Quelle.

Richtig wertvoll wird es bei Befehlen, die mehrere Tools verketten. Etwas wie `find . -name "*.log" -mtime +30 -exec rm {} \;` kombiniert `find`, Positionstests und `exec`-Syntax auf einmal. ExplainShell bricht jeden Teil visuell auf, mit Farbcodierung, die dir die logische Struktur zeigt — bevor du auch nur ein Wort gelesen hast.

Kein Account. Du fügst einen Befehl ein, drückst Enter und bekommst die Aufschlüsselung. So direkt ist das. Für Entwickler, die Shell-Skripte aus Dokumentation oder von Kollegen übernehmen, ist das der Typ Tool, den du mehrmals pro Woche öffnest, ohne groß darüber nachzudenken — und dessen Fehlen du sofort bemerkst, wenn du mal an einem Rechner ohne dein Lesezeichen sitzt.

## PairDrop: Dateiübertragung ohne Frust

Das nervigste Szenario beim Dateitransfer ist nicht das Senden zwischen zwei Computern auf demselben Schreibtisch. Es ist das Senden eines 400-MB-Videos vom Android-Handy auf den Windows-Laptop, wenn beide nicht im gleichen Ökosystem sind. AirDrop funktioniert nur zwischen Apple-Geräten. Android Nearby Share nur zwischen Android-Geräten. Bluetooth ist langsam. USB-C-Kabel erfordern physische Nähe und kompatible Anschlüsse.

[PairDrop](https://pairdrop.net) löst das ohne jegliche Installation. Es ist ein browserbasiertes P2P-Dateiübertragungstool, das zwischen zwei beliebigen Geräten mit modernem Browser funktioniert. Öffne es auf beiden — Handy und Laptop, zwei Laptops, Tablet und Desktop — und sie finden sich automatisch, wenn sie im selben lokalen Netzwerk sind. Klick auf eines, bestätige auf dem anderen, und der Transfer beginnt.

Das Peer-to-Peer-Prinzip ist entscheidend. Dateien werden direkt zwischen den Geräten über WebRTC übertragen — dasselbe Protokoll, das Browser für Videoanrufe nutzen. Nichts läuft über PairDrops Server; der Server übernimmt nur den initialen Verbindungshandshake. Danach ist der Datenpfad direkt. Für vertrauliche Dokumente oder große Dateien, bei denen du keine Kopie in irgendeiner Cloud haben möchtest, ist das ein echter Unterschied zu Diensten wie WeTransfer oder Google Drive.

PairDrop ist ein Fork und eine substantielle Weiterentwicklung von [Snapdrop](https://snapdrop.net), einem älteren Open-Source-Projekt mit demselben Konzept. Die PairDrop-Codebasis fügt Features hinzu, die Snapdrop fehlten: passwortgeschützte Räume zum Verbinden von Geräten in verschiedenen Netzwerken, Textübertragung neben Dateiübertragung und bessere Handhabung großer Dateien. Es wird auf [GitHub](https://github.com/schlagmichdoch/PairDrop) als Open-Source-Projekt gepflegt.

Der Vergleich mit [ShareDrop](/tool/sharedrop-io) ist einen Satz wert: Beide sind browserbasierte P2P-Dateifreigabetools ohne Registrierung. ShareDrop verlangt, dass sich beide Geräte im selben lokalen Netzwerk befinden. PairDrop kann über seine Raumfunktion auch Geräte aus verschiedenen Netzwerken verbinden. Für den Heimgebrauch funktionieren beide. Wenn du jemandem in einer anderen Stadt eine Datei schicken willst, ohne dich mit Accounts oder Größenbeschränkungen herumzuschlagen, hat PairDrop die Nase vorn.

Ein Vorbehalt: Da es auf WebRTC basiert, können Unternehmens-Firewalls die P2P-Verbindung manchmal blockieren. In einem normalen Heimnetzwerk oder im Café läuft es problemlos.

## Markmap: Deine Notizen als Mindmap

Es gibt diesen einen Moment beim Planen, wenn du eine Struktur im Kopf hast — einen Projektumriss, eine Forschungsübersicht, einen Entscheidungsbaum — und eine flache Liste mit Stichpunkten einfach nicht mehr reicht. Du willst die Zusammenhänge sehen. Die Äste. Welche Unterthemen wo hingehören.

Genau dafür gibt es [Markmap](https://markmap.js.org).

Markmap wandelt Markdown — konkret Markdown-Überschriften und -Listen — in eine interaktive Mindmap um. Du schreibst das:

```markdown
# Project Launch

## Marketing
### Blog posts
### Social media
### Email campaign

## Engineering
### Backend API
### Frontend
### Testing

## Design
### Brand refresh
### Assets
```

Und Markmap rendert daraus einen interaktiven radialen Baum mit Ästen, die du per Klick ein- und ausklappen kannst. Das Rendering ist sofort. Kein Upload, kein Account, kein Warten. Links ein Texteditor, rechts die Mindmap — die sich aktualisiert, während du tippst.

Die Exportoptionen sind praktisch: SVG und HTML. Der SVG-Export liefert dir ein Vektorbild, das du in eine Präsentation oder ein Dokument ziehen kannst. Der HTML-Export ergibt eine in sich geschlossene, interaktive Datei, die du mit jedem teilen kannst, der einen Browser hat. Kein Empfänger braucht einen Account oder muss etwas installieren.

Für VS-Code-Nutzer gibt es eine [Markmap-Extension](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode), die neben deiner Markdown-Datei eine Live-Mindmap-Vorschau anzeigt. Alle anderen kommen mit der Browser-Version auf markmap.js.org aus — kein Account, keine Zahlung, kein Nudge in Richtung „Pro"-Abo.

Was Markmap nicht sein will, ist eine vollständige Mindmap-Anwendung. Manuelles Positionieren von Knoten, benutzerdefinierte Farben je Knoten oder Cloud-Synchronisierung — das gibt es hier nicht. Diese Features existieren in Tools wie MindMeister, Miro und Coggle, die aber alle eine Registrierung erfordern. Wenn du pixelgenaue Kontrolle über dein Mindmap-Layout brauchst, findest du das dort. Aber wenn du eine Struktur aus deinem Kopf schnell visualisieren willst, ist Markmap schneller als jedes dieser Tools.

Das Projekt ist open source, wird von [gera2ld auf GitHub](https://github.com/markmap/markmap) gepflegt und hat eine solide Anhängerschaft in der Entwickler- und Tech-Writing-Community aufgebaut. Die Kernbibliothek ist auch als npm-Paket verfügbar, was Entwicklern erlaubt, Markmap-Rendering in eigene Dokumentationstools einzubetten — ein verbreiteter Anwendungsfall in Wissensdatenbank-Software und Static-Site-Generatoren.

## Warum genau diese drei?

Die naheliegende Frage, wenn jemand sagt „Tools, von denen ich nicht lassen kann", ist: Was hat dafür gesorgt, dass diese geblieben sind, wo andere es nicht geschafft haben?

Bei ExplainShell ist es, dass es eine Sache tut und das aus erster Hand. Es gibt Dutzende Browser-Extensions und KI-Chatbots, die Shell-Befehle „erklären". ExplainShell ist anders, weil es nicht interpretiert — es indexiert echte Dokumentation. Das ist ein höherer Genauigkeitsmaßstab, und für alles, was du gleich im Terminal ausführst, zählt Genauigkeit.

Bei PairDrop ist es der plattformübergreifende P2P-Transfer, für den sonst nichts sauber funktioniert. Apple zu Apple ist gelöst. Android zu Android ist gelöst. Die gemischten Fälle — und die meisten realen Dateitransfers sind gemischte Fälle — haben keine gute native Lösung. PairDrop füllt diese Lücke in einem Browser-Tab, ohne Registrierung und ohne Größenbeschränkungen, die in der Praxis relevant wären.

Bei Markmap ist es die reibungslose Umwandlung vom Denktool (Markdown) zum Visualisierungstool (Mindmap). Die meisten Mindmap-Programme zwingen dich, in den Kategorien des jeweiligen Tools zu denken. Markmap kommt zu dir — wenn du sowieso in Markdown schreibst. Das Tool passt sich deinem Arbeitsablauf an, statt dir einen aufzuzwingen.

Alle drei sind datenschutzfreundlich in dem Sinne, der wirklich zählt: Sie verarbeiten deine Daten lokal oder direkt zwischen Geräten, ohne dass du einen Account erstellen musst, der dann zum Datenpunkt in der Marketingdatenbank von irgendjemandem wird. Sie sind auch nicht der Typ Tool, der mit der Zeit zu einem „Freemium"-Produkt verkommt — ExplainShell ist seit über einem Jahrzehnt kostenlos und ohne Account, PairDrop ist open source und selbst hostbar, und Markmaps Kerntool hat keine Bezahlschranke.

Wenn du mehr Tools in dieser Kategorie suchst, pflegt [nologin.tools](/tool/nologin-tools) ein Verzeichnis geprüfter Tools, die ohne Registrierung funktionieren. Der [Überblick über Design-Tools ohne Account](/blog/five-design-tools-no-account) deckt andere Anwendungsfälle ab — ebenfalls einen Blick wert, wenn das Prinzip dich überzeugt.

Das Prinzip überzeugt: nützliche Software, die sofort funktioniert, ohne etwas zu verlangen. Es gibt davon überraschend viel. Das Schwierige ist nicht, diese Tools zu finden — sondern die Gewohnheit aufzubauen, als Erstes dort hinzugreifen, bevor man reflexartig eine Desktop-App öffnet oder wieder irgendwo einen Account anlegt. Hat man die Gewohnheit einmal, will man nicht mehr zurück.
