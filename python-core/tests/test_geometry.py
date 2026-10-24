import unittest
from heatloop_core.geometry import CircuitRules, preflight

L = [(0, 0), (5, 0), (5, 2), (3, 2), (3, 4), (0, 4)]


class TestGeometryContract(unittest.TestCase):
    def test_l_area_and_wall_axis(self):
        r = preflight(L, [(0.108, 0.108), (2.8, 0.108)], CircuitRules())
        self.assertEqual(r["room_area_m2"], 16)
        self.assertAlmostEqual(r["wall_to_pipe_axis_m"], 0.108)
        self.assertTrue(r["preflight_pass"])
        self.assertFalse(r["installation_ready"])

    def test_four_spacings_only(self):
        for s in (0.10, 0.125, 0.15, 0.20):
            CircuitRules(spacing_m=s)
        with self.assertRaises(ValueError):
            CircuitRules(spacing_m=0.22)

    def test_length_includes_manifold_runs(self):
        r = preflight(L, [(0.2, 0.2), (2.8, 0.2)], CircuitRules(supply_to_manifold_m=40, return_to_manifold_m=40))
        self.assertFalse(r["within_80m"])
        self.assertAlmostEqual(r["total_length_m"], 82.6)

    def test_route_outside_cutout_is_rejected(self):
        r = preflight(L, [(2.5, 3.0), (4.0, 3.0)], CircuitRules())
        self.assertFalse(r["inside_wall_clearance"])

    def test_crossing_route_is_rejected(self):
        r = preflight(L, [(0.2, 0.2), (2, 1.8), (0.2, 1.8), (2, 0.2)], CircuitRules())
        self.assertFalse(r["no_self_crossings"])


if __name__ == "__main__":
    unittest.main()
