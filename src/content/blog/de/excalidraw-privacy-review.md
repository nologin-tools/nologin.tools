---
title: "Ist Excalidraw datenschutzkonform? Kostenloses Online-Whiteboard ohne Login"
description: "Excalidraw verschlüsselt die Zusammenarbeit mit Schlüsseln, die den Browser nie verlassen. So hält dieses kostenlose Whiteboard deine Diagramme by design privat."
publishedAt: 2026-04-08
author: "nologin.tools"
tags: ["tools", "review", "privacy", "open-source"]
featured: false
heroImageQuery: "privacy encryption whiteboard digital security"
locale: "de"
originalSlug: "excalidraw-privacy-review"
sourceHash: "9dbf0a033cb42d45"
---

![Hero image](/blog/images/excalidraw-privacy-review/hero.jpg)

Denk an das letzte Diagramm, das du in einem kollaborativen Online-Whiteboard gezeichnet hast. Vielleicht war es eine Architekturskizze für ein Produkt, das du noch nicht angekündigt hast. Eine Prozesskarte, die zeigt, wie dein Team wirklich arbeitet. Eine Wettbewerbsanalyse. Ein Fundraising-Zeitplan.

Dieser Inhalt lebt irgendwo. Bei den meisten Whiteboard-Plattformen lebt er auf deren Servern — lesbar für ihre Mitarbeiter, zugänglich für rechtliche Anfragen, abhängig von der Datenschutzrichtlinie. Die meisten denken erst darüber nach, wenn es zu spät ist.

Excalidraw handhabt das anders. Wenn du eine Zeichnung über einen Kollaborationslink teilst, wird dein Inhalt verschlüsselt, bevor er deinen Browser verlässt. Die Excalidraw-Server übertragen Daten zwischen Teilnehmern, können aber nicht lesen, was diese Bytes enthalten. Der Verschlüsselungsschlüssel berührt niemals ihre Infrastruktur.

Das ist eine bedeutsame Design-Entscheidung für ein kostenloses Web-Tool. Hier ist, was das tatsächlich bedeutet und wann es wichtig ist.

## Was die meisten Whiteboard-Tools mit deinen Daten machen

Populäre Whiteboard-Tools funktionieren als Cloud-Dienste. Dein Inhalt lebt auf deren Servern, und die Plattform hat Lesezugriff darauf. Das ist nicht zwingend böswillig — es ist einfach, wie Cloud-Software funktioniert. Aber es hat praktische Konsequenzen.

Miro speichert deine Boards auf seiner Infrastruktur, und die Nutzungsbedingungen räumen dem Unternehmen Rechte ein, Inhalte zur Produktverbesserung zu nutzen. FigJam ist Teil der Figma-Enterprise-Suite. Lucidchart speichert deine Diagramme in der Cloud; Data-Residency-Optionen sind ein Enterprise-Feature.

Die Datenschutzrichtlinien sind nicht versteckt. Niemand liest sie, aber die Situation, die sie beschreiben, ist: Alles, was du zeichnest, wird von einem Unternehmen gespeichert, das es einsehen kann. Für eine schnelle Skizze ist das wahrscheinlich in Ordnung. Für eine Produkt-Roadmap vor dem Launch oder ein Healthcare-Workflow-Diagramm ändert sich die Kalkulation.

Die traditionelle Alternative zu Cloud-Whiteboards war „Tools, die lokal speichern, aber nicht kollaborieren können." Excalidraw hat diesen Trade-off aufgebrochen.

## Wie Excalidraw's Datenschutz-Architektur tatsächlich funktioniert

Wenn du eine Kollaborationssession in [Excalidraw](https://excalidraw.com) startest, generiert die App zwei Dinge: eine zufällige Raum-ID und einen zufälligen Verschlüsselungsschlüssel. Beide werden in die URL nach dem `#`-Symbol eingebettet.

Diese Platzierung ist bedeutsam. Browser senden das URL-Fragment niemals an Server. Wenn dein Browser `https://excalidraw.com/#room=abc123,encryptionKey456` lädt, sendet er eine GET-Anfrage an `excalidraw.com/` ohne Raum- oder Schlüsselinformationen. Der Server erhält nur die Basisanfrage — er sieht das Fragment nie.

Zeichendaten werden im Browser mit der [Web Cryptography API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) verschlüsselt, bevor sie übertragen werden. Der Server speichert und leitet nur verschlüsselten Chiffretext weiter. Ohne den Schlüssel — den er nicht hat und nicht erhalten kann — sind die Daten für Excalidraw's Infrastruktur unlesbar.

Das ist dieselbe Architektur wie bei [Yopass](/tool/yopass-se) für verschlüsseltes Secret-Sharing und [hat.sh](/tool/hat-sh) für In-Browser-Dateiverschlüsselung: Der Server übernimmt den Transport, der Nutzer hält die Schlüssel.

Für die Einzelnutzung ist die Situation noch einfacher. Excalidraw speichert deine aktuelle Zeichnung im Browser-`localStorage`. Nichts wird hochgeladen, es sei denn, du startest explizit eine Kollaborationssession oder exportierst eine Datei.

## Die Datenschutzversprechen verifizieren

Ein Datenschutzversprechen eines Closed-Source-Tools erfordert Vertrauen. Jeder kann behaupten „Wir lesen deine Daten nicht."

Excalidraw ist [MIT-lizenziert und öffentlich auf GitHub verfügbar](https://github.com/excalidraw/excalidraw). Die Verschlüsselungsimplementierung ist im Quellcode einsehbar — von jedem mit einem Browser und ein paar Minuten. Kollaborationssession-Code, Schlüsselgenerierung und Nachrichtenübermittlung können alle geprüft werden. Kein Vertrauen erforderlich — der Code ist der Beweis.

Das Projekt hat über 80.000 Sterne auf GitHub. Das bedeutet, dass eine große Anzahl von Entwicklern über mehrere Jahre aktiver Entwicklung auf den Code geschaut hat. Wenn es ein Datenschutzproblem in der Implementierung gäbe, wäre es findbar.

Das ist die entscheidende Lücke zwischen „Wir schätzen deine Privatsphäre" (Marketing-Sprache) und „Hier ist der Code, der Datenschutz implementiert" (verifizierbare Eigenschaft).

## Kollaboration ohne Konten — und ohne Kompromisse

Die typische Annahme über datenschutzfreundliche Software ist, dass sie Features gegen Schutz eintauscht. Echtzeit-Kollaboration erfordert normalerweise Konten, was eine E-Mail-Adresse erfordert, was eine Beziehung mit einer Plattform startet, die Zugriff auf deinen Inhalt hat.

Excalidraw's Kollaborationsmodell bricht diese Annahme auf. Zwei Personen können denselben Canvas in Echtzeit bearbeiten — Cursor erscheinen mit Namen, Änderungen werden sofort übertragen — ohne dass eine von beiden ein Konto hat. Der verschlüsselte Link ist der Zugangsmechanismus.

Für Anwendungsfälle, wo Kontoerstellung eine Barriere ist — Feedback von einem Kunden einholen, der kein weiteres SaaS-Login möchte, oder ein technisches Interview führen, bei dem der Kandidat sich auf das Problem konzentrieren soll, nicht auf einen Anmeldeprozess — ist das praktisch relevant.

Sessions sind standardmäßig kurzlebig. Wenn die letzte Person den Tab schließt, endet die Session. Es gibt keinen persistenten Cloud-Raum, zu dem man zurückkehren kann, es sei denn, man exportiert die `.excalidraw`-Datei. Für ein einmaliges Brainstorming oder eine einzelne Arbeitssession ist das in Ordnung. Für laufende Teamarbeit sind regelmäßige Exports in einen gemeinsamen Ordner der Workflow.

## Excalidraw vs. die Alternativen: Ein datenschutzorientierter Vergleich

Wenn die Frage speziell um Datenprivatsphäre geht, ist der Vergleich nicht Features gegen Features — es sind Datenmodelle.

| | Excalidraw | Miro | FigJam | tldraw |
|---|---|---|---|---|
| Server liest Inhalt | Nein (E2E verschlüsselt) | Ja | Ja | Nein |
| Login erforderlich | Nein | Ja | Ja | Nein |
| Selbst hostbar | Ja (MIT) | Nein | Nein | Ja |
| Quellcode einsehbar | Ja | Nein | Nein | Ja |
| Kollaboration E2E verschlüsselt | Ja | Nein | Nein | Teilweise |

[tldraw](/tool/tldraw-com) ist der nächste Konkurrent in Sachen Datenschutz. Ebenfalls Open Source, ebenfalls kein Login erforderlich, und eine saubere kollaborative Erfahrung. Der Hauptunterschied ist das Verschlüsselungsmodell — tldraw's Architektur verwendet derzeit nicht denselben URL-Fragment-Ansatz für Ende-zu-Ende-Verschlüsselung während der Kollaboration.

[Diagrams.net](/tool/app-diagrams-net) ist eine weitere No-Login-Option, die aus Datenschutzgründen erwähnenswert ist. Es speichert standardmäßig lokal und erfordert kein Konto. Bietet aber keine Echtzeit-Kollaboration auf dieselbe Weise.

Miro ist leistungsstark und ausgereift. Wenn dein Team es bereits nutzt und Datenschutz für deinen Anwendungsfall kein Problem ist, gibt es keinen zwingenden Grund zu wechseln. Aber wenn du etwas zeichnest, das kein Dritter lesen sollte, ist der Architekturunterschied real.

## Die Selbst-Hosting-Option

Wenn „der Kollaborationsserver ist E2E-blind" immer noch zu viel Vertrauen in einen Drittanbieter-Betreiber bedeutet — weil du in einer regulierten Branche tätig bist oder die Richtlinie deiner Organisation erfordert, dass Tools auf Unternehmensinfrastruktur laufen — ist Excalidraw selbst hostbar.

Das [offizielle Docker-Image](https://hub.docker.com/r/excalidraw/excalidraw) macht den Deployment unkompliziert. Du betreibst Excalidraw auf deinem eigenen Server, ohne Excalidraw-Infrastruktur. Sämtlicher Traffic läuft über deinen Server, in deiner Rechtsordnung, hinter deiner Firewall.

Diese Option existiert, weil die MIT-Lizenz das ausdrücklich erlaubt. Organisationen aus Gesundheitswesen, Finanzen und dem öffentlichen Sektor haben Excalidraw auf internen Netzwerken deployed, genau weil die Alternative — ein SaaS-Whiteboard, das Diagramme auf externen Servern speichert — Compliance-Risiken schafft.

## Wo das Datenschutzmodell seine Grenzen hat

Genauigkeit ist hier wichtig. Excalidraw's Datenschutzmodell ist in spezifischen, klar definierten Bereichen stark. Es hat Grenzen, die es wert sind, gekannt zu werden.

Wenn du ein PNG exportierst und es auf Slack oder Google Drive lädst oder per E-Mail sendest, enden Excalidraw's Garantien beim Export. Die Plattformen, über die du teilst, haben normalen Zugriff auf diese Dateien.

Excalidraw+ — die kostenpflichtige gehostete Version mit persistentem Cloud-Speicher und passwortgeschützten Räumen — ist ein anderes Produkt mit einem anderen Speichermodell.

Browser-`localStorage` ist auf OS-Ebene generell nicht verschlüsselt. Wenn jemand physischen Zugang zu deinem Rechner hat und weiß, wo er suchen muss, könnte er eine Zeichnung aus dem Browser-Speicher extrahieren.

Metadaten sind nicht verschlüsselt. Excalidraw weiß, wann du auf die Seite zugreifst, wie lang Sessions dauern und welche IP-Adressen teilgenommen haben. Das ist standardmäßiges Web-Server-Logging.

Keine dieser Punkte sind Gründe, das Tool zu meiden. Sie sind das genaue Bild davon, was „privat" in diesem Kontext bedeutet.

## Loslegen

Geh auf [excalidraw.com](https://excalidraw.com). Fang an zu zeichnen. Keine Registrierung. Keine Installation.

Deine Zeichnung wird automatisch in `localStorage` gespeichert, während du arbeitest. Den Tab schließen und wieder öffnen stellt dein letztes Canvas wieder her. Für dauerhaftes Speichern als `.excalidraw` exportieren (eine JSON-Datei, die du später öffnen und bearbeiten kannst), PNG oder SVG.

Für die Kollaboration klick auf das Personen-Symbol in der Toolbar und teile den generierten Link. Dein Mitarbeiter braucht nichts installiert, kein Konto, keinen Download. Der Link ist die Session.

Das Interessante an Excalidraw ist nicht, dass es kostenlos ist. Es ist, dass die Leute, die es gebaut haben, sich bewusst entschieden haben, den Server für den Inhalt blind zu machen. Echtzeit-Kollaboration, bei der der Vermittler die Daten nicht lesen kann, wurde als Ingenieursproblem betrachtet. Sie haben es gelöst und die Lösung dann open-sourced.
