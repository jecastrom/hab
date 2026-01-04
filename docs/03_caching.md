## 3. Offline- & Caching-Strategie
Um die Anforderungen für den Einsatz in Funklöchern (z. B. Tiefgaragen) zu erfüllen, wurde eine aggressive Caching-Strategie implementiert:
- **Auto-Precache:** Beim Start lädt die App die globale `objects.json`. Danach startet ein Hintergrundtask, der automatisch die JSON-Daten für **jedes** gelistete Objekt abruft und im Cache speichert.
- **Sitzungslogik:** Das Skript `auth-guard.js` überwacht `navigator.onLine`. Läuft ein Token ab, während der Techniker offline ist, wird die Abmeldung ausgesetzt, bis wieder eine Verbindung besteht. Dies verhindert den Ausschluss von der App während der Arbeit.
- **Offline-Signalisierung:** Ein spezieller CSS-Status (`body.is-offline`) schaltet bei Verbindungsabbruch automatisch ein rotes „OFFLINE“-Badge frei.