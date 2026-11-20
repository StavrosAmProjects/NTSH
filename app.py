"""Loopback-only local prototype for Ensinesthisi.cy."""

from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
import hashlib
import json
from pathlib import Path
import re
import secrets
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8765
MAX_BODY_BYTES = 4096
MAX_EVIDENCE_BYTES = 4 * 1024 * 1024
MAX_DEMO_REPORTS = 50
STATIC_PATHS = {"/", "/index.html", "/site.css", "/site.js"}
ALLOWED_HOSTS = {f"127.0.0.1:{PORT}", f"localhost:{PORT}"}
ALLOWED_ORIGINS = {f"http://{host}" for host in ALLOWED_HOSTS}

CATEGORIES = {
    "traffic": {"el": "Κυκλοφορία και στάθμευση", "en": "Traffic and parking"},
}
SCENARIOS = {
    "sidewalk-parking": {
        "category": "traffic",
        "title": {"el": "Στάθμευση πάνω σε πεζοδρόμιο", "en": "Parking on a sidewalk"},
        "summary": {
            "el": "Φανταστικό παράδειγμα: ένα όχημα είναι σταθμευμένο πάνω σε πεζοδρόμιο.",
            "en": "Fictional example: a vehicle is parked on a sidewalk.",
        },
    },
    "disabled-bay-parking": {
        "category": "traffic",
        "title": {"el": "Στάθμευση σε θέση ΑμεΑ", "en": "Parking in a disabled parking space"},
        "summary": {
            "el": "Φανταστικό παράδειγμα: ένα όχημα χωρίς σχετική άδεια καταλαμβάνει θέση στάθμευσης ΑμεΑ.",
            "en": "Fictional example: a vehicle without the relevant permit occupies a disabled parking space.",
        },
    },
}
DEMO_REPORTS = []
DEMO_SUBMISSIONS = {}


def _scenario_from_payload(payload):
    if not isinstance(payload, dict) or set(payload) != {"scenario_id", "confirmed_synthetic"}:
        raise ValueError("Choose a listed scenario and confirm it is fictional.")
    if payload["confirmed_synthetic"] is not True:
        raise ValueError("Synthetic-demo confirmation is required.")
    scenario_id = payload["scenario_id"]
    if not isinstance(scenario_id, str) or scenario_id not in SCENARIOS:
        raise ValueError("Choose a listed demo scenario.")
    return scenario_id, SCENARIOS[scenario_id]


def _new_report(scenario_id, scenario):
    return {
        "id": f"DEMO-{secrets.token_hex(4).upper()}",
        "scenario_id": scenario_id,
        "category_id": scenario["category"],
        "scenario_title": scenario["title"],
        "summary": scenario["summary"],
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "receipt_type": "synthetic-demo-only",
        "delivery_status": "not-transmitted",
        "authority_status": "not-connected",
        "c2pa_status": "not-integrated",
        "app_attestation_status": "not-integrated",
        "trusted_timestamp_status": "not-integrated",
        "time_status": "local-demo-time-not-trusted",
    }


def create_demo_report(payload, reports=None):
    """Create a receipt from a fixed fictional scenario; never accept report text."""
    scenario_id, scenario = _scenario_from_payload(payload)
    report = _new_report(scenario_id, scenario)
    collection = DEMO_REPORTS if reports is None else reports
    collection.insert(0, report)
    del collection[MAX_DEMO_REPORTS:]
    return report


def inspect_supporting_image(image, content_type):
    """Check size and basic container markers; this is not image or provenance validation."""
    if not isinstance(image, bytes) or not image or len(image) > MAX_EVIDENCE_BYTES:
        raise ValueError("Image must be between 1 byte and 4 MiB.")
    signatures = {
        "image/jpeg": image.startswith(b"\xff\xd8\xff") and image.endswith(b"\xff\xd9"),
        "image/png": image.startswith(b"\x89PNG\r\n\x1a\n") and image[-8:-4] == b"IEND",
        "image/webp": image[:4] == b"RIFF" and image[8:12] == b"WEBP" and int.from_bytes(image[4:8], "little") == len(image) - 8,
    }
    if content_type not in signatures or not signatures[content_type]:
        raise ValueError("Image type and basic file markers do not match.")
    return {
        "sha256": hashlib.sha256(image).hexdigest(),
        "bytes": len(image),
        "media_type": content_type,
        "assurance": "supporting-image-unverified",
        "source_status": "not-verified",
        "stored": False,
    }


def create_captured_demo_report(payload, image, content_type, idempotency_key, reports=None, submissions=None):
    """Hash a browser capture for a local fictional demo, then discard its bytes."""
    scenario_id, scenario = _scenario_from_payload(payload)
    if not isinstance(idempotency_key, str) or not re.fullmatch(r"[A-Za-z0-9-]{8,80}", idempotency_key):
        raise ValueError("A valid idempotency key is required.")
    evidence = inspect_supporting_image(image, content_type)
    collection = DEMO_REPORTS if reports is None else reports
    keys = DEMO_SUBMISSIONS if submissions is None else submissions
    previous = keys.get(idempotency_key)
    if previous:
        if previous["scenario_id"] != scenario_id or previous["evidence"]["sha256"] != evidence["sha256"]:
            raise ValueError("idempotency_key_conflict")
        return previous, False

    report = _new_report(scenario_id, scenario)
    report["evidence"] = evidence
    collection.insert(0, report)
    del collection[MAX_DEMO_REPORTS:]
    keys[idempotency_key] = report
    retained_ids = {item["id"] for item in collection}
    for key, item in list(keys.items()):
        if item["id"] not in retained_ids:
            del keys[key]
    return report, True


class Handler(SimpleHTTPRequestHandler):
    """Serve the existing frontend and a bounded, memory-only prototype API."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(self), microphone=(), geolocation=()")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' blob: data:; media-src 'self' blob:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format, *args):
        return

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def local_request_allowed(self):
        host = self.headers.get("Host", "").lower()
        origin = self.headers.get("Origin")
        return host in ALLOWED_HOSTS and (origin is None or origin in ALLOWED_ORIGINS)

    def _read_body(self, limit):
        try:
            length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            self.send_json(411, {"error": "content_length_required"})
            return None
        if length < 0 or length > limit:
            self.send_json(413, {"error": "request_too_large"})
            return None
        return self.rfile.read(length)

    def do_GET(self):
        path = urlsplit(self.path).path
        if not path.startswith("/api/"):
            if path not in STATIC_PATHS:
                return self.send_error(404)
            return super().do_GET()
        if not self.local_request_allowed():
            return self.send_json(421, {"error": "local_demo_only"})
        if path in {"/api/health", "/api/v1/health"}:
            return self.send_json(200, {
                "mode": "synthetic-local-prototype",
                "storage": "memory-only; image-bytes-discarded-after-hashing",
                "capture_assurance": "unverified-browser-frame",
                "c2pa": "not-integrated",
                "app_attestation": "not-integrated",
                "trusted_timestamp": "not-integrated",
                "authority_delivery": "disabled",
            })
        if path in {"/api/scenarios", "/api/v1/scenarios"}:
            return self.send_json(200, {"categories": CATEGORIES, "scenarios": SCENARIOS})
        if path in {"/api/reports", "/api/v1/reports"}:
            return self.send_json(200, {"reports": DEMO_REPORTS, "storage": "memory", "transmission": "none"})
        if path.startswith("/api/v1/reports/"):
            report_id = path.removeprefix("/api/v1/reports/")
            report = next((item for item in DEMO_REPORTS if item["id"] == report_id), None)
            return self.send_json(200, {"report": report}) if report else self.send_json(404, {"error": "not_found"})
        return self.send_json(404, {"error": "not_found"})

    def do_HEAD(self):
        if urlsplit(self.path).path not in STATIC_PATHS:
            return self.send_error(404)
        return super().do_HEAD()

    def do_POST(self):
        path = urlsplit(self.path).path
        if not self.local_request_allowed():
            return self.send_json(421, {"error": "local_demo_only"})
        if path == "/api/v1/reports":
            content_type = self.headers.get_content_type()
            if content_type not in {"image/jpeg", "image/png", "image/webp"}:
                return self.send_json(415, {"error": "supported_image_required"})
            if self.headers.get("X-Confirmed-Synthetic", "").lower() != "true":
                return self.send_json(400, {"error": "synthetic_demo_confirmation_required"})
            body = self._read_body(MAX_EVIDENCE_BYTES)
            if body is None:
                return
            payload = {"scenario_id": self.headers.get("X-Scenario-ID"), "confirmed_synthetic": True}
            try:
                report, created = create_captured_demo_report(
                    payload, body, content_type, self.headers.get("Idempotency-Key")
                )
            except ValueError as error:
                status = 409 if str(error) == "idempotency_key_conflict" else 400
                return self.send_json(status, {"error": str(error)})
            return self.send_json(201 if created else 200, {"report": report})
        if path == "/api/reports":
            if self.headers.get_content_type() != "application/json":
                return self.send_json(415, {"error": "application_json_required"})
            body = self._read_body(MAX_BODY_BYTES)
            if body is None:
                return
            try:
                report = create_demo_report(json.loads(body.decode("utf-8")))
            except (UnicodeDecodeError, json.JSONDecodeError, RecursionError, ValueError):
                return self.send_json(400, {"error": "invalid_demo_selection"})
            return self.send_json(201, {"report": report})
        return self.send_json(404, {"error": "not_found"})


def main():
    server = HTTPServer((HOST, PORT), Handler)
    print(f"Ensinesthisi local prototype: http://{HOST}:{PORT}")
    print("Browser capture is unverified. Images are hashed in memory then discarded; no authority delivery.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPrototype server stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
