from transit_lab import reserve_transit
import pytest
room=[(0,0),(6,0),(6,4),(0,4)]
fields=[[(0,0),(3,0),(3,4),(0,4)],[(3,0),(6,0),(6,4),(3,4)]]
def test_two_fields():
    result=reserve_transit(room,fields,(0,.1))
    assert result["status"]=="candidate"
    assert result["transit_pipe_count"]==2
    assert result["heat_area_after_m2"]<result["heat_area_before_m2"]
def test_three_fields():
    fields3=[[(0,0),(2,0),(2,4),(0,4)],[(2,0),(4,0),(4,4),(2,4)],[(4,0),(6,0),(6,4),(4,4)]]
    result=reserve_transit(room,fields3,(0,.1))
    assert result["transit_pipe_count"]==4
def test_overlap_refused():
    with pytest.raises(ValueError):reserve_transit(room,[fields[0],fields[0]],(0,.1))
def test_bad_door():
    with pytest.raises(ValueError):reserve_transit(room,fields,(10,10))
