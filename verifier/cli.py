"""Minimal offline bundle hash and event-chain verifier.

This verifies internal consistency only. It does not authenticate the bundle's
author, capture device, location, capture time, or scene.
"""

import argparse
import hashlib
import json
import sys
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def create_demo(destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=False)
    media = destination / "media.bin"
    media.write_bytes(b"synthetic demo bytes; not a photograph\n")
    manifest = {
        "format": "civic-evidence-demo-v1",
        "evidence_id": "demo-only",
        "media": "media.bin",
        "media_sha256": sha256(media),
        "capture_time": {"value": None, "status": "not-provided"},
        "location": {"value": None, "status": "not-provided"},
        "signature": {"status": "not-implemented"},
        "trusted_timestamp": {"status": "not-implemented"},
        "device_attestation": {"status": "not-implemented"},
    }
    (destination / "manifest.json").write_bytes(canonical(manifest) + b"\n")
    event = {
        "sequence": 0,
        "type": "demo.bundle-created",
        "manifest_sha256": sha256(destination / "manifest.json"),
        "previous_event_hash": None,
    }
    event["event_hash"] = hashlib.sha256(canonical(event)).hexdigest()
    (destination / "events.jsonl").write_bytes(canonical(event) + b"\n")


def verify(bundle: Path) -> list[str]:
    errors: list[str] = []
    try:
        manifest_path = bundle / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        media_name = manifest["media"]
        if Path(media_name).name != media_name:
            errors.append("media path must be a filename within the bundle")
        else:
            media_path = bundle / media_name
            if not media_path.is_file():
                errors.append("media file missing")
            elif sha256(media_path) != manifest["media_sha256"]:
                errors.append("media SHA-256 mismatch")
        events_path = bundle / "events.jsonl"
        events = [json.loads(line) for line in events_path.read_text(encoding="utf-8").splitlines() if line]
        previous = None
        for expected_sequence, event in enumerate(events):
            claimed_hash = event.get("event_hash")
            payload = {key: value for key, value in event.items() if key != "event_hash"}
            if event.get("sequence") != expected_sequence:
                errors.append(f"event sequence mismatch at index {expected_sequence}")
            if event.get("previous_event_hash") != previous:
                errors.append(f"event predecessor mismatch at index {expected_sequence}")
            if hashlib.sha256(canonical(payload)).hexdigest() != claimed_hash:
                errors.append(f"event hash mismatch at index {expected_sequence}")
            previous = claimed_hash
        if not events:
            errors.append("event log empty")
        elif events[0].get("manifest_sha256") != sha256(manifest_path):
            errors.append("manifest hash is not bound to first event")
    except (OSError, ValueError, KeyError, TypeError) as exc:
        errors.append(f"bundle unreadable or invalid: {exc}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify internal bundle hashes; no authenticity claim.")
    sub = parser.add_subparsers(dest="command", required=True)
    create = sub.add_parser("create-demo", help="create synthetic, non-evidence demo bundle")
    create.add_argument("directory", type=Path)
    check = sub.add_parser("verify", help="check hashes and event chain")
    check.add_argument("directory", type=Path)
    args = parser.parse_args()
    if args.command == "create-demo":
        try:
            create_demo(args.directory)
        except FileExistsError:
            print("error: destination already exists", file=sys.stderr)
            return 2
        print(f"Created synthetic demo bundle: {args.directory}")
        print("This is not real evidence and contains no capture authenticity proof.")
        return 0
    errors = verify(args.directory)
    if errors:
        print("FAIL: internal consistency checks failed")
        for error in errors:
            print(f"- {error}")
        return 1
    print("PASS: file hashes and event-chain consistency only")
    print("NOT VERIFIED: signer, capture time, location, device, timestamp authority, or scene authenticity")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
