import json
import tempfile
import unittest
from pathlib import Path

from verifier.cli import create_demo, verify


class VerifierTests(unittest.TestCase):
    def test_demo_bundle_passes_internal_consistency(self):
        with tempfile.TemporaryDirectory() as temporary:
            bundle = Path(temporary) / "bundle"
            create_demo(bundle)
            self.assertEqual([], verify(bundle))

    def test_media_tampering_fails(self):
        with tempfile.TemporaryDirectory() as temporary:
            bundle = Path(temporary) / "bundle"
            create_demo(bundle)
            (bundle / "media.bin").write_bytes(b"changed")
            self.assertIn("media SHA-256 mismatch", verify(bundle))

    def test_event_tampering_fails(self):
        with tempfile.TemporaryDirectory() as temporary:
            bundle = Path(temporary) / "bundle"
            create_demo(bundle)
            event = json.loads((bundle / "events.jsonl").read_text())
            event["type"] = "tampered"
            (bundle / "events.jsonl").write_text(json.dumps(event) + "\n")
            self.assertTrue(any("event hash mismatch" in error for error in verify(bundle)))


if __name__ == "__main__":
    unittest.main()
