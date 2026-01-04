# Meldergruppen & Ringe Suche (PWA)

A high-performance, offline-capable Progressive Web App (PWA) designed for technicians to search and manage fire alarm detector data (ESSER Tools 8000) in environments with limited or no connectivity.

## 🚀 Key Features

- **PWA Architecture:** Installable on iOS and Android with a native-app feel.
- **Offline-First Search:** All site data is automatically pre-cached locally. Searches work perfectly deep underground or in shielded buildings.
- **Biometric Security:** Secure login via Face ID or Fingerprint (WebAuthn) as a seamless alternative to passwords.
- **Smart Data Ingestion:** Admin panel for uploading ESSER Tools 8000 CSV exports, featuring automatic data cleansing and key mapping.
- **Role-Based Access Control:** Secure boundaries between 'Team Members' (Search only) and 'Technical Administrators' (Full management).
- **Universal UX:** Consistent Dark Mode and settings across all interfaces.
- **Connectivity Awareness:** Real-time signaling of online/offline status.

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3 (Modern Flex/Grid), Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Azure Functions (Serverless).
- **Authentication:** JWT (JSON Web Tokens), bcryptjs, WebAuthn API.
- **Persistence:** Azure Persistent File Storage (outside the read-only wwwroot).
- **PWA:** Service Workers, Cache API, Web App Manifest.
- **Deployment:** Azure Static Web Apps (SWA).

