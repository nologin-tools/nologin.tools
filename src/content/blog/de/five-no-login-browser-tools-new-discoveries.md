---
title: "Fünf Browser-Tools ohne Anmeldung, die du wahrscheinlich noch nicht kennst"
description: "Eine neue Auswahl an Browser-Tools, die die Registrierungsseite überspringen — darunter ein neuer In-Browser-PDF-Editor, der gerade auf Hacker News die Runde macht."
publishedAt: 2026-03-29
author: "nologin.tools"
tags: ["tools", "browser", "review", "comparison"]
featured: false
heroImageQuery: "browser tools no signup privacy web app"
locale: de
originalSlug: five-no-login-browser-tools-new-discoveries
sourceHash: 4883bf41e2c3b733
---

![Hero image](/blog/images/five-no-login-browser-tools-new-discoveries/hero.jpg)

Jemand hat [BreezePDF](https://breezepdf.com/?v=3) kürzlich bei Hacker News mit dem Slogan „kostenloser, im Browser laufender PDF-Editor" eingereicht. Es schaffte die Frontpage. Der meistgewählte Kommentar handelte nicht von Features — er handelte davon, dass man es tatsächlich nutzen konnte, ohne vorher seine E-Mail-Adresse preiszugeben. Dieses Detail hat gezündet.

Diese Reaktion sagt etwas darüber aus, wo die Erwartungen 2026 liegen. Menschen sind so sehr an Registrierungssperren gewöhnt, dass ein Tool, das einfach funktioniert, als bemerkenswert markiert wird. Was rückwärts ist. Die Registrierungssperre ist die ungewöhnliche Entscheidung. Alles im Browser zu verarbeiten — kein Server, kein Account, keine gespeicherten Daten — ist oft der technisch geradlinigere Weg. Er erfordert nur, dass man sich mehr um die User Experience kümmert als um Wachstumsmetriken.

Hier sind fünf Tools, die den einfacheren Weg gewählt haben.

## BreezePDF: PDF-Bearbeitung, die sofort einsatzbereit ist

Der Workflow, der die meisten Menschen zu einem PDF-Editor treibt, ist sehr konkret: Jemand schickt dir ein Formular per E-Mail, du musst es ausfüllen, und du hast kein Acrobat. Die Standardreaktion ist, ein Online-Tool zu suchen, zu entdecken, dass es einen Account will, ein anderes auszuprobieren, und schließlich nach fünf Minuten, die man nicht hatte, irgendwo zu landen, das funktioniert.

BreezePDF schneidet diese Schleife kurz. URL öffnen, PDF hochladen, editieren. Es deckt Formularausfüllung, Annotationen, Texteinfügung und Seitenumordnung ab — die Operationen, die 90 % der Gründe abdecken, weshalb jemand einen PDF-Editor öffnet. Alles läuft im Browser, was bedeutet, dass nichts an einen Server gesendet wird, den du nicht einsehen kannst.

Der relevante Vergleich: [PDF24 Tools](/tool/tools-pdf24-org-en) ist seit Jahren die zuverlässige No-Login-Option für PDF-Arbeit und deckt Zusammenführen, Teilen, Komprimieren und Konvertieren ab. BreezePDF konzentriert sich enger auf die Bearbeitung des Inhalts eines einzelnen Dokuments. Die beiden ergänzen sich eher, als dass sie konkurrieren, und beide sind es wert, bekannt zu sein. PDF24 ist das Schweizer Taschenmesser; BreezePDF ist das Skalpell.

Was BreezePDF über den Funktionsumfang hinaus bemerkenswert macht, ist das Timing. Es tauchte genau dann auf, als [mehrere zuvor kostenlose PDF-Tools begonnen haben, den Export hinter Accounts zu sperren](https://smallpdf.com/pricing) — ein Muster, das inzwischen so verbreitet ist, dass es vorhersehbar ist. Ein neuer Anbieter, der sich zu No-Signup bekennt, ist in diesem Kontext eine bedeutsame Ansage.

## Datasette Lite: ein Datenbankexplorer, der in deinem Browser-Tab läuft

Wenn du eine CSV-Datei oder eine SQLite-Datenbank bekommst und Fragen daran stellen willst, sind die üblichen Optionen: in Excel öffnen (okay für kleine Dateien, schmerzhaft für große), in eine lokale Datenbank importieren (erfordert Setup) oder in einen Cloud-Dienst hochladen (wirft offensichtliche Fragen auf, wo deine Daten landen).

[Datasette Lite](https://lite.datasette.io) ist eine andere Option. Es läuft die vollständige Datasette-Anwendung im Browser über WebAssembly — konkret: ein Python-Interpreter, der via Pyodide zu WASM kompiliert wurde. Du kannst eine SQLite-Datei von deiner lokalen Festplatte oder einer URL laden, SQL-Abfragen dagegen ausführen, Daten filtern und sortieren und Ergebnisse exportieren. Nichts verlässt deine Maschine.

Die technische Leistung hier ist real. Einen Python-Web-Framework im Browser ohne Server zu betreiben wäre vor ein paar Jahren noch undenkbar gewesen. Die [WebAssembly-Spezifikation](https://webassembly.org/docs/use-cases/) ist ausgereift genug, dass diese Art von Port praktikabel ist, und Datasette Lite ist eines der beeindruckendsten Beispiele dafür, was das ermöglicht.

Für Journalisten, Forscher oder jeden, der Datenanalysen an sensiblen Dateien durchführt, ist der Datenschutzaspekt genauso bedeutsam wie die Bequemlichkeit. Eine Datenbank mit Patientenakten oder Finanzdaten in einen Cloud-Dienst hochzuladen, um sie abzufragen, ist ein schlechtes Geschäft. Dieselbe Abfrage lokal in einem Browser-Tab auszuführen, ohne dass die Daten die Maschine jemals verlassen, ist das richtige Muster.

Datasette Lite unterstützt auch das Laden von Daten aus URLs, was es nützlich macht, um veröffentlichte Regierungsdatensätze oder Open-Data-Portale zu erkunden, ohne lokale Infrastruktur aufzubauen.

## led.run: Verwandle jeden Bildschirm in ein Anzeigedisplay

Es gibt eine spezifische Situation, in der [led.run](/tool/led-run) nützlich wird: Du bist in einem Veranstaltungsraum, bei einem Event, in einem Klassenzimmer oder einer Präsentation, und du musst scrollenden Text auf einem Bildschirm anzeigen, ohne Software zu installieren oder ein dediziertes Displaysystem einzurichten. Vielleicht eine Willkommensnachricht für eine Konferenz, ein Live-Q&A-Prompt, ein Countdown oder einfach ein Namensschild.

led.run ist ein Browser-basiertes Display-Toolkit, das jeden Bildschirm in ein steuerbares Display verwandelt. Text eingeben, Schriftgröße und Farbschema wählen, Scrollgeschwindigkeit einstellen, Browser auf die URL richten — fertig. Funktioniert auf jedem Gerät mit einem modernen Browser. Du kannst es von einem anderen Gerät aus steuern, indem du die URL teilst. Keine App-Installation, kein Account, kein Abo für den „mehrere Displays"-Tarif.

Das Tool löst ein enges Problem gut. Das ist das Designmuster, das es wert ist, bemerkt zu werden: Statt einer vollständigen „Event-Management-Plattform" mit Registrierung, Analytics und Badgedruck macht led.run eine einzige Sache — Text auf einen Bildschirm bringen — ohne das ganze Drumherum.

Dieser Ansatz wird unter No-Login-Tools immer häufiger. Die Einschränkung „keine Accounts" drängt das Design natürlich zur Vereinfachung. Wenn du dich nicht auf persistenten Benutzerstatus stützen kannst, musst du dafür sorgen, dass Dinge ohne ihn funktionieren. Das führt oft zu besseren Tools, nicht zu schlechteren.

## iFormat.io: Dateikonvertierung ohne die E-Mail-Schranke

Dateikonvertierung ist eine dieser Aufgaben, die ständig vorkommt und von Dutzenden Tools gelöst wird, von denen die meisten einen Account wollen. Eine HEIC-Foto in JPEG umwandeln. Ein DOCX in PDF transformieren. Audio als MP3 statt M4A exportieren.

[iFormat.io](/tool/iformat-io) deckt über 500 Formatkonvertierungen ohne Registrierung ab. Der Umfang ist breit: Audio, Video, Bilder, Dokumente, E-Books, Archive. Die Dateiverarbeitung erfolgt serverseitig (die Konvertierung binärer Dateien ist im Browser für alle Formate noch nicht praktikabel), aber kein Account ist erforderlich, und Dateien werden verarbeitet und gelöscht statt gespeichert.

Der Vergleichspunkt ist [Convertio](/tool/convertio-co), das in diesem Bereich eine zuverlässige Option war, aber seinen kostenlosen Tarif in den letzten Jahren eingeschränkt hat — du kannst noch ohne Account konvertieren, aber mit strengeren Größen- und Häufigkeitslimits. iFormat.io lohnt sich als Alternative zu kennen, besonders für größere Dateien oder Stapelkonvertierungen, bei denen Convertios Limits zum Problem werden.

Für einfachere Formatkonvertierungen — Bilder verkleinern, PNGs komprimieren, Bildformate umwandeln — deckt [TinyWow](/tool/tinywow-com) eine breite Palette von Operationen ohne Registrierung ab. Das richtige Tool hängt davon ab, was du konvertierst, aber für allgemeine Dateitransformationen verarbeitet iFormat.io die breiteste Bandbreite, ohne etwas dafür zu verlangen.

## SiteAge: Erforsche die Geschichte jeder Website ohne Account

Wenn du ein neues Tool oder einen Dienst evaluierst, spielt es eine Rolle, wie lange es schon existiert. Eine Website, die vor sechs Monaten gestartet hat, ist ein anderes Angebot als eine, die seit einem Jahrzehnt läuft. Ein Dienst, der in drei Jahren zweimal seinen Namen geändert hat, verdient eine andere Prüfung als einer mit konstanter Identität. Alter und Kontinuität sind Signale.

[SiteAge](/tool/siteage-org) bündelt diese Informationen aus der [Wayback Machine des Internet Archive](https://web.archive.org/), einem der langlebigsten Web-Archivierungsprojekte. Gib eine URL ein, und SiteAge zeigt dir den ältesten archivierten Snapshot, die Domain-Registrierungshistorie und eine Zeitleiste, wie sich die Website verändert hat. Du schaust auf Jahre historischer Daten aus öffentlichen Quellen, zusammengestellt ohne dass du einen Account anlegen musst.

Das ist genau in dem Kontext nützlich, in dem du ein No-Login-Tool verifizieren würdest: Du hast etwas Nützliches gefunden, es behauptet, kostenlos und datenschutzfreundlich zu sein, und du willst wissen, ob es lange genug existiert, um glaubwürdig zu sein. Die Wayback Machine selbst lässt dich diese Recherche durchführen, aber SiteAge bringt die Kernfakten schneller auf den Punkt — wann die Website erstmals auftauchte, ob sie gewachsen oder geschrumpft ist, wie lange sie auf der aktuellen Domain ist.

> Ein Tool, das fünf Jahre ohne Accounts betrieben wurde, macht eine andere Art von Versprechen als eines, das letzten Monat mit „vorerst kein Login nötig" gestartet ist.

Das größere Muster: datenschutzfreundliche Tools kommen oft mit weniger Hintergrundgeschichte als kommerzielle Alternativen. Du vertraust darauf, dass das Tool tut, was es sagt, und nicht still Daten sammelt, die es nicht sollte. Zu wissen, dass das Tool jahrelang konsistent betrieben wurde — nachprüfbar über das Archive — ist ein Teil davon, wie du dieses Vertrauen kalibrierst.

## Was diese Tools gemeinsam haben

Diese fünf Tools teilen keine Kategorie. PDF-Bearbeitung, Datenbankexploration, Displaysysteme, Dateikonvertierung und historische Recherche landen normalerweise nicht im selben Roundup. Aber sie teilen etwas Strukturelles.

Jedes von ihnen macht eine bestimmte Sache, ohne zu verlangen, dass du Informationen über dich preisgibst, um sie nutzen zu können. Sie kommen zur richtigen Antwort — „der Nutzer sollte das sofort ohne Account tun können" — von verschiedenen Ausgangspunkten. BreezePDF, weil PDF-Bearbeitung clientseitig möglich ist. Datasette Lite, weil WebAssembly es ermöglicht, komplexe Software im Browser zu betreiben. led.run, weil URL-basierter State für ein Display-Tool ausreicht. SiteAge, weil die zugrundeliegenden Daten ohnehin öffentlich sind.

Das [nologin.tools-Verzeichnis](/tool/nologin-tools) verfolgt über hundert Tools, die nach diesem Prinzip organisiert sind. Das Entdeckungsproblem ist real: No-Login-Tools tauchen nicht in denselben Marketing-Kanälen auf wie Abonnementprodukte. Sie haben keine Wachstumsbudgets oder Onboarding-Sequenzen zum Optimieren. Mundpropaganda und kuratierte Listen sind der Weg, wie Menschen sie finden.

Die Hacker-News-Einreichung, die BreezePDF sichtbar machte, ist ein gutes Beispiel dafür, wie das in der Praxis funktioniert. Jemand hat etwas gebaut, es gepostet, und die Reaktion, die Fahrt aufnahm, handelte nicht von Features — sie handelte davon, dass man es sofort nutzen konnte. Diese Reaktion, von einem technisch versierten Publikum, das Software als Beruf entwickelt, ist es wert, beachtet zu werden.

Immer mehr Tools werden auf diese Weise gebaut. Die Browser-Fähigkeiten entwickeln sich weiter. Die [WebAssembly-Spezifikation](https://webassembly.org/roadmap/) fügt weiterhin Features hinzu — Threads, Garbage Collection, bessere Debugging-Unterstützung — die es praktikabel machen, zunehmend komplexe Software in den Browser zu portieren. Die Menge an Tools, die ehrlich sagen können „das läuft komplett in deinem Browser, kein Server beteiligt", wird weiter wachsen.

Die, die es sich lohnt zu verfolgen: datenschutzfreundlich, Browser-nativ, kein Account erforderlich. Diese Kombination ist seltener als sie sein sollte, aber weniger selten als früher.

Wenn du ein Tool findest, das diese Beschreibung erfüllt und noch nicht im [Verzeichnis](/tool/nologin-tools) ist, dauert das [Einreichformular](/submit) etwa zwei Minuten.
