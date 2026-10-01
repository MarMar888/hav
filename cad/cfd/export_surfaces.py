"""Export the CFD surfaces from the same script that defines the boat.

Run from cad/:  agentcad run cfd/export_surfaces.py --label cfd-surfaces --no-preview --no-diff --no-view

Writes metres-scale STLs in OpenFOAM orientation:
  +x downstream (bow at -x), +y to port, z = 0 at the undisturbed free surface
  (the static waterline at the 62 lb design weight, z = -115.3 mm in CAD).
Re-run it whenever hull.py changes so the CFD geometry can't drift from the CAD.
"""
WATERLINE_MM = 115.3   # CAD z of the static free surface, negated to put it at z=0
MM = 0.001

# Run hull.py for its geometry, with show_object turned off.
_ns = dict(globals())
_ns["show_object"] = lambda *a, **k: None
exec(open("hull.py").read(), _ns)
outer, tubes = _ns["outer"], _ns["tubes"]

def to_cfd(shape):
    """CAD (y fwd, z up, mm) -> CFD (x downstream, z up, metres, WL at z=0)."""
    s = shape.rotate(Axis.Z, 90)          # x_new = -y_old: bow ends up at -x
    s = s.scale(MM)
    return s.translate((0, 0, WATERLINE_MM * MM))

hull_cfd = to_cfd(Part(outer))            # the glassed outside shape, closed solid
tubes_cfd = to_cfd(Part(tubes) if not isinstance(tubes, Compound) else tubes)

export_stl(hull_cfd, "cfd/geometry/hull.stl", tolerance=0.0005, angular_tolerance=0.2)
export_stl(tubes_cfd, "cfd/geometry/tubes.stl", tolerance=0.0008, angular_tolerance=0.3)

bb = hull_cfd.bounding_box()
print(f"hull  x {bb.min.X:+.3f}..{bb.max.X:+.3f}  y {bb.min.Y:+.3f}..{bb.max.Y:+.3f}  z {bb.min.Z:+.3f}..{bb.max.Z:+.3f} m")
print(f"LOA {bb.size.X:.3f} m, beam {bb.size.Y:.3f} m, draft below WL {-bb.min.Z:.3f} m")
show_object(hull_cfd, id="hull", name="Hull wetted surface (CFD)")
show_object(tubes_cfd, id="tubes", name="Tubes (CFD)")
