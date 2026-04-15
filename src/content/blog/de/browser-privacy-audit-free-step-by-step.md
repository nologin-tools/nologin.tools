---
title: "Browser-Datenschutz kostenlos prüfen — kein Account nötig"
description: "Eine Schritt-für-Schritt-Anleitung, um zu testen, was dein Browser preisgibt — mit kostenlosen Tools ohne Anmeldung. Prüfe IP-Leaks, DNS-Leaks und die Einzigartigkeit deines Fingerprints."
publishedAt: 2026-04-15
author: "nologin.tools"
tags: ["privacy", "browser", "guide", "tools"]
featured: false
heroImageQuery: "browser privacy security audit magnifying glass"
locale: de
originalSlug: browser-privacy-audit-free-step-by-step
sourceHash: 9d9947ee9e2f5374
---

![Hero image](/blog/images/browser-privacy-audit-free-step-by-step/hero.jpg)

Die meisten Datenschutztipps lassen den wichtigsten Schritt aus: tatsächlich zu überprüfen, was passiert. Einstellungen ändern und Erweiterungen installieren lässt sich leicht empfehlen. Was schwieriger ist — und viel nützlicher — ist konkrete Tests durchzuführen, um zu sehen, was dein Browser gerade jetzt preisgibt, bevor du irgendwas änderst.

Genau darum geht es in diesem Guide. Zehn Minuten, kein Account erforderlich, keine Software zum Installieren. Nur ein Set kostenloser Browser-Tools, die dir genau zeigen, was leckt — mit konkreten Zahlen, auf die du reagieren kannst.

## Was du testest

Dein Browser gibt Daten über vier Hauptkanäle preis, und jeder erfordert einen anderen Test.

**IP-Adresse** — die offensichtlichste. Jede Verbindung enthüllt deine IP. Aber WebRTC (die Browser-API, die In-Browser-Videogespräche ermöglicht) kann deine echte IP selbst durch ein VPN preisgeben, weil es auf einer Ebene operiert, die das VPN nicht abfängt.

**DNS-Abfragen** — jede Domain, die du besuchst, löst einen DNS-Lookup aus, der irgendwohin geht. Standardmäßig geht er unverschlüsselt zum Resolver deines Internetanbieters. Dein ISP protokolliert jede Domain, die du anfragst. Ein VPN sollte diese Anfragen über seinen eigenen Resolver leiten — tut es aber oft nicht, was außerhalb des Tunnels eine separate Aufzeichnung deines Surfverhaltens hinterlässt.

**Browser-Fingerprint** — deine Kombination aus GPU, installierten Schriften, Zeitzone, Bildschirmauflösung, Hardware-Parallelität und Dutzenden weiterer Eigenschaften bildet ein Profil, das einzigartig genug ist, um dich seitenübergreifend ohne Cookies zu verfolgen. Die [Panopticlick-Studie](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) der EFF stellte fest, dass 83,6 % der Browser einen einzigartigen Fingerprint haben, der auf 94,2 % steigt, wenn Browser-Plugins einbezogen werden. Der Inkognito-Modus ändert daran nichts.

**Drittanbieter-Skripte** — Werbenetzwerke und Datenhändler platzieren Tracking-Skripte auf den meisten kommerziellen Websites. Diese Skripte laufen in deinem Browser, lesen deinen Fingerprint und melden an ihre Server. Sie zu blockieren ist etwas anderes als die oben genannten Lecks zu beheben.

Die vier kostenlosen Tools unten testen jeden dieser Aspekte. Führe sie aus, bevor du irgendwas änderst — du brauchst eine Ausgangslage zum Vergleichen.

## Schritt 1: Fingerprint-Score mit Cover Your Tracks ermitteln

[Cover Your Tracks](/tool/coveryourtracks-eff-org) wurde von der Electronic Frontier Foundation entwickelt und ist der richtige Startpunkt, weil es ein einziges, klares Urteil liefert: Entweder geht dein Browser in der Masse unter oder nicht.

Klick auf „Test Your Browser" und warte etwa zehn Sekunden. Das Ergebnis fällt in eine von drei Kategorien:

- **Starker Schutz** — dein Fingerprint ist weit verbreitet genug, um sich unter vielen anderen Nutzern zu verlieren
- **Etwas Schutz** — teilweise randomisiert, aber in mancher Hinsicht noch identifizierbar
- **Einzigartiger Fingerprint** — dein Browser kann identifiziert und seitenübergreifend verfolgt werden, selbst ohne Cookies

Die meisten Menschen erhalten beim ersten Mal „Einzigartiger Fingerprint". Das ist kein Versagen — das ist ein Ausgangspunkt, den du verbessern kannst. Das Tool zeigt auch eine Entropie-Aufschlüsselung nach Attribut: wie viele Bits an identifizierender Information jede Eigenschaft beisteuert. Die Bildschirmauflösung fügt typischerweise 3–4 Bits hinzu. Die User-Agent-Zeichenkette etwa 10 Bits. Zusammen trägt ein einzigartiger Fingerprint oft 18–22 Bits Entropie — was bedeutet, dass etwa 1 von 250.000 Browsern dieselbe Kombination teilt.

Notiere dein Ergebnis, bevor du Änderungen vornimmst. Du wirst es danach zum Vergleichen brauchen.

## Schritt 2: IP- und WebRTC-Leaks mit IPLeak prüfen

[IPLeak.net](/tool/ipleak-net) lädt schnell und prüft drei Dinge auf einmal: deine sichtbare IP-Adresse, alle über WebRTC exponierten IPs und deine DNS-Server.

Besonders aufmerksam sein: Zeigt der WebRTC-Bereich eine andere IP als deine Haupt-IP? Wenn du ein VPN nutzt und WebRTC deine echte ISP-IP anzeigt — nicht die VPN-IP — hast du ein bestätigtes WebRTC-Leak. Websites können diese Überprüfung lautlos im Hintergrund ausführen, ohne jede Nutzerinteraktion.

Der DNS-Bereich zeigt, welche Resolver deine Anfragen bearbeiten. Siehst du IP-Adressen, die deinem ISP oder Telekommunikationsunternehmen gehören, gehen diese Abfragen außerhalb deines VPN-Tunnels. Dein ISP kann jede Domain sehen, die du besuchst, auch wenn der Inhalt verschlüsselt bleibt.

Wenn du kein VPN nutzt, werden sowohl im IP- als auch im DNS-Bereich die Details deines ISPs angezeigt — erwartet, aber wichtig zu verstehen. Für deinen ISP bist du nicht anonym.

## Schritt 3: DNS-Konfiguration überprüfen

[DNS Leak Test](/tool/dnsleaktest-com) konzentriert sich speziell auf DNS und führt eine gründlichere Prüfung als IPLeak durch. Nutze die Option „Extended Test" — sie sendet mehrere DNS-Anfragen an eindeutige Subdomains und erfasst jeden Resolver, der antwortet.

Die Ergebnisse zeigen die IP-Adresse und zugehörige Organisation jedes DNS-Servers. Sauberes Ergebnis: Nur die Server deines VPN-Anbieters erscheinen. DNS-Leak: Deine ISP-Server erscheinen neben oder statt den Servern deines VPN-Anbieters. Schweres Leak: Nur deine ISP-Server erscheinen trotz aktivem VPN, was bedeutet, dass das VPN keinen DNS-Datenverkehr leitet.

Hier ein Vergleich, was jedes kostenlose Datenschutz-Test-Tool abdeckt:

| Tool | IP-Leak | WebRTC-Leak | DNS-Leak | Fingerprint | Ohne Anmeldung |
|------|---------|-------------|----------|------|---------|
| [Cover Your Tracks](/tool/coveryourtracks-eff-org) | — | — | — | ✓ | ✓ |
| [IPLeak.net](/tool/ipleak-net) | ✓ | ✓ | ✓ | — | ✓ |
| [DNS Leak Test](/tool/dnsleaktest-com) | — | — | ✓ | — | ✓ |
| [BrowserLeaks](/tool/browserleaks-com) | ✓ | ✓ | — | ✓ | ✓ |
| [PrivacyTests.org](/tool/privacytests-org) | — | ✓ | ✓ | ✓ | ✓ |

Alle fünf sind kostenlos, ohne Registrierung und liefern Ergebnisse, auf die du sofort reagieren kannst.

## Schritt 4: Tiefenprüfung mit BrowserLeaks

[BrowserLeaks](/tool/browserleaks-com) ist eine Sammlung einzelner Testseiten, die jeweils eine Fingerprinting-Oberfläche gezielt testen. Technischer als Cover Your Tracks, aber du bekommst die Rohdaten hinter deinem Fingerprint zu sehen.

Die wichtigsten Seiten:

**WebRTC-Leaks** — kreuzt gegen das, was IPLeak gezeigt hat. Wenn beide Tools dieselbe geleakte IP melden, ist das Leak real und konsistent.

**Canvas-Fingerprint** — zeigt den Pixel-Hash, den dein Browser erzeugt, wenn er aufgefordert wird, Inhalte unsichtbar darzustellen. Wenn die Canvas-Fingerprinting-Abwehr funktioniert, ändert sich dieser Wert bei jedem Seitenneuladen. Ist er identisch bei jedem Laden, bist du über Canvas verfolgbar.

**IP-Adresse** — beinhaltet die aus deiner IP abgeleitete Geolokalisierung, die typischerweise auf Stadtebene genau ist, ohne GPS oder irgendeine Erlaubnis von dir.

**User-Agent Client Hints** — Chromes neuere UA-CH API lässt Sites individuelle Attribute (Browserversion, Plattform, Architektur) separat abfragen statt eine monolithische User-Agent-Zeichenkette zu lesen. BrowserLeaks zeigt genau, welche Werte dein Browser über diesen neueren Kanal preisgibt.

[PrivacyTests.org](/tool/privacytests-org), von einem ehemaligen Firefox-Datenschutz-Ingenieur betrieben, benchmarkt alle großen Browser über 20+ standardisierte Tests und veröffentlicht die Ergebnisse öffentlich. Es geht weniger darum, dein aktuelles Setup zu testen, als Firefox, Chrome, Brave und Safari nebeneinander zu vergleichen, bevor du dich für einen Wechsel entscheidest. Die Tests sind automatisiert und werden regelmäßig aktualisiert — das macht es zu einer verlässlichen Referenz statt einem einmaligen Schnappschuss.

## Was behebbar ist und was nicht

Mit deinen Ausgangsergebnissen: Das kannst du tatsächlich ändern.

**WebRTC-IP-Leak** — in unter zwei Minuten behoben. In Firefox öffne `about:config`, suche nach `media.peerconnection.enabled` und setze es auf `false`. Das deaktiviert WebRTC komplett; In-Browser-Videoanrufe funktionieren dann nicht mehr, aber die meisten Nutzer brauchen diese ohnehin nicht. In Brave gehe zu Einstellungen → Datenschutz und Sicherheit → WebRTC-IP-Handhabungsrichtlinie und setze es auf „Nicht-proxiiertes UDP deaktivieren". Für Chrome gibt es keine native Einstellung — installiere die uBlock Origin-Erweiterung und aktiviere „Verhindern, dass WebRTC die lokale IP-Adresse preisgibt" in ihrem Einstellungsbereich.

**DNS-Leak** — durch Aktivierung von DNS-over-HTTPS behebbar. Das verschlüsselt deine DNS-Anfragen und leitet sie über einen selbst gewählten Resolver statt den deines ISPs. Firefox: Einstellungen → Datenschutz & Sicherheit → scrollen zu DNS über HTTPS → „Maximaler Schutz" aktivieren und Cloudflare oder NextDNS als Anbieter wählen. Chrome: Einstellungen → Datenschutz und Sicherheit → Sicherheit → Sicheres DNS verwenden → Anbieter wählen. Mozillas [DNS over HTTPS Dokumentation](https://support.mozilla.org/en-US/kb/firefox-dns-over-https) deckt die Firefox-spezifische Konfiguration ausführlich ab. Nach der Aktivierung erneut DNS Leak Test ausführen, um zu bestätigen, dass ISP-Server nicht mehr erscheinen.

**Einzigartiger Fingerprint** — schwieriger, aber sinnvoll verbesserbar. Drei Ansätze mit dokumentierten Ergebnissen:

Firefox mit aktiviertem `privacy.resistFingerprinting` (`about:config`, auf `true` setzen) normalisiert deinen Fingerprint, sodass er zu jedem anderen Firefox-Nutzer mit derselben Einstellung passt — feste Bildschirmauflösung, UTC-Zeitzone, generischer User-Agent. Cover Your Tracks sollte dann „starken Schutz" zurückgeben.

Brave fügt bei jeder Sitzung zufälliges Rauschen zu Canvas- und Audio-Fingerprints hinzu, was die sitzungsübergreifende Korrelation selbst dann unpraktikabel macht, wenn einzelne Sitzungen fingerprinting-anfällig sind. „Fingerprint-Schutz" in den Shields-Einstellungen aktivieren.

uBlock Origin im mittleren Modus blockiert die meisten Drittanbieter-Skripte bevor sie ausgeführt werden — was verhindert, dass Fingerprinting-Skripte überhaupt starten. Das ist der stärkste Ansatz für Chrome-Nutzer, die den Browser nicht wechseln wollen.

**Tracking-Skripte** — die Firefox-Erweiterung [Multi-Account Containers](https://support.mozilla.org/en-US/kb/containers) isoliert verschiedene Sites voneinander und verhindert seitenübergreifendes Tracking, selbst wenn Skripte ausgeführt werden. Das Netzwerkanfragen-Log von uBlock Origin zeigt dir genau, welche Drittanbieter-Skripte auf einer bestimmten Seite geladen werden.

> Die unangenehme Ironie: Ungewöhnliche Datenschutzerweiterungen können dich *leichter* identifizierbar machen. Wenn du einer der wenigen bist, die eine bestimmte Kombination von Erweiterungen nutzen, wird diese Konfiguration selbst zum Unterscheidungsmerkmal. Das Ziel ist nicht, alles zu blockieren — es ist, wie viele andere Menschen auszusehen.

## Exposition ohne Konfigurationsänderungen reduzieren

Technische Korrekturen beheben Browser-Verhalten. Sie beheben nicht, was passiert, wenn du dich einloggst und Accounts erstellst. Sobald eine Site deine E-Mail-Adresse hat, wird Fingerprinting überflüssig — sie haben bereits einen permanenten geräteübergreifenden Identifier, der dir überall folgt.

Ein praktischer Ansatz: Tools verwenden, die keine Accounts erfordern. Um sensitive Dateien ohne Registrierung zu teilen, nutzt [Wormhole](/tool/wormhole-app) Ende-zu-Ende-Verschlüsselung ohne Anmeldung. Um eine Nachricht zu senden, die sich nach dem Lesen selbst löscht, funktioniert [PrivNote](/tool/privnote-com) sofort ohne Account-Erstellung. Wenn eine Site eine E-Mail-Adresse nur fordert, um Inhalte anzuzeigen, generiert [Temp Mail](/tool/temp-mail-org) sofort eine Wegwerf-Adresse — kein Konto, kein Passwort.

Das sind keine Notlösungen — das ist ein strukturell anderes Modell. Ein Tool ohne Account-System kann kein Profil über dich erstellen, weil es nichts gibt, an das die Daten geknüpft werden könnten. Das [nologin.tools-Verzeichnis](/tool/nologin-tools) katalogisiert Hunderte von Tools über Kategorien hinweg — Bildbearbeitung, Dateikonvertierung, Entwickler-Utilities, Kollaboration — alle ohne Anmeldung nutzbar. Für ihre Nutzung braucht man keine Browser-Einstellungen zu reparieren; der Datenschutzmechanismus wird schlicht überflüssig.

## Wo jetzt anfangen

Führe Cover Your Tracks aus. Wenn es „einzigartiger Fingerprint" anzeigt, ist das dein Hauptproblem, und der Wechsel zu Firefox mit aktiviertem `privacy.resistFingerprinting` oder zu Brave ist die wirkungsvollste Maßnahme.

Dann führe IPLeak aus. Wenn WebRTC eine andere IP als die deines VPNs enthüllt, lässt sich das in unter zwei Minuten mit einer Browser-Einstellung beheben.

Dann führe DNS Leak Test aus. Wenn ISP-Server in den Ergebnissen erscheinen, braucht das Aktivieren von DNS-over-HTTPS im Browser etwa drei Klicks.

Drei Tests. Drei konkrete Fixes. Keiner erfordert einen Account. Führe Cover Your Tracks nach den Änderungen erneut aus — der Unterschied zwischen „einzigartigem Fingerprint" und „starkem Schutz" zeigt sich sofort, und es lohnt sich, ihn zu sehen.

Datenschutz verstärkt sich durch Überlagerung. Einen Leak zu beheben löst nicht alles, verengt aber das, was tatsächlich exponiert ist — und genau zu wissen, was leckt, ist besser als zu raten.
