import hashlib
import unittest

from app import create_captured_demo_report, create_demo_report, inspect_supporting_image


class DemoReportTests(unittest.TestCase):
    def test_catalog_contains_only_the_two_requested_fictional_traffic_examples(self):
        from app import SCENARIOS

        self.assertEqual({"sidewalk-parking", "disabled-bay-parking"}, set(SCENARIOS))
        self.assertEqual({"traffic"}, {scenario["category"] for scenario in SCENARIOS.values()})

    def test_fixed_synthetic_scenario_creates_non_transmitted_receipt(self):
        reports = []
        report = create_demo_report(
            {"scenario_id": "sidewalk-parking", "confirmed_synthetic": True}, reports
        )
        self.assertIs(reports[0], report)
        self.assertTrue(report["id"].startswith("DEMO-"))
        self.assertEqual("synthetic-demo-only", report["receipt_type"])
        self.assertEqual("not-transmitted", report["delivery_status"])
        self.assertEqual("local-demo-time-not-trusted", report["time_status"])
        self.assertNotIn("description", report)

    def test_requires_explicit_synthetic_confirmation(self):
        with self.assertRaises(ValueError):
            create_demo_report(
                {"scenario_id": "sidewalk-parking", "confirmed_synthetic": False}, []
            )

    def test_rejects_free_text_and_unknown_fields(self):
        with self.assertRaises(ValueError):
            create_demo_report(
                {
                    "scenario_id": "sidewalk-parking",
                    "confirmed_synthetic": True,
                    "description": "user supplied text",
                },
                [],
            )

    def test_rejects_unknown_scenarios(self):
        with self.assertRaises(ValueError):
            create_demo_report(
                {"scenario_id": "not-listed", "confirmed_synthetic": True}, []
            )

    def test_receipt_memory_is_bounded(self):
        reports = []
        for _ in range(55):
            create_demo_report(
                {"scenario_id": "sidewalk-parking", "confirmed_synthetic": True}, reports
            )
        self.assertEqual(50, len(reports))


class SupportingImageTests(unittest.TestCase):
    def setUp(self):
        self.synthetic_jpeg = b"\xff\xd8\xff\xe0synthetic-test-image\xff\xd9"

    def test_browser_image_is_hashed_but_bytes_are_not_retained(self):
        report, created = create_captured_demo_report(
            {"scenario_id": "sidewalk-parking", "confirmed_synthetic": True},
            self.synthetic_jpeg,
            "image/jpeg",
            "test-capture-001",
            [],
            {},
        )
        self.assertTrue(created)
        self.assertEqual(hashlib.sha256(self.synthetic_jpeg).hexdigest(), report["evidence"]["sha256"])
        self.assertFalse(report["evidence"]["stored"])
        self.assertEqual("supporting-image-unverified", report["evidence"]["assurance"])
        self.assertEqual("not-integrated", report["c2pa_status"])
        self.assertEqual("not-connected", report["authority_status"])

    def test_idempotent_retry_returns_same_demo_report(self):
        reports, submissions = [], {}
        payload = {"scenario_id": "sidewalk-parking", "confirmed_synthetic": True}
        first, created = create_captured_demo_report(payload, self.synthetic_jpeg, "image/jpeg", "retry-key-001", reports, submissions)
        retry, created_again = create_captured_demo_report(payload, self.synthetic_jpeg, "image/jpeg", "retry-key-001", reports, submissions)
        self.assertTrue(created)
        self.assertFalse(created_again)
        self.assertIs(first, retry)
        self.assertEqual(1, len(reports))

    def test_rejects_reused_idempotency_key_for_different_capture(self):
        reports, submissions = [], {}
        payload = {"scenario_id": "sidewalk-parking", "confirmed_synthetic": True}
        create_captured_demo_report(payload, self.synthetic_jpeg, "image/jpeg", "retry-key-001", reports, submissions)
        with self.assertRaisesRegex(ValueError, "idempotency_key_conflict"):
            changed_jpeg = b"\xff\xd8\xff\xe0different-image\xff\xd9"
            create_captured_demo_report(payload, changed_jpeg, "image/jpeg", "retry-key-001", reports, submissions)

    def test_evicted_receipts_do_not_leave_stale_retry_keys(self):
        reports, submissions = [], {}
        payload = {"scenario_id": "sidewalk-parking", "confirmed_synthetic": True}
        for index in range(51):
            create_captured_demo_report(
                payload, self.synthetic_jpeg, "image/jpeg", f"retry-key-{index:03d}", reports, submissions
            )
        self.assertEqual(50, len(reports))
        self.assertEqual(50, len(submissions))
        replacement, created = create_captured_demo_report(
            payload, self.synthetic_jpeg, "image/jpeg", "retry-key-000", reports, submissions
        )
        self.assertTrue(created)
        self.assertIs(reports[0], replacement)
        self.assertEqual(50, len(reports))

    def test_rejects_mismatched_image_type_and_bad_markers(self):
        with self.assertRaises(ValueError):
            inspect_supporting_image(self.synthetic_jpeg, "image/png")
        with self.assertRaises(ValueError):
            inspect_supporting_image(b"not an image", "image/jpeg")

    def test_rejects_missing_consent_and_unknown_scenario(self):
        with self.assertRaises(ValueError):
            create_captured_demo_report(
                {"scenario_id": "sidewalk-parking", "confirmed_synthetic": False},
                self.synthetic_jpeg,
                "image/jpeg",
                "retry-key-002",
                [],
                {},
            )


if __name__ == "__main__":
    unittest.main()
