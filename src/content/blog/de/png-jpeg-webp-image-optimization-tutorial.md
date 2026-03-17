---
title: "PNG, JPEG oder WebP? Ein praktisches Tutorial zur Bildoptimierung"
description: "Ein Format-zuerst-Leitfaden zum Komprimieren, Konvertieren und Skalieren von Bildern mit browserbasierten Tools ohne Anmeldung — inklusive konkreter Qualitätseinstellungen und Plattformdimensionen."
publishedAt: 2026-03-17
author: "nologin.tools"
tags: ["tutorial", "tools", "browser", "guide"]
featured: false
locale: de
originalSlug: png-jpeg-webp-image-optimization-tutorial
sourceHash: 4deafb9217a610ad
heroImageQuery: "image format comparison compression web optimization"
---

![Hero image](/blog/images/png-jpeg-webp-image-optimization-tutorial/hero.jpg)

Die meisten Menschen wählen ein Dateiformat zufällig aus. Sie exportieren aus Figma, speichern aus Photoshop oder machen einen Screenshot — und welches Format dabei herauskommt, das nehmen sie. Dann werfen sie die Datei in einen Kompressor und hoffen, dass sie kleiner wird, ohne zu verstehen, warum das manchmal nicht so klappt wie erhofft.

Die Formatwahl ist wichtiger als die Komprimierungseinstellungen. Ein JPEG, das mit Qualität 85 komprimiert wird, ist kleiner als ein PNG mit denselben Einstellungen — nicht weil der Kompressor härter arbeitet, sondern weil JPEG und PNG Bilddaten auf fundamental unterschiedliche Weise kodieren. Die richtige Formatentscheidung zu treffen, bevor du überhaupt ein Komprimierungstool öffnest, spart mehr Bytes als jeder Slider.

Dieses Tutorial behandelt zuerst die Formatentscheidung und dann konkrete Tools und Einstellungen zum Komprimieren, Konvertieren und Skalieren. Alles hier funktioniert ohne Account.

## Die Formatentscheidung, die du vor allem anderen treffen solltest

Drei Formate decken fast alle Web- und Alltagsanwendungsfälle ab: JPEG, PNG und WebP. Klarer Überblick:

**JPEG** ist für Fotos und Bilder mit kontinuierlichen Tonverläufen — Porträts, Landschaften, Essensfotos. Es nutzt verlustbehaftete Komprimierung, die gezielt ausnutzt, wie das menschliche Auge Farbe versus Helligkeit wahrnimmt. Deshalb sieht ein JPEG-Foto bei Qualität 80 nahezu identisch zum Original aus, hat aber nur etwa die Hälfte der Dateigröße. Sanfte Farbübergänge handhabt JPEG gut, aber bei harten Kanten (Text, Logos, Icons) entstehen die typischen Blockartefakte.

**PNG** ist für Screenshots, Illustrationen, Logos, Icons und alles, das exakte Pixelwerte oder Transparenz benötigt. PNG ist verlustfrei — es komprimiert ohne Datenverlust. Deshalb ist ein PNG eines Fotos immer größer als ein JPEG desselben Fotos. Niemals PNG für Fotos verwenden. Immer PNG für Dinge mit scharfen Kanten, Transparenz oder Text.

**WebP** ist für alles — und dabei kleiner. [WebP](https://developers.google.com/speed/webp) erzeugt Dateien, die für Fotos etwa 25–35 % kleiner als JPEG und für Grafiken etwa 26 % kleiner als PNG sind, bei vergleichbarer visueller Qualität. Die Browserunterstützung liegt mittlerweile bei [97 % weltweit](https://caniuse.com/webp) — Safari ergänzte die Unterstützung 2020 als Letzter. Fürs Web gibt es kaum noch einen Grund, JPEG oder PNG zu liefern, wenn man WebP anbieten kann.

Der praktische Entscheidungsbaum: Wenn du für das Web speicherst, nimm WebP. Wenn etwas PNG erfordert (transparenter Hintergrund, exakte Farbgenauigkeit für den Druck), nimm PNG. Wenn du an jemanden sendest, der das Bild später bearbeiten muss, nimm JPEG für Fotos und PNG für Grafiken. Bei E-Mail-Anhängen oder dem Hochladen auf Plattformen ohne WebP-Support: JPEG für Fotos, PNG für alles andere.

## Komprimieren mit Squoosh: die Einstellungen, die wirklich zählen

Wenn du ein einzelnes Bild sorgfältig komprimieren möchtest — ein Hero-Bild, ein Produktfoto, ein Portfolio-Stück — ist [Squoosh](https://squoosh.app) das richtige Tool. Es wurde vom Google Chrome-Team entwickelt, läuft vollständig in WebAssembly, und deine Dateien verlassen nie den Browser.

Squoosh öffnen, Bild reinziehen. Die Oberfläche zeigt links das Original und rechts die bearbeitete Version, getrennt durch eine verschiebbare Trennlinie. Im rechten Bereich wählst du das Ausgabeformat und passt die Einstellungen an.

Für Web-Bilder: starte mit **WebP bei Qualität 80**. Diese Einstellung deckt die meisten Anwendungsfälle ab — visuell fast identisch wie das Original, aber deutlich kleinere Dateien als JPEG mit demselben Qualitätswert. Die Größenschätzung unten rechts aktualisiert sich beim Verschieben des Sliders in Echtzeit. Beobachte, was zwischen Qualität 75 und 85 passiert: Du wirst typischerweise erhebliche Byteeinsparungen beim Heruntergehen auf 75 sehen, mit kaum sichtbaren Änderungen — und dann deutlichere Qualitätsverluste unter 70. Qualität 80 ist der Sweet Spot für die meisten Fotoaufnahmen.

Für Bilder mit Text, harten Linien oder Transparenz: Ausgabeformat auf **WebP (verlustfrei)** umstellen. Squoosh warnt, dass dies größer ist als verlustbehaftet, aber die exakten Pixelwerte bleiben erhalten. Vergleiche das Ergebnis mit einer verlustbehafteten Komprimierung und prüfe, ob der Unterschied bei deiner Anzeigedimension sichtbar ist.

Squoosh handhabt auch die Skalierung im Bereich „Bearbeiten". Zielbreite in Pixeln eingeben — oder auf den Prozenttoggle klicken und 50 % eingeben, um die Dimensionen zu halbieren — und den Seitenverhältnis-Lock aktivieren. Der **Lanczos3**-Skalierungsalgorithmus ist für Fotos die richtige Wahl; er erhält die Schärfe besser als bilinear oder Box. Für Icons oder Pixel-Art beim Vergrößern lieber „Nächster Nachbar" verwenden, um harte Kanten zu erhalten statt sie zu verwischen.

Eine Sache, die Squoosh nicht kann: Stapelverarbeitung. Es ist immer eine Datei auf einmal — gut für ein bestimmtes Bild, das du bearbeitest, aber unpraktisch für 40 Produktfotos.

## Stapelkomprimierung ohne Account

Wenn Menge wichtiger ist als Kontrolle über jedes einzelne Bild, verarbeitet [TinyPNG](https://tinypng.com) bis zu 20 Bilder auf einmal — ohne Account. Einen Bildordner in das Upload-Feld ziehen, und alle werden parallel verarbeitet.

TinyPNG's Algorithmus für PNG-Dateien nutzt selektive Farbquantisierung: Die Zahl der unterschiedlichen Farben wird von bis zu 16 Millionen auf eine kleinere Palette reduziert, dann wird das Ergebnis standard-komprimiert. Der visuelle Unterschied ist typischerweise nicht wahrnehmbar. PNG-Dateien schrumpfen häufig um 60–80 % — manchmal mehr bei einfachen Grafiken mit großen einfarbigen Flächen.

Bei JPEG-Dateien re-encodiert TinyPNG mit aggressiverer Quantisierung und entfernt Metadaten (EXIF-Daten, Farbprofile, eingebettete Kommentare). Ein 3 MB-Handyfoto kommt oft unter 500 KB raus. Der Algorithmus trifft die Qualitätsentscheidung für dich, und er ist gut kalibriert.

Kein Tageslimit auf der kostenlosen 20-Datei-Stufe — jeder Batch von 20 ist unabhängig. Einen Batch fertigstellen, nächste 20 Bilder reinziehen. Für 200 Fotos sind das 10 Drag-and-Drops. Mühsam, aber ohne Account oder API-Kosten.

Eine ehrliche Einschränkung: TinyPNG lädt Dateien auf seine Server hoch. Bilder werden nach kurzer Zeit gelöscht, aber wenn du sensible Bilder komprimierst (Rechtsdokumente, medizinische Fotos, privates Material), bleib besser bei Squooshs lokaler Verarbeitung. Für Produktfotos oder Blog-Bilder ist die serverseitige Verarbeitung ein vertretbarer Kompromiss.

## Skalieren für spezifische Plattformen

„Auf die richtigen Abmessungen skalieren" klingt simpel, bis man acht verschiedene empfohlene Größen für acht verschiedene Plattformen vor sich hat. Hier sind die aktuellen Standardabmessungen für gängige Fälle:

| Plattform / Anwendungsfall | Empfohlene Abmessungen | Format |
|---------------------------|------------------------|--------|
| Web-Hero-Bild | 1920×1080 oder 1440×900 | WebP |
| Blog-Beitragsbild | 1200×675 (16:9) | WebP oder JPEG |
| Open Graph / Link-Vorschau | 1200×630 | JPEG (breite Kompatibilität) |
| Twitter/X-Post-Bild | 1600×900 | JPEG oder WebP |
| Instagram quadratisch | 1080×1080 | JPEG |
| Instagram Story / Reel | 1080×1920 | JPEG |
| LinkedIn-Banner | 1584×396 | JPEG |
| E-Mail-Newsletter-Bild | max. 600px breit | JPEG |
| Favicon | 32×32, 180×180 (Apple) | PNG |

Zum Skalieren können die gleichen Tools wie zum Komprimieren verwendet werden. Squoosh (mit geöffnetem Bearbeiten-Bereich) und [ezGIF](https://ezgif.com) erlauben beide die Angabe exakter Pixeldimensionen. Für mehr Kontrolle — Zuschneiden auf ein genaues Seitenverhältnis, Neupositionierung von Inhalten innerhalb eines Rahmens — ist [Photopea](https://www.photopea.com) die leistungsfähigste kostenlose Option ohne Login. Es lädt einen vollständigen Photoshop-ähnlichen Editor im Browser und lässt dich Leinwandgröße, Zuschnitt und Bildgröße genauso steuern wie in Photoshop — ohne Account.

## HEIC und andere exotische Formate konvertieren

iPhones fotografieren standardmäßig in HEIC (manchmal als HEIF geschrieben). Es ist ein ausgezeichnetes Format — kleiner als JPEG bei besserer Qualität — aber noch nicht allgemein akzeptiert. WordPress lehnt es ab. Die meisten Webbrowser zeigen es nicht an. E-Mail-Clients rendern es inkonsistent.

Für HEIC-zu-JPEG-Konvertierung erledigt [ezGIF](https://ezgif.com) das ohne Anmeldung. Den Tab „Image Converter" aufrufen, eine HEIC-Datei hochladen, JPEG als Ausgabe wählen und das Ergebnis herunterladen. Die Konvertierung funktioniert, wobei ezGIF für große Batches nicht das Schnellste ist.

[Convertio](https://convertio.co) verarbeitet RAW-Kameraformate (CR2, NEF, ARW), Game-Texturen (DDS) und HDR-Formate wie EXR — Dinge, die die meisten Bildtools stillschweigend überspringen. Kostenlose Konvertierungen ohne Account sind auf etwa 10 pro Tag und 100 MB pro Datei begrenzt, was für gelegentliche Nutzung ausreicht. Dateien werden auf Convertios Server hochgeladen, also die [Datenschutzerklärung](https://convertio.co/privacy) für sensibles Material prüfen.

Für SVG-Dateien speziell: Design-Tools wie Figma exportieren SVGs vollgepackt mit Editor-Metadaten, Inline-Styles und numerischer Präzision bis zu 8 Dezimalstellen. Die Dateien sind technisch valide, aber unnötig groß. Vor dem Deployment durch [SVGOMG](/tool/jakearchibald-github-io-svgomg) laufen lassen — einen browserbasierten SVG-Optimierer. Typische Einsparungen bei einem Figma-Export liegen bei 40–70 %, vollständig clientseitig verarbeitet.

## Ein realistischer Workflow für die häufigsten Fälle

Für die meisten Menschen in den meisten Situationen sieht der richtige Workflow so aus:

**Handyfoto → Website**: In Squoosh öffnen, Ausgabe auf WebP setzen, Qualität 80, auf 1200px Breite skalieren. Fertig. Die Datei liegt für fast jedes Foto unter 200 KB.

**Produktfotos (Stapel)**: Bis zu 20 auf einmal in TinyPNG ziehen. Herunterladen, wiederholen. Keine Formatkonvertierung, nur Größenreduzierung.

**Screenshot → Blog-Beitrag**: Squoosh oder TinyPNG. Screenshots von dunklen UIs komprimieren sich mit verlustfreiem WebP besonders gut.

**HEIC vom iPhone → teilbares JPEG**: ezGIF-Bildkonverter, HEIC-Eingabe, JPEG-Ausgabe.

**Logo oder Icon für Website**: Wenn du das SVG hast, mit SVGOMG optimieren. Wenn du ein PNG brauchst, aus dem Design-Tool exportieren und dann durch TinyPNG laufen lassen.

**Ungewöhnliche Formate konvertieren**: Convertio für Formate, die die anderen Tools nicht beherrschen.

> Das Beste, was die meisten Menschen für ihre Bilddateien tun können, ist der Wechsel von JPEG auf WebP für die Web-Ausgabe. Das zweitbeste ist, vor dem Komprimieren auf die tatsächlichen Anzeigedimensionen zu skalieren — es hat keinen Sinn, ein 3000px-breites Bild zu liefern, das bei 800px angezeigt wird. Beide Schritte sind kostenlos, sofort ausführbar und erfordern keinen Account.

Die hier beschriebenen Tools sind im [nologin.tools-Verzeichnis](/tool/squoosh-app) verifiziert. Das [HTTP Archive Web Almanac](https://almanac.httparchive.org/en/2024/media) zeigt konstant, dass Bilder die größte Asset-Kategorie im Web sind und dass die WebP/AVIF-Akzeptanz weit unter dem liegt, was Browser verarbeiten könnten. Die Lücke zwischen dem technisch Möglichen und dem, was die meisten Seiten tatsächlich ausliefern, ist noch groß — und sie schließt sich eine Datei nach der anderen.

Wenn du einen breiteren Überblick haben möchtest, was diese Tools jenseits der hier beschriebenen Grundlagen abdecken, geht der frühere Artikel über [Bildkomprimierungs- und Konvertierungstools](/blog/compress-convert-resize-images-no-login) tiefer auf Formatentscheidungen und Tool-Abwägungen ein.
