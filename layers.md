# Layers

Derived from the source AutoCAD drawing, this field indicates the category of
segment.

Definitions for each of the values:

- `FREEWAYS`: such as 80, 280 and 101.
- `PAPER`: the centerline segment is present on Assessor and/or Public Works map,
  but is not an actual street in reality.
- `PAPER_FWYS`: the centerline segment is present on Assessor and/or Public Works
  map, but is not an actual street in reality, and is under or near a freeway.
- `PAPER_WATER`: the centerline segment is present on Assessor and/or Public
  Works map, but is not an actual street in reality, and is under water in the
  Bay.
- `PARKS`: street segment maintained by Recreation and Park Department, e.g., in
  Golden Gate Park.
- `PARKS_NPS_FTMASO`: street segment maintained by the National Park Service
  within Fort Mason.
- `PARKS_NPS_PRESID`: street segment maintained by the National Park Service
  within the Presidio.
- `PRIVATE`: street segment is not maintained by the City and is not on an
  Assessor or Public Works map.
- `PRIVATE_PARKING`: street segment is not maintained by the City and is not on
  an Assessor or Public Works map, and is a parking lot.
- `PSEUDO`: street segment created for use in addressing.
- `STREETS`: standard street centerline segment.
- `STREETS_HUNTERSP`: standard street centerline segment within the Hunters
  Point Shipyard area.
- `STREETS_PEDESTRI`: standard street centerline segment, but pedestrian access
  only.
- `STREETS_TI`: standard street centerline segment within Treasure Island.
- `STREETS_YBI`: standard street centerline segment within Yerba Buena Island.
- `UPROW`: Unpaved Right of Way street centerline segment.
