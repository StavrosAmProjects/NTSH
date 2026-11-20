"""Loopback-only backend for the synthetic Ensinesthisi.cy prototype."""

from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
from pathlib import Path
import secrets
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8765
MAX_BODY_BYTES = 4096
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


def create_demo_report(payload, reports=None):
    """Create a receipt from a fixed fictional scenario; never accept report text."""
    if not isinstance(payload, dict) or set(payload) != {"scenario_id", "confirmed_synthetic"}:
        raise ValueError("Choose a listed scenario and confirm it is fictional.")
    if payload["confirmed_synthetic"] is not True:
        raise ValueError("Synthetic-demo confirmation is required.")
    scenario_id = payload["scenario_id"]
    if not isinstance(scenario_id, str) or scenario_id not in SCENARIOS:
        raise ValueError("Choose a listed demo scenario.")

    scenario = SCENARIOS[scenario_id]
    report = {
        "id": f"DEMO-{secrets.token_hex(4).upper()}",
        "scenario_id": scenario_id,
        "category_id": scenario["category"],
        "scenario_title": scenario["title"],
        "summary": scenario["summary"],
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "receipt_type": "synthetic-demo-only",
        "delivery_status": "not-transmitted",
        "time_status": "local-demo-time-not-trusted",
    }
    collection = DEMO_REPORTS if reports is None else reports
    collection.insert(0, report)
    del collection[MAX_DEMO_REPORTS:]
    return report


class Handler(SimpleHTTPRequestHandler):
    """Serve the existing frontend and a bounded local-demo API."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format, *args):
        # Request paths only are useful here; keep the local demo quiet.
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

    def do_GET(self):
        path = urlsplit(self.path).path
        if not path.startswith("/api/"):
            if path not in STATIC_PATHS:
                return self.send_error(404)
            return super().do_GET()
        if not self.local_request_allowed():
            return self.send_json(421, {"error": "local_demo_only"})
        if path == "/api/health":
            return self.send_json(200, {"mode": "synthetic-demo", "storage": "memory", "transmission": "none"})
        if path == "/api/scenarios":
            return self.send_json(200, {"categories": CATEGORIES, "scenarios": SCENARIOS})
        if path == "/api/reports":
            return self.send_json(200, {"reports": DEMO_REPORTS, "storage": "memory", "transmission": "none"})
        return self.send_json(404, {"error": "not_found"})

    def do_HEAD(self):
        if urlsplit(self.path).path not in STATIC_PATHS:
            return self.send_error(404)
        return super().do_HEAD()

    def do_POST(self):
        if urlsplit(self.path).path != "/api/reports":
            return self.send_json(404, {"error": "not_found"})
        if not self.local_request_allowed():
            return self.send_json(421, {"error": "local_demo_only"})
        if self.headers.get_content_type() != "application/json":
            return self.send_json(415, {"error": "application_json_required"})
        try:
            length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            return self.send_json(411, {"error": "content_length_required"})
        if length < 0 or length > MAX_BODY_BYTES:
            return self.send_json(413, {"error": "request_too_large"})
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            report = create_demo_report(payload)
        except (UnicodeDecodeError, json.JSONDecodeError, RecursionError, ValueError):
            return self.send_json(400, {"error": "invalid_demo_selection"})
        return self.send_json(201, {"report": report})


def main():
    server = HTTPServer((HOST, PORT), Handler)
    print(f"Ensinesthisi synthetic demo: http://{HOST}:{PORT}")
    print("Loopback only. Fictional presets only. No authority transmission or trusted time.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nDemo server stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
