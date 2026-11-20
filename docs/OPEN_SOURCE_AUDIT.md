# Open-source audit — initial desk review

This is not a complete dependency approval. No dependency is installed or copied yet. Repository status can change; pin reviewed release/commit and rerun license/advisory checks before adoption.

| Project | Current finding | Initial decision |
|---|---|---|
| `contentauth/c2pa-rs` | Official repo; Rust C2PA SDK; dual MIT/Apache-2.0 license stated in repo/search result; active releases surfaced | Candidate for server/CLI verifier prototype; pin and inspect API/security advisories first |
| `contentauth/c2pa-swift` | Official iOS/macOS SDK and release history surfaced; license/build matrix not yet verified | Candidate; BLOCKED pending device build and license review |
| `contentauth/c2pa-android` | Official Android SDK/release history surfaced; current README shows Gradle distribution; min SDK/signing limitations not tested | Candidate; BLOCKED pending device build and license review |
| `contentauth/c2pa-node` | Listed by brief; current maintenance, package and API not yet verified | Do not select yet |
| Guardian Project Proofmode Android/iOS | Listed by brief; repository state, licenses, signing model and current platform compatibility not verified | Reference candidate only; BLOCKED |
| `codenotary/immudb` | Not yet inspected | Defer; first test whether simple signed, checkpointed audit log meets needs |
| PostGIS | Mature geospatial option, but no spatial query requirement established for POC | Defer until authority routing/map requirements are defined |
| OPA | Policy engine may be unnecessary for first small service; not yet audited | Defer; start with explicit server-side authorization policy |
| OWASP MASVS/MASTG | Use as mobile security assessment baseline; no runtime dependency | Adopt as test guidance after native apps exist |
| `sigstore/cosign` | Useful for signing build artifacts, not incident media evidence | Consider in CI/release supply-chain controls only |
| OpenTelemetry Collector | Adds operational telemetry boundary and deployment cost | Defer; define privacy-safe observability before adding |

## Next audit gate

For each adopted dependency: record upstream URL, exact version/commit, license text, transitive dependencies, supported platforms, release date, security advisories reviewed, integration test, and owner. Do not treat popularity, open source status, or a release tag as a security approval.
