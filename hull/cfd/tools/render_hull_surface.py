"""Render the actual converted STL, with visible tessellation edges."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
# Install VTK, NumPy and Matplotlib in the active Python environment.
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

folder = ROOT / 'hull-input'
vertices = [list(map(float, line.split()[1:]))
            for line in (folder / 'hull-meters.stl').read_text().splitlines()
            if line.strip().startswith('vertex ')]
triangles = np.asarray(vertices).reshape(-1, 3, 3)
normals = np.cross(triangles[:, 1] - triangles[:, 0],
                   triangles[:, 2] - triangles[:, 0])
normals /= np.linalg.norm(normals, axis=1)[:, None]
fig = plt.figure(figsize=(14, 6), facecolor='#f2f5f8')
views = [(24, -125, 'DECK & SIDE'), (-24, -125, 'UNDERSIDE & KEEL')]
for i, (elev, azim, title) in enumerate(views):
    ax = fig.add_subplot(1, 2, i + 1, projection='3d')
    ax.set_facecolor('#f2f5f8')
    light = np.array([-0.3, -0.6, 0.74 if elev > 0 else -0.74])
    light /= np.linalg.norm(light)
    intensity = 0.55 + 0.45 * np.maximum(0, normals @ light)
    colors = np.array([0.20, 0.62, 0.76])[None, :] * intensity[:, None]
    mesh = Poly3DCollection(triangles, facecolors=colors,
                            edgecolors=(0.04, 0.16, 0.23, 0.40), linewidths=0.22)
    ax.add_collection3d(mesh)
    ax.set_xlim(0, 1.524)
    ax.set_ylim(-0.23, 0.23)
    ax.set_zlim(-0.02, 0.32)
    ax.set_box_aspect((1.524, 0.46, 0.34), zoom=0.96)
    ax.view_init(elev=elev, azim=azim)
    ax.set_proj_type('ortho')
    ax.set_axis_off()
    ax.text2D(0.01, 0.93, title, transform=ax.transAxes,
              fontsize=11, weight='bold', color='#274754')
fig.suptitle('Your exported hull • converted surface', fontsize=23,
             color='#19333f', x=0.05, ha='left', y=0.97)
fig.text(0.05, 0.91, '60 in long  ×  14.5 in wide  ×  11.5 in tall   |   4,992 triangles',
         fontsize=13, color='#4a6270')
fig.text(0.05, 0.035, 'Rendered directly from hull-meters.stl. Lines show surface triangles; no water-flow results are shown.',
         fontsize=11, color='#4a6270')
fig.subplots_adjust(left=0.03, right=0.98, bottom=0.07, top=0.85, wspace=0.03)
fig.savefig(folder / 'hull-conversion.png', dpi=150, facecolor=fig.get_facecolor())
print(folder / 'hull-conversion.png')

