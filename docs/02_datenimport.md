# Datenimport & Bereinigungs-Engine

Die Anwendung transformiert rohe Software-Exporte (CSV-Dateien) in saubere, durchsuchbare Informationen.

## CSV-Verarbeitung
Der Parser ist speziell auf den ESSER-Standard abgestimmt:
- Header-Zeile: Zeile 3
- Erste Datenzeile: Zeile 4

Dies ermöglicht eine zuverlässige Erkennung und Verarbeitung der Export-Dateien.

## Feld-Mapping
Die relevanten Spalten werden wie folgt umbenannt und zugeordnet:

- `Nr.` → **Gruppe**
- `Zusatztext` → **Installationsort**
- `Installationsort` → **Ring**

## Datenbereinigung
Eine Regex-basierte Logik sorgt für saubere Daten:
- Entfernt unerwünschte Sonderzeichen aus typischen Industrie-Exporten: `´`, `@`, `/`, `.`, `°`, `%`, `(`, `)`
- Fasst mehrfache Leerzeichen zu einem einzelnen zusammen

Das Ergebnis: eine übersichtliche UI-Präsentation und eine präzise, zuverlässige Suchfunktion.