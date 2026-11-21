# Project status

Updated: 2026-11-21

## Implemented

- Standalone Git repository with the project brief and preserved initial history.
- Static bilingual prototype with an interactive local demo flow.
- Responsive small-screen navigation, keyboard-visible focus, custom 404, and local PWA metadata/assets for the desktop web prototype.
- Python standard-library backend bound to loopback; versioned local API and two fixed demo scenarios.
- Browser camera preview for a supporting image; server hashes the compressed frame and discards image bytes.
- Expo Android/iOS/web app source with native camera capture, local SHA-256, and in-memory receipts; its web output is configured for static export.
- Project-specific icon assets replace the Expo starter branding in the app shell.
- Idempotent local demo receipts; no location, identity fields, free text, persistent media storage, or external transmission.
- Python standard-library CLI that checks media SHA-256, manifest binding, and a hash-linked event log.
- Synthetic verifier bundle explicitly marked as non-evidence.

## Not implemented / blocked

| Capability | Status | Blocker |
|---|---|---|
| Persistent report storage or production backend | NOT IMPLEMENTED | Current service is a loopback-only demo with volatile in-memory state |
| Native Android/iOS camera capture | IMPLEMENTED IN SOURCE; NOT TESTED ON DEVICE | Expo camera flow is present; native builds and real-device capture have not been verified |
| C2PA signing and trust validation | NOT IMPLEMENTED | No signing identity or validated mobile/backend integration |
| Device/app attestation | NOT IMPLEMENTED | Requires platform-specific apps, server verification, and physical devices |
| Trusted timestamp | NOT IMPLEMENTED | Requires TSA/QTSP selection, agreement, and RFC 3161 validation |
| GPS anti-spoofing | NOT IMPLEMENTED | GPS cannot prove physical location; native sensing and validation needed |
| Authority routing/integration | BLOCKED | No approved receiving endpoint, mandate, data-sharing agreement, or accepted workflow is configured |
| Legal/privacy production approval | BLOCKED | Requires targeted Cyprus legal, privacy and authority review |
| Forensic/production audit | BLOCKED | Prototype has not passed external examination |

## Important existing-service finding

Gov.cy currently provides a Cyprus Police route for anonymous information/complaints. This project must demonstrate a practical gap and may not represent itself as the official channel. Anonymous submission also does not guarantee investigation or follow-up. Confirm service scope for each report type before routing.

## Acceptance status

- Local demo receipt and browser-frame hash flow: implemented for demonstration only; records disappear when the local process stops and the image itself is discarded.
- Mobile capture and hash flow: implemented in Expo source only; not device-tested. Photos are not uploaded; receipts are session-only.
- Responsive navigation, static/PWA metadata, manifest assets, and custom not-found pages: implemented in source; not production-host tested.
- Hash check and event-chain code: tests cover valid and tampered bundles.
- C2PA, device/app attestation, trusted timestamp, location, institutional and legal claims: NOT TESTED / BLOCKED.
