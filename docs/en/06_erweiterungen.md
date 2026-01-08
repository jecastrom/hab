# Planned Extensions

The application is designed for stepwise extension. Here are the most important planned features for the near future:

## Hekatron Integration
Extension of the existing CSV parser to also support export files from Hekatron projects.

- The parser will be supplemented with new field mappings and cleaning rules
- Goal: Seamless processing and search of Hekatron data alongside current ESSER data

This makes the app usable for a wider range of fire alarm systems.

## Microsoft SSO
Integration with **Microsoft Entra ID** (formerly Azure AD) for enterprise-wide Single Sign-On.

- Users can log in directly with their Microsoft work accounts
- No separate user management needed
- Higher security and easier administration in enterprise environments

## Extended Activity Logs
Introduction of server-side logging of important actions.

- Logging of search queries (anonymized)
- Recording of administrator actions (e.g., uploads, deletions, user changes)
- Purpose: Auditability and traceability for audits

This increases compliance and transparency of the application.

## Mobile Push Notifications

Add support for push notifications to keep field technicians informed about data updates.

- Leverage the **Web Push API** (fully compatible with the existing PWA) to deliver notifications even when the app is not open.
- Primary use case: **New data availability**
  - When an administrator uploads a new CSV file for a site/object, trigger a notification to all relevant users.
  - Example message: "New data update available for site ABC123"
- Benefit: Technicians receive a timely alert while they still have internet connectivity, allowing them to open the app and refresh the cache before entering areas with poor or no signal (e.g., basements, shielded rooms).

This ensures users always work with the latest detector/zone data without needing to manually check.