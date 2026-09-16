---
title: "Der Air-Gapped Datenschutz-Stack: 10 Browser-Tools, die niemals die Cloud berühren"
description: "Entdecken Sie 10 rein clientseitige Browser-Tools, die sensiblen Code, Datenbanken und Dateien im Speicher verarbeiten, ohne ein einziges Byte zu senden."
publishedAt: 2026-09-16
author: "nologin.tools"
tags: ["privacy", "security", "developer", "offline", "data"]
featured: false
heroImageQuery: "air gap cybersecurity privacy data"
locale: "de"
originalSlug: "the-air-gapped-privacy-stack-10-tools-never-touch-cloud"
sourceHash: "ae3b0f531badb3a6"
---

![Hero image](/blog/images/the-air-gapped-privacy-stack-10-tools-never-touch-cloud/hero.jpg)

Wenn Softwareentwickler und Sicherheitsanalysten proprietären Code analysieren, Sicherheitsvorfälle untersuchen oder vertrauliche Kundendatenbanken bereinigen, stellen herkömmliche Web-Tools ein erhebliches Sicherheitsrisiko dar. Das Einfügen unredigierter Server-Logs, eines Produktions-Stacktraces mit Authentifizierungs-Tokens oder einer Finanzkalkulation in einen typischen Online-Konverter überträgt sensible Unternehmensdaten direkt auf die Cloud-Infrastruktur von Drittanbietern.

Sobald Daten Ihre physische Workstation verlassen, passieren sie öffentliche Routing-Knoten, landen auf unbekannten Backend-Festplatten und fließen in proprietäre Server-Logs ein. Für Organisationen, die an Compliance-Vorgaben wie HIPAA, DSGVO, SOC 2 oder strenge Geheimhaltungsvereinbarungen (NDAs) gebunden sind, stellt dieser versehentliche Datenabfluss eine Datenschutzverletzung dar.

Glücklicherweise haben moderne Browser-Standards – allen voran WebAssembly, die Web Audio API, Web Workers und die File System Access API – die Notwendigkeit serverseitiger Verarbeitung für Dutzende gängiger Entwickleraufgaben überflüssig gemacht. Heute können Sie kryptografische Transformationen auf Industrieniveau ausführen, Datenbanken mit mehreren Megabytes abfragen, Grafiken komprimieren und Schemata prüfen – vollständig innerhalb des isolierten Speicherbereichs Ihres Browsers.

Einmal in Ihren Browser-Tab geladen, funktionieren diese Tools in einer echten Air-Gapped-Umgebung (physisch vom Netzwerk isoliert). Sie können Ihre Netzwerkverbindung physisch trennen, das WLAN ausschalten und selbst vertraulichste Daten verarbeiten, ohne dass ein einziges Byte Ihre lokale Maschine verlässt.

Hier ist eine architektonische Aufschlüsselung, wie Sie die browserinterne Isolation verifizieren können, gefolgt von zehn geprüften Werkzeugen, die in die Offline-Toolbox jedes sicherheitsbewussten Entwicklers gehören.

## So überprüfen Sie, dass ein Browser-Tool niemals nach Hause telefoniert

Bevor Sie einem Web-Tool sensible Informationen anvertrauen, sollten Sie sich niemals allein auf Marketingversprechen oder Datenschutzerklärungen verlassen. Mit den nativen Entwicklertools Ihres Browsers lässt sich in weniger als dreißig Sekunden überprüfen, ob ein Tool rein clientseitig arbeitet:

1. **Netzwerk-Inspektor öffnen**: Drücken Sie `F12` oder `Cmd+Option+I` und wählen Sie den Reiter **Netzwerk** (Network).
2. **Nach aktiven Anfragen filtern**: Aktivieren Sie „Fetch/XHR“ und „WS“ (WebSocket), um alle ausgehenden Datenkanäle zu überwachen.
3. **Offline-Modus simulieren**: Öffnen Sie in Chromium-basierten Browsern oder Firefox das Drosselungs-Dropdown-Menü (oft mit „Keine Drosselung“ bzw. „No throttling“ beschriftet) und stellen Sie es auf **Offline**. Alternativ können Sie die Netzwerkverbindung Ihres Betriebssystems trennen.
4. **Kernfunktion ausführen**: Fügen Sie Ihre Nutzdaten ein, ziehen Sie Ihre Datei hinein oder klicken Sie auf Konvertieren. Verarbeitet die Anwendung die Daten sofort, ohne einen Verbindungsfehler zu werfen oder eine ausstehende POST-Anfrage auszulösen, liegt die gesamte Ausführungslogik im clientseitigen JavaScript oder WebAssembly.

Tools mit dieser clientseitigen Architektur verwenden häufig Content-Security-Policy-Header mit `connect-src 'none'` oder beschränken Netzwerkanfragen strikt auf statische Ressourcen des eigenen Ursprungs. Das bietet Ihnen kryptografische Gewissheit, dass Ihre Eingaben vertraulich bleiben.

## 1. CyberChef: Das kryptografische Schweizer Taschenmesser im Browser

Ursprünglich von Analysten der britischen Government Communications Headquarters (GCHQ) entwickelt und als Open Source für die Sicherheits-Community freigegeben, gilt **[CyberChef](/tool/gchq-github-io-cyberchef)** als Goldstandard für die Datentransformation im Browser. Es bietet Hunderte modularer Operationen – von einfacher Base64- und Hex-Kodierung über AES-GCM-Entschlüsselung, Zertifikatsanalyse und Regex-Extraktion bis hin zur Gzip-Dekomprimierung.

Wenn Sie Operationen in CyberChef miteinander verketten, wird jeder Schritt sequenziell im Browser-Thread ausgeführt. Egal ob Sie verdächtigen Shellcode analysieren, SHA-256-Hashes privater Binärdateien berechnen oder obfuskierte Skripte entpacken: Während der Rezeptausführung werden keinerlei Netzwerkanfragen abgesetzt. Als Progressive Web App ist CyberChef vollständig im Cache speicherbar und somit auf isolierten IT-Forensik-Workstations uneingeschränkt einsatzbereit.

## 2. Datasette Lite: SQLite im Arbeitsspeicher via WebAssembly abfragen

Datenanalysten müssen häufig vertrauliche CSV-Exporte oder Kundendatensätze abfragen, ohne dafür extra Datenbankserver bereitzustellen oder Cloud-Uploads zu riskieren. **[Datasette Lite](/tool/lite-datasette-io)** löst dies, indem sowohl die Python-Laufzeitumgebung (Pyodide) als auch die offizielle C-Datenbank-Engine von SQLite direkt zu WebAssembly kompiliert wurden.

Sobald Sie eine Datei in Datasette Lite laden, läuft die gesamte relationale Datenbank-Engine in der WebAssembly-Sandbox Ihres Browser-Tabs. Sie können komplexe SQL-Joins schreiben, Aggregationen ausführen, Millionen von Datenzellen filtern und Trends in Echtzeit visualisieren. Da die SQLite-Engine direkt auf lokalen Speicherpuffern arbeitet, verlassen Ihre sensiblen Unternehmensdaten zu keinem Zeitpunkt das System in Richtung externer APIs.

## 3. hat.sh: Zero-Knowledge-Dateiverschlüsselung mit Libsodium

Cloud-Speicheranbieter und E-Mail-Systeme sind grundsätzlich nicht vertrauenswürdige Übertragungswege. Bei der Übertragung sensibler Archive stellt clientseitige symmetrische Verschlüsselung sicher, dass zwischengeschaltete Plattformen lediglich unlesbaren Chiffretext sehen. **[hat.sh](/tool/hat-sh)** bietet clientseitige Dateiverschlüsselung auf Basis von libsodium, kompiliert zu WebAssembly.

Unter Verwendung moderner ChaCha20-Poly1305- und Argon2id-Schlüsselableitungsalgorithmen verschlüsselt hat.sh Dateien in gestreamten Chunks direkt im Browser. Ihre Passphrase verlässt niemals den lokalen Arbeitsspeicher, und die unverschlüsselte Datei berührt zu keinem Zeitpunkt einen externen Server. Sobald das Client-Bundle geladen ist, können Sie ein vertrauliches Archiv offline in den Browser-Tab ziehen und eine authentifizierte `.enc`-Datei mit vollständiger mathematischer Vertraulichkeit erzeugen.

## 4. CSV SafeCheck: Formelinjektionen vor dem Öffnen in Tabellenkalkulationen neutralisieren

Das Öffnen externer CSV-Dateien in Desktop-Tabellenkalkulationen wie Microsoft Excel oder LibreOffice Calc birgt erhebliche Sicherheitsrisiken. Bösartige Formeln, die mit `=`, `+`, `-` oder `@` beginnen, können DDE-Exploits (Dynamic Data Exchange) auslösen oder lokale Daten exfiltrieren, sobald sie von einem ahnungslosen Benutzer ausgeführt werden.

**[CSV SafeCheck](/tool/csv-safecheck-pages-dev)** analysiert CSV- und TSV-Dateien lokal über einen strikten Browser-Parser. Es durchsucht jede Spalte und Zeile nach Command-Injection-Payloads, nicht maskierten Trennzeichen und bösartiger Syntax, ohne die Tabellendaten an ein Analyse-Backend zu übermitteln. Sie erhalten eine sofortige Sicherheitsprüfung und eine bereinigte Download-Datei, bei der alle gefährlichen Präfixe sicher maskiert wurden – so bleiben interne Vertriebs- und Benutzerlisten geschützt.

## 5. privacy.sexy: Im lokalen DOM generierte Skripte zur Betriebssystem-Härtung

Das Härten von Betriebssystemen gegen Telemetriedatenerfassung, Hintergrund-Logger und unnötige Daemons erfordert meist administrative Skripte. Die Nutzung von Online-Skriptgeneratoren legt jedoch häufig Details über Ihre spezifische OS-Version, installierte Sicherheitswerkzeuge und Ihre Abwehrkonfiguration offen.

**[privacy.sexy](/tool/privacy-sexy)** umgeht dies, indem vollständige Skripte zur Systemanpassung (Bash für Linux/macOS und PowerShell für Windows) komplett im clientseitigen Code generiert werden. Während Sie Datenschutzprofile auswählen, Werbe-IDs deaktivieren oder Firewall-Regeln festlegen, wird das Skript dynamisch im DOM Ihres Browsers zusammengestellt. Kein Telemetrie-Profil wird auf Remote-Servern gespeichert, und Sie können den erzeugten Code vor der Ausführung Zeile für Zeile prüfen.

## 6. Squoosh: Professionelle Bildkomprimierung via Wasm SIMD

Das Aufbereiten von Grafiken, Architekturdiagrammen und UI-Mockups für Dokumentationen erfordert oft eine starke Dateikomprimierung. Die meisten gängigen Online-Bildkompressoren verlangen das Hochladen von PNGs oder JPEGs auf deren Cloud-Infrastruktur – ein gravierendes Datenschutzrisiko bei vertraulichen Produktdesigns oder internen System-Screenshots.

Googles Open-Source-Projekt **[Squoosh](/tool/squoosh-app)** leistete Pionierarbeit für hochperformante Browser-Bildkomprimierung, indem native C++-Codecs wie MozJPEG, OxiPNG, WebP und AVIF direkt mit SIMD-Beschleunigung zu WebAssembly kompiliert wurden. Wenn Sie ein Bild in Squoosh ablegen, führt der Hauptprozessor Ihres Rechners die mathematischen Kodierungsroutinen lokal aus. Der interaktive Vorher-Nachher-Vergleichsschieberegler wird direkt auf einem HTML5-Canvas gerendert und liefert Kompressionsraten auf Desktop-Niveau – völlig ohne Server-Kommunikation.

## 7. JSON Crack: Sensible Datenstrukturen auf dem Canvas visualisieren

API-Antworten, JWT-Tokens und verschachtelte Konfigurationsdateien sind im Rohtextformat notorisch schwer zu überblicken. Zwar existieren zahlreiche Cloud-Visualisierer, doch das Einfügen sensibler JSON-Daten mit Sitzungsschlüsseln oder Benutzerobjekten auf unbekannten Domains exponiert Zugangsdaten in fremden Server-Zugriffsprotokollen.

**[JSON Crack](/tool/jsoncrack-com)** wandelt komplexe JSON-, YAML- und XML-Dokumente vollständig clientseitig in interaktive, knotenbasierte Graphenbäume um. Der Layout-Algorithmus läuft in clientseitigem JavaScript und rendert visuelle Knoten direkt auf einem 2D-Canvas. Sie können verschachtelte Objekthierarchien durchsuchen, aufklappen und nachvollziehen, ohne dass auch nur ein einziges Byte Ihrer JSON-Daten den Tab verlässt.

## 8. DevDocs: Vollständige technische Dokumentation in der IndexedDB gespeichert

Moderne Softwareentwicklung erfordert das ständige Nachschlagen von API-Dokumentationen, Sprachsyntaxen und Framework-Spezifikationen. In isolierten Sicherheitslaboren (Air-Gapped) oder restriktiven Entwicklungsumgebungen, in denen ausgehender Internetzugang gesperrt oder überwacht wird, ist das Online-Nachschlagen schlicht unmöglich.

**[DevDocs](/tool/devdocs-io)** bündelt Hunderte von API-Dokumentationen – von JavaScript, Python, Go und Rust über PostgreSQL und Docker bis hin zu Linux-Manpages – in einer einheitlichen Weboberfläche. DevDocs erlaubt es Benutzern, komplette Dokumentationspakete direkt in den IndexedDB-Speicher des Browsers herunterzuladen. Einmal gespeichert, durchsuchen Sie Tausende Methoden, Klassen und Codebeispiele blitzschnell und völlig offline.

## 9. Excalidraw: Sichere Architektur-Skizzen auf dem Whiteboard

Systemarchitekten müssen häufig Netzwerktopologien, Bedrohungsmodellierungsdiagramme und vertrauliche Infrastrukturpläne entwerfen. Cloud-zentrierte Whiteboard-Plattformen speichern Skizzen auf Servern von Drittanbietern und schaffen so ein zentrales Angriffsziel für Wirtschaftsspionage und versehentliche Datenlecks.

**[Excalidraw](/tool/excalidraw-com)** stellt eine schlanke Zeichenfläche bereit, die völlig ohne Benutzerkonto funktioniert. Im Standalone-Modus verbleiben Ihre Architekturskizzen ausschließlich im lokalen Arbeitsspeicher und im localStorage Ihres Browsers. Falls Sie sich entscheiden, ein Diagramm über die Ende-zu-Ende-verschlüsselte Kollaborationsfunktion zu teilen, werden die kryptografischen Schlüssel lokal erzeugt und im URL-Fragment-Hash abgelegt, der niemals an den Relay-Server übermittelt wird.

## 10. AudioMass: Serverlose Wellenform-Audiobearbeitung

Das Bearbeiten von Sprachnotizen, Interviewaufnahmen oder akustischen Vorfallsprotokollen wirft aufgrund der Sensibilität von Audiodaten oft regulatorische Fragen auf. Cloud-Audio-Editoren laden megabyteschwere Audiodateien in Remote-Warteschlangen hoch und exponieren so Stimmen und vertrauliche Besprechungen.

**[AudioMass](/tool/audiomass-co)** ist eine vollwertige digitale Audio-Workstation (DAW), die in reinem clientseitigen JavaScript und mit der Web Audio API entwickelt wurde. Sie unterstützt Mehrspurschnitt, Frequenzanalyse, Pegelanpassung, Tonhöhenänderung sowie den MP3- und WAV-Export. Die gesamte Dekodierungs- und Rendering-Pipeline der Wellenform läuft auf den Kernen Ihrer lokalen CPU – so bearbeiten Sie vertrauliche Tonaufnahmen völlig ohne Server-Beteiligung.

## Architektonischer Vergleich: Cloud-abhängiges SaaS vs. clientseitige Browser-Tools

Die architektonische Diskrepanz zwischen traditionellen Cloud-Diensten und modernen clientseitigen Browser-Tools markiert einen fundamentalen Wandel für den Datenschutz und die Sicherheitsarchitektur:

| Architektonische Eigenschaft | Cloud-abhängiges SaaS | Clientseitiges / Air-Gapped Tool |
| :--- | :--- | :--- |
| **Ziel der Nutzdaten** | Über TLS an Remote-Backends übertragen | Im lokalen Browser-RAM und in CPU-Registern gehalten |
| **Datenpersistenz** | Auf Festplatten und Datenbanken Dritter gespeichert | Beim Schließen des Tabs verworfen oder in IndexedDB abgelegt |
| **Netzwerkabhängigkeit** | Permanente Breitband-Internetverbindung erforderlich | Voll funktionsfähig im Flugmodus / offline |
| **Compliance-Risiko** | Unterauftragsverarbeiter-Audits, AVVs, DSGVO-Risiken | Keinerlei Haftungsrisiken durch Datenverarbeitung Dritter |
| **Identitätsanforderung** | E-Mail-Verifizierung, Passwörter, OAuth-Profiling | Kein Login, kein Konto, sofortige Nutzbarkeit |
| **Fehlermodi** | Backend-Ausfälle, Rate-Limits, API-Abkündigungen | Läuft unbegrenzt weiter, solange der Browser geöffnet bleibt |

## Einen alltäglichen Zero-Egress-Workflow aufbauen

Der Umstieg auf clientseitige Werkzeuge erfordert weder Abstriche beim Komfort noch bei der Produktivität. Wenn Sie diese Werkzeuge in Ihrem Browser anheften oder als Progressive Web Apps (PWAs) installieren, schaffen Sie eine widerstandsfähige Entwicklungsumgebung, die geschützte Ressourcen bereits durch ihr Design absichert.

Indem Sie den Server aus der betrieblichen Gleichung entfernen, eliminieren Sie Bedrohungen wie unbefugte Dateneinsicht, Credential Stuffing und Datenschutzverletzungen. In einer Ära, in der Überwachung durch Konzerne und Datenerfassung zum allgegenwärtigen Standard geworden sind, bringt clientseitiges Computing den Webbrowser zurück zu seinem ursprünglichen Versprechen: ein leistungsstarker persönlicher Computer, der ausschließlich in Ihrem Dienst arbeitet.
