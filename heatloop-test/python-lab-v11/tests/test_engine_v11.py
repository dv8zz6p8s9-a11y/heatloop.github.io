import unittest
from pathlib import Path
import sys
from math import isfinite

sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from drawing_engine import analyze_room,rectangle,validate_room,MAX_LOOP_M,WARN_LOOP_M

ROOM=[(0,0),(4,0),(4,3),(0,3)]
BASE={"spacing_m":0.20,"diameter_m":0.016,"wall_edge_m":0.10,
      "radius_m":0.08,"feed_m":2.0,"back_m":2.0}

class V11Geometry(unittest.TestCase):
    def test_limit_is_100_and_warning_from_90(self):
        self.assertEqual(MAX_LOOP_M,100)
        self.assertEqual(WARN_LOOP_M,90)
        r=analyze_room(ROOM,BASE)
        self.assertEqual(r["max_loop_m"],100)
        self.assertEqual(r["warning_threshold_m"],90)
        zone=r["zone_results"][0]
        self.assertEqual(zone["max_loop_m"],100)
        self.assertTrue(isfinite(zone["checked_length_m"]))
        self.assertEqual(zone["over_limit"],zone["over_80m"])

    def test_loop_length_and_margin_include_supply_and_return(self):
        r=analyze_room(ROOM,BASE)
        layout=r["zone_results"][0]["layout"]
        self.assertIn(layout["status"],("experimental","schematic"))
        self.assertAlmostEqual(layout["total_m"],layout["drawn_m"]+4,delta=.005)
        self.assertAlmostEqual(layout["margin_m"],100-layout["total_m"],delta=.0011)
        self.assertLessEqual(layout["total_m"],100.001)

    def test_schematic_does_not_silently_claim_full_coverage(self):
        settings=dict(BASE,spacing_m=.10)
        field=[(0,0),(4.75,0),(4.75,2.13),(0,2.13)]
        z=analyze_room(field,settings)["zone_results"][0]
        self.assertGreater(z["full_area_estimate_m"],100)
        self.assertTrue(z["over_limit"] or z["coverage_incomplete"])
        self.assertFalse(z["layout"]["installation_ready"])

    def test_two_heating_fields_can_have_different_spacings(self):
        room=[(0,0),(6,0),(6,3),(0,3)]
        p1=[(.1,.1),(2.8,.1),(2.8,2.9),(.1,2.9)]
        p2=[(3.2,.1),(5.9,.1),(5.9,2.9),(3.2,2.9)]
        r=analyze_room(room,BASE,heating_zones=[p1,p2],
          zone_settings=[{"spacing_m":.10,"feed_m":2,"back_m":2},
                         {"spacing_m":.20,"feed_m":2,"back_m":2}])
        self.assertEqual(len(r["zone_results"]),2)
        self.assertEqual([x["spacing_m"] for x in r["zone_results"]],[.10,.20])

    def test_self_intersecting_room_rejected(self):
        with self.assertRaises(ValueError):
            validate_room([(0,0),(4,4),(0,4),(4,0)])

    def test_overly_tight_bends_are_never_installation_ready(self):
        r=analyze_room(ROOM,dict(BASE,spacing_m=.125,radius_m=.08))
        z=r["zone_results"][0]
        self.assertFalse(z["layout"]["installation_ready"])

    def test_unreasonable_approaches_exceed_100m_and_warn(self):
        r=analyze_room(ROOM,dict(BASE,feed_m=100,back_m=100))
        z=r["zone_results"][0]
        self.assertTrue(z["over_limit"])
        self.assertGreater(z["checked_length_m"],100)

    def test_reversible_inlet_and_outlet_from_manifold(self):
        r=analyze_room(ROOM,BASE,zone_settings=[{"routing":{
          "direction":"reverse","manifold_point_m":(-.2,.3),
          "preferred_start_m":(.12,.12)}}])
        z=r["zone_results"][0]
        layout=z["layout"]
        self.assertIn(layout["status"],("experimental","schematic"))
        self.assertEqual(layout["direction"],"reverse")
        self.assertEqual(len(layout["actual_start_m"]),2)
        self.assertEqual(len(layout["actual_end_m"]),2)

if __name__=="__main__":
    unittest.main()
