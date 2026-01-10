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

## Unterstützung für Mehrfach-Datei-Uploads pro Standort

Die Anwendung unterstützt nun Standorte (Objekte), deren Daten auf mehrere CSV-Dateien verteilt sind – ein häufiges Szenario bei größeren ESSER-Exporten.

### Funktionalität
- Administratoren können **mehrere CSV-Dateien gleichzeitig** auswählen, sowohl beim Erstellen eines neuen Objekts als auch beim Aktualisieren von Daten.
- Die Dateien werden clientseitig zu einem einzigen Datensatz zusammengeführt.
- Duplikate werden automatisch entfernt: Jeder Meldereintrag wird eindeutig über den Wert **„Nr.“** (die physische Geräteadresse) identifiziert. Erscheint dieselbe „Nr.“ in mehreren Dateien, wird nur ein Eintrag behalten.
- Der finale Datensatz wird **numerisch aufsteigend** nach „Nr.“ sortiert, unabhängig von der Reihenfolge der ausgewählten Dateien.

### Technische Umsetzung
1. Das Datei-Input-Feld erlaubt Mehrfachauswahl (`<input type="file" multiple>`).
2. Alle ausgewählten Dateien werden parallel eingelesen und geparst.
3. Die Zeilen werden in einer JavaScript-`Map` gespeichert, wobei „Nr.“ als Schlüssel dient – dies entfernt Duplikate automatisch.
4. Der zusammengeführte Datensatz wird wieder in ein Array umgewandelt, nach „Nr.“ sortiert und an das Backend gesendet.

### Vorteile
- Nahtlose Verarbeitung geteilter Exporte (z. B. 4 separate CSV-Dateien für einen großen Standort).
- Robust gegenüber Bedienfehlern: versehentliches doppeltes Auswählen einer Datei wird ignoriert, ohne Fehlermeldung.
- Keine serverseitigen Änderungen nötig – Deduplizierung und Sortierung erfolgen sicher im Browser.

Dadurch wird das Anlegen und Aktualisieren großer oder segmentierter Projekte deutlich einfacher und fehlerresistenter.