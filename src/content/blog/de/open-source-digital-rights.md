---
title: "Das digitale Recht auf Software, die dich nicht überwacht"
description: "Open-Source-Tools ohne Login sind nicht nur praktisch — sie setzen digitale Rechte in die Praxis um: kommunizieren und zusammenarbeiten, ohne getrackt zu werden."
publishedAt: 2026-03-20
author: "nologin.tools"
tags: ["open-source", "privacy", "analysis", "tools", "browser"]
featured: false
heroImageQuery: "digital rights open source privacy freedom"
locale: de
originalSlug: "open-source-digital-rights"
sourceHash: "994e76dd1a720e0b"
---

![Hero image](/blog/images/open-source-digital-rights/hero.jpg)

Eine Frage, über die es sich nachzudenken lohnt: Wenn du einem Video-Call über Zoom beitrittst, was hast du dann akzeptiert zu teilen? Deinen Namen. Deine E-Mail-Adresse. Deine IP-Adresse. Die Metadaten deines Geräts. Deine Nutzungsmuster. Den Inhalt deiner Gespräche, je nachdem welchen Plan dein Gastgeber bezahlt. All das, bevor der Call überhaupt begonnen hat.

[Jitsi Meet](/tool/meet-jit-si) läuft vollständig im Browser. Kein Account. Kein Download. Keine Registrierung. Der Call startet in dem Moment, in dem jemand einen Link teilt. Jitsi ist Open Source (Apache-2.0-Lizenz), selbst hostbar und wird von [Millionen Menschen weltweit](https://jitsi.org/) genutzt — darunter Organisationen, die wirklich sensible Kommunikation abwickeln. Der Quellcode ist öffentlich und wurde unabhängig auditiert. Die Architektur nutzt WebRTC, was bedeutet, dass Medien wenn möglich Peer-to-Peer übertragen werden — nicht über Jitsis Server.

Dieser Kontrast ist nicht nur ein Produktvergleich. Es geht darum, welche Art von Software du das Recht hast zu nutzen.

## Digitale Rechte sind nicht abstrakt

„Digitale Rechte" klingt nach etwas, das nur Aktivisten und Juristen betrifft. Das stimmt nicht. Die [Electronic Frontier Foundation](https://www.eff.org/issues/privacy) argumentiert seit drei Jahrzehnten, dass das Recht, privat zu kommunizieren, Software zu nutzen ohne profiliert zu werden und die eigenen Daten zu besitzen, eine bürgerrechtliche Frage ist — keine bloße Verbraucherpräferenz. Die DSGVO hat einen Teil davon in Gesetz gegossen: Artikel 5 fordert, dass personenbezogene Daten für „festgelegte, eindeutige und legitime Zwecke" erhoben werden und nicht auf eine mit diesen Zwecken unvereinbare Weise verarbeitet werden. Artikel 25 verlangt „Datenschutz durch Technikgestaltung und datenschutzfreundliche Voreinstellungen".

Open-Source-Tools ohne Login zeigen, wie diese Prinzipien in der Praxis aussehen. Sie fragen keine Daten ab, weil sie keine brauchen. Sie brauchen sie nicht, weil die Architektur um den Nutzer herum gebaut ist — nicht um ein Geschäftsmodell, das Nutzerdaten monetarisiert.

Die wichtigsten Tools ohne Anmeldung sind nicht einfach die, die ein Formularfeld weglassen. Es sind die, bei denen kein Login eine natürliche Konsequenz der Funktionsweise der Software ist: clientseitige Verarbeitung, Peer-to-Peer-Transfer, kein serverseitiger State. Auf die Registrierung zu verzichten ist kein Feature, das sie hinzugefügt haben. Es ist ein Feature, das sie nie gebraucht haben.

## Wenn du ohne Spuren teilen musst

Jemand schickt dir ein sensibles Passwort, einen API-Key, einen Vertrag. Du musst es an einen Kollegen weitergeben. E-Mail ist Klartext. Slack führt Logs. Messaging-Apps speichern den Nachrichtenverlauf oft auf unbestimmte Zeit. Der Impuls, es einfach zu schreiben, ist verständlich — und oft genau falsch.

[Yopass](/tool/yopass-se) löst das Problem ordentlich. Du fügst ein Geheimnis ein, legst ein Ablaufdatum fest und bekommst einen Einmal-Link. Der Empfänger öffnet den Link, liest das Geheimnis, und es wird automatisch gelöscht. Das Geheimnis wird clientseitig verschlüsselt, bevor es deinen Browser verlässt; die Server von Yopass sehen nur verschlüsselten Chiffretext, den sie nicht lesen können. Wenn der Link genutzt wird (oder abläuft), sind die verschlüsselten Daten weg. Keine Logs, keine Persistenz, kein Account auf beiden Seiten nötig. Der [Quellcode](https://github.com/jhaals/yopass) ist öffentlich — du kannst diese Behauptung selbst überprüfen statt sie auf Vertrauen hinzunehmen, und du kannst Yopass selbst hosten, wenn du nicht mal deren Infrastruktur vertrauen willst.

Der Kontrast zu Produkten wie der „Teilen"-Funktion von LastPass (erfordert Accounts auf beiden Seiten) oder dem schlichten Versenden eines Passworts per E-Mail ist krass. Diese Tools protokollieren, wer was an wen geschickt hat. Yopass tut das explizit nicht.

## File Transfer, der den Server komplett umgeht

Der Standardweg, um eine Datei mit jemandem zu teilen, ist das Hochladen auf einen Server — Google Drive, WeTransfer, Dropbox — und das Versenden eines Links. Dieser Server speichert deine Datei. Er kann beschlagnahmt, kompromittiert oder für Analytics ausgewertet werden. Die Datei existiert irgendwo, das du nicht kontrollierst, länger als du denkst.

[PairDrop](/tool/pairdrop-net) funktioniert strukturell anders. Deine Datei wandert direkt von deinem Gerät zu dem des Empfängers, über WebRTCs Data Channels. PairDrops Server übernimmt nur das Signaling — den kurzen Handshake, der zwei Browsern hilft, sich zu finden. Sobald die Verbindung steht, ist der Server aus dem Spiel. Die Datei selbst berührt ihn nie.

Das ist nicht nur eine Datenschutzverbesserung. Es ist eine andere Architektur. Der Server kann nicht speichern, was er nie empfängt. Ein Breach in PairDrops Infrastruktur würde deine übertragenen Dateien nicht preisgeben, weil sie dort nie waren. [ShareDrop](/tool/sharedrop-io) funktioniert genauso — als Alternative bookmarken, die ebenfalls kein Login erfordert und P2P-Transfer ohne Zwischenspeicherung handhabt.

Beide sind Open Source. Beide funktionieren in jedem modernen Browser. Keiner fragt nach deiner E-Mail.

## Wissen, was dein Browser verrät

Die Lücke zwischen „kein Login" und „nicht getrackt" ist größer als die meisten Menschen ahnen. Ein Tool kann das Anmeldeformular weglassen und trotzdem deinen Browser fingerprinten, deine IP loggen und deine Besuche mit Tracking-Pixeln von Drittanbietern korrelieren. Manche tun das. Du kannst überprüfen, ob dein Browser Daten auf eine Weise leakt, die du nicht autorisiert hast.

[Cover Your Tracks](/tool/coveryourtracks-eff-org) — betrieben von der EFF — testet, ob der Fingerprint deines Browsers eindeutig genug ist, um dich siteübergreifend zu tracken. Es prüft Tracker-Blocking, Fingerprint-Randomisierung und ob gängige Fingerprinting-Skripte deine spezifische Browser-Konfiguration identifizieren können. Keine Anmeldung. Open-Source-Testmethodik. Die EFF veröffentlicht die Testmethodik öffentlich, damit du genau verstehst, was gemessen wird.

[BrowserLeaks](/tool/browserleaks-com) geht tiefer: IP-Adresse, WebGL-Fingerprint, Canvas-Fingerprint, Audio-Kontext, Font-Enumeration, Geolocation-APIs. Jeder Test zeigt dir, was Websites ohne Nachfragen über dich erfahren können. Die Ergebnisse sind oft unbequem. Zu wissen, was dein Browser verrät, ist eine Voraussetzung dafür, gute Entscheidungen darüber zu treffen, welchen Tools ohne Login du wirklich vertrauen kannst.

| Tool | Geloggte Daten | Server sieht | Selbst hostbar |
|------|-------------|-------------|---------------|
| Zoom (kostenlos) | Account, IP, Metadaten, Call-Inhalt | Alles | Nein (proprietär) |
| Jitsi Meet | Optional: Anzeigename | Nur Signaling | Ja (Apache 2.0) |
| WeTransfer | IP, E-Mail, Dateiinhalt | Datei + Metadaten | Nein |
| PairDrop | Nichts | Nur Signaling | Ja (MIT) |
| LastPass Share | Account-Daten, Zugriffsprotokolle | Verschlüsselte Datei | Nein |
| Yopass | Nichts | Verschlüsseltes Secret | Ja (MIT) |

## Warum Open Source die Vertrauensschicht ist

Der Satz „Wir respektieren deine Privatsphäre" kostet nichts, ihn zu veröffentlichen. Er steht in praktisch jeder Datenschutzerklärung, die je geschrieben wurde. Der Satz „Hier ist der Code, der läuft, wenn du unser Tool nutzt" bedeutet etwas.

Open-Source-Code kann auditiert werden. Sicherheitsforscher untersuchen regelmäßig Open-Source-Tools und berichten öffentlich, was sie finden. Wenn [Jitsis Code](https://github.com/jitsi/jitsi-meet) die Authentifizierung behandelt, ist die Implementierung sichtbar. Wenn Yopass clientseitige Verschlüsselung durchführt, ist die [verwendete Crypto-Bibliothek](https://github.com/jhaals/yopass) angegeben und überprüfbar. Wenn PairDrop eine WebRTC-Verbindung aufbaut, kannst du genau lesen, welche Daten durch den Signaling-Server fließen.

Proprietäre Tools können die gleichen Behauptungen aufstellen, und du kannst sie nicht überprüfen. Du kannst ihre Netzwerkanfragen mit den Browser-Entwicklertools prüfen (was dir etwas verrät), aber du kannst den serverseitigen Code nicht sehen, der deine Daten nach der Übertragung verarbeitet. Open-Source-Tools mit clientseitiger Verarbeitung umgehen dieses Problem: Es gibt keinen serverseitigen Code, der deine Daten verarbeitet, und der clientseitige Code ist öffentlich.

Das ist die Kombination, die zählt. Open Source aber serverseitig ist besser als Closed Source, erfordert aber immer noch, dem Server zu vertrauen. Clientseitig aber Closed Source ist besser als serverseitig, bleibt aber undurchsichtig bezüglich dessen, was der Code lokal tut. Open Source *und* clientseitig bedeutet, dass weder der Server noch der Code Vertrauen erfordern, das über das Überprüfbare hinausgeht.

## Die Self-Hosting-Garantie

Es gibt noch eine weitere Ebene, die es wert ist zu verstehen: Self-Hosting. Jedes hier genannte Tool kann auf Infrastruktur betrieben werden, die du selbst kontrollierst.

Jitsi Meet ist für das Self-Hosting auf Ubuntu mit einer [Schritt-für-Schritt-Anleitung](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart) dokumentiert. Yopass hat Docker-Support. PairDrops Architektur ist einfach genug, dass ein einzelner Server das Signaling für Tausende von Nutzern übernimmt. Für Organisationen mit spezifischen regulatorischen Anforderungen — Gesundheitswesen, Recht, öffentliche Verwaltung — ist das relevant. Die Pflichten aus Artikel 28 DSGVO bezüglich Auftragsverarbeitern entfallen, wenn der Auftragsverarbeiter man selbst ist.

Für die meisten Privatpersonen lohnt sich Self-Hosting nicht wegen des Wartungsaufwands. Aber die *Möglichkeit* des Self-Hostings verändert die Vertrauensbeziehung zur gehosteten Version. Ein Tool, das du selbst betreiben könntest und das identisch funktioniert, egal ob du ihre Instanz oder deine eigene nutzt, ist grundlegend anders als ein Tool, bei dem die gehostete Version die einzige Option ist. Die Architektur muss sauber genug sein, um ohne ein proprietäres Backend zu funktionieren — was viele überwachungsfördernde Designentscheidungen ausschließt.

## Die Entwicklung geht hin zu weniger erforderlichem Vertrauen

Datenschutzfreundliche Software bedeutete früher, etwas auf dem eigenen Rechner zu betreiben, getrennt vom Netz. Das ist nicht mehr die einzige Option. WebAssembly, WebRTC und clientseitige Verschlüsselung haben es gemeinsam möglich gemacht, Tools zu bauen, die im Browser laufen, miteinander kommunizieren und sensible Operationen abwickeln — ohne einen Server, der Nutzerdaten ansammelt.

Das Projekt [PrivacyTests.org](/tool/privacytests-org) verfolgt, welche Browser Fingerprinting, Tracking und Datenlecks widerstehen. Der Trend ist positiv: Browser werden immer besser darin, einzuschränken, was Dritte sammeln können, und Nutzer sind sich des Unterschieds zwischen „kostenlos" und „kostet dich deine Daten" stärker bewusst.

Die Tools ohne Login, die sich langfristig lohnen, sind die, bei denen die Architektur Überwachung strukturell unmöglich macht — nicht nur durch aktuelle Richtlinien verboten. Richtlinien ändern sich. Geschäftsmodelle ändern sich. Architektur ist schwerer zu ändern — besonders wenn der Code öffentlich ist und die Community es bemerken würde.

Stöber durch die Tools auf [nologin.tools](/tool/nologin-tools), um datenschutzfreundliche Open-Source-Optionen zu finden, die für clientseitige Verarbeitung verifiziert sind. Die als Open Source markierten haben öffentliche Repositories, die du inspizieren kannst. Das ist der Standard, der wirklich etwas bedeutet.
