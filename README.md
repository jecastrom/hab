# Meldergruppen & Ringe Suche (PWA)

<p align="center">
  <a href="https://jecastrom.github.io/hab/">
    <img src="https://img.shields.io/badge/📚_Vollständige_Dokumentation-Jetzt_ansehen-brightgreen?style=for-the-badge" alt="Vollständige Dokumentation">
  </a>
</p>

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

