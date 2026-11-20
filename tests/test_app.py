import unittest

from app import create_demo_report


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


if __name__ == "__main__":
    unittest.main()
