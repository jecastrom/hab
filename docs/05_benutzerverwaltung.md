# Benutzerverwaltung

Das System unterscheidet zwei klar definierte Benutzerrollen, um Zugriffsrechte sicher und übersichtlich zu verwalten.

## Standard (Teammitglied)
Diese Rolle ist für den regulären Einsatz vor Ort gedacht.

- Zugriff **nur** auf die Suchseite (`index.html`)
- Kann frei suchen und filtern
- Darf den Dunkelmodus aktivieren/deaktivieren
- Kann Biometrie (Passkeys) für das eigene Gerät registrieren und nutzen

Teammitglieder haben keinen Zugriff auf administrative Funktionen.

## Admin (Technischer Administrator)
Diese Rolle hat vollen Zugriff auf das Admin-Panel (`admin.html`).

- Erstellen und Löschen von Objekten (Standorten/Sites)
- Verwalten der Benutzerdatenbank (Erstellen, Bearbeiten, Löschen von Accounts)
- Durchführen von Daten-Uploads (CSV-Dateien verknüpfen)

Dadurch können Administratoren die Datenbasis pflegen und neue Nutzer anlegen.