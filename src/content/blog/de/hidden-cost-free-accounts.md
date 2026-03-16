---
title: "Der versteckte Preis kostenloser Accounts: Was du wirklich bezahlst"
description: "Kostenlose Accounts sind nicht gratis — Meta verdient 233 Dollar pro US-Nutzer im Jahr. Was wirklich gesammelt wird, wie es genutzt wird, und was du dagegen tun kannst."
publishedAt: 2026-03-14
author: "nologin.tools"
tags: ["privacy", "analysis", "tools"]
featured: false
heroImageQuery: "digital privacy data collection surveillance"
locale: de
originalSlug: hidden-cost-free-accounts
sourceHash: 6cafff4f6ab83823
---

![Hero image](/blog/images/hidden-cost-free-accounts/hero.jpg)

Meta hat 2024 rund 233 Dollar pro US-amerikanischem und kanadischem Nutzer verdient. Nicht durch Abonnements. Durch den Verkauf von Zugängen zu Verhaltensprofilen — aufgebaut aus allem, was du getippt, angeklickt, überflogen und ignoriert hast, während du ihre „kostenlosen" Produkte genutzt hast.

Diese Zahl stammt direkt aus den Quartalsberichten des Unternehmens. Keine Schätzung irgendwelcher Datenschutzaktivisten. Das ist das, was der Werbemarkt für deine Aufmerksamkeit und deine Verhaltensdaten zu zahlen bereit ist — und die Zahl steigt jedes Jahr.

Wenn ein Dienst also kostenlos ist, machst du kein Schnäppchen. Du bist das Schnäppchen.

## Was beim Anlegen eines Accounts wirklich gesammelt wird

Die E-Mail-Adresse ist dabei noch das Harmloseste. Sobald du einen Account erstellst — und oft schon vorher, durch Tracking-Pixel und Drittanbieter-Scripts — beginnt ein Unternehmen damit, ein Profil über dich aufzubauen.

Das Offensichtliche ist klar: Name, E-Mail, Geburtstag, Wohnort. Aber der eigentliche Wert steckt in den Verhaltensdaten. Jedes Scrollen, jede Pause, jede Suchanfrage und jedes Stück Content, bei dem du länger verweilts, wird protokolliert und in Modelle eingespeist, die Dinge über dich ableiten, die du niemandem erzählt hast. Ob du ängstlich bist. Ob du schwanger bist. Ob du kurz davor bist, ein Auto zu kaufen.

Darunter läuft technisches Fingerprinting. Browsertyp, Bildschirmauflösung, installierte Schriften, Grafikkartenverhalten — kombiniert ergeben diese Daten einen nahezu einzigartigen Identifier, der dir über verschiedene Seiten hinweg folgt, auch wenn du nicht eingeloggt bist und selbst dann, wenn du deine Cookies löschst. Das [Cover Your Tracks](https://coveryourtracks.eff.org)-Tool der EFF ([auch ohne Anmeldung nutzbar](/tool/coveryourtracks-eff-org)) zeigt dir genau, wie einzigartig dein Browser für die Seiten aussieht, die du besuchst. Die meisten Menschen sind überrascht.

Besonders schwer zu entkommen ist die seitenübergreifende Dimension. „Mit Google anmelden"- und „Mit Facebook anmelden"-Buttons auf Drittanbieter-Seiten melden sich bei Google und Meta zurück, selbst wenn du nicht draufklickst. Das Login-Widget lädt — und das Tracking findet statt, egal was. Du hast dich auf dieser Website für nichts angemeldet, trotzdem wird dein Besuch erfasst.

## Die Echtzeit-Auktion hinter jedem Seitenaufruf

Wenn du eine Webseite lädst, die programmatische Werbung schaltet, findet in etwa 100 Millisekunden eine Auktion statt. Dein Profil — geschlosserte demografische Daten, Kaufabsichtssignale, Browserverlauf — wird an hunderte potenzielle Werbetreibende übermittelt. Die bieten. Der Höchstbietende schaltet die Anzeige. Du siehst nichts davon, aber deine Daten wurden mit jedem Bieter in dieser Auktion geteilt — nicht nur mit dem Gewinner.

Das nennt sich Real-Time Bidding und ist das Fundament der Werbewirtschaft. Die Datenschutzprobleme sind dabei kein Versehen — sie sind strukturell. Deine Daten gleichzeitig mit hunderten Parteien zu teilen, ist das, wie das System funktioniert.

Googles Werbesparte hat 2024 rund 237 Milliarden Dollar eingenommen. Alphabet verkauft keine Anzeigen auf Basis von Markenbekanntheit allein; es verkauft Targeting, das nur möglich ist, weil gleichzeitig das Verhalten über Search, Gmail, YouTube, Maps, Android und den Chrome Browser hinweg verfolgt wird. Eine Studie der Vanderbilt University aus dem Jahr 2022 schätzte, dass ein unbeschäftigtes Android-Smartphone etwa 14 Mal pro Stunde Daten an Google-Server sendet.

## Das Datenpannen-Problem ist größer als du denkst

Kostenlose Accounts häufen sich an. Mit der Zeit haben die meisten Menschen dutzende davon — Forum-Registrierungen, Test-Anmeldungen, längst vergessene Apps. Jeder davon ist ein potenzielles Angriffsziel.

Troy Hunts [Have I Been Pwned](https://haveibeenpwned.com)-Datenbank ([ohne Login zugänglich](/tool/haveibeenpwned-com)) hatte Anfang 2025 über 14 Milliarden kompromittierte Accounts erfasst. Diese Zahl steht für tausende einzelne Datenpannen, von kleinen Foren bis hin zu großen Plattformen. Die Chancen stehen gut, dass deine E-Mail-Adresse dort mehrfach auftaucht.

Die eigentliche Katastrophe sind nicht die einzelnen Datenpannen — sondern was danach passiert. Datenhändler aggregieren Datensätze aus verschiedenen Quellen, führen sie zusammen und verkaufen umfassende Profile. Der National Public Data-Leak von 2024 legte rund 2,9 Milliarden Datensätze frei, darunter Sozialversicherungsnummern und Adressen. Das Unternehmen war ein Datenhändler. Es hatte all diese Informationen gezielt gesammelt, weil Daten ständig aus kostenlosen Diensten lecken — und weil es einen Markt gibt, sie zu kaufen, zu bereinigen und weiterzuverkaufen.

IBMs „Cost of a Data Breach Report 2024" bezifferte die durchschnittlichen weltweiten Kosten einer Datenpanne auf 4,88 Millionen Dollar pro Vorfall. Aber das sind die Kosten für das Unternehmen. Für die Betroffenen schlägt das anders zu Buche: durch Phishing-Versuche, Credential-Stuffing-Angriffe auf andere Accounts, durch Identitätsbetrug Jahre später.

> „Die Daten verschwinden nach einer Datenpanne nicht — sie kursieren. Ein Satz kompromittierter Zugangsdaten aus dem Jahr 2016 kann 2026 noch immer in aktiven Credential-Stuffing-Kampagnen eingesetzt werden."

## Was mit den Daten passiert, die du für harmlos hieltest

Die beunruhigendsten dokumentierten Missbrauchsfälle sind keine Theorie. Sie wurden untersucht, mit Bußgeldern belegt und teilweise eingestanden.

Metas Werbepixel wurde auf mindestens 33 der 100 meistbesuchten US-Krankenhauswebseiten gefunden. Es übermittelte Daten zu gesundheitsbezogenen Suchanfragen — nach bestimmten Diagnosen, Terminbuchungen — zurück an Facebooks Targeting-Systeme. Das berichtete The Markup im Jahr 2022. Diese Daten hätten die Systeme des Krankenhauses nie verlassen dürfen.

BetterHelp, eine Plattform für Online-Therapie, zahlte 2023 eine FTC-Strafe von 7,8 Millionen Dollar, weil das Unternehmen sensible psychische Gesundheitsdaten von Nutzern trotz ausdrücklicher gegenteiliger Versprechen an Facebook und Snapchat weitergegeben hatte.

Twitter (vor der Übernahme) einigte sich 2023 auf einen Vergleich über 150 Millionen Dollar wegen eines spezifischen Musters: Das Unternehmen hatte Telefonnummern für die Zwei-Faktor-Authentifizierung gesammelt und dieselben Nummern anschließend für Werbetargeting genutzt. Nummern, die aus Sicherheitsgründen angegeben wurden, landeten im Umsatzmodell.

Google zahlte 2022 einen Vergleich über 391 Millionen Dollar in mehreren US-Bundesstaaten, nachdem eine Untersuchung der Associated Press ergab, dass der Konzern den genauen Standort von Nutzern verfolgte, obwohl diese die „Standortverlauf"-Funktion explizit deaktiviert hatten. Die Einstellung sagte das eine. Das System tat das andere.

Das sind keine Einzelfälle. Es sind dokumentierte Durchsetzungsmaßnahmen von Bundesbehörden gegen einige der größten Technologieunternehmen der Welt.

## Warum die DSGVO hilft — und wo sie es nicht tut

Die EU-Datenschutz-Grundverordnung gibt europäischen Nutzern bedeutsame Rechte: Auskunft über ihre Daten, Löschung, Portabilität und die Pflicht von Unternehmen, eine rechtliche Grundlage für die Verarbeitung personenbezogener Daten nachzuweisen. DSGVO-Bußgelder können bis zu 4 % des weltweiten Jahresumsatzes betragen — weshalb Meta seit 2018 über 1,2 Milliarden Euro an DSGVO-Bußgeldern gezahlt hat.

Kaliforniens CCPA räumt ähnliche Rechte für Einwohner des Bundesstaates ein. Als Kalifornier kannst du Datenhändlern technisch gesehen mitteilen, deine Daten zu löschen. Das Problem: Eine Studie von Consumer Reports ergab, dass Datenhändler gelöschte Daten oft innerhalb von Monaten aus anderen Quellen wieder beschaffen. Löschanfragen wirken einmal. Die Datenwirtschaft füllt Lücken automatisch wieder auf.

Die USA haben bis 2026 immer noch kein umfassendes Bundesdatenschutzgesetz. Der Schutz variiert je nach Bundesstaat, Branche und dem guten Willen der Unternehmen. Für die meisten Nutzer außerhalb Kaliforniens und der EU ist der rechtliche Schutz dünn.

## Der Vergleich, den du wirklich anstellen solltest

| Tool | Account erforderlich | Gesammelte Daten | Einnahmemodell |
|---|---|---|---|
| Google Docs | Ja | Dokumentinhalte, Verhalten, Metadaten | Werbetargeting |
| Microsoft 365 Free | Ja | Nutzungstelemetrie, Content-Scanning | Upsell + Daten |
| Photopea (ohne Login) | Nein | Minimale Session-Daten | Display-Werbung (nicht-zielgerichtet) |
| Excalidraw (ohne Login) | Nein | Nichts serverseitig gespeichert | Open Source / Spenden |
| PDF24 Tools (ohne Login) | Nein | Dateiinhalte (verarbeitet, nicht gespeichert) | Werbung |

[Photopea](/tool/photopea-com) öffnet PSD-Dateien auf dem Niveau einer Desktop-Anwendung. [Excalidraw](/tool/excalidraw-com) ist ein vollständiges kollaboratives Whiteboard. Keins der beiden erfordert einen Account. Keins baut ein Verhaltensprofil über dich auf. Die Lücke zwischen diesen Tools und ihren account-pflichtigen Gegenstücken hat sich dramatisch verkleinert.

Der Vergleich fällt nicht immer zugunsten von No-Login-Tools aus — Google Docs hat Funktionen, die Photopea nicht hat. Aber für einen großen Teil der alltäglichen Aufgaben ist der Funktionsunterschied entweder vernachlässigbar oder gar nicht vorhanden, und die Abwägung verschiebt sich vollständig.

## Was du konkret tun kannst

No-Login-Tools für Aufgaben zu nutzen, die keine dauerhafte Speicherung erfordern, ist der direkteste Ansatz. Für schnelle Bildbearbeitung, Formatkonvertierung, PDF-Tools, Whiteboard-Skizzen, Grammatikprüfung und dutzende andere Anwendungsfälle gibt es Tools, die ohne Anmeldung funktionieren — und zwar gut. [nologin.tools](/tool/nologin-tools) pflegt ein kuratiertes Verzeichnis mit geprüften Optionen.

Wenn du wirklich einen Account brauchst, ermöglichen [Wegwerf-E-Mail-Dienste](/tool/temp-mail-org) das Erstellen einer Einmaladresse für die Anmeldung. So wird dein echter Posteingang nicht zu einem Datenpunkt, der über dutzende Dienste hinweg verknüpft wird. Das hilft nicht beim Verhaltens-Tracking nach dem Login, begrenzt aber die Verknüpfung deiner echten Identität.

Browser-Hygiene ist wichtig. Getrennte Browser für verschiedene Kontexte, aggressives Content-Blocking und das Wissen darum, was dein Browser preisgibt, machen einen Unterschied. [BrowserLeaks](/tool/browserleaks-com) zeigt dir, welche Fingerprinting-Daten aus deinem aktuellen Setup sichtbar sind.

Das kürzlich auf Hacker News vorgestellte Tool Ichinichi — eine Ein-Notiz-pro-Tag-App, die Ende-zu-Ende-verschlüsselt und Local-First ist — steht stellvertretend für eine breitere Architekturrichtung, die es wert ist, im Auge zu behalten. Local-First-Anwendungen, die Daten auf deinem Gerät statt in der Cloud verarbeiten, umgehen das serverseitige Datenhortungsproblem von Grund auf. Der Trend zu Local-First-, Zero-Knowledge- und Privacy-by-Design-Tools nimmt Fahrt auf. Nicht wegen eines moralischen Sieges, sondern weil genug Nutzer danach fragen — und damit einen Markt geschaffen haben.

## Der Wandel, der bereits stattfindet

Der Regulierungsdruck steigt. Durchsetzungsmaßnahmen werden größer. DSGVO-Bußgelder haben die Milliardengrenze überschritten. Die FTC war unter den letzten Regierungen bei Datenpraktiken aktiver als im vorangegangenen Jahrzehnt. Bundesstaatliche Gesetzgebung nimmt zu. Die rechtlichen Kosten für Datenmissbrauch steigen — das verändert die Kalkulation für Unternehmen, die Nutzerdaten bisher als reinen Gewinn betrachteten.

Die technischen Alternativen sind besser als je zuvor. Datenschutzfreundliche Tools für nahezu jeden gängigen Workflow existieren inzwischen, oft auf Open-Source-Grundlagen gebaut, die sie auf eine Art und Weise vertrauenswürdig machen, die proprietäre Dienste nicht erreichen können.

Der Standard ist trotzdem noch immer Überwachung. Die meisten Menschen werden weiter Accounts erstellen, Nutzungsbedingungen akzeptieren, die sie nicht lesen, und unwissentlich Verhaltenswerbe-Ökosysteme mit dem Protokoll ihres digitalen Alltags finanzieren. Diesen Standard zu ändern — einen Tool-Wechsel nach dem anderen — ist keine perfekte Lösung, aber eine echte.

Die Frage ist nicht, ob du komplett auf Accounts verzichten kannst. Das wirst du wahrscheinlich nicht können. Die Frage ist: Welche Accounts sind wirklich notwendig — und bei welchen hast du dich angemeldet, weil es schneller war, als nach einer Alternative zu suchen?
