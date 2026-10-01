"""Read the actual STEP export, validate its solid and create a metre-unit STL.

Requires cadquery-ocp installed in the active Python environment.
Run from any directory with the bundled Python runtime.
"""
from pathlib import Path
import hashlib
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
# Install cadquery-ocp in the active Python environment.
from OCP.STEPControl import STEPControl_Reader
from OCP.IFSelect import IFSelect_RetDone
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.BRepGProp import BRepGProp
from OCP.GProp import GProp_GProps
from OCP.BRepBuilderAPI import BRepBuilderAPI_Transform
from OCP.gp import gp_Trsf, gp_Pnt
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
from OCP.Interface import Interface_Static


def main():
    source = ROOT / 'geometry/hull-v1.step'
    out = ROOT / 'cfd/hull-input'
    out.mkdir(exist_ok=True)
    reader = STEPControl_Reader()
    # Explicit OpenCascade transfer units: millimetres, then scale to metres.
    Interface_Static.SetCVal_s('xstep.cascade.unit', 'MM')
    assert reader.ReadFile(str(source)) == IFSelect_RetDone, 'STEP read failed'
    reader.SetSystemLengthUnit(1.0)
    assert reader.TransferRoots() > 0, 'STEP transfer failed'
    shape = reader.OneShape()
    solids = TopExp_Explorer(shape, TopAbs_SOLID)
    count = 0
    while solids.More():
        count += 1
        solids.Next()
    assert count == 1, f'Expected one solid, got {count}'
    assert BRepCheck_Analyzer(shape).IsValid(), 'CAD solid is invalid'
    transform = gp_Trsf()
    transform.SetScale(gp_Pnt(0, 0, 0), 0.001)
    shape = BRepBuilderAPI_Transform(shape, transform, True).Shape()
    box = Bnd_Box()
    BRepBndLib.AddOptimal_s(shape, box, False, False)
    lo, hi = box.CornerMin(), box.CornerMax()
    bounds = (lo.X(), lo.Y(), lo.Z(), hi.X(), hi.Y(), hi.Z())
    dims = [bounds[i + 3] - bounds[i] for i in range(3)]
    assert abs(dims[0] - 1.524) < 0.005, f'Unexpected length/units: {dims}'
    props = GProp_GProps()
    BRepGProp.VolumeProperties_s(shape, props)
    assert props.Mass() > 0, 'Nonpositive enclosed volume'
    mesh = BRepMesh_IncrementalMesh(shape, 0.0005, False, 0.12, True)
    assert mesh.IsDone(), 'Surface triangulation failed'
    writer = StlAPI_Writer()
    writer.ASCIIMode = True
    stl = out / 'hull-meters.stl'
    assert writer.Write(shape, str(stl)), 'STL write failed'
    report = {
        'source': source.name,
        'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'cad_valid': True, 'solid_count': count,
        'units': 'metres', 'bounds_xyz_min_max_m': bounds,
        'dimensions_xyz_m': dims,
        'dimensions_xyz_in': [x / 0.0254 for x in dims],
        'enclosed_external_volume_m3': props.Mass(),
        'volume_note': 'Full exterior volume, not submerged displacement or material mass.',
        'surface_deflection_m': 0.0005, 'angular_deflection_rad': 0.12,
        'stl': stl.name,
        'status': 'CAD validated and triangulated; fluid volume mesh and CFD not yet run.',
    }
    (out / 'geometry-report.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
