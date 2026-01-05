# Systemarchitektur

Die Anwendung basiert auf einer entkoppelten Architektur unter Verwendung von **Azure Static Web Apps**.

## Frontend
- Wird als statische Assets bereitgestellt.
- Ein **Service Worker** fängt Netzwerkanfragen ab und nutzt eine „Network-First“-Strategie mit Fallback auf den lokalen Cache.

## API (Backend)
- Eine Reihe von serverlosen **Azure Functions** verarbeitet Authentifizierung, Benutzerverwaltung und Datei-I/O.

## Persistenzschicht
Im Gegensatz zu Standard-SWA-Bereitstellungen (die schreibgeschützt sind) nutzt diese App das Verzeichnis `C:\home\data` innerhalb der Azure-Umgebung.

Dort werden gespeichert:
- `users.json`
- `objects.json`
- Die objektspezifischen Datendateien

Dies gewährleistet die Beständigkeit der Daten über Code-Deployments hinweg.