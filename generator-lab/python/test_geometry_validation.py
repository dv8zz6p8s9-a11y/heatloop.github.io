import unittest
from geometry_validation import validate_layout, inward_boundaries

ROOM = [(0,0),(3,0),(3,3),(0,3)]
L_ROOM = [(0,0),(4,0),(4,2),(2,2),(2,4),(0,4)]

class GeometryValidationTests(unittest.TestCase):
    def test_valid_inside(self):
        self.assertTrue(validate_layout(ROOM,[(.3,.3),(2.7,.3),(2.7,2.7)])["valid"])
    def test_reject_wall_violation(self):
        self.assertFalse(validate_layout(ROOM,[(0,.3),(2,.3)])["valid"])
    def test_reject_self_crossing(self):
        self.assertFalse(validate_layout(ROOM,[(.3,.3),(2.7,2.7),(.3,2.7),(2.7,.3)])["valid"])
    def test_inward_contours_rectangle(self):
        self.assertGreater(len(inward_boundaries(ROOM)),1)
    def test_l_room_offsets(self):
        self.assertGreater(len(inward_boundaries(L_ROOM)),0)
    def test_invalid_room(self):
        with self.assertRaises(ValueError):
            inward_boundaries([(0,0),(2,2),(0,2),(2,0)])

if __name__ == "__main__":
    unittest.main()
