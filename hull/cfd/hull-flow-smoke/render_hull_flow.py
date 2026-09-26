"""Render a centerline X-Z cut through actual OpenFOAM VTK cell fields."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
# Install VTK, NumPy and Matplotlib in the active Python environment.
import vtk
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import PolyCollection

case = Path(__file__).resolve().parent / 'mesh-001'
frames = [(0.0, 'VTK/mesh-001_0/internal.vtu'),
          (0.25, 'VTK/mesh-001_254/internal.vtu')]
fig, axes = plt.subplots(1, 2, figsize=(15, 6), sharey=True, facecolor='#f3f6f8')
for ax, (time, rel) in zip(axes, frames):
    reader = vtk.vtkXMLUnstructuredGridReader()
    reader.SetFileName(str(case / rel))
    reader.Update()
    grid = reader.GetOutput()
    cutter = vtk.vtkCutter()
    plane = vtk.vtkPlane()
    plane.SetOrigin(0, 0, 0)
    plane.SetNormal(0, 1, 0)
    cutter.SetCutFunction(plane)
    cutter.SetInputData(grid)
    cutter.Update()
    cut = cutter.GetOutput()
    alpha = cut.GetCellData().GetArray('alpha.water')
    if alpha is None:
        raise RuntimeError('alpha.water array missing in OpenFOAM VTK output')
    polys, colors = [], []
    ids = vtk.vtkIdList()
    cells = cut.GetPolys()
    cells.InitTraversal()
    for i in range(cells.GetNumberOfCells()):
        cells.GetNextCell(ids)
        poly = np.array([[cut.GetPoint(ids.GetId(j))[0], cut.GetPoint(ids.GetId(j))[2]]
                         for j in range(ids.GetNumberOfIds())])
        polys.append(poly)
        a = float(alpha.GetTuple1(i))
        colors.append((0.90 - 0.78*a, 0.96 - 0.32*a, 0.98 - 0.12*a, 1))
    ax.add_collection(PolyCollection(polys, facecolors=colors,
                                     edgecolors=(0.27, 0.40, 0.46, 0.10), linewidths=0.12))
    hull = vtk.vtkSTLReader()
    hull.SetFileName(str(ROOT / 'hull-input/hull-meters.stl'))
    hull.Update()
    hc = vtk.vtkCutter()
    hc.SetCutFunction(plane)
    hc.SetInputConnection(hull.GetOutputPort())
    hc.Update()
    lines = hc.GetOutput().GetLines()
    pts = hc.GetOutput().GetPoints()
    if lines and pts:
        line = vtk.vtkIdList()
        lines.InitTraversal()
        while lines.GetNextCell(line):
            xy = np.array([[pts.GetPoint(line.GetId(j))[0], pts.GetPoint(line.GetId(j))[2]]
                           for j in range(line.GetNumberOfIds())])
            ax.plot(xy[:, 0], xy[:, 1], color='#142f3a', linewidth=1.0)
    ax.axhline(0.12, color='#197aa0', linestyle='--', linewidth=1.2, label='Assumed waterline')
    ax.set_xlim(-0.75, 2.25)
    ax.set_ylim(-0.35, 0.65)
    ax.set_aspect('equal', adjustable='box')
    ax.set_title(f't = {time:.2f} s', loc='left', fontsize=15, weight='bold', color='#274754')
    ax.set_xlabel('X: metres (bow points right)')
    ax.grid(alpha=0.16)
axes[0].set_ylabel('Z: metres (up)')
fig.suptitle('Fixed hull • centerline slice of simulated water fraction',
             fontsize=21, color='#19333f', x=0.06, ha='left')
fig.text(0.06, 0.90, 'Blue = water  |  pale = air  |  dark outline = hull  |  imposed flow: 1 m/s toward left',
         color='#4a6270', fontsize=12)
fig.text(0.06, 0.045, 'Exploratory 0.25 s run; concave cells remain. Not validated for resistance or performance.',
         color='#4a6270', fontsize=11)
fig.subplots_adjust(left=0.06, right=0.98, bottom=0.12, top=0.84, wspace=0.08)
out = case / 'centerline-water.png'
fig.savefig(out, dpi=150, facecolor=fig.get_facecolor())
print(out)
