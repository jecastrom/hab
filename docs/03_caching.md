# Offline- & Caching-Strategie

Um den Einsatz in Bereichen ohne Netzabdeckung (z. B. Tiefgaragen oder Funklöcher) zu ermöglichen, wurde eine aggressive und zuverlässige Caching-Strategie implementiert.

## Auto-Precache
Beim Start der App wird zunächst die globale Datei `objects.json` geladen.  

Anschließend startet ein Hintergrundtask, der automatisch die JSON-Daten für **jedes** gelistete Objekt (Site) abruft und im Browser-Cache speichert.  

Dadurch stehen alle relevanten Daten sofort zur Verfügung – auch ohne Internetverbindung.

## Sitzungslogik bei Offline-Betrieb
Das Skript `auth-guard.js` überwacht den Online-Status über `navigator.onLine`.

- Läuft ein Authentifizierungs-Token ab, während der Nutzer offline ist, wird die Abmeldung **ausgesetzt**.
- Die Abmeldung erfolgt erst automatisch, sobald wieder eine Verbindung besteht.

Dies verhindert, dass Techniker während der Arbeit plötzlich aus der App geworfen werden.

## Offline-Signalisierung
Ein spezieller CSS-Klasse (`body.is-offline`) wird aktiviert, sobald die Verbindung abbricht.

- Dadurch erscheint automatisch ein auffälliges rotes **„OFFLINE“**-Badge in der Benutzeroberfläche.
- Der Nutzer wird visuell informiert, ohne dass die Funktionalität der App beeinträchtigt wird.