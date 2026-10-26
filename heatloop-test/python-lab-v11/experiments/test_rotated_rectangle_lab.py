"""Run from heatloop-test/python-lab-v11:
python -m unittest discover -s experiments -p 'test_rotated_rectangle_lab.py'
"""
import unittest
from shapely.geometry import Polygon
from shapely.affinity import rotate
from experiments.rotated_rectangle_lab import rotated_rectangle

class RotatedRectangleLabTests(unittest.TestCase):
    def setUp(self):
        self.base=Polygon([(0,0),(4,0),(4,3),(0,3)])

    def test_rotated_geometry(self):
        p=rotate(self.base,30,origin='centroid')
        result=rotated_rectangle(p,.20,.10,.08,2,2)
        self.assertEqual(result["status"],"experimental")
        self.assertLessEqual(result["total_m"],100)
        self.assertTrue(result["supply"])
        self.assertEqual(result["kind"],"counterflow-rotated-rectangle-lab")

    def test_axis_aligned_geometry(self):
        result=rotated_rectangle(self.base,.20,.10,.08,2,2)
        self.assertEqual(result["status"],"experimental")

    def test_l_shape_rejected(self):
        p=Polygon([(0,0),(4,0),(4,2),(2,2),(2,4),(0,4)])
        with self.assertRaises(ValueError):
            rotated_rectangle(p,.20,.10,.08,2,2)

    def test_omega_not_supported(self):
        with self.assertRaises(ValueError):
            rotated_rectangle(self.base,.10,.10,.08,2,2)

if __name__=="__main__":
    unittest.main()
