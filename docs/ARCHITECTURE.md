# Evidence architecture — first cut

## Trust layers

1. **File integrity:** SHA-256 detects byte changes after hashing. It does not identify who made the hash.
2. **Provenance:** C2PA can bind assertions to media and signatures. Signing identity and trust policy still matter; it cannot prove a scene is true.
3. **App/device signals:** Android Play Integrity / hardware-backed keys and Apple App Attest can provide platform-specific signals. They do not certify GPS or scene truth.
4. **Location:** Record native location, horizontal accuracy, fix age, and available mock-location/integrity signals. Treat all as reported indicators with residual spoofing risk.
5. **Time:** Preserve device-reported capture time separately from server receipt time and RFC 3161 TSA time. TSA time binds a digest no later than the TSA time; it does not establish when the camera shutter fired.
6. **Custody:** Append-only signed events, object versioning, access/export records, and independent periodic verification. Hash chains are tamper-evident only while an independently protected checkpoint/key exists.
7. **Scene truth:** Human/legal determination. No integrity score or AI guilt finding.

## Target capture protocol

1. Server issues short-lived random challenge after an upload session starts.
2. Native app obtains challenge, captures original media through native camera APIs, and hashes exact original bytes.
3. App binds challenge, media digest, app build identity, reported capture time, location and accuracy, and attestation result into a signed manifest. Platform-specific payloads remain distinct and verifiable.
4. Server verifies expiry/one-time challenge, media digest, signature and attestation; stores original bytes immutably under versioning; records server receipt time.
5. Server requests RFC 3161 timestamp for package digest from selected TSA; stores full token and validation material.
6. Independent export includes original, manifest, attestation material, TSA token, certificate chain, and signed custody events.

Challenge proves only that the app had a fresh challenge when it formed the package; it does not prove physical capture time or prevent a compromised device from injecting media. Offline captures receive a deferred status and later TSA time, never a retroactive trusted capture time.

## Initial decision record

| Requirement | Options | Evidence | Decision | Residual risk / test | Result |
|---|---|---|---|---|---|
| Independent bundle verification | Custom binary format; C2PA; both | C2PA ecosystem has Rust, Swift and Android SDKs; mobile release compatibility still untested | Use simple documented JSON bundle for POC; add C2PA only after native POC | Need external format interoperability tests | POC only |
| Tamper detection | Plain file hash; hash-chained events; external ledger | Python stdlib supports SHA-256; no trusted key/checkpoint exists yet | Hash + event chain for first POC | Attacker who can rewrite whole bundle can recompute hashes | Partial |
| Official submission | Direct API; manual official service; no routing | Gov.cy has anonymous Police information/complaint service | No submission integration until authority confirms scope and accepts package | Potential duplicate channel and unclear evidential procedure | BLOCKED |
| Web/mobile | Browser camera; native Android/iOS | Browser lacks app attestation / robust native capture control | Web limited to supporting evidence; high-assurance capture requires native apps | Mobile build/device tests not available yet | BLOCKED |

## Data boundary

- Never put images, precise location, case identifiers, or unsalted content hashes in public logs/blockchains.
- Avoid third-party analytics and advertising SDKs.
- Keep anti-abuse/network logs minimal, access-controlled, and retention-limited.
- Separate reporter identity from report/evidence records. Do not claim technical anonymity until network, storage, support, notification and authority flows are reviewed end to end.
