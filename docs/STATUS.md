# Project status

Updated: 2026-11-20

## Implemented

- Standalone Git repository with the project brief and preserved initial history.
- Static bilingual prototype with an interactive local demo flow.
- Python standard-library backend bound to loopback; versioned local API and two fixed fictional traffic scenarios.
- Browser camera preview for a supporting image; server hashes the compressed frame and discards image bytes.
- Idempotent local demo receipts; no location, identity fields, free text, persistent media storage, or external transmission.
- Python standard-library CLI that checks media SHA-256, manifest binding, and a hash-linked event log.
- Synthetic verifier bundle explicitly marked as non-evidence.

## Not implemented / blocked

| Capability | Status | Blocker |
|---|---|---|
| Persistent report storage or production backend | NOT IMPLEMENTED | Current service is a loopback-only demo with volatile in-memory state |
| Native Android/iOS capture | BLOCKED | The repository contains no mobile applications; Android SDK/Java and physical-device testing are unavailable here |
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

- Local fictional report and browser-frame hash flow: implemented for demonstration only; records disappear when the local process stops and the image itself is discarded.
- Hash check and event-chain code: tests cover valid and tampered bundles.
- All device, cryptographic signer, timestamp, location, institutional and legal claims: NOT TESTED / BLOCKED.
