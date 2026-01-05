# Authentication & Biometrics

The application offers secure and user-friendly authentication with modern biometrics support (WebAuthn/Passkeys) as well as classic JWT-based session management.

## JWT Implementation
Sessions are secured by JSON Web Tokens (JWT):
- Token validity: **8 hours**
- Renewed login required after expiration

This strikes a good balance between security and user comfort.

## WebAuthn (Passkeys)
The app supports device-native biometric authentication without password entry.

### Registration
- Generates a cryptographic key pair directly on the device
- The public key is securely linked to the user account
- The private key never leaves the device

### Login
- Seamless flow with system-native icons:
  - Face ID on iOS
  - Fingerprint or face recognition on Android
- No manual password entry needed

## Security Masking
To prevent unwanted browser dialogs like “Save password?” (often confused with biometrics registration), a special technique is used:

- The CSS attribute `-webkit-text-security` is applied to standard text fields
- This suppresses browser heuristics for detecting login forms

The biometrics flow remains clean and free of disturbing pop-ups.