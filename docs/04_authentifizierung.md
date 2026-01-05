# Authentifizierung & Biometrie

Die Anwendung bietet eine sichere und benutzerfreundliche Authentifizierung mit moderner Biometrie-Unterstützung (WebAuthn/Passkeys) sowie klassischer JWT-basierten Sitzungsverwaltung.

## JWT-Implementierung
Sitzungen werden durch JSON Web Tokens (JWT) gesichert:
- Token-Gültigkeit: **8 Stunden**
- Nach Ablauf ist eine erneute Anmeldung erforderlich

Dies gewährleistet einen guten Kompromiss aus Sicherheit und Benutzerkomfort.

## WebAuthn (Passkeys)
Die App unterstützt geräteeigene biometrische Authentifizierung ohne Passworteingabe.

### Registrierung
- Erzeugt ein kryptografisches Schlüsselpaar direkt auf dem Gerät
- Der öffentliche Schlüssel wird sicher mit dem Benutzerkonto verknüpft
- Der private Schlüssel verlässt das Gerät niemals

### Login
- Nahtloser Ablauf mit systemeigenen Icons:
  - Face ID auf iOS
  - Fingerabdruck oder Gesichtserkennung auf Android
- Keine manuelle Passworteingabe nötig

## Sicherheits-Maskierung
Um unerwünschte Browser-Dialoge wie „Passwort speichern?“ zu verhindern (die oft mit der Biometrie-Registrierung verwechselt werden), wird eine spezielle Technik eingesetzt:

- Das CSS-Attribut `-webkit-text-security` wird auf Standard-Textfelder angewendet
- Dies unterdrückt die Heuristiken der Browser zur Erkennung von Login-Formularen

Dadurch bleibt der Biometrie-Flow sauber und ohne störende Pop-ups.