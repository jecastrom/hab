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