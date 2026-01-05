# System Architecture

The application is based on a decoupled architecture using **Azure Static Web Apps**.

## Frontend
- Deployed as static assets.
- A **Service Worker** intercepts network requests and uses a “Network-First” strategy with fallback to the local cache.

## API (Backend)
- A series of serverless **Azure Functions** handle authentication, user management, and file I/O.

## Persistence Layer
In contrast to standard SWA deployments (which are read-only),  this app uses the directory `C:\home\data` within the Azure environment.

Stored there:
- `users.json`
- `objects.json`
- The object-specific data files

This ensures data persistence across code deployments.