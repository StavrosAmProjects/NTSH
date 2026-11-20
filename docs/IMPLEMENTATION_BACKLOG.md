# Implementation backlog

## Phase 0 — now

- [x] Create isolated repository and preserve brief.
- [x] Record project limits and initial evidence model.
- [x] Implement standard-library hash/event-chain verifier POC.
- [x] Run verifier positive/tamper tests and record outputs.
- [x] Add a loopback-only, synthetic-only reporting demo with an in-memory receipt API.
- [x] Add browser-camera supporting-image capture, versioned local report API, SHA-256 receipt, and retry deduplication.
- [ ] Create native iOS and Android clients; retain separate assurance labels for browser-provided images.
- [ ] Verify current official online reporting routes by incident type; targeted only.
- [ ] Complete repo/license/security audit for candidates chosen for POC.

## Phase 1 — evidence POC

- [ ] Define versioned evidence bundle schema and signed manifest.
- [ ] Audit and integrate a pinned ProofMode/C2PA implementation per mobile platform.
- [ ] Build small Kotlin CameraX capture spike; preserve raw bytes.
- [ ] Build Swift AVFoundation capture spike; preserve raw bytes.
- [ ] Bind fresh server challenge to media digest and attestation assertion.
- [ ] Obtain/test RFC 3161 token using a permitted test TSA; keep production TSA blocked.
- [ ] Test on physical Android and iOS devices. No device means no pass claim.

## Phase 2 — product design

- [ ] Confirm authority gap and sponsor.
- [ ] Targeted Cyprus privacy/criminal-procedure opinion and DPIA.
- [ ] Freeze data model, state machine, access model and retention rules.
- [ ] Threat model and abuse/redaction review.

## Phase 3 — secure MVP after gates

- [ ] Bilingual citizen flow, anonymous receipt, secure API and encrypted evidence storage.
- [ ] Authority portal with MFA/RBAC and audited evidence access.
- [ ] Independent CLI verifier with signed events, C2PA, attestation and TSA verification.
- [ ] Adversarial, privacy, independent security and forensic audits.
- [ ] Controlled pilot only with written institutional approval.
