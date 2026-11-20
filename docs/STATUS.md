# Project status

Updated: 2026-11-20

## Implemented

- New standalone Git repository and preserved project brief.
- Python standard-library CLI that checks media SHA-256, manifest binding, and a hash-linked event log.
- Synthetic demo bundle explicitly marked as non-evidence.

## Not implemented / blocked

| Capability | Status | Blocker |
|---|---|---|
| Native Android/iOS capture | BLOCKED | No mobile toolchains or physical-device test access in this environment |
| C2PA signing and trust validation | NOT IMPLEMENTED | No signing identity or validated mobile/backend integration |
| Device/app attestation | NOT IMPLEMENTED | Requires platform-specific apps, server verification, and physical devices |
| Trusted timestamp | NOT IMPLEMENTED | Requires TSA/QTSP selection, agreement, and RFC 3161 validation |
| GPS anti-spoofing | NOT IMPLEMENTED | GPS cannot prove physical location; native sensing and validation needed |
| Backend and secure storage | NOT IMPLEMENTED | Hosting, key management, institutional/privacy design unresolved |
| Authority routing/integration | BLOCKED | Authority, mandate, data-sharing agreement, and accepted workflow not established |
| Legal/privacy production approval | BLOCKED | Requires targeted Cyprus legal, privacy and authority review |
| Forensic/production audit | BLOCKED | Prototype has not passed external examination |

## Important existing-service finding

Gov.cy currently provides a Cyprus Police route for anonymous information/complaints. This project must demonstrate a practical gap and may not represent itself as the official channel. Anonymous submission also does not guarantee investigation or follow-up. Confirm service scope for each report type before routing.

## Acceptance status

- Hash check and event-chain code: implemented; runtime verification pending in this workspace.
- All device, cryptographic signer, timestamp, location, institutional and legal claims: NOT TESTED / BLOCKED.
