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

    def test_multiple_disjoint_heating_zones(self):
        a=[(.5,.5),(2,.5),(2,3),(.5,3)]
        b=[(3,.5),(4.5,.5),(4.5,3),(3,3)]
        result=analyze_room(ROOM,SETTINGS,heating_zones=[a,b])
        self.assertEqual(result["heating_zone_count"],2)
        self.assertAlmostEqual(result["room_area_m2"],20)
        self.assertAlmostEqual(result["heating_area_m2"],7.5)
        self.assertAlmostEqual(result["unheated_area_m2"],12.5)
        self.assertEqual(result["layout"]["kind"],"multiple-heating-fields")
        self.assertEqual(result["layout"]["status"],"planned")
        self.assertFalse(result["layout"]["installation_ready"])
        self.assertAlmostEqual(result["estimate_m"],45.5)  # two 2m+2m approaches

    def test_multiple_zones_reject_overlap(self):
        a=[(.5,.5),(2,.5),(2,2),(.5,2)]
        b=[(1,1),(3,1),(3,3),(1,3)]
        with self.assertRaisesRegex(ValueError,"nachodzą na siebie"):
            analyze_room(ROOM,SETTINGS,heating_zones=[a,b])

    def test_adjacent_zones_may_share_boundary(self):
        a=[(.5,.5),(2,.5),(2,2),(.5,2)]
        b=[(2,.5),(3.5,.5),(3.5,2),(2,2)]
        r=analyze_room(ROOM,SETTINGS,heating_zones=[a,b])
        self.assertEqual(r["heating_zone_count"],2)
        self.assertAlmostEqual(r["heating_area_m2"],4.5)

    def test_previous_heating_points_api_remains_supported(self):
        a=[(.5,.5),(2,.5),(2,2),(.5,2)]
        old=analyze_room(ROOM,SETTINGS,heating_points=a)
        new=analyze_room(ROOM,SETTINGS,heating_zones=[a])
        self.assertEqual(old["heating_area_m2"],new["heating_area_m2"])
        self.assertEqual(old["estimate_m"],new["estimate_m"])

    def test_reject_zone_outside_room_with_two_fields(self):
        a=[(.5,.5),(2,.5),(2,2),(.5,2)]
        b=[(4.5,.5),(5.5,.5),(5.5,2),(4.5,2)]
        with self.assertRaisesRegex(ValueError,"wewnątrz pomieszczenia"):
            analyze_room(ROOM,SETTINGS,heating_zones=[a,b])

    def test_individual_spacing_and_manifold_assignment(self):
        a=[(.5,.5),(2,.5),(2,3),(.5,3)]
        b=[(3,.5),(4.5,.5),(4.5,3),(3,3)]
        result=analyze_room(ROOM,SETTINGS,heating_zones=[a,b],zone_settings=[
            {"spacing_m":.10,"feed_m":2,"back_m":2,"manifold_id":1},
            {"spacing_m":.20,"feed_m":3,"back_m":4,"manifold_id":2}
        ])
        z=result["zone_results"]
        self.assertEqual(len(z),2)
        self.assertEqual(z[0]["spacing_m"],.10)
        self.assertEqual(z[1]["spacing_m"],.20)
        self.assertEqual(z[0]["manifold_id"],1)
        self.assertEqual(z[1]["manifold_id"],2)
        self.assertAlmostEqual(z[0]["estimate_m"],41.5)
        self.assertAlmostEqual(z[1]["estimate_m"],25.75)
        self.assertAlmostEqual(result["estimate_m"],67.25)

    def test_per_loop_limit_not_sum_of_two_independent_loops(self):
        a=[(.2,.2),(3.2,.2),(3.2,2.2),(.2,2.2)]
        b=[(.2,2.21),(3.2,2.21),(3.2,3.99),(.2,3.99)]
        result=analyze_room(ROOM,SETTINGS,heating_zones=[a,b],zone_settings=[
            {"spacing_m":.15,"feed_m":2,"back_m":2},
            {"spacing_m":.15,"feed_m":2,"back_m":2}
        ])
        self.assertGreater(result["estimate_m"],80)
        self.assertFalse(result["estimate_over_limit"])
        self.assertTrue(all(not z["over_80m"] for z in result["zone_results"]))

    def test_length_warning_applies_to_one_overlong_loop(self):
        a=[(.2,.2),(4.8,.2),(4.8,3.4),(.2,3.4)]
        r=analyze_room(ROOM,SETTINGS,heating_zones=[a],zone_settings=[
            {"spacing_m":.10,"feed_m":3,"back_m":3}
        ])
        self.assertTrue(r["zone_results"][0]["over_80m"])
        self.assertTrue(r["estimate_over_limit"])
        self.assertFalse(r["zone_results"][0]["layout"]["installation_ready"])

    def test_invalid_individual_spacing_rejected(self):
        a=[(.5,.5),(2,.5),(2,2),(.5,2)]
        with self.assertRaisesRegex(ValueError,"Rozstaw pojedynczej"):
            analyze_room(ROOM,SETTINGS,heating_zones=[a],zone_settings=[
                {"spacing_m":.13,"feed_m":2,"back_m":2}
            ])

    def test_independent_settings_count_must_match_fields(self):
        a=[(.5,.5),(2,.5),(2,2),(.5,2)]
        b=[(3,.5),(4.5,.5),(4.5,2),(3,2)]
        with self.assertRaisesRegex(ValueError,"Ustawienia pętli"):
            analyze_room(ROOM,SETTINGS,heating_zones=[a,b],zone_settings=[
                {"spacing_m":.10,"feed_m":2,"back_m":2}
            ])

    def test_schematic_counterflow_preview_after_strict_radius_rejection(self):
        import math
        from shapely.geometry import Polygon, LineString
        settings=dict(SETTINGS,spacing_m=.125,radius_m=.08)
        result=analyze_room(ROOM,settings)
        layout=result["zone_results"][0]["layout"]
        self.assertEqual(layout["status"],"schematic")
        self.assertEqual(layout["kind"],"counterflow-rectangle-preview")
        self.assertFalse(layout["installation_ready"])
        self.assertTrue(layout["warning"].startswith("SZKIC"))
        self.assertGreater(layout["turns"],0)
        self.assertGreater(len(layout["supply"]),4)
        self.assertGreater(len(layout["return"]),4)
        self.assertEqual(len(layout["cap"]),17)
        combined=layout["supply"]+layout["cap"][1:]+layout["return"][1:]
        line=LineString(combined)
        clearance=settings["wall_edge_m"]+settings["diameter_m"]/2
        self.assertTrue(Polygon(ROOM).buffer(-clearance).buffer(2e-7).covers(line))
        self.assertTrue(line.is_simple)
        self.assertLessEqual(layout["total_m"],80)
        self.assertAlmostEqual(layout["drawn_m"],line.length,places=2)

    def test_all_seven_reference_size_rectangles_have_visible_schematic(self):
        # Representative dimensions/individual spacings from the 7-field
        # drawing test, without storing any client image or personal data.
        sizes=[(2.07,3.00,.125),(1.93,3.00,.125),
               (4.73,2.28,.125),(4.75,2.07,.125),
               (4.75,2.13,.10),(1.77,4.20,.125),
               (1.80,3.61,.15)]
        for w,h,spacing in sizes:
            with self.subTest(width=w,height=h,spacing=spacing):
                room=[(0,0),(w,0),(w,h),(0,h)]
                settings=dict(SETTINGS,spacing_m=spacing)
                result=analyze_room(room,settings)
                layout=result["zone_results"][0]["layout"]
                self.assertIn(layout["status"],("experimental","schematic"))
                self.assertGreater(layout["drawn_m"],0)
                self.assertLessEqual(layout["total_m"],80)
                self.assertFalse(layout["installation_ready"])

    def test_schematic_warns_about_full_coverage_estimate(self):
        settings=dict(SETTINGS,spacing_m=.10)
        rectangle=[(0,0),(4.75,0),(4.75,2.13),(0,2.13)]
        result=analyze_room(rectangle,settings)
        zone=result["zone_results"][0]
        self.assertEqual(zone["layout"]["status"],"schematic")
        self.assertTrue(zone["coverage_warning"])
        self.assertTrue(zone["over_80m"])
        self.assertTrue(result["estimate_over_limit"])
        self.assertGreater(zone["full_area_estimate_m"],80)
        self.assertLessEqual(zone["layout"]["total_m"],80)

if __name__=="__main__":
    unittest.main()
