---
title: "Dein Browser leckt Daten — und so kannst du es stoppen"
description: "Dein Browser verrät jeder Website deine echte IP, GPU, installierte Schriften und Zeitzone. Hier erfährst du, was genau durchsickert und was du dagegen tun kannst."
publishedAt: 2026-03-31
updatedAt: 2026-03-31
author: nologin.tools
tags: ["privacy", "browser", "guide", "analysis"]
featured: false
heroImageQuery: "browser privacy fingerprinting data leak surveillance"
locale: de
originalSlug: browser-leaking-data-how-to-stop-it
sourceHash: fd14e428ffc082f9
---

![Hero image](/blog/images/browser-leaking-data-how-to-stop-it/hero.jpg)

Öffne einen frischen Inkognito-Tab. Keine Cookies, kein Verlauf, kein Login. Du fühlst dich anonym.

Bist du aber nicht. Nicht mal ansatzweise.

Die [Panopticlick-Studie der EFF](https://coveryourtracks.eff.org/static/browser-uniqueness.pdf) hat herausgefunden, dass **83,6 % aller Browser einen einzigartigen Fingerabdruck haben** — genug, um dich auf jeder Website zu identifizieren, die du besuchst, ohne auch nur einen Cookie zu setzen. Mit Browser-Erweiterungen im Mix steigt diese Zahl auf 94,2 %. Der Inkognito-Modus ändert daran nichts. Cookies löschen auch nicht.

Hier ist, was wirklich durchsickert — und was du dagegen tun kannst.

## Was dein Browser tatsächlich sendet

Jedes Mal, wenn du eine Seite lädst, verrät dein Browser eine Menge über sich selbst. Noch bevor JavaScript läuft, enthüllen die HTTP-Request-Header deinen Browser-Namen und die Version, dein Betriebssystem, bevorzugte Sprachen und Encoding-Unterstützung. Das passiert automatisch — kein Hinweis, keine Zustimmung.

JavaScript macht es deutlich schlimmer. Websites können deine Bildschirmauflösung auslesen (einschließlich des Freiraums für deine Taskbar), deine genaue Zeitzone, wie viele CPU-Kerne du hast, wie viel RAM dein Gerät hat (auf die nächste Zweierpotenz gerundet, aber trotzdem nützlich) und welches Farbschema du bevorzugst. Nichts davon erfordert irgendeine Berechtigungsabfrage.

Die Gesamtzahl ist beeindruckend: Moderne Fingerprinting-Bibliotheken wie FingerprintJS sammeln **über 100 einzelne Attribute** pro Browser. Zu einem Hash kombiniert erzeugen sie eine Kennung, die über Sitzungen hinweg bestehen bleibt — über Browser auf demselben Rechner und sogar im Inkognito-Modus. FingerprintJS behauptet, wiederkehrende Besucher mit 99,5 % Genauigkeit zu identifizieren, selbst nachdem Cookies gelöscht wurden.

Die unbequeme Wahrheit: Die meisten Dinge, die dich online „privat" machen sollen — Cookies löschen, VPN nutzen, Inkognito öffnen — haben keinerlei Auswirkung auf Fingerprinting. Das sind Lösungen für ein anderes Problem.

## Das WebRTC-Problem (und warum dein VPN nicht hilft)

WebRTC ist die Browser-API, die Video-Calls im Browser ermöglicht — Google Meet, Discord, Zoom Web. Sie funktioniert durch direkte Peer-to-Peer-Verbindungen zwischen Browsern, was bedeutet, dass sie deine echte Netzwerkadresse kennen muss.

Das Problem: Jede Website kann mit ein paar Zeilen JavaScript einen WebRTC-Verbindungsversuch auslösen — ohne Nutzerinteraktion, ohne Erlaubnis. Um den schnellsten Weg zwischen Peers zu finden, nutzt WebRTC ein Protokoll namens ICE (Interactive Connectivity Establishment), das einen öffentlichen STUN-Server kontaktiert. Die Antwort dieses STUN-Servers enthält deine **echte öffentliche IP-Adresse**.

Dein VPN fängt das nicht ab. WebRTC-Traffic verwendet UDP und wird auf Betriebssystem-Ebene anders behandelt als der HTTP-Traffic deines Browsers. Die meisten VPN-Implementierungen fangen ihn schlicht nicht ab. Selbst mit laufendem VPN kann eine Website diesen Code ausführen und deine echte IP in unter einer Sekunde ermitteln:

```js
const pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
pc.createDataChannel("");
pc.createOffer().then(o => pc.setLocalDescription(o));
pc.onicecandidate = e => { /* deine echte IP steckt in e.candidate.candidate */ };
```

Das nennt sich WebRTC Leak, und er ist in kommerziellen Fingerprinting-SDKs, Ad-Tech-Plattformen und Anti-Fraud-Systemen gleichermaben dokumentiert.

**So blockierst du es:** Firefox erlaubt es, WebRTC komplett zu deaktivieren, indem du `media.peerconnection.enabled` in `about:config` auf `false` setzt. Das bricht In-Browser-Video-Calls, ist also ein Kompromiss. Die erweiterten Einstellungen von uBlock Origin enthalten eine Option „WebRTC daran hindern, lokale IP-Adressen preiszugeben", die weniger drastisch ist — sie blockiert die Offenlegung der lokalen IP, lässt WebRTC aber weiter funktionieren. Brave blockiert die lokale IP-Preisgabe standardmäßig im Shields-Panel.

Du kannst mit [IPLeak](/tool/ipleak-net) prüfen, ob du leakst — es zeigt alle WebRTC-ICE-Kandidaten, die dein Browser gerade preisgibt.

## DNS Leaks: Das andere Loch in deinem VPN

Wenn du eine Domain in deinen Browser eingibst, wandelt ein DNS-Resolver sie in eine IP-Adresse um. Wenn du ein VPN nutzt, sollte diese Anfrage durch den VPN-Tunnel zu deinem VPN-Provider gehen — nicht zu deinem ISP.

Ein DNS Leak liegt vor, wenn die Anfrage trotzdem beim ISP landet und ihm jede Domain verrät, die du besuchst — egal ob VPN oder nicht. Der Inhalt deines Traffics bleibt verschlüsselt, aber dein ISP kann sehen, dass du am Dienstag um 21:14 Uhr `beispiel.com` besucht hast. Genug, um ein detailliertes Verhaltenprofil zu erstellen.

DNS Leaks entstehen aus mehreren langweiligen Infrastrukturgründen. Windows hat eine Funktion namens Smart Multi-Homed Name Resolution, die DNS-Anfragen **gleichzeitig** an alle verfügbaren Netzwerkadapter sendet und die schnellste Antwort nimmt. Das heißt: Anfragen gehen gleichzeitig an den VPN-Resolver und den ISP-Resolver. Viele VPN-Clients korrigieren dieses Verhalten nicht richtig.

IPv6 ist ein weiterer häufiger Übeltäter. Viele VPNs tunneln nur IPv4-Traffic. Wenn dein Router und Betriebssystem IPv6 unterstützen, umgehen DNS-Anfragen über diesen Weg den VPN-Tunnel vollständig.

Manche ISPs verschlimmern das noch durch transparente DNS-Proxys — sie fangen den gesamten ausgehenden UDP-Traffic auf Port 53 ab und leiten ihn zu ihren eigenen Resolvern um, selbst wenn du ein anderes DNS wie 1.1.1.1 oder 8.8.8.8 konfiguriert hast.

**So testest du, ob du leakst:** Starte einen erweiterten Test auf [DNS Leak Test](/tool/dnsleaktest-com). Er sendet DNS-Anfragen an eindeutige Subdomains und überwacht, welche Resolver sie aufgreifen. Zeigen die Ergebnisse deinen ISP statt deines VPN-Providers, hast du einen bestätigten Leak.

Die Lösung hängt von deinem Setup ab, aber DNS-over-HTTPS (DoH) im Browser zu aktivieren ist ein vernünftiger Anfang, der den System-Resolver komplett umgeht. In Firefox findest du das unter Einstellungen → Datenschutz & Sicherheit → DNS über HTTPS. Stelle es auf „Maximaler Schutz", um den Fallback auf den System-Resolver zu verhindern.

## Canvas- und Audio-Fingerprinting (das wirklich gruselige Zeug)

Selbst mit blockiertem WebRTC und gesichertem DNS gibt es eine Kategorie von Fingerprinting, die überhaupt nicht von deinem Netzwerk abhängt. Sie nutzt winzige Unterschiede aus, wie deine Hardware Grafiken rendert.

Canvas-Fingerprinting funktioniert so: Ein Script zeichnet Text und Formen auf ein unsichtbares `<canvas>`-Element und liest dann die Pixeldaten aus. Die Ausgabe variiert — subtil, aber messbar — basierend auf deinem GPU-Modell, der GPU-Treiberversion, dem Betriebssystem und der Font-Rendering-Engine. macOS nutzt CoreText, Windows DirectWrite, Linux FreeType. Jedes produziert leicht unterschiedliches Sub-Pixel-Antialiasing. Jeder GPU-Treiber hat sein eigenes Gleitkomma-Rundungsverhalten. Das akademische Paper aus 2014 [„The Web Never Forgets"](https://dl.acm.org/doi/10.1145/2660267.2660347) fand Canvas-Fingerprinting auf 5 % der Top-100.000-Websites eingesetzt — und das war vor über einem Jahrzehnt.

Audio-Fingerprinting ist ähnlich. Ein Script erstellt einen `AudioContext`, leitet einen Oszillator durch einen Analyzer und liest die Ausgabewerte. Die winzigen Gleitkommaunterschiede in der Art, wie deine Hardware Audio verarbeitet, sind konsistent genug, um dich sitzungsübergreifend zu identifizieren. Kein Mikrofonzugriff erforderlich.

Diese beiden Signale kombiniert — Canvas + WebGL-Fingerprint — tragen jeweils etwa 15 oder mehr Bits Entropie. Das bedeutet: Ungefähr 1 von 32.768 Browsern teilt isoliert denselben Canvas-Fingerprint. Kombiniert mit deiner Bildschirmauflösung, Zeitzone, CPU-Kernzahl und User-Agent landet man bei einer Stichprobengröße von eins.

> Die unbequeme Ironie: Privacy-Erweiterungen zu haben kann dich *besser* identifizierbar machen. Wenn du einer der wenigen bist, der uBlock Origin im „Medium Mode" mit einem bestimmten Erweiterungsset betreibt, wird diese Konfiguration selbst zum Erkennungsmerkmal.

## Wie du dich jetzt sofort testen kannst

Bevor du irgendetwas änderst, lohnt es sich zu sehen, was du tatsächlich preisgibst.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) von der EFF ist der beste Startpunkt. Es vergleicht deinen Browser mit einer Datenbank aus Millionen echter Fingerprints und sagt dir, wie einzigartig deiner ist — mit Entropiewerten pro Attribut. „Dein Browser hat einen einzigartigen Fingerprint" bedeutet, du kannst identifiziert werden. „Starker Schutz" bedeutet, dein Browser sieht aus wie viele andere — was das eigentliche Ziel ist.

[BrowserLeaks](/tool/browserleaks-com) geht tiefer, mit separaten Seiten für WebRTC-Leaks, Canvas-Fingerprints, WebGL-Details, installierte Schriften, TLS-Fingerprinting und mehr. Starte zuerst den WebRTC-Test — dort ist die Überraschung am wahrscheinlichsten.

[PrivacyTests](/tool/privacytests-org), betrieben von einem ehemaligen Firefox-Privacy-Ingenieur, vergleicht Browser untereinander in über 20 Privacy-Tests. Dabei geht es weniger ums Testen deines spezifischen Browsers, sondern mehr um den Vergleich von Chrome, Firefox, Brave, Safari und Tor Browser in standardisierten Szenarien. Lesenswert, bevor du entscheidest, ob du den Browser wechselst.

## Was wirklich hilft

Ehrliche Antwort: Keine einzelne Einstellung behebt alles. Aber diese Änderungen haben messbare, dokumentierte Auswirkungen:

**Wechsle den Browser.** Das ist der größte Hebel. Brave blockiert standardmäßig die lokale IP-Offenlegung per WebRTC und Canvas-Fingerprinting — es fügt Canvas- und Audio-Ausgaben jede Sitzung zufälliges Rauschen hinzu, sodass Cross-Site-Korrelation unmöglich wird, ohne das Web kaputtzumachen. Firefox mit `privacy.resistFingerprinting = true` verfolgt einen anderen Ansatz: Es normalisiert alles, um wie ein generischer Browser auszusehen (feste Bildschirmgröße 1000×900, UTC-Zeitzone, generischer UA-String). Das lässt dich wie jeden anderen Firefox-Nutzer mit dieser Einstellung aussehen — das ist das richtige Modell.

| Browser | Canvas FP | WebRTC IP | DNS-over-HTTPS | Drittanbieter-Cookies |
|---|---|---|---|---|
| Chrome | Keine | Leak | Optional | Teilweise blockiert |
| Firefox (Standard) | Keine | Leak | Optional | Strikt (ETP) |
| Firefox (RFP) | Zufällig | Deaktiviert | Optional | Strikt |
| Brave | Zufällig | Blockiert | Optional | Blockiert |
| Tor Browser | Einheitlich | Deaktiviert | N/A (nutzt Tor) | Blockiert |

**Installiere uBlock Origin.** Auf Firefox: Nutze den Medium Mode (blockiert alle Drittanbieter-Scripts standardmäßig, Whitelist nach Bedarf). Aktiviere „WebRTC daran hindern, lokale IP-Adressen preiszugeben" in den erweiterten Einstellungen. Das blockiert die Mehrheit der Fingerprinting-Scripts, bevor sie überhaupt laufen. Auf Chrome: Nutze es, bevor Googles Manifest-V3-Änderungen die Extension-Fähigkeiten weiter einschränken.

**Aktiviere DNS-over-HTTPS.** Beide Browser unterstützen das inzwischen nativ. Nutze Cloudflare (1.1.1.1) oder NextDNS. NextDNS zeigt dir besonders detailliert, welche Domains dein Browser auflöst — praktisch, um zu prüfen, was auf einer Seite im Hintergrund läuft.

**Friere deinen User-Agent ein.** Dein UA-String allein trägt laut der ursprünglichen Panopticlick-Studie etwa 10,5 Bits Entropie. `privacy.resistFingerprinting` in Firefox erledigt das automatisch. Auf Chrome hat die UA-CH-API (User-Agent Client Hints) den alten UA-String nach und nach ersetzt — die Absicht war, die Entropie zu reduzieren, aber der Rollout war inkonsistent.

Tor Browser bleibt der Goldstandard für Fingerprinting-Resistenz. Es normalisiert jeden fingerprintbaren Attribut so, dass er bei allen Tor-Nutzern identisch ist — gleicher UA, gleiche Bildschirmgröße, gleiche Schriften, gleiche Zeitzone. Das Ziel ist Einheitlichkeit, nicht Blockierung. Jeder Tor-Browser-Nutzer sieht identisch aus. Das ist der einzige Ansatz, der Fingerprinting wirklich besiegt, statt nur den Aufwand zu erhöhen.

Für die meisten Menschen bringt Brave oder Firefox mit uBlock Origin 80 % der Wirkung — ohne die Websites zu brechen, die man tatsächlich nutzt. Das ist ein vernünftiger Kompromiss.

Was du allein nicht vollständig lösen kannst, ist TLS-Fingerprinting — die Cipher-Suite-Reihenfolge und TLS-Extension-Werte, die dein Browser beim HTTPS-Handshake sendet, sind charakteristisch genug, um deinen Browser auf Netzwerkebene zu identifizieren, noch vor jedem HTTP. Cloudflare und andere CDNs nutzen bereits JA3-Hashes (ein standardisierter TLS-Fingerprint) zur Bot-Erkennung. Keine Browser-Extension greift das an. Es ist lösbar — aber nur die Browser selbst können es beheben.

Das Web hat mehr Überwachungsinfrastruktur eingebaut, als die meisten Nutzer ahnen. Die gute Nachricht: Einige konkrete Änderungen — ein besserer Browser, eine Extension, DNS-over-HTTPS aktiviert — reduzieren messbar, was du preisgibst. Fang mit Cover Your Tracks an. Schau, was es sagt. Dann entscheide, womit du dich wohlfühlst.

Noch eine Sache: Die Tools, die deine Privatsphäre am meisten respektieren, sind jene, die dich nicht nach deiner Identität fragen. Privacy-freundliche Tools ohne Signup können deine Sitzungsdaten nicht mit einem Profil verknüpfen — weil es kein Profil gibt, mit dem man sie verknüpfen könnte. Wenn du wissen willst, wie viele leistungsfähige No-Login-Tools es gibt, führt [nologin.tools](/tool/nologin-tools) eine kuratierte Liste — von Bildbearbeitungs-Tools über Dateifreigabe bis hin zu Entwickler-Utilities, alles ohne Account nutzbar. Eine praktische Möglichkeit, deinen digitalen Fußabdruck zu reduzieren, ohne auf Produktivität zu verzichten.
