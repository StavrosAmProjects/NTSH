# Local prototype API contract

This API is loopback-only and demo-only. It is not an authority interface or a production intake service. No C2PA validation, app attestation, trusted timestamp, location processing, or external delivery occurs.

## Read endpoints

| Method and path | Purpose |
|---|---|
| `GET /api/v1/health` | Reports local-only mode and the status of unimplemented integrations. |
| `GET /api/v1/scenarios` | Returns the fixed bilingual synthetic traffic catalog. |
| `GET /api/v1/reports` | Returns recent in-memory demo receipts. |
| `GET /api/v1/reports/{report_id}` | Returns one demo receipt. |

## Create a local demo receipt

`POST /api/v1/reports` accepts one browser-generated JPEG, PNG, or WebP frame as the raw request body. Required headers:

```text
Content-Type: image/jpeg | image/png | image/webp
X-Scenario-ID: sidewalk-parking | disabled-bay-parking
X-Confirmed-Synthetic: true
Idempotency-Key: <8–80 letters, digits, or hyphens>
```

The server checks a small set of file markers and a 4 MiB size limit, computes SHA-256, creates a demo receipt, and discards the received bytes. The check does not decode the image, prove capture origin, or validate provenance. A retry with the same key and same scenario/hash returns the same receipt; reusing the key for different content returns `409`.

Each receipt states `synthetic-demo-only`, `supporting-image-unverified`, `not-integrated` for C2PA/app attestation/trusted timestamps, and `not-connected` for authorities. Data is held in memory, capped at 50 receipts, and lost when the process stops.

The legacy `POST /api/reports` JSON route remains for compatibility with the first demo; it creates a demo receipt without an image.

## Production boundary

This contract is not the production API proposed by the architecture plan. Production intake needs authentication appropriate to the selected anonymous/confidential/formal mode, durable encrypted storage, signed capture-session challenges, independently verified provenance and attestation, a reviewed retention policy, and authority-approved adapters. Those components must not be represented by this local demo endpoint.
