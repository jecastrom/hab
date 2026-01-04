## 4. Authentifizierung & Biometrie
- **JWT-Implementierung:** Sitzungen werden mit einem 8-Stunden-Token gesichert.
- **WebAuthn (Passkeys):** 
  - **Registrierung:** Erzeugt ein eindeutiges kryptografisches Schlüsselpaar auf dem Gerät und verknüpft den öffentlichen Schlüssel mit dem Benutzerkonto.
  - **Login:** Ein nahtloser Login-Flow mit gerätespezifischen Icons (Face ID für iOS, Fingerabdruck für Android).
- **Sicherheits-Maskierung:** Um die „Passwort speichern“-Dialoge der Browser zu unterdrücken (die oft mit der Biometrie-Registrierung verwechselt werden), nutzt die UI das Attribut `-webkit-text-security` auf Standard-Texteingabefeldern. Dies umgeht die Heuristiken der Browser zur Erkennung von Login-Formularen.