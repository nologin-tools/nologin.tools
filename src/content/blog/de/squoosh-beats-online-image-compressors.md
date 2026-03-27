---
title: "Warum Squoosh jeden anderen Online-Bildkompressor schlägt"
description: "Squoosh komprimiert Bilder vollständig im Browser – kein Upload nötig. Warum das wichtig ist und wie es im Vergleich zu den Alternativen abschneidet."
publishedAt: 2026-03-27
author: "nologin.tools"
tags: ["tools", "review", "browser", "open-source"]
featured: false
heroImageQuery: "image compression WebAssembly browser tool"
locale: de
originalSlug: squoosh-beats-online-image-compressors
sourceHash: ac06129c46b666ba
---

![Hero image](/blog/images/squoosh-beats-online-image-compressors/hero.jpg)

Die meisten Online-Bildkompressoren funktionieren nach dem gleichen Prinzip: Du lädst deine Datei auf den Server von jemandem hoch, das Backend übernimmt die Komprimierung, und du bekommst eine kleinere Datei zurück. Klingt simpel. Aber das bedeutet, dass deine Bilder — Produktfotos, Kundenbilder, vertrauliche Mockups — für eine gewisse Zeit auf einem fremden Server liegen. Du vertraust ihrer Aufbewahrungsrichtlinie. Und ihrer Sicherheit.

[Squoosh](https://squoosh.app) geht das anders an. Jede Komprimierung passiert direkt in deinem Browser-Tab. Nichts verlässt deinen Rechner. Und trotzdem — obwohl alles clientseitig läuft — liefert es kleinere Dateien als die meisten serverbasierten Alternativen.

## Was wirklich unter der Haube steckt

Der Grund, warum Squoosh professionelle Komprimierung ohne Server betreiben kann, ist WebAssembly. Google Chrome Labs hat Codecs wie MozJPEG, OxiPNG, libwebp, libavif und JPEG XL direkt in WASM-Module kompiliert, die im Browser mit nahezu nativer Geschwindigkeit laufen.

Das ist dasselbe MozJPEG, das Mozilla entwickelt hat, um den originalen JPEG-Encoder zu verbessern. Dasselbe libavif, das in Produktionssystemen eingesetzt wird. Squoosh verwendet keine JavaScript-Reimplementierung — es führt die echten Komprimierungsbibliotheken aus, nur für ein anderes Ziel kompiliert. Die Qualität entspricht dem, was du mit Kommandozeilentools bekommst.

Zum Datenschutz: Weil es keinen Upload gibt, gibt es keinen Server, keine Aufbewahrungsrichtlinie, keine dritte Partei. Die Datei, die du komprimierst, verlässt nie dein Gerät. Das ist keine Marketingaussage — das ist eine technische Konsequenz davon, wie das Tool funktioniert.

## Die unterstützten Formate (und warum das wichtig ist)

Hier zieht Squoosh an einfacheren Tools vorbei. Die meisten Online-Kompressoren verarbeiten JPEG und PNG. Manche WebP. Squoosh unterstützt:

| Format | Encoder | Am besten für |
|--------|---------|----------|
| JPEG | MozJPEG | Fotos, farbintensive Bilder |
| PNG | OxiPNG | Screenshots, Grafiken mit Transparenz |
| WebP | libwebp | Web-Bilder, gute Browser-Unterstützung |
| AVIF | libavif | Moderne Browser, beste Kompressionsraten |
| JPEG XL | jxl | Zukunftsformat, exzellente Qualität |
| WebP2 | Experimentell | Nur für Forschung/Tests |

AVIF lohnt sich zu verstehen. Es basiert auf dem AV1-Video-Codec und produziert konsistent Dateien, die 20–50 % kleiner sind als WebP bei gleicher visueller Qualität — und über 50 % kleiner als JPEG. [Googles Forschung zu AVIF](https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/speed/avif.md) zeigt, dass es andere Formate für die meisten Bildtypen übertrifft. Browser-Support gibt es inzwischen in Chrome, Firefox, Safari und Edge — du kannst es also heute in der Produktion einsetzen.

Squoosh lässt dich direkt in AVIF kodieren, ohne etwas zu installieren. TinyPNG bietet kein AVIF. Convertio schon, aber das erfordert den Upload auf deren Server. Dieser Unterschied spielt eine Rolle, wenn du mit Bildern arbeitest, die du lieber privat halten möchtest.

## Der Side-by-Side-Vergleich: Die Funktion, die sonst niemand hat

Das Nützlichste an Squoosh ist nicht mal die Codec-Auswahl. Es ist der Vergleichsschieberegler.

Wenn du ein Bild in Squoosh öffnest, bekommst du eine geteilte Ansicht: Original auf der einen Seite, komprimierte Version auf der anderen. Du ziehst einen Teiler links und rechts, um zu vergleichen. Die Dateigrößen aktualisieren sich in Echtzeit, während du die Qualitätseinstellungen anpasst. Du siehst genau, wo Komprimierungsartefakte anfangen aufzutauchen, und kannst den Qualitätsschieberegler zurückziehen, bis sie verschwinden.

Das klingt simpel. Es ist simpel. Aber kein anderes No-Login-Bildtool macht das so gut. [TinyPNG](https://nologin.tools/tool/tinypng-com) komprimiert automatisch ohne Qualitätskontrolle — du bekommst, was du bekommst. [Convertio](/tool/convertio-co) lässt dich Qualität numerisch einstellen, gibt aber kein visuelles Feedback. Squoosh zeigt dir den Kompromiss in Echtzeit. So kannst du eine fundierte Entscheidung treffen, statt mit Zahlen zu raten.

Die Dateigrößenanzeige zeigt sowohl absolute Größen (z. B. „1,2 MB → 340 KB") als auch die prozentuale Reduzierung. Das sind die Informationen, die du für eine Entscheidung brauchst. Nicht „optimiert!" — echte Zahlen.

## Vergleich mit den gängigen Alternativen

Wenn du ein Bild für ein Webprojekt komprimieren musst, sind die üblichen Verdächtigen TinyPNG, Convertio, iLoveIMG und ähnliche Dienste. Alle erfordern das Hochladen deiner Datei. Alle haben Dateigrößenbeschränkungen im kostenlosen Plan. Die meisten haben Nutzungskontingente.

[TinyPNG](/tool/tinypng-com) ist schnell und liefert gute Ergebnisse für PNG und JPEG, verwendet aber seinen eigenen Komprimierungsalgorithmus ohne Qualitätskontrolle. Der kostenlose Tarif beschränkt auf 20 Dateien pro Monat. AVIF oder JPEG XL werden nicht unterstützt. Und deine Dateien gehen auf deren Server in den Niederlanden.

[Convertio](/tool/convertio-co) unterstützt eine riesige Bandbreite an Formaten und ist für Formatkonvertierungen wirklich nützlich. Kostenlose Konten sind aber auf 10 Konvertierungen pro Tag und 100 MB Dateigröße beschränkt. Die Konvertierungen laufen serverseitig — was für nicht sensible Dateien in Ordnung ist.

Squoosh hat kein Dateigrößenlimit, kein Konvertierungskontingent, keine Account-Anforderung. Es gibt nicht mal ein Konzept von „kostenlosem Tarif", weil es keine Serverinfrastruktur zu bezahlen gibt. Die einzige Einschränkung ist der Arbeitsspeicher deines Browsers — was bei sehr großen Bildern relevant wird (denk an RAW-Dateien mit 50+ Megapixeln).

Wo Squoosh schwächelt: Es ist immer nur eine Datei auf einmal. Wenn du in einer Session 200 Produktfotos komprimieren musst, ist die Web-Oberfläche nicht das richtige Tool. Für die Stapelverarbeitung löst das die [Squoosh CLI](https://github.com/GoogleChromeLabs/squoosh/tree/dev/cli) — als npm-Paket verfügbar (`npx @squoosh/cli`) und unterstützt dieselben Encoder wie die Web-UI.

## Das Open-Source-Argument

Squoosh ist [open source auf GitHub](https://github.com/GoogleChromeLabs/squoosh) unter der Apache-2.0-Lizenz. Der Code ist öffentlich, die Komprimierung läuft lokal, und Google Chrome Labs pflegt es als Vorzeigeprojekt für das, was WebAssembly im Browser leisten kann.

Das ist aus mehreren Gründen relevant. Du kannst verifizieren, dass das Tool nichts Unerwartetes mit deinen Dateien macht — es gibt nichts zu verstecken, weil es keinen Server gibt. Du kannst eine eigene Instanz hosten, wenn du willst. Und weil das Projekt open source ist, kann die Community Verbesserungen an den WASM-Codec-Implementierungen prüfen.

Wer tiefer in browserbasierte Tools mit WebAssembly einsteigen möchte: Das [Datasette Lite](/tool/lite-datasette-io)-Projekt ist ein weiteres Beispiel — eine vollständige SQLite-Datenbank, die im Browser-Tab läuft. Der WASM-Trend verdient Aufmerksamkeit. Er ermöglicht eine Klasse von No-Login-Tools, die es vorher einfach nicht geben konnte.

## Wann Squoosh die richtige Wahl ist

Squoosh ist die richtige Wahl, wenn:

- Du mit Fotos oder Grafiken arbeitest, die du lieber nirgendwo hochladen würdest
- Du AVIF- oder JPEG-XL-Kodierung brauchst, ohne Software zu installieren
- Du den Qualitäts-/Größenkompromiss visuell prüfen willst, bevor du herunterlädst
- Du das Maximum aus einer Datei herausholen willst

Für Stapelverarbeitung ist die Squoosh CLI die Antwort. Für Formatkonvertierungen über Bilder hinaus (Dokumente, Audio, Video) deckt [Convertio](/tool/convertio-co) mehr ab. Für SVG speziell läuft [SVGOMG](/tool/jakearchibald-github-io-svgomg) lokal im Browser und optimiert SVGs besser als Squoosh.

Das Szenario, wo Squoosh klar gewinnt: Du hast ein einzelnes hochwertiges Bild, dir liegt die Komprimierungsqualität am Herzen, und du willst nicht, dass die Datei deinen Computer verlässt. Produktfotos vor dem Versand an einen Kunden. Medizinische Bilder. Persönliche Fotos. Rechtsdokumente, die zufällig Bilder sind. In solchen Fällen ist das Hochladen auf einen Drittanbieterdienst nur zum Skalieren einer Datei ein schlechtes Geschäft.

## Ein Tool, das deine Dateien respektiert

Die meisten No-Login-Tools sind „ohne Login", weil sie einfach genug sind, dass Accounts keinen Sinn ergeben. Squoosh ist anders — es ist technisch ausgereift genug, dass es *einen* Account und Serverinfrastruktur erfordern *könnte*, wurde aber bewusst so gebaut, dass es clientseitig läuft. Das ist eine Designentscheidung, keine Einschränkung.

Das Web wird zunehmend fähig, echte Software auszuführen, ohne auf Backend-Server angewiesen zu sein. Squoosh demonstriert das seit 2018. Die Codecs werden besser, die Browser-Unterstützung für AVIF wächst, und die Lücke zwischen „auf einen Server hochladen" und „lokal ausführen" schließt sich weiter.

Falls du es noch nicht ausprobiert hast: [squoosh.app](https://squoosh.app) öffnet sofort ohne Registrierung. Bild reinziehen, Ergebnisse vergleichen, exportieren. Das war's. Für weitere Tools, die so funktionieren — kein Account, kein Upload, kein Tracking — listet das [nologin.tools-Verzeichnis](/tool/nologin-tools) Hunderte davon in allen Kategorien.
