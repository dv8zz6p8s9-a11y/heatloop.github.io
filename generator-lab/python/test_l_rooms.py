"""Regression tests for L-shaped rooms. Run: python -m unittest discover -s generator-lab/python -p 'test_*.py'"""
import unittest
from geometry_validation import inward_boundaries, validate_layout

L_WIDE = [(0,0),(6,0),(6,2),(3,2),(3,4),(0,4)]
L_TALL = [(0,0),(3,0),(3,5),(5,5),(5,7),(0,7)]
L_NARROW = [(0,0),(4,0),(4,0.4),(0.4,0.4),(0.4,4),(0,4)]
L_CONCAVE = [(0,0),(5,0),(5,3),(2,3),(2,6),(0,6)]

class LRoomTests(unittest.TestCase):
    def test_wide_l_contours(self):
        self.assertTrue(inward_boundaries(L_WIDE, .15, .30))
    def test_tall_l_contours(self):
        self.assertTrue(inward_boundaries(L_TALL, .15, .30))
    def test_narrow_l_contours_do_not_crash(self):
        self.assertIsInstance(inward_boundaries(L_NARROW, .15, .30), list)
    def test_concave_l_contours(self):
        self.assertTrue(inward_boundaries(L_CONCAVE, .15, .30))
    def test_crossing_cutout_is_rejected(self):
        route=[(4.5,.5),(4.5,2.5),(1,4.5)]
        self.assertFalse(validate_layout(L_CONCAVE, route)["valid"])
    def test_valid_route_in_one_arm(self):
        route=[(.4,.4),(4.5,.4),(4.5,2.5)]
        self.assertTrue(validate_layout(L_CONCAVE, route)["valid"])
    def test_wall_clearance_violation(self):
        route=[(.05,.05),(1,.05)]
        self.assertFalse(validate_layout(L_CONCAVE, route)["valid"])
    def test_self_intersection_in_l(self):
        route=[(.4,.4),(1.6,1.6),(.4,1.6),(1.6,.4)]
        self.assertFalse(validate_layout(L_CONCAVE, route)["valid"])

if __name__=="__main__":
    unittest.main()
