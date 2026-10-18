import unittest
from geometry import meander, length_m
class GeometryTests(unittest.TestCase):
    def test_rectangle(self):
        route=meander(3,3)
        self.assertGreater(len(route),2)
        self.assertAlmostEqual(route[0][0],route[-1][0])
        self.assertGreater(length_m(route),0)
    def test_invalid_dimensions(self):
        with self.assertRaises(ValueError): meander(0,3)
        with self.assertRaises(ValueError): meander(0.2,0.2)
if __name__=='__main__': unittest.main()
