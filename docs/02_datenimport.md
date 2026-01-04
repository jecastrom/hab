## 2. Datenimport & Bereinigungs-Engine
Die Anwendung transformiert rohe Software-Exporte in durchsuchbare Informationen:
- **CSV-Verarbeitung:** Der Parser ist auf Zeile 3 für Header und Zeile 4 für Daten optimiert (ESSER-Standard).
- **Feld-Mapping:**
  - `Nr.` ➔ `Gruppe`
  - `Zusatztext` ➔ `Installationsort`
  - `Installationsort` ➔ `Ring`
- **Datenbereinigung:** Eine Regex-basierte Logik entfernt unerwünschte Zeichen aus Industrie-Exporten (`´`, `@`, `/`, `.`, `°`, `%`, `(`, `)`) und fasst mehrfache Leerzeichen zusammen. Dies garantiert eine saubere UI-Präsentation und eine zuverlässige Suche.