---
title: "Bilder komprimieren, konvertieren und skalieren ohne Registrierung"
description: "Die besten browserbasierten Bildtools für Komprimierung, Formatkonvertierung und Skalierung — ohne Konto, ohne Software, ohne Upload-Limits, die eine Registrierung erfordern."
publishedAt: 2026-03-12
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "guide"]
featured: false
locale: de
originalSlug: compress-convert-resize-images-no-login
sourceHash: 18af3124efd343de
---

![Hero image](/blog/images/compress-convert-resize-images-no-login/hero.jpg)

Bilder sind für etwa die Hälfte des Gewichts einer durchschnittlichen Webseite verantwortlich. Nicht JavaScript, nicht CSS — Bilder. Und dennoch verlangen die Tools, zu denen die meisten greifen, wenn sie ein Foto komprimieren, ein PNG in WebP umwandeln oder etwas für eine bestimmte Plattform skalieren müssen, ein Konto, bevor man auch nur einen Regler anfassen darf.

Das ist zu viel Aufwand für eine Fünf-Sekunden-Aufgabe.

Es gibt eine ganze Kategorie von Bildtools, die vollständig im Browser laufen, Dateien clientseitig verarbeiten ohne sie auf einen Server hochzuladen, und nichts weiter verlangen als das Öffnen eines Tabs. Manche stammen von Google. Andere sind Ein-Entwickler-Projekte mit Millionen monatlicher Nutzer. Alle sind kostenlos und funktionieren ohne Registrierung.

## Warum die Formatwahl wichtiger ist als du denkst

Die meisten komprimieren Bilder ohne über das Format nachzudenken. Sie haben ein JPEG, machen es kleiner, fertig. Aber die Formatauswahl ist oft wichtiger als die Komprimierungseinstellung selbst.

[WebP](https://developers.google.com/speed/webp) — ein von Google entwickeltes Format — erzeugt Dateien, die bei gleicher visueller Qualität etwa 25-34 % kleiner sind als JPEG. AVIF, das neuere Format, das von Netflix und der Alliance for Open Media unterstützt wird, kann die Dateigröße im Vergleich zu JPEG um bis zu 50 % reduzieren. Beide Formate werden inzwischen von allen wichtigen Browsern unterstützt. Wenn du Bilder für eine Website optimierst, kann der bloße Wechsel von JPEG zu WebP deine Nutzlast um ein Drittel reduzieren — noch bevor du an einem Qualitätsregler drehst.

Deshalb ist ein Tool, das neben Komprimierung auch Formatkonvertierung beherrscht, nützlicher als eines, das nur dein vorhandenes JPEG verkleinert. Für die meisten Web-Arbeiten lautet die Antwort: in WebP konvertieren, auf etwa 80 % Qualität komprimieren, fertig. Zwei Login-freie Tools machen das trivial einfach.

## Squoosh: das erste, das du ausprobieren solltest

Wenn du ein Bild mit echter Kontrolle über das Ergebnis komprimieren musst, ist [Squoosh](https://squoosh.app) die leistungsstärkste Option in diesem Bereich. Es ist ein Open-Source-Tool von Google, das vollständig in WebAssembly läuft — deine Datei verlässt nie den Browser.

Der Workflow ist eine nebeneinander angeordnete Vergleichsansicht: Original links, komprimierte Vorschau rechts. Format auswählen (MozJPEG, WebP, AVIF, JPEG XL, PNG, OxiPNG und mehr), Qualitätsregler ziehen und die Größenschätzung in Echtzeit aktualisieren sehen. Die Differenzanzeige zeigt genau, wie viele Kilobyte du als Prozentsatz des Originals sparst.

Was Squoosh besser als die meisten Alternativen macht: Es vereinfacht nicht zu sehr. Du kannst Chroma-Subsampling anpassen, Kodierungsgeschwindigkeit wählen und erweiterte Codec-Einstellungen verfeinern, wenn du weißt, was das bedeutet. Oder das alles ignorieren und einfach den Qualitätsregler bewegen. So oder so bekommst du eine Live-Vorschau, bevor du bestätigst — was bei Login-freien Tools selten ist.

Es verwaltet auch die Skalierung: Breite und Höhe mit optionaler Seitenverhältnissperre und mehrere Skalierungsalgorithmen (Lanczos für Schärfe, Mitchell für Fotos mit leichtem Ringing an den Kanten). Sieh dir den [Squoosh-Eintrag auf nologin.tools](/tool/squoosh-app) für die vollständige Liste der Fähigkeiten an. Die einzige Einschränkung: Es verarbeitet ein Bild nach dem anderen, was lästig ist, wenn du einen Ordner mit 50 Fotos hast.

## TinyPNG: schnell und vollständig automatisch

[TinyPNG](https://tinypng.com) löst das Batch-Problem. Bis zu 20 Bilder gleichzeitig ablegen (bis zu 5 MB pro Stück, ohne Konto) und es komprimiert sie mit verlustbehafteter Optimierung, die die Farbpalette selektiv auf eine Weise reduziert, die die meisten Menschen nicht bemerken. PNG-Dateien schrumpfen typischerweise um 60-80 %. JPEG und WebP werden ebenfalls unterstützt.

Die Erfahrung ist eine Drag-and-Drop-Zone, ein Fortschrittsbalken und ein Download-Link. Nichts zu konfigurieren. Das ist eine Designentscheidung — der Algorithmus trifft die Entscheidungen für dich, und er ist gut genug, dass du das wahrscheinlich nicht hinterfragen wirst.

Im Gegensatz zu Tools, die für Batch-Verarbeitung eine Registrierung erfordern, gilt TinyPNGs Limit von 20 Dateien pro Batch, nicht pro Tag. Einfach weitere 20 Bilder ablegen, wenn der erste Batch fertig ist. Für Fotografen, die eine Galerie vor dem Upload vorbereiten, oder Entwickler, die Image-Assets vor einem Deployment aufräumen, hält dieser Workflow ohne Konto.

Die gleiche Komprimierungsqualität wie die Browser-Version ist als Entwickler-API und WordPress-Plugin verfügbar — aber die Web-Version ist die kostenlose Login-freie Option. Das [TinyPNG-Profil auf nologin.tools](/tool/tinypng-com) zeigt, was in der kostenlosen Stufe im Vergleich zum kostenpflichtigen Plan enthalten ist.

## ezGIF: weit mehr als der Name vermuten lässt

Der Name unterschätzt es gewaltig. [ezGIF](https://ezgif.com) ist eines der umfassendsten Bildtools ohne Konto, und es verarbeitet weit mehr als animierte GIFs.

Für GIF-Arbeit: aus einer Videodatei oder Bildsequenz erstellen, Frame-Timing optimieren, Farben reduzieren, zuschneiden, skalieren, umkehren, Text hinzufügen. Der GIF-Optimierer ist besonders nützlich — animierte GIFs sind berüchtigt für ihre Größe, und die Optimierung von ezGIF reduziert sie typischerweise um 30-40 % ohne sichtbaren Qualitätsverlust.

Aber die Tool-Liste geht weit über GIFs hinaus. Es gibt einen JPG/PNG/WebP-Optimierer, einen Skalierer, der prozentuale oder pixelspezifische Dimensionen verwaltet, einen Formatkonverter (unterstützt AVIF, HEIC, BMP, TIFF und andere, die viele „moderne" Alternativen stillschweigend übergehen), einen Bild-zu-PDF-Konverter und einen Sprite-Sheet-Cutter für CSS-Sprite-Arbeit.

Die Oberfläche ist funktional — Tabs oben, ein Upload-Bereich, Ergebnisse unten. Sie wurde seit etwa 2014 nicht redesignt und das sieht man. Aber jede Funktion arbeitet, und die Dateitypunterstützung ist ungewöhnlich breit: HEIC von iPhones, TIFF von Scannern, AVIF von neueren Kameras. Wenn ein Format existiert, verwaltet ezGIF es wahrscheinlich. Vollständiges Profil bei [ezGIF auf nologin.tools](/tool/ezgif-com).

## Convertio und SVGOMG: für Sonderfälle

Einige Formatkonversionen sind obskur genug, dass die meisten Tools sie nicht unterstützen. [Convertio](https://convertio.co) deckt über 300 Dateiformate zwischen Bildern, Dokumenten, Audio und Video ab. Für spezifische Bildarbeit: Es verarbeitet Kamera-RAW-Formate (CR2, NEF, ARW), DDS (Spieltexturen), TGA, EXR (HDR-Format von VFX-Pipelines) und andere, die spezialisierte Tools auslassen.

Kostenlose Konversionen ohne Registrierung sind auf ein vernünftiges Tageslimit und 100 MB pro Datei beschränkt. Dateien werden auf Convertios Server hochgeladen (im Gegensatz zur clientseitigen Verarbeitung von Squoosh), also für sensible Bilder deren [Datenschutzrichtlinie](https://convertio.co/privacy) vorher prüfen. Für die Konvertierung eines Produkt-Mockups von RAW zu JPG oder eines Icons von SVG zu ICO ist es prima. Für alles Vertrauliche ist die lokale Verarbeitung von Squoosh die sicherere Wahl. Sieh [Convertio auf nologin.tools](/tool/convertio-co).

SVG-Dateien sind ein völlig anderes Problem. Design-Tools wie Figma und Adobe Illustrator exportieren SVGs, die mit Editor-Metadaten, redundanten Gruppenelementen, Zahlen mit 8 Dezimalstellen Genauigkeit und Inline-Styles geladen sind, die Attribute sein könnten. [SVGOMG](https://jakearchibald.github.io/svgomg/) ist das browserbasierte Frontend für SVGO — ein SVG ablegen und es entfernt das Rauschen während es eine Live-Vorschau anzeigt. Typische Einsparungen bei Figma-Exporten betragen 40-70 %. Das Toggle-Panel erlaubt es, einzelne Optimierungen zu deaktivieren, wenn eine einen bestimmten SVG-Trick bricht. Kein Upload, kein Konto, alles lokal. Profil bei [SVGOMG auf nologin.tools](/tool/jakearchibald-github-io-svgomg).

## Welches Tool für welche Aufgabe?

Hier die ehrliche Karte, denn diese Tools konkurrieren nicht miteinander — sie decken unterschiedliche Bedürfnisse ab:

| Aufgabe | Bestes Tool | Verlassen Dateien den Browser? |
|---------|-------------|-------------------------------|
| Ein Bild mit Formatkontrolle komprimieren | Squoosh | Nein |
| PNG/JPEG/WebP in Batches komprimieren | TinyPNG | Ja (serverseitig) |
| GIFs erstellen oder optimieren | ezGIF | Ja (serverseitig) |
| Skalieren mit Algorithmusoptionen | Squoosh oder ezGIF | Nein / Ja |
| Ungewöhnliche Formatkonvertierung (RAW, DDS, EXR) | Convertio | Ja (serverseitig) |
| SVG aus einem Design-Tool optimieren | SVGOMG | Nein |

Die Spalte „Verlassen Dateien den Browser?" ist für den Datenschutz relevant. Squoosh und SVGOMG senden deine Datei nirgendwo hin — alles passiert in WebAssembly oder JavaScript in deinem Tab. TinyPNG, ezGIF und Convertio laden auf ihre Server hoch, verarbeiten und geben Ergebnisse zurück. Alle drei haben kurze deklarierte Aufbewahrungsfristen (typischerweise 24 Stunden oder weniger), aber du vertraust ihrer Richtlinie.

Für die meisten täglichen Aufgaben — ein Produktfoto komprimieren, ein Header-Bild skalieren, ein JPEG in WebP konvertieren — ist die serverseitige Verarbeitung ein vernünftiger Kompromiss für die Bequemlichkeit und Formatunterstützung, die diese Tools bieten. Für medizinische Bilder, rechtliche Dokumente oder alles Persönliche, das du lieber nicht auf dem Server von jemandem hättest: Squoosh.

> Tools, die ohne dich einzusperren überleben, sind tendenziell die, die wirklich gut sind. Squoosh wird vom Google Chrome-Team nicht als Produkt mit einem Monetarisierungsplan aufgebaut und gepflegt, sondern als Referenzimplementierung für moderne Bild-Codecs. Diese Ausrichtung der Anreize — „Bildkomprimierung gut für das Web machen" — produziert ein besseres Tool als „Nutzer Konten anlegen lassen".

Laut dem [HTTP Archive Web Almanac](https://almanac.httparchive.org) hat die WebP-Übernahme im Web erheblich zugenommen, aber JPEG und PNG dominieren nach wie vor. Die Lücke zwischen dem, was moderne Browser unterstützen, und dem, was die meisten Websites tatsächlich ausliefern, entspricht realem Leistungspotenzial, das auf dem Tisch bleibt. Keines der Tools, um diese Lücke zu schließen, verlangt, dass du zuerst deine E-Mail-Adresse angibst.

Das breitere Verzeichnis von [nologin.tools](/tool/nologin-tools) katalogisiert verifizierte datenschutzfreundliche Tools in Dutzenden von Kategorien. Der Bereich der Bildtools ist einer der umfassendsten — es gibt keine Knappheit an Diensten, die entdeckt haben, dass „ohne Registrierung" ein Feature ist, kein Kompromiss, und die Sammlung wächst weiter.
