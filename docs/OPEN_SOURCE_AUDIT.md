# Open-source and dependency audit

Review date: 2026-11-21. This is a desk review of upstream project pages and the current local web and Expo prototypes. It is not a formal security review, license opinion, or approval for production use. Repository details can change; repeat checks against exact versions before adoption.

## Current project inventory

The desktop prototype uses Python standard-library modules, plain HTML, CSS, and JavaScript. The mobile app uses Expo SDK 58, React Native, and its package-lock dependencies. It has no analytics or third-party runtime reporting service. The desktop API is bound to loopback; the mobile capture and receipt flow runs in the app and keeps receipts in memory. Both clients use two fixed local-test parking scenarios. No C2PA, proof-of-capture, timestamp, authority routing, or persistent production service is connected. `npm audit --offline` reported zero known advisories across 790 resolved packages using the local npm audit data. Because registry access was unavailable, advisories could not be refreshed; `expo install --check` also fell back to the SDK's bundled version map. The unused `expo-font` dependency was removed from the app manifest and lockfile.

No upstream project below has been copied into or installed by this prototype. For the present local test, adding them would increase review and maintenance work without enabling a verified product need.

## Candidate upstream projects reviewed

| Project | Upstream finding | Decision for this prototype |
|---|---|---|
| [contentauth/c2pa-rs](https://github.com/contentauth/c2pa-rs) | Rust SDK for C2PA manifests | Defer until a real media authenticity workflow and threat model exist. Review exact release, license, transitive dependencies, and advisories before adoption. |
| [contentauth/c2pa-swift](https://github.com/contentauth/c2pa-swift) | Swift SDK for Apple platforms | Defer until a native iOS/macOS capture app is in scope; device build and license review remain outstanding. |
| [contentauth/c2pa-android](https://github.com/contentauth/c2pa-android) | Android SDK | Defer until a native Android capture app is in scope; device build and license review remain outstanding. |
| [contentauth/c2pa-node](https://github.com/contentauth/c2pa-node) | GitHub marks the repository archived/read-only since 2025-09-22 | Do not adopt this Node binding. Reassess maintained official options if a Node use case arises. |
| [Guardian Project ProofMode Android](https://github.com/guardianproject/proofmode-android) | GitHub page identifies itself as a mirror of the Guardian Project GitLab repository | Reference only. Check upstream GitLab activity, license, signing model, and supported devices before any adoption. The iOS counterpart was not independently verified in this review. |
| [codenotary/immudb](https://github.com/codenotary/immudb) | Immutable database project | Defer; current demo is in-memory and has no persistence requirement. Evaluate operational model, exact license, dependency tree, and recovery behavior if durable audit storage is designed. |
| [postgis/postgis](https://github.com/postgis/postgis) | PostGIS PostgreSQL spatial database extension | Defer; the current demo has no location collection or spatial queries. |
| [open-policy-agent/opa](https://github.com/open-policy-agent/opa) | General-purpose policy engine | Defer; this demo has no user roles or policy service. Keep authorization explicit if a real backend is later designed. |
| [OWASP MASVS](https://github.com/OWASP/masvs) and [MASTG](https://mas.owasp.org/) | Mobile application security standards and testing guidance | Guidance only when native clients exist; not a runtime dependency. |
| [sigstore/cosign](https://github.com/sigstore/cosign) | Artifact signing and verification tooling | Consider only for a future release pipeline; it does not establish authenticity of incident evidence. |
| [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) | Telemetry collection service | Defer; this prototype has no telemetry and should not introduce a new data boundary without a privacy design. |

## Skill and repository sourcing

The requested GitHub skills discovery/import capability did not expose mapped endpoints in this environment. No third-party skill was downloaded or installed. The local project-specific guidance and available design/audit instructions were used to review the current work. External skills and code repositories remain untrusted until their source, license, maintenance, permissions, and contents are reviewed.

## Adoption gate

Before adopting a dependency or repository, record its upstream URL, exact version or commit, license text, transitive dependencies, supported platforms, latest release and maintenance state, relevant security advisories, integration test, and maintenance owner. Review only candidates that meet an established product need. Do not treat popularity, open-source status, or a passing demo as security approval.

## Limits of this review

A pattern-based scan of all 7 Git commits and the working tree found no private-key headers, GitHub-token-like strings, AWS access-key IDs, or credential-like filenames. This is a heuristic scan, not a guarantee that every kind of secret is absent.

This pass did not perform a full source-code audit of upstream projects, resolve transitive dependency graphs for unadopted candidates, or assess advisories against a refreshed registry database. The app is a local prototype, not a production reporting or evidence service.
