# Ensinesthisi.cy — project instructions

This repository is a standalone project. Treat its files and the user-provided project brief as the only project-specific source of truth.

## Boundaries

- Do not search, read, import, sync, or reuse code, assets, datasets, credentials, or plans from the user's other projects.
- Do not connect this repository to any repository other than the one explicitly chosen for Ensinesthisi.cy.
- Do not claim official police or government status, authority integration, legal approval, evidentiary admissibility, or guaranteed anonymity.
- No public accusations, automatic guilt findings, or automatic fines.
- Use synthetic data only. Never test with real reports, personal data, photographs, or precise locations.
- Keep evidence limitations explicit. A hash proves byte consistency after hashing only. C2PA does not prove scene truth. Device GPS is not cryptographic location proof.
- Do not deploy or transmit data to external services unless the user specifically requests that destination and the necessary approval exists.

## Working rules

1. Read `README.md`, `PROJECT-BRIEF.md`, and `docs/STATUS.md` first.
2. Keep implementation minimal and maintainable. Prefer standard library and native platform capabilities.
3. For material changes, update tests and relevant docs. Do not claim tests ran unless they ran.
4. Mark unavailable or unverified capability `BLOCKED` or `NOT TESTED`; never invent verification.
5. Keep this project repository root as the working directory.

## Initial state

The current site is a visual prototype. The Python CLI verifies a synthetic bundle's hashes and event-chain consistency. Native capture, backend, signatures, C2PA, attestation, trusted timestamps, authority intake, and production privacy/legal approval are not implemented.
