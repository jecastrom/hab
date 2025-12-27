# Gruppen & Ringe – Schnelle Lokalisierung für Brandmeldeanlagen

 
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

*Entwickelt mit Fokus auf Einfachheit und Zuverlässigkeit.


### Project Structure

This repository is organized for Azure Static Web Apps (SWA) deployment: static files in root, Azure Functions in `/api/`. Below is the file tree:


plain ```

hab/
├── api/                  # Azure Functions backend
│   ├── login/            # Function folder for /api/login
│   │   ├── function.json # Binding config
│   │   └── index.js      # Login logic code
│   ├── add-object/       # Your existing functions...
│   └── delete-object/
├── login.html            # Static login page (root for direct access)
├── index.html            # Main search page
├── admin.html            # Admin panel
├── styles.css            # If separated (optional)
├── scripts/              # JS files if modularized
│   └── auth.js           # Shared auth utils (e.g., JWT check)
└── users.json            # Stored in root or data/ (committed to GitHub)

```

- **Static Files**: Served directly by SWA for performance.
- **Functions**: Auto-deployed as API endpoints (e.g., `/api/login`).
- **Data**: `users.json` acts as simple DB (GitHub-hosted; update via Functions for security).

For deployment: Push to GitHub → SWA auto-builds. Configure `JWT_SECRET` in Azure Function app settings.
