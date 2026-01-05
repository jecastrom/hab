# Caching and Offline Functionality

To enable use in areas without network coverage (e.g., underground garages or dead zones), an aggressive and reliable caching strategy has been implemented.

## Auto-Precache
Upon app start, the global file `objects.json` is loaded first.

A background task then automatically fetches and stores the JSON data for **every** listed object (site) in the browser cache.

This makes all relevant data available immediately—even without an internet connection.

## Session Logic in Offline Mode
The script `auth-guard.js` monitors the online status via `navigator.onLine`.

- If an authentication token expires while offline, logout is **suspended**.
- Logout occurs automatically only when the connection is restored.

This prevents technicians from being unexpectedly logged out during work.

## Offline Signaling
A special CSS class (`body.is-offline`) activates when the connection drops.

- An eye-catching red **“OFFLINE”** badge appears automatically in the UI.
- The user is visually informed without impairing app functionality.