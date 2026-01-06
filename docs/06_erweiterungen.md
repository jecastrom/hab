# Geplante Erweiterungen

Die Anwendung ist so konzipiert, dass sie schrittweise erweitert werden kann. Hier sind die wichtigsten geplanten Features für die nahe Zukunft:

## Hekatron-Integration
Erweiterung des bestehenden CSV-Parsers, um auch Export-Dateien aus Hekatron-Projekten zu unterstützen.

- Der Parser wird um neue Feld-Mappings und Bereinigungsregeln ergänzt
- Ziel: Nahtlose Verarbeitung und Suche von Hekatron-Daten neben den aktuellen ESSER-Daten

Dadurch wird die App für eine breitere Palette von Brandmeldeanlagen einsetzbar.

## Microsoft SSO
Integration mit **Microsoft Entra ID** (ehemals Azure AD) für unternehmensweites Single Sign-On.

- Nutzer können sich direkt mit ihren Microsoft-Arbeitskonten anmelden
- Keine separate Benutzerverwaltung mehr nötig
- Höhere Sicherheit und einfachere Administration in Unternehmensumgebungen

## Erweiterte Aktivitätsprotokolle
Einführung von serverseitigem Logging wichtiger Aktionen.

- Protokollierung von Suchanfragen (anonymisiert)
- Aufzeichnung von Administrator-Aktionen (z. B. Uploads, Löschungen, Benutzeränderungen)
- Zweck: Revisionsfähigkeit und Nachverfolgbarkeit für Audits

Dies erhöht die Compliance und Transparenz der Anwendung.

## Verbesserte Objekt-Erstellung im Admin-Panel

Optimierung des Workflows zum Hinzufügen neuer Standorte (Objekte) im Admin-Panel.

- Zusammenführen des bisherigen zweistufigen Prozesses (Objekt erstellen → Daten hochladen und verknüpfen) in ein **einheitliches Formular**.
- Administratoren geben den Standortnamen ein und laden die CSV-Datei in einem einzigen Schritt hoch.
- Das Backend übernimmt automatisch sowohl die Objekt-Erstellung als auch die Datenverknüpfung.

Der bestehende **separate Daten-Upload-Bereich** bleibt unverändert und ermöglicht schnelle Aktualisierungen bestehender Standorte durch reines Hochladen neuer CSV-Dateien (ohne Änderung des Namens).

Dies reduziert den Verwaltungsaufwand und minimiert Fehler beim Anlegen neuer Projekte.

## Mobile Push-Benachrichtigungen

Einführung von Push-Benachrichtigungen, um Techniker im Außeneinsatz über Datenaktualisierungen zu informieren.

- Nutzung der **Web Push API** (vollständig kompatibel mit der bestehenden PWA), um Benachrichtigungen auch bei geschlossener App zu senden.
- Haupt-Anwendungsfall: **Verfügbarkeit neuer Daten**
  - Bei Upload einer neuen CSV-Datei für ein Objekt/Standort durch einen Administrator wird eine Benachrichtigung an alle relevanten Nutzer gesendet.
  - Beispiel-Nachricht: „Neue Datenaktualisierung für Standort ABC123 verfügbar“
- Vorteil: Techniker erhalten rechtzeitig einen Hinweis, solange sie noch Internetverbindung haben. Sie können die App öffnen und den Cache aktualisieren, bevor sie in Bereiche mit schlechtem oder keinem Empfang (z. B. Kellerräume, abgeschirmte Zonen) gehen.

So arbeiten die Nutzer stets mit den aktuellsten Melder-/Zonendaten, ohne manuell nachprüfen zu müssen.