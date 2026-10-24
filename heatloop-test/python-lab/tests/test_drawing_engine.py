import unittest
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from drawing_engine import analyze_room

ROOM = [(0,0),(5,0),(5,4),(0,4)]
L = [(0,0),(5,0),(5,2),(3,2),(3,4),(0,4)]
SETTINGS = {
 "spacing_m":0.20,
 "diameter_m":0.016,
 "wall_edge_m":0.10,
 "radius_m":0.08,
 "feed_m":2,
 "back_m":2,
}

class HeatingAreaTests(unittest.TestCase):
    def test_original_full_room_still_supported(self):
        result=analyze_room(ROOM,SETTINGS)
        self.assertAlmostEqual(result["room_area_m2"],20)
        self.assertAlmostEqual(result["heating_area_m2"],20)
        self.assertAlmostEqual(result["unheated_area_m2"],0)
        self.assertFalse(result["custom_heating_area"])

    def test_smaller_manual_heating_area(self):
        heated=[(1,1),(4,1),(4,3),(1,3)]
        result=analyze_room(ROOM,SETTINGS,heated)
        self.assertAlmostEqual(result["room_area_m2"],20)
        self.assertAlmostEqual(result["heating_area_m2"],6)
        self.assertAlmostEqual(result["unheated_area_m2"],14)
        self.assertAlmostEqual(result["estimate_m"],34) # 6 / .2 + 2 + 2
        self.assertTrue(result["custom_heating_area"])

    def test_reject_heating_zone_outside_room(self):
        heated=[(3,1),(6,1),(6,3),(3,3)]
        with self.assertRaisesRegex(ValueError,"musi w całości"):
            analyze_room(ROOM,SETTINGS,heated)

    def test_reject_zone_crossing_inner_corner_L(self):
        zone=[(2,1),(4.5,1),(4.5,3.5),(2,3.5)]
        with self.assertRaisesRegex(ValueError,"musi w całości"):
            analyze_room(L,SETTINGS,zone)

    def test_irregular_zone_is_only_planned(self):
        heated=[(.5,.5),(3,.5),(3,1.5),(2,1.5),(2,3.5),(.5,3.5)]
        result=analyze_room(L,SETTINGS,heated)
        self.assertEqual(result["layout"]["status"],"planned")
        self.assertFalse(result["layout"]["installation_ready"])

    def test_custom_area_at_same_boundary(self):
        r=analyze_room(ROOM,SETTINGS,ROOM)
        self.assertAlmostEqual(r["unheated_area_m2"],0)

if __name__=="__main__":
    unittest.main()
