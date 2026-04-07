---
title: "Excalidraw: Kostenloses Online-Whiteboard ohne Anmeldung"
description: "Excalidraw ist ein freies, Open-Source-Whiteboard-Tool, das direkt im Browser funktioniert – ohne Registrierung. Zeichne Diagramme im Skizzen-Stil und arbeite mit Ende-zu-Ende-Verschlüsselung zusammen."
publishedAt: 2026-04-07
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source", "browser"]
featured: false
heroImageQuery: "whiteboard sketching digital drawing hand-drawn"
locale: "de"
originalSlug: "excalidraw-free-whiteboard-no-login"
sourceHash: "ba7bcfac58d58f30"
---

![Hero image](/blog/images/excalidraw-free-whiteboard-no-login/hero.jpg)

Die meisten Whiteboard-Tools verlangen, dass du ein Konto erstellst, bevor du die erste Linie zeichnest. Miro will deine E-Mail-Adresse. FigJam braucht deinen Figma-Account. Lucidchart zeigt nach fünf Formen eine Bezahlschranke. Und wer zahlt, dem schaut das Unternehmen trotzdem auf die Zeichenfläche.

[Excalidraw](https://excalidraw.com) öffnet sich direkt mit einer leeren Leinwand, bereit zur Nutzung. Kein Signup. Kein Login. Kein Pop-up, das nach deiner E-Mail fragt. Einfach ein Whiteboard.

Das ist das Versprechen – und nach Millionen von Nutzern und Jahren aktiver Entwicklung gilt es nach wie vor.

## Was Excalidraw tatsächlich tut

Excalidraw ist ein browserbasiiertes Zeichenwerkzeug, das alles im handgezeichneten Stil rendert. Rechtecke haben leicht wackelige Kanten. Linien haben diese natürliche Ungenauigkeit, die Diagramme aussehen lässt, als wären sie auf einer Serviette skizziert worden – nicht auf einer Folie in PowerPoint.

Diese Ästhetik ist eine bewusste Designentscheidung, keine Einschränkung. Wenn du ein Architekturdiagramm skizzierst oder einem Team ein Konzept erklärst, sendet das raue Erscheinungsbild das Signal „das ist ein Entwurf, kommentiert gerne" – viel klarer als eine glattgebügelte Keynote-Folie. Entwicklerteams nutzen es für System-Design-Interviews. Designer setzen es vor dem Öffnen von Figma fürs Wireframing ein. Lehrende nutzen es, um Konzepte zu erklären, ohne dass die Formalität eines Foliensatzes im Weg steht.

Das Tool bietet die üblichen Formen – Rechtecke, Kreise, Pfeile, Linien, Text, Freihandzeichnen – sowie Bilder, die sich direkt in die Leinwand einbetten lassen. Objekte können gruppiert, geschichtet, gesperrt und an einem Raster ausgerichtet werden. Es gibt einen Farbwähler, eine Strichbreiten-Auswahl und Füllloptionen. Nichts davon steckt hinter einem Premium-Tier.

Der Export funktioniert ohne Account. Du kannst als PNG (optionaler transparenter Hintergrund), SVG oder in die Zwischenablage exportieren. Das `.excalidraw`-Dateiformat ist reines JSON – deine Zeichnungen sind also auch ohne die App lesbar und wiederherstellbar, was praktisch ist, falls das Projekt eines Tages offline geht.

## Die Datenschutz-Architektur

Das ist der Grund, warum Excalidraw speziell als datenschutzfreundliches Tool vorgestellt werden sollte: Das Kollaborationsmodell ist standardmäßig Ende-zu-Ende-verschlüsselt.

Wenn du eine Zeichnung über den „Live-Zusammenarbeit"-Link teilst, werden sowohl die Raum-ID als auch der Verschlüsselungsschlüssel im URL-Fragment eingebettet (dem Teil nach dem `#`). Das Fragment wird niemals an den Server gesendet – es bleibt im Browser. Excalidraw-Server übermitteln die Zeichnungsdaten zwischen Teilnehmern, empfangen aber nur verschlüsselte Bytes. Was gezeichnet wurde, können sie nicht lesen.

Das ist eine substanzielle Datenschutzgarantie. Bei Tools wie Miro oder Notion hat die Plattform vollen Zugriff auf den Inhalt deines Whiteboards. Im Kollaborationsmodus von Excalidraw ist das nicht so. Der [Quellcode liegt auf GitHub](https://github.com/excalidraw/excalidraw) unter MIT-Lizenz, sodass jeder diese Aussage durch Lesen des Codes verifizieren kann – ohne darauf vertrauen zu müssen.

Bei Einzelnutzung verlässt nichts deinen Browser. Zeichnungen werden in `localStorage` gespeichert und bleiben auf deinem Gerät, solange du sie nicht explizit exportierst.

> "Your data is end-to-end encrypted, meaning the Excalidraw server cannot read what you've drawn." — Excalidraw documentation

Das ist das gleiche Designprinzip, das man in anderen datenschutzorientierten Tools sieht: Der Server übernimmt den Transport, nicht den Inhalt. Der Nutzer hält die Schlüssel.

## Excalidraw vs. tldraw vs. Diagrams.net

In der Kategorie kostenloser Whiteboards ohne Login gibt es einige starke Mitbewerber. Hier der Vergleich:

| | Excalidraw | tldraw | Diagrams.net |
|---|---|---|---|
| Login erforderlich | Nein | Nein | Nein |
| Zusammenarbeit | E2E-verschlüsselt | Ja | Nein (nur Export) |
| Stil | Handgezeichnet | Sauber/Vektor | Technisch/UML |
| Selbst-hostbar | Ja | Ja | Ja |
| Exportformate | PNG, SVG, JSON | PNG, SVG, JSON | PNG, SVG, PDF, XML |
| Open Source | MIT | MIT | Apache 2.0 |

[tldraw](/tool/tldraw-com) ist der nächste Konkurrent. Ebenfalls kostenlos, ohne Login und Open Source. Der Hauptunterschied ist ästhetisch – tldraw verwendet saubere Vektorformen, während Excalidraw konsequent am handgezeichneten Look festhält. Wenn Präzision wichtig ist – etwa für ein Diagramm in einem formalen technischen Dokument –, ist tldraw mit seinem saubereren Rendering einfacher zu handhaben.

[Diagrams.net](/tool/app-diagrams-net) richtet sich an einen völlig anderen Anwendungsfall. Es bietet echte UML-Formen, Flussdiagramm-Vorlagen, Netzwerktopologie-Icons und ein XML-basiertes Format, das mit Confluence und anderen Enterprise-Tools integriert werden kann. Für strukturierte Diagramme ist es mächtiger, für freies Skizzieren weniger geeignet.

Miro ist die Enterprise-Option – poliert, wirklich funktionsreich und ab 16 Dollar pro Nutzer und Monat nach Ende des kostenlosen Kontingents. Es erfordert ein Konto, verfolgt die Nutzung und hat vollen Zugriff auf alles, was du zeichnest. Für ein kleines Team, das gelegentlich Diagramme erstellt, ist das viel Geld für das, was Excalidraw kostenlos bietet.

## Zusammenarbeit ohne Daten-Übergabe

Das typische Echtzeit-Kollaborationsprodukt funktioniert so: Du erstellst ein Konto, deine Inhalte leben auf deren Servern, und sie können sie lesen. Das ist ein bekannter Trade-off, bei vielen Produkten ist das in Ordnung.

Excalidraw funktioniert anders. Zwei Personen können dieselbe Leinwand in Echtzeit bearbeiten – Cursor erscheinen mit Namen, Änderungen propagieren sofort – und der vermittelnde Server ist funktional blind gegenüber dem Inhalt. Der Verschlüsselungsschlüssel berührt niemals den Server, also würde auch eine richterliche Anordnung keine lesbaren Zeichnungsdaten produzieren.

Um eine Kollaborationssitzung zu starten, klick auf das Personen-Icon in der Toolbar und teile den Link. Jeder mit dem Link kann beitreten, ohne ein Konto zu erstellen. Sitzungen bestehen nur so lange, wie jemand verbunden ist. Im kostenlosen Tier gibt es keinen dauerhaften Cloud-Raum.

Das bedeutet: kein Versionsverlauf, keine geräteübergreifende Cloud-Synchronisation und keine Möglichkeit, Tage später zu einer Sitzung zurückzukehren, ohne die Datei exportiert zu haben. Für Ad-hoc-Skizzier-Sitzungen ist das ein akzeptabler Kompromiss. Für fortlaufende Team-Whiteboards solltest du `.excalidraw`-Dateien regelmäßig in einen gemeinsamen Ordner exportieren oder dir [Excalidraw+](https://plus.excalidraw.com) anschauen – die kostenpflichtige gehostete Version mit dauerhaftem Cloud-Speicher, passwortgeschützten Räumen und Szenen-Backups.

Die kostenlose Version deckt, was die meisten Menschen tatsächlich brauchen: ein Konzept mit einem Kollegen durcharbeiten, exportieren, weitermachen.

## Tastaturkürzel und Power-User-Erfahrung

Excalidraw belohnt das Lernen der Tastaturkürzel. Sobald sie in den Fingern sitzen, wird das Zeichnen richtig schnell.

Die Form-Shortcuts sind einstellig: `R` für Rechteck, `E` für Ellipse, `A` für Pfeil, `L` für Linie, `X` für Freihand, `T` für Text. `V` kehrt zum Auswahlwerkzeug zurück. `H` und `V` spiegeln horizontal und vertikal. `Ctrl+A` wählt alles aus, `Ctrl+G` gruppiert ausgewählte Objekte.

Zum Teilen: `Ctrl+Shift+E` öffnet den Exportdialog, von wo aus du in die Zwischenablage kopieren oder herunterladen kannst. `Ctrl+L` kopiert direkt einen teilbaren Link in die Zwischenablage.

Zoom: `Ctrl+Scroll` zoomt rein und raus, `Ctrl+Shift+H` passt die gesamte Zeichnung auf den Bildschirm an. Das Hand-Werkzeug (`Leertaste+Ziehen`) schwenkt die Leinwand ohne Wechsel des ausgewählten Werkzeugs.

Diese Shortcuts minimieren die Lücke zwischen Denken und Zeichnen. Diese Unmittelbarkeit ist der Hauptgrund, warum Excalidraw für schnelle Diagramme so gut funktioniert – du wühlst nicht in Menüs herum, während die Idee noch frisch ist.

## Das Open-Source-Ökosystem

Eine der echten Stärken von Excalidraw ist das, was andere darauf aufgebaut haben. Weil es MIT-lizenziert ist und als npm-Paket geliefert wird, wurde es in eine überraschend große Anzahl von Tools eingebettet.

[Excalideck](/tool/excalideck-com) wandelt Excalidraw-Zeichnungen in Präsentationsfolien um – die handgezeichnete Ästhetik im Folien-Format, ohne zusätzliche Software. Für technische Vorträge, bei denen du grobe Architekturdiagramme zeigen willst, ohne zwischen Tools zu wechseln, ist das wirklich nützlich.

Es gibt Obsidian-Plugins, die es ermöglichen, Excalidraw-Diagramme direkt in deinem Notes-Vault zu zeichnen. VS Code-Erweiterungen betten eine Leinwand neben deinem Code ein. Mehrere Dokumentations-Tools und Wikis haben Excalidraw-Integration hinzugefügt, damit Teams Diagramme am gleichen Ort wie den Text aufbewahren können, den sie illustrieren.

Das Bibliothekssystem verdient eine Erwähnung. Die Community hat Hunderte von vorgefertigten Formensammlungen beigetragen – AWS-Architektur-Icons, Google-Cloud-Infrastrukturdiagramme, mobile UI-Komponenten, Flussdiagramm-Vorlagen, Datenbankdiagramme. Sie lassen sich über den Bibliotheks-Browser in der App installieren, ohne Registrierung.

Das Projekt hat über 80.000 Sterne auf GitHub angehäuft, womit es zu den am meisten adoptierten Open-Source-Zeichenwerkzeugen gehört. Aktive Wartung, ein reaktionsschnelles Issue-Tracker und ein gesundes Ökosystem an Integrationen sind das Ergebnis jahrelanger konsequenter Entwicklung.

## Für wen eignet sich Excalidraw

Wenn du Architekturdiagramme skizzierst, ist Excalidraw schwer zu schlagen. Der handgezeichnete Stil nimmt den Druck, Dinge poliert aussehen zu lassen, bevor die Idee feststeht – und die Tastaturkürzel erlauben es, im Tempo des Denkens zu zeichnen.

Beim UX-Wireframing in der Lo-Fi-Phase – bevor Figma oder Sketch geöffnet wird – funktioniert Excalidraw gut. Die grobe Ästhetik kommuniziert klar „das ist Erkundung", was dazu neigt, ehrlicheres Feedback zu erzeugen als ein pixelgenaues Mockup.

Im Bildungsbereich nutzen Lehrende es, um während Videoanrufen Diagramme zu zeichnen, während Schülerinnen und Schüler der geteilten Leinwand beitreten. Das kontofreie Modell ist hier wichtig: Man kann nicht voraussetzen, dass alle Schüler einen Account haben oder auf einer weiteren Plattform erstellen möchten.

Für alles, was präzise Ausrichtung, bedingte Formatierung oder ein Diagramm in einem formalen Spezifikationsdokument erfordert, sollte man [Diagrams.net](/tool/app-diagrams-net) oder ein dediziertes Vektorwerkzeug verwenden. Der handgezeichnete Stil von Excalidraw ist auch seine Grenze.

## Starten ohne jede Einrichtung

Geh zu [excalidraw.com](https://excalidraw.com). Fang an zu zeichnen. Das ist das gesamte Onboarding.

Deine Zeichnung wird beim Arbeiten automatisch in `localStorage` gespeichert, sodass das Schließen und Wiedereröffnen des Tabs deine letzte Leinwand zurückbringt. Für alles, was du langfristig behalten willst, nutze `Ctrl+Shift+E` zum Exportieren – entweder als `.excalidraw`-Datei (zum späteren Wiedereröffnen und Bearbeiten) oder als PNG/SVG (zum Teilen oder Einbetten).

Für die Zusammenarbeit klicke auf das Personen-Icon und teile den Raum-Link. Deine Mitarbeiter müssen nichts installieren, brauchen keinen Account, keinen Download. Der Link ist alles.

Wenn du selbst hosten willst – für ein Firmenintranet, ein Schulnetzwerk oder einfach weil du volle Kontrolle über den Speicherort deiner Zeichnungen haben möchtest – steht das Docker-Image bereit und die Selbst-Hosting-Dokumentation ist ausführlich. Die MIT-Lizenz bedeutet, dass du es nach Belieben modifizieren und betreiben kannst.

Weitere datenschutzfreundliche No-Login-Tools sind auf [nologin.tools](/tool/nologin-tools) aufgelistet, falls du ein Toolkit aufbaust, das konsequent auf Account-Erstellung verzichtet.

Die Kategorie Whiteboard-Tools ist eine, in der die kostenlose, Open-Source-Option mit Privacy-First-Ansatz für die meisten Nutzer genuuin die beste ist. Das passiert selten. Excalidraw hat es sich verdient, indem es Datenschutz und lokalen Besitz als Features behandelt – nicht als Nachgedanken.
