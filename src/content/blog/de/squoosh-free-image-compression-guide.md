---
title: "Bilder kostenlos komprimieren mit Squoosh — Kein Account, kein Upload"
description: "Schritt-für-Schritt-Anleitung zum Komprimieren von Bildern mit Squoosh im Browser. Kein Login, kein Server-Upload — AVIF, WebP, JPEG, PNG-Einstellungen und CLI-Stapelverarbeitung erklärt."
publishedAt: 2026-04-16
author: "nologin.tools"
tags: ["tools", "tutorial", "browser", "open-source"]
featured: false
locale: de
originalSlug: squoosh-free-image-compression-guide
sourceHash: f54e1dbf39ce8747
heroImageQuery: "image compression browser WebAssembly optimize"
---

![Hero image](/blog/images/squoosh-free-image-compression-guide/hero.jpg)

Du musst ein Bild komprimieren. Am besten sofort, ohne Account, ohne Upload auf einen fremden Server und ohne Qualitäts-Roulette mit einem Tool, das dir einfach "komprimiert!" meldet und nichts weiter erklärt. Die üblichen Verdächtigen haben entweder ein 5-MB-Limit im Free-Plan, versehen die Ausgabe mit Wasserzeichen oder lassen dich im Dunkeln darüber, was sie mit deiner Datei gemacht haben.

[Squoosh](https://squoosh.app) löst all das. Browser-Tab öffnen, Bild reinziehen, Einstellungen anpassen, Ergebnis herunterladen. Kein Login nötig. Kein Upload auf einen Remote-Server. Die Komprimierung läuft komplett im Browser — dank WebAssembly-Modulen, die aus denselben Codecs kompiliert wurden, die Produktionssysteme nutzen: MozJPEG, libavif, OxiPNG, libwebp.

Diese Anleitung zeigt, wie du Squoosh effektiv einsetzt: welches Format für welchen Anwendungsfall, welche Einstellungen wirklich einen Unterschied machen und wie du Batch-Jobs erledigst, ohne irgendetwas dauerhaft installieren zu müssen.

## Was Squoosh eigentlich macht — und warum das besonders ist

Die meisten Online-Komprimierer laden deine Datei auf einen Backend-Server hoch, komprimieren sie dort und schicken dir eine kleinere Datei zurück. Das bedeutet: Deine Bilder — Kundenfotos, vertrauliche Mockups, Produktshots vor der Veröffentlichung — liegen für eine gewisse Zeit auf dem Server von jemandem anderen. Du vertraust deren Aufbewahrungsrichtlinie. Deren Sicherheit.

Squoosh kompiliert die Komprimierungs-Codecs zu WebAssembly und führt sie lokal in deinem Tab aus. Nichts verlässt deinen Rechner. Das ist keine Marketing-Behauptung, sondern eine Konsequenz der Architektur. Es gibt schlicht keinen Server, auf den etwas hochgeladen werden könnte.

Squoosh wird von [Google Chrome Labs](https://github.com/GoogleChromeLabs/squoosh) entwickelt und ist Open Source unter Apache 2.0. Einen ausführlichen Vergleich mit Alternativen wie TinyPNG und Convertio findest du in der [Squoosh-Rezension auf dieser Seite](/blog/squoosh-beats-online-image-compressors). Diese Anleitung ist praktisch ausgerichtet: Einstellungen, Workflows, Entscheidungen.

## Welches Format solltest du verwenden?

Die erste Entscheidung ist das Ausgabeformat. Das ist wichtiger als jeder Qualitäts-Slider, weil verschiedene Formate grundlegend unterschiedliche Stärken haben.

| Format | Optimal für | Browser-Support | Größe vs. JPEG |
|--------|-------------|-----------------|----------------|
| MozJPEG | Fotos, hohe Farbkomplexität | Universal | Baseline |
| OxiPNG | Transparente Grafiken, Screenshots | Universal | Größer |
| WebP | Allgemeine Web-Bilder | Alle modernen Browser | ~25% kleiner |
| AVIF | Web-Bilder, beste Komprimierung | Chrome, Firefox, Safari, Edge | ~50% kleiner |
| JPEG XL | Zukunftssicherheit | Eingeschränkt (experimentell) | ~60% kleiner |

Für die meisten Web-Bilder in 2026 ist **AVIF die richtige Standardwahl**. Es erzeugt Dateien, die 30–50 % kleiner sind als WebP bei gleichwertiger visueller Qualität, und der Browser-Support deckt inzwischen jeden großen Browser ab. Wenn du sehr alte Browser unterstützen musst oder Bilder für ein Tool ausgibst, das moderne Formate nicht versteht, ist WebP der sichere Fallback. JPEG bleibt relevant für universelle Kompatibilität — auf jeder Plattform, in jedem Viewer.

PNG ist verlustfrei. Du greifst zu OxiPNG, wenn Transparenz erforderlich ist: Icons, Logos mit transparentem Hintergrund, UI-Screenshots, bei denen pixelgenaues Text-Rendering wichtig ist. Niemals PNG für Fotos — die Dateien werden riesig.

JPEG XL ist technisch beeindruckend, aber der Browser-Support ist noch zu uneinheitlich, um es für die meisten Produktionsanwendungen zu empfehlen.

## Einstellungen, die wirklich einen Unterschied machen

Sobald du ein Format gewählt hast, ist der Qualitäts-Slider die Hauptkontrolle. Aber "Qualität" bedeutet bei verschiedenen Codecs etwas anderes, und die Zahlen sind nicht direkt vergleichbar.

**Web-Fotos und Hero-Images**: Starte bei AVIF-Qualität 60–70. Das klingt aggressiv, aber AVIF verarbeitet niedrige Qualitätseinstellungen deutlich eleganter als JPEG. Bei Qualität 60 zeigt ein JPEG typischerweise sichtbare Blockartefakte; AVIF sieht bei der nominell gleichen Einstellung erheblich sauberer aus. Bestätige das mit dem Vergleichs-Slider (dazu später mehr).

**Produktfotografie für E-Commerce**: WebP bei Qualität 75–80, oder MozJPEG bei 75, wenn du maximale Formatkompatibilität brauchst. Produktbilder brauchen feine Details an Kanten und Texturen — unter Qualität 70 wirst du meist Weichzeichnung bei Stoffen, geprägtem Text und filigranen Formen sehen.

**Screenshots und UI-Aufnahmen**: OxiPNG mit Kompressionsstufe 3. Höhere Stufen reduzieren die Dateigröße weiter, brauchen aber merklich länger. Stufe 3 ist der praktische Sweet Spot für die meisten Screenshots. Enthält das Bild große einfarbige Flächen — bei UI-Aufnahmen häufig —, schlägt OxiPNG oft AVIF, weil verlustfreie Komprimierung gleichmäßige Bereiche sehr effizient verarbeitet.

**Thumbnails und Avatare**: WebP bei Qualität 80, skaliert auf die tatsächliche Anzeigedimension. Squoosh hat ein Resize-Panel — nutze es. Ein 3024-Pixel-Original bei 120 Pixel Displaygröße auszuliefern ist einer der häufigsten Bildperformance-Fehler, und keine Menge Komprimierung löst das Grundproblem.

**Hintergrundbilder und Texturen**: Die vertragen aggressive Komprimierung gut, weil sie mit niedrigem visuellem Fokus wahrgenommen werden. AVIF bei Qualität 50–60 reicht meist; du wirst kaum einen Qualitätsunterschied bemerken, wenn ein Bild hinter Text liegt.

Als Faustregel: Starte bei Qualität 75 für AVIF/WebP oder 80 für JPEG. Dann zeigt dir der Vergleichs-Slider, wie weit du gehen kannst.

## Den Vergleichs-Slider effektiv nutzen

Der Vergleichs-Slider ist das, was Squoosh von Tools unterscheidet, die dir ein Ergebnis ohne Erklärung liefern. Du siehst das Original links, die komprimierte Ausgabe rechts, mit Dateigrößen in Echtzeit unten. Ziehe den Teiler, um beide Seiten zu sehen.

Die Technik: Slider in die Mitte, dann konzentriere dich auf die Bildpartien, die sich am schlechtesten komprimieren lassen — scharfe Kanten, feiner Text, sanfte Farbverläufe und menschliche Gesichter. Hier erscheinen Artefakte zuerst. Wenn du in diesen Bereichen keinen wesentlichen Unterschied siehst, ist die aktuelle Qualitätseinstellung angemessen. Wenn du Weichzeichnung, Blockbildung oder Farbbanding siehst, erhöhe die Qualität.

Bei AVIF speziell: Beobachte Farbübergänge, nicht nur Kanten. AVIF kann bei niedrigen Qualitätseinstellungen subtiles Farbbanding in sanften Verläufen erzeugen — am deutlichsten in Himmelsfotos oder Hintergründen mit weichen Farbübergängen, weniger in detailreichen Produktfotos.

Bei OxiPNG bestätigt der Vergleichs-Slider hauptsächlich, dass die verlustfreie Komprimierung korrekt funktioniert hat. Die Ausgabe sollte identisch mit dem Original aussehen — wenn nicht, ist etwas Unerwartetes passiert (selten, aber einen kurzen Check wert).

Wenn die Qualität stimmt, prüfe die Dateigrößenreduktion in der Squoosh-Oberfläche. Ein vernünftiges Ergebnis für Web-Bilder ist 60–80 % kleiner als das Original. Wenn du weniger als 40 % Reduktion bei einem JPEG-Foto bekommst, das in AVIF konvertiert wird, probiere eine niedrigere Qualität — du lässt mit ziemlicher Sicherheit Einsparungen auf dem Tisch liegen.

## Skalieren: Der Schritt, den viele überspringen

Qualitätseinstellungen sind nicht der einzige Hebel. Auf tatsächliche Anzeigedimensionen zu skalieren liefert oft größere Dateigrößeneinsparungen als jede Qualitätsanpassung.

Das Resize-Panel von Squoosh lässt dich eine Zielbreite oder -höhe festlegen. Ein paar Hinweise zu den Algorithmus-Optionen: **Lanczos3** liefert das schärfste Ergebnis mit minimalem Aliasing und ist für die meisten Fotos die richtige Wahl. **Triangle** ist schneller, aber weicher. **Mitchell** liegt dazwischen.

Bevor du den Qualitäts-Slider anfasst, frag dich, ob du die Originalauflösung brauchst. Wenn deine Website Blog-Bilder bei 800 Pixel Breite zeigt, ist ein 3024-Pixel-Original selbst bei maximaler Komprimierung verschwendete Daten. Erst skalieren, dann komprimieren. Die kombinierten Einsparungen sind fast immer größer als jeder einzelne Ansatz allein.

Squoosh wendet die Skalierung vor der Komprimierung an — das ist die richtige Reihenfolge. Du setzt finale Dimensionen im Resize-Panel, passt die Qualität im Kompressions-Panel an, und die heruntergeladene Datei spiegelt beide Änderungen wider.

## Mehr als eine Datei auf einmal

Squooshs Web-UI verarbeitet ein Bild nach dem anderen. Für die Komprimierung eines ganzen Ordners in einem Durchgang ist das Squoosh CLI die Antwort — und es erfordert keine dauerhafte Installation.

Mit installiertem Node.js führe aus:

```bash
npx @squoosh/cli --avif '{"quality":65}' *.jpg
```

Das komprimiert jede JPEG-Datei im aktuellen Verzeichnis zu AVIF bei Qualität 65 und schreibt Ausgabedateien neben die Originale mit der Erweiterung `.avif`. Für WebP: `--webp '{"quality":80}'`. Für MozJPEG: `--mozjpeg '{"quality":75}'`. Gleichzeitig skalieren: `--resize '{"width":1200}'`.

Das CLI verwendet dieselben WebAssembly-Module wie die Web-UI, die Ausgabe ist also identisch. Besonders praktisch für Workflows, bei denen du einen Ordner mit Rohfotos hast, die web-ready sein müssen, bevor du sie in ein CMS oder eine Publishing-Pipeline hochlädst. Keine dauerhafte Installation, kein Abonnement, kein Server.

## Wann Squoosh nicht das richtige Tool ist

Squoosh verarbeitet Rasterbilder. Für SVG-Dateien ist [SVGOMG](/tool/jakearchibald-github-io-svgomg) das Äquivalent — ebenfalls lokal im Browser ausgeführt, ohne Dateigrößenlimits, ohne Account. SVGs nicht durch Squoosh jagen.

Bei sehr großen Dateien — Panoramen mit 100+ Megapixeln, TIFF-Dateien von Mittelformatkameras — kann Squoosh den Browser-Speicher erschöpfen. Desktop-Tools kommen damit besser zurecht.

Wenn du schnelle JPEG- oder PNG-Komprimierung ohne Qualitätskontrolle brauchst und dir Datei-Privatsphäre egal ist, ist [TinyPNG](/tool/tinypng-com) für diese spezifische Aufgabe schneller. Es automatisiert die Entscheidung und überspringt den Slider. Nützlich, wenn dir der Kompromiss egal ist und du einfach etwas Kleineres willst.

Für Formatkonvertierungen jenseits von Bildern — Dokumente, Video, Audio — hilft Squoosh nicht weiter. Es ist gezielt für Bildkomprimierung gebaut.

## Ein paar Praktiken, die sich lohnen

Dateien vor dem Herunterladen umbenennen. Squoosh erzeugt Namen wie `image-compressed.avif`. Wenn du mehrere Dateien in einer Session verarbeitest, ohne umzubenennen, landest du am Ende mit `image-compressed (1).avif`, `image-compressed (2).avif` und so weiter.

Das Original behalten. AVIF- und WebP-Komprimierung ist verlustbehaftet. Wenn du später eine andere Qualitätsstufe oder ein anderes Ausgabeformat brauchst, willst du vom Original ausgehen — das Komprimieren einer bereits komprimierten Datei stapelt Qualitätsverluste.

Nicht dieselbe Qualitätszahl auf jedes Bild anwenden. Eine detaillierte Nahaufnahme komprimiert sich anders als eine weite Landschaft bei nominell gleicher Einstellung. Ein Qualitätswert, der bei einem Bild unsichtbare Degradierung bedeutet, kann bei einem anderen klar sichtbar sein. Der Slider gibt dir die Antwort — vertraue ihm mehr als festen Zahlen.

---

Bildoptimierung ist eine dieser Aufgaben, bei denen es sich lohnt, sie richtig zu machen. Das richtige Tool ist kostenlos, funktioniert ohne Account und läuft vollständig in deinem Browser. Für weitere Tools dieser Kategorie — kein Login, kein Upload, kein Tracking — hat [nologin.tools](/tool/nologin-tools) Hunderte, geordnet nach Anwendungsfall.
