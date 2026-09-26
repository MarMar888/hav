"""Prepare geometry-only experiment manifests. This does not run CFD."""
import argparse
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATIONS = [(0, 1, 0, 0, 0), (1/3, .9, .03/.55, .01, 4/18),
            (19/30, .63, .16/.55, .03, 10/18),
            (13/15, .3, .36/.55, .05, 16/18), (1, .08, 1, .07, 1)]


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, allow_nan=False,
                                    separators=(',', ':')).encode()).hexdigest()


def defaults(config):
    return {k: v['default'] for k, v in config['parameters'].items()}


def sections(p):
    """Same section formulas as drone-hull-v2.fs. Distances returned in inches."""
    out = []
    for t, b, k, s, a in STATIONS:
        w = .08 + .92 * ((b-.08)/.92)**(1/p['bowFullness'])
        half = w*p['beam']/2
        keel = k*p['bowRise']
        sheer = p['sheerHeight'] + s*(p['sheerHeight']+p['deckRise'])
        out.append(dict(x=(p['aftFraction']+(1-p['aftFraction'])*t)*p['length'],
                        half_beam=half, keel=keel, sheer=sheer,
                        crown=sheer+p['deckRise']*w,
                        chine_y=p['chineRatio']*half,
                        chine_z=keel+p['chineRatio']*half*math.tan(
                            math.radians(p['deadrise']+a*p['bowExtra']))))
    return out


def geometry_errors(p, config):
    errors = []
    if set(p) != set(config['parameters']):
        return ['Missing or unexpected shape parameters']
    for key, spec in config['parameters'].items():
        v = p[key]
        if isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v):
            errors.append(f'{key}: expected finite number')
        elif not spec['min'] <= v <= spec['max']:
            errors.append(f'{key}: outside bounds')
    if errors:
        return errors
    for i, s in enumerate(sections(p)):
        if s['chine_z'] >= s['sheer']:
            errors.append(f'section {i}: chine intersects/exceeds sheer')
        if s['crown']-s['sheer'] > s['half_beam']:
            errors.append(f'section {i}: deck arc would exceed intended beam')
    return errors


def box_component(mass_kg, center_m, size_m):
    """Uniform axis-aligned mass surrogate, inertia about its own center."""
    values = [mass_kg, *center_m, *size_m]
    if len(center_m) != 3 or len(size_m) != 3 or not all(
            isinstance(v, (int, float)) and not isinstance(v, bool)
            and math.isfinite(v) for v in values):
        raise ValueError('Finite mass and three-component center/size required')
    if mass_kg <= 0 or min(size_m) <= 0:
        raise ValueError('Mass and dimensions must be positive')
    x, y, z = size_m
    return {'mass_kg': mass_kg, 'cg_m': list(center_m),
            'inertia_about_cg_kg_m2': [[mass_kg*(y*y+z*z)/12, 0, 0],
                                     [0, mass_kg*(x*x+z*z)/12, 0],
                                     [0, 0, mass_kg*(x*x+y*y)/12]]}


def combine_components(components):
    """Combine valid body-axis mass tensors using the parallel-axis theorem.

    Input inertias must be about each component CG and already rotated into
    the common hull axes. Off-diagonals are signed matrix entries.
    """
    if not components:
        raise ValueError('At least one component required')
    for c in components:
        if not valid_mass_properties(c['mass_kg'], c['cg_m'], c['inertia_about_cg_kg_m2']):
            raise ValueError('Invalid component mass properties')
    mass = sum(c['mass_kg'] for c in components)
    cg = [sum(c['mass_kg']*c['cg_m'][i] for c in components)/mass for i in range(3)]
    inertia = [[0.0]*3 for _ in range(3)]
    for c in components:
        d = [c['cg_m'][i]-cg[i] for i in range(3)]
        d2 = sum(v*v for v in d)
        for i in range(3):
            for j in range(3):
                inertia[i][j] += c['inertia_about_cg_kg_m2'][i][j] + c['mass_kg']*(
                    (d2 if i == j else 0)-d[i]*d[j])
    return {'total_mass_kg': mass, 'cg_m': cg, 'inertia_about_cg_kg_m2': inertia}


def valid_mass_properties(mass, cg, tensor):
    try:
        if len(cg) != 3 or len(tensor) != 3 or any(len(r) != 3 for r in tensor):
            return False
        values = [mass, *cg, *(v for row in tensor for v in row)]
        if not all(isinstance(v, (int, float)) and not isinstance(v, bool)
                   and math.isfinite(v) for v in values) or mass <= 0:
            return False
        scale = max(abs(v) for row in tensor for v in row)
        if scale <= 0:
            return False
        a = [[v/scale for v in row] for row in tensor]
        if any(abs(a[i][j]-a[j][i]) > 1e-9 for i in range(3) for j in range(3)):
            return False
        # Physical inertia requires positive-definite I and positive-semidefinite
        # second-moment matrix C = trace(I)/2 * identity - I.
        det = lambda m: (m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])
                        -m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
                        +m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]))
        if a[0][0] <= 0 or a[0][0]*a[1][1]-a[0][1]**2 <= 0 or det(a) <= 0:
            return False
        trace = sum(a[i][i] for i in range(3))
        c = [[(trace/2 if i == j else 0)-a[i][j] for j in range(3)] for i in range(3)]
        return (all(c[i][i] >= -1e-9 for i in range(3))
                and all(c[i][i]*c[j][j]-c[i][j]**2 >= -1e-9
                        for i, j in [(0, 1), (0, 2), (1, 2)]) and det(c) >= -1e-9)
    except (TypeError, KeyError):
        return False


def readiness(config):
    """Informational prerequisites, NOT a CFD safety or validity certificate."""
    issues = []
    load = config['loading']
    if load['mode'] != 'total_properties' or not valid_mass_properties(
            load['total_mass_kg'], load['cg_m'], load['inertia_about_cg_kg_m2']):
        issues.append('Total mass, CG and physical inertia tensor are unset/invalid')
    for key in ['water_density_kg_m3', 'water_kinematic_viscosity_m2_s',
                'air_density_kg_m3', 'air_dynamic_viscosity_pa_s', 'water_depth_m']:
        value = config['conditions'][key]
        if not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
            issues.append(f'Condition unset/invalid: {key}')
    if config['conditions']['force_application_point_m'] is None:
        issues.append('Tow/propulsion force application point unset')
    if any(not config['solver'][k] for k in ['name', 'version', 'adapter']):
        issues.append('CFD solver/version/adapter not configured')
    if config['optimization']['objective'] is None:
        issues.append('Optimization objective unset')
    if config['optimization']['constraints']['thresholds'] is None:
        issues.append('Feasibility thresholds unset')
    return issues


def campaign(config):
    baseline = defaults(config)
    candidates = [('baseline', baseline)]
    for key, spec in config['parameters'].items():
        if spec['optimize']:
            for label in ['min', 'max']:
                candidates.append((f'{key}_{label}', {**baseline, key: spec[label]}))
    rows = []
    for name, p in candidates:
        errors = geometry_errors(p, config)
        for mph in config['conditions']['speeds_mph']:
            speed = mph*.44704
            payload = {'configuration': config, 'parameters': p, 'speed_mph': mph}
            rows.append({'case_id': digest(payload)[:20], 'name': name,
                         'parameters': p, 'onshape_definition': {**p, 'hollow': False},
                         'parameter_units': {k: v['unit'] for k, v in config['parameters'].items()},
                         'speed_mph': mph, 'speed_m_s': speed,
                         'Fn_length': speed/math.sqrt(config['conditions']['gravity_m_s2']*p['length']*.0254),
                         'Fn_beam': speed/math.sqrt(config['conditions']['gravity_m_s2']*p['beam']*.0254),
                         'geometry_screen_errors': errors,
                         'status': 'rejected_section_geometry' if errors else 'awaiting_CAD_and_physics',
                         'metrics': None})
    return {'status': 'manifest_only_no_CFD_run', 'configuration': config,
            'prerequisites': readiness(config), 'cases': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, default=ROOT/'design-space.json')
    parser.add_argument('--output', type=Path, default=ROOT/'campaign.json')
    args = parser.parse_args()
    data = campaign(json.loads(args.config.read_text(encoding='utf-8')))
    args.output.write_text(json.dumps(data, indent=2, allow_nan=False)+'\n', encoding='utf-8')
    print(f"Prepared {len(data['cases'])} cases; no CAD export, CFD or training performed.")
    for issue in data['prerequisites']:
        print('Pending:', issue)


if __name__ == '__main__':
    main()
