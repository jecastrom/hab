### Teil 1: GitHub README.md

# Meldergruppen & Ringe Suche (PWA)

Eine hochperformante, offline-fähige Progressive Web App (PWA), die speziell für Techniker entwickelt wurde, um Melderdaten (ESSER Tools 8000) in Umgebungen mit eingeschränkter oder fehlender Konnektivität zu suchen und zu verwalten.

## 🚀 Hauptmerkmale

- **PWA-Architektur:** Installierbar auf iOS und Android mit dem Gefühl einer nativen App.
- **Offline-First Suche:** Alle Objektdaten werden automatisch im Hintergrund lokal zwischengespeichert. Die Suche funktioniert einwandfrei in Untergeschossen oder abgeschirmten Gebäuden.
- **Biometrische Sicherheit:** Sicherer Login via Face ID oder Fingerabdruck (WebAuthn) als nahtlose Alternative zum Passwort.
- **Intelligenter Datenimport:** Admin-Panel zum Hochladen von ESSER Tools 8000 CSV-Exporten mit automatischer Datenbereinigung und Feld-Mapping.
- **Rollenbasierte Zugriffskontrolle:** Klare Trennung zwischen „Teammitgliedern“ (nur Suche) und „Technischen Administratoren“ (vollständige Verwaltung).
- **Universelle UX:** Konsistentes Design mit Dunkelmodus-Unterstützung und einheitlichen Einstellungen über alle Schnittstellen hinweg.
- **Konnektivitäts-Status:** Echtzeit-Signalisierung des Online-/Offline-Status durch ein diskretes Benachrichtigungsbanner.

## 🛠 Tech-Stack

- **Frontend:** HTML5, CSS3 (Modernes Flexbox/Grid), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Azure Functions (Serverless).
- **Authentifizierung:** JWT (JSON Web Tokens), bcryptjs, WebAuthn API.
- **Speicherung:** Persistenter Azure-Dateispeicher (außerhalb des schreibgeschützten wwwroot).
- **PWA:** Service Worker, Cache API, Web App Manifest.
- **Bereitstellung:** Azure Static Web Apps (SWA).

---

### Teil 2: Umfassende Technische Dokumentation

## 1. Systemarchitektur
Die Anwendung basiert auf einer entkoppelten Architektur unter Verwendung von **Azure Static Web Apps**.
- **Frontend:** Wird als statische Assets bereitgestellt. Ein **Service Worker** fängt Netzwerkanfragen ab und nutzt eine „Network-First“-Strategie mit Fallback auf den lokalen Cache.
- **API (Backend):** Eine Reihe von serverlosen **Azure Functions** verarbeitet Authentifizierung, Benutzerverwaltung und Datei-I/O.
- **Persistenzschicht:** Im Gegensatz zu Standard-SWA-Bereitstellungen, die schreibgeschützt sind, nutzt diese App das Verzeichnis `C:\home\data` innerhalb der Azure-Umgebung. Dort werden `users.json`, `objects.json` und die objektspezifischen Datendateien gespeichert, um die Beständigkeit über Code-Deployments hinweg zu gewährleisten.

## 2. Datenimport & Bereinigungs-Engine
Die Anwendung transformiert rohe Software-Exporte in durchsuchbare Informationen:
- **CSV-Verarbeitung:** Der Parser ist auf Zeile 3 für Header und Zeile 4 für Daten optimiert (ESSER-Standard).
- **Feld-Mapping:**
  - `Nr.` ➔ `Gruppe`
  - `Zusatztext` ➔ `Installationsort`
  - `Installationsort` ➔ `Ring`
- **Datenbereinigung:** Eine Regex-basierte Logik entfernt unerwünschte Zeichen aus Industrie-Exporten (`´`, `@`, `/`, `.`, `°`, `%`, `(`, `)`) und fasst mehrfache Leerzeichen zusammen. Dies garantiert eine saubere UI-Präsentation und eine zuverlässige Suche.

## 3. Offline- & Caching-Strategie
Um die Anforderungen für den Einsatz in Funklöchern (z. B. Tiefgaragen) zu erfüllen, wurde eine aggressive Caching-Strategie implementiert:
- **Auto-Precache:** Beim Start lädt die App die globale `objects.json`. Danach startet ein Hintergrundtask, der automatisch die JSON-Daten für **jedes** gelistete Objekt abruft und im Cache speichert.
- **Sitzungslogik:** Das Skript `auth-guard.js` überwacht `navigator.onLine`. Läuft ein Token ab, während der Techniker offline ist, wird die Abmeldung ausgesetzt, bis wieder eine Verbindung besteht. Dies verhindert den Ausschluss von der App während der Arbeit.
- **Offline-Signalisierung:** Ein spezieller CSS-Status (`body.is-offline`) schaltet bei Verbindungsabbruch automatisch ein rotes „OFFLINE“-Badge frei.

## 4. Authentifizierung & Biometrie
- **JWT-Implementierung:** Sitzungen werden mit einem 8-Stunden-Token gesichert.
- **WebAuthn (Passkeys):** 
  - **Registrierung:** Erzeugt ein eindeutiges kryptografisches Schlüsselpaar auf dem Gerät und verknüpft den öffentlichen Schlüssel mit dem Benutzerkonto.
  - **Login:** Ein nahtloser Login-Flow mit gerätespezifischen Icons (Face ID für iOS, Fingerabdruck für Android).
- **Sicherheits-Maskierung:** Um die „Passwort speichern“-Dialoge der Browser zu unterdrücken (die oft mit der Biometrie-Registrierung verwechselt werden), nutzt die UI das Attribut `-webkit-text-security` auf Standard-Texteingabefeldern. Dies umgeht die Heuristiken der Browser zur Erkennung von Login-Formularen.

## 5. Benutzerverwaltung
Das System unterstützt zwei Rollen:
- **Standard (Teammitglied):** Zugriff nur auf die Suchseite (`index.html`). Kann Suchen durchführen, den Dunkelmodus nutzen und Biometrie für das eigene Gerät registrieren.
- **Admin (Technischer Administrator):** Voller Zugriff auf das Admin-Panel (`admin.html`). Kann Objekte (Standorte) erstellen/löschen, die Benutzerdatenbank verwalten und Daten-Uploads durchführen.

## 6. Zukünftige Erweiterungen
- **Hekatron-Integration:** Erweiterung des CSV-Parsers zur Unterstützung von Hekatron-Projekt-Exporten.
- **Microsoft SSO:** Integration mit Microsoft Entra ID (ehemals Azure AD) für unternehmensweites Single Sign-On.
- **Erweiterte Aktivitätsprotokolle:** Serverseitiges Logging von Suchanfragen und Administrator-Aktionen für Revisionszwecke.
