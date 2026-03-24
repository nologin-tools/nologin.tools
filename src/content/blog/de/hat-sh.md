---
title: "hat.sh: Dateien im Browser verschlüsseln – ohne jemandem vertrauen zu müssen"
description: "hat.sh verschlüsselt und entschlüsselt Dateien mit AES-256-GCM direkt im Browser. Kein Upload, kein Server, kein Konto — deine Daten verlassen dein Gerät nicht."
publishedAt: 2026-03-24
author: "nologin.tools"
tags: ["tools", "review", "privacy", "encryption"]
featured: false
locale: de
originalSlug: hat-sh
sourceHash: 49157d5e315dbffb
heroImageQuery: "file encryption security lock browser"
---

![Hero image](/blog/images/hat-sh/hero.jpg)

Alle Cloud-Speicher, alle Dateifreigabe-Plattformen, alle vermeintlich „sicheren" Upload-Tools haben eins gemeinsam: Deine Dateien landen auf dem Rechner von jemand anderem. Du vertraust der Verschlüsselung des Anbieters, seinem Schlüsselmanagement, seinen Mitarbeitern und seinen rechtlichen Verpflichtungen gegenüber jedem, der nach deinen Daten fragt. Das ist viel Vertrauen für ein Unternehmen, das du noch nie getroffen hast.

Was wäre, wenn die Verschlüsselung stattfände, bevor die Datei dein Gerät verlässt — im Browser, ohne dass ein Server jemals den Klartext zu sehen bekommt?

Genau das macht [hat.sh](https://hat.sh).

## Was hat.sh wirklich tut

hat.sh ist ein browserbasiertes Datei-Verschlüsselungstool. Du ziehst eine Datei auf die Seite, gibst ein Passwort (oder einen öffentlichen Schlüssel) ein, und erhältst eine verschlüsselte `.enc`-Datei. Zum Entschlüsseln ziehst du die `.enc`-Datei auf dieselbe Seite, gibst das Passwort ein, und bekommst deine Originaldatei zurück. Alles läuft lokal in JavaScript — keine Netzwerkanfragen mit deinem Dateiinhalt, kein Backend, keine Datenbank.

Das Verschlüsselungsschema ist AES-256-GCM, dasselbe Verfahren, das Signal, WhatsApp und die meisten modernen TLS-Verbindungen verwenden. Es handelt sich um authentifizierte Verschlüsselung: Wenn die Datei irgendwann manipuliert wurde, schlägt die Entschlüsselung laut fehl — kein stilles Korrumpieren. Du kannst keine verschlüsselte Datei heimlich verändern und erwarten, dass hat.sh sie akzeptiert.

hat.sh unterstützt zwei Modi:

- **Passwortbasierte Verschlüsselung**: Du legst ein Passwort fest, das Tool leitet daraus einen Verschlüsselungsschlüssel über PBKDF2 ab. Jeder mit dem Passwort kann entschlüsseln.
- **Public-Key-Verschlüsselung**: Du generierst ein Schlüsselpaar, teilst deinen öffentlichen Schlüssel, und jeder kann Dateien verschlüsseln, die nur du mit deinem privaten Schlüssel öffnen kannst. Dabei kommt X25519-Schlüsselaustausch kombiniert mit AES-256-GCM zum Einsatz.

Der Public-Key-Modus ist besonders nützlich für Teams. Ein Journalist kann seinen öffentlichen Schlüssel veröffentlichen; Quellen können hat.sh nutzen, um Dokumente vor dem Versand zu verschlüsseln — ganz ohne Einrichtung auf Senderseite.

## Kein Login, kein Upload, kein Konto

Die Datenschutzgeschichte hier ist ungewöhnlich sauber. Der [Quellcode liegt auf GitHub](https://github.com/sh-dv/hat.sh) unter MIT-Lizenz — du kannst genau lesen, welches JavaScript in deinem Browser läuft. Keine Telemetrie, keine Analytics-Aufrufe mit Datei-Metadaten, und keine serverseitige Komponente, die kompromittiert werden könnte.

Vergleich mal mit typischen „sicheren" Dateifreigabe-Diensten:

| Funktion | Typischer verschlüsselter Upload-Dienst | hat.sh |
|----------|----------------------------------------|--------|
| Dateien werden an Server gesendet | Ja | Nein |
| Konto erforderlich | Oft | Nie |
| Server sieht Klartext | Abhängig von der Implementierung | Nein |
| Quellcode prüfbar | Selten | Ja (MIT) |
| Funktioniert offline | Nein | Ja (nach erstem Laden) |

Tools wie [VirusTotal](/tool/virustotal-com) schicken deine Dateien absichtlich an externe Server — das ist ihr Zweck. hat.sh ist das genaue Gegenteil: Der Witz ist gerade, dass dein Dateiinhalt nirgendwohin geht.

## Wann du hat.sh einsetzen würdest

Stell dir eine freiberufliche Buchhalterin vor, die Steuerunterlagen an einen Kunden schicken muss. E-Mail ist Klartext. Die meisten Dateifreigabe-Links laufen ab oder werden indexiert. Sie braucht etwas Einfaches: eine Webseite öffnen, die Datei mit einem gemeinsamen Passwort verschlüsseln, das Ergebnis verschicken.

Oder ein Entwickler, der Credentials in einem Repository rotiert. Er muss eine `.env`-Datei einmalig sicher mit einem Teammitglied teilen — ohne dafür eine ganze GPG-Schlüsselinfrastruktur aufzubauen. Mit hat.sh verschlüsselt er mit einem Einmalpasswort und schickt die `.enc`-Datei über Slack, Discord oder Mail. Ohne das Passwort ist der verschlüsselte Blob wertlos.

Für Sicherheitsforscher hat der Public-Key-Modus echten Nutzen. Du kannst deinen öffentlichen Schlüssel auf deiner Website veröffentlichen und jeden verschlüsselte Dateien an dich schicken lassen — ohne dass der Absender irgendetwas installieren muss. Kein PGP-Schlüsselserver, kein GPG-Client, keine Komplexität der [Web of Trust](https://en.wikipedia.org/wiki/Web_of_trust).

## Die technische Ehrlichkeit clientseitiger Verschlüsselung

Clientseitige Verschlüsselung hat eine bemerkenswerte Einschränkung, die erwähnt werden sollte: Wenn die Website selbst kompromittiert wird, könnte bösartiges JavaScript dein Passwort oder deine Datei vor der Verschlüsselung abgreifen. Das ist die grundlegende Spannung bei jedem browserbasierten Krypto-Tool.

hat.sh begegnet dem auf mehrere Arten. Erstens: Der offene Quellcode ermöglicht es jedem, das JavaScript zu prüfen. Zweitens: Du kannst das Repository herunterladen und hat.sh lokal ausführen — vollständig air-gapped. Drittens: Für Nutzer mit sehr hohen Sicherheitsanforderungen bietet das Projekt ein Docker-Setup für Self-Hosting.

Für die meisten Anwendungsfälle — sensible Dokumente an einen Kollegen schicken, ein Backup vor dem Cloud-Upload verschlüsseln, eine Konfigurationsdatei schützen — gehört ein kompromittiertes CDN nicht zum Bedrohungsmodell. Browserseitige Verschlüsselung ist eine wesentliche Verbesserung gegenüber dem unverschlüsselten Versand.

Wenn du verstehen willst, wie dein Browser mit Kryptografie umgeht, liefert die [Web Crypto API-Spezifikation](https://www.w3.org/TR/WebCryptoAPI/) die Dokumentation zu den Primitiven, die hat.sh verwendet. Es handelt sich um eine native Browser-Funktion, keine eigene Implementierung — die kryptografischen Operationen laufen in optimiertem C++, nicht in interpretiertem JavaScript.

## hat.sh im Vergleich zu ähnlichen No-Login-Tools

Vielleicht kennst du bereits [CyberChef](/tool/gchq-github-io-cyberchef), das ebenfalls vollständig im Browser läuft und AES-Verschlüsselung beherrscht. CyberChef ist ein Allzweck-Datentransformations-Tool — es verarbeitet Encoding, Komprimierung, Hashing und Hunderte weiterer Operationen zusätzlich zur Verschlüsselung. Diese Breite macht es leistungsstark, aber auch komplex für nicht-technische Nutzer.

hat.sh ist für genau eine Sache gemacht: Dateien für sicheren Transport oder Speicherung verschlüsseln. Die Oberfläche ist minimal genug, dass du die URL jemandem schicken kannst, der nicht weiß, was AES ist, und er findet sich in unter einer Minute zurecht. Die Einfachheit ist ein Feature.

[Wormhole](/tool/wormhole-app) löst ein verwandtes, aber anderes Problem — Peer-to-Peer-Dateiübertragung mit Ende-zu-Ende-Verschlüsselung. Aber beide Parteien müssen gleichzeitig online sein, und die Dateien laufen über Relay-Server. hat.sh erzeugt eine statische verschlüsselte Datei, die du asynchron über beliebige Kanäle verschicken kannst.

## So fängst du an

hat.sh zum ersten Mal zu benutzen dauert etwa 30 Sekunden:

1. Geh auf [hat.sh](https://hat.sh)
2. Ziehe eine beliebige Datei auf die Seite (oder klicke zum Durchsuchen)
3. Wähle den Modus „Password" und gib eine starke Passphrase ein
4. Klicke auf **Encrypt** — du lädst eine `.enc`-Datei herunter
5. Schick die `.enc`-Datei über einen beliebigen Kanal; das Passwort teilst du separat mit

Zum Entschlüsseln:

1. Geh auf [hat.sh](https://hat.sh)
2. Ziehe die `.enc`-Datei auf die Seite
3. Gib das Passwort ein
4. Deine Originaldatei wird automatisch heruntergeladen

Der gesamte Ablauf benötigt kein Konto, keine Installation und kein Vertrauen in Dritte. Die verschlüsselte Datei sind nur Bytes — du kannst sie in Dropbox speichern, per Mail schicken oder öffentlich posten. Ohne das Passwort ist sie undurchdringlich.

---

Datenschutz-Tools haben oft einen Haken: Entweder bekommst du starke Sicherheit mit schmerzhafter Komplexität (GPG), oder du bekommst Bedienkomfort, dafür aber gehen deine Daten auf fremde Server. hat.sh setzt auf etwas anderes — dass eine gut gestaltete, transparente Open-Source-Web-App beides liefern kann. Während Browser leistungsfähiger werden und die Web Crypto API reift, werden mehr Tools diesem Muster folgen: Der Server liefert nur den Code, alles Sensible passiert auf deiner Maschine.
