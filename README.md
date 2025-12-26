# Gruppen & Ringe – Schnelle Lokalisierung für Brandmeldeanlagen

![Feuermelder Icon](https://img.shields.io/badge/Status-Entwickelt%20mit%20xAI-blue.svg)  
*Ein Tool für Informationselektroniker für Brandmeldetechnik und Gefahrenmeldeanlagen.*

## Überblick
Dieses Web-Tool löst ein alltägliches Problem in der Wartung von Gefahrenmeldeanlagen: die rasche Zuordnung von Meldergruppen zu Ringen und umgekehrt. Es hilft Technikern, den Installationsort einer Gruppe zu finden, alle Gruppen in einem Ring aufzulisten und die Anzahl der Melder pro Gruppe einzusehen – alles in einer benutzerfreundlichen Oberfläche.

Entwickelt für den Praxiseinsatz, ermöglicht es eine effiziente Suche basierend auf exportierten Daten aus Systemen wie Esser Tools 8000. Kein langes Blättern durch Tabellen mehr – nur präzise Ergebnisse auf Knopfdruck!

## Funktionen
- **Schnelle Abfragen**: Suche nach Gruppe oder Ring – erhalte sofort den Installationsort, zugehörige Elemente und Melderanzahl.
- **Admin-UI für Wartung**: 
  - Neue Objekte (Anlagen) hinzufügen.
  - JSON-Daten hochladen (automatische Verarbeitung von CSV-Exports).
  - Objekte löschen – alles ohne Code-Kenntnisse.
- **Automatisierte Datenverarbeitung**: CSV aus Esser Tools 8000 wird nahtlos in JSON umgewandelt und integriert.
- **Responsive Design**: Optimiert für Mobile und Desktop, mit Dark-Mode-Unterstützung.

## Technische Highlights
- **Frontend**: HTML/CSS/JS mit responsivem Layout (Flexbox/Grid), Dark-Mode und Touch-Gesten.
- **Backend**: Azure Functions für GitHub-Integration (Commits/Deploys).
- **Hosting**: Azure Static Web Apps für hohe Verfügbarkeit, Skalierbarkeit und automatische Bereitstellung.
- **Datenquelle**: Unterstützung für Esser Tools 8000 (CSV zu JSON); erweiterbar für Hekatron.

## Einrichtung & Nutzung
1. Klone das Repository.
2. Konfiguriere Azure (Functions, Static Web App, GitHub Token).
3. Starte die App – suche oder administriere direkt!

Für detaillierte Anleitungen siehe [Wiki](wiki-link-placeholder).

*Entwickelt mit Fokus auf Einfachheit und Zuverlässigkeit – Feedback willkommen!* 🚀
