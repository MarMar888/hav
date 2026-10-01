import copy
import json
import unittest
from pathlib import Path
from prepare import (box_component, campaign, combine_components, defaults,
                     geometry_errors, readiness, sections, valid_mass_properties)


class PreparationTests(unittest.TestCase):
    def setUp(self):
        self.config = json.loads((Path(__file__).parent/'design-space.json').read_text())

    def test_baseline_matches_original_stations(self):
        p = defaults(self.config)
        self.assertEqual(geometry_errors(p, self.config), [])
        s = sections(p)
        for row, x in zip(s, [24, 36, 46.8, 55.2, 60]):
            self.assertAlmostEqual(row['x'], x)
        self.assertAlmostEqual(s[0]['crown'], 11.5)
        self.assertAlmostEqual(s[-1]['keel'], 6.325)

    def test_invalid_geometry_rejected(self):
        p = defaults(self.config)
        p.update(sheerHeight=5.5, bowRise=7)
        self.assertTrue(geometry_errors(p, self.config))
        p['beam'] = float('nan')
        self.assertTrue(geometry_errors(p, self.config))

    def test_parallel_axis_tensor(self):
        a = box_component(2, [-1, 0, 0], [1, 1, 1])
        b = box_component(2, [1, 0, 0], [1, 1, 1])
        result = combine_components([a, b])
        self.assertEqual(result['total_mass_kg'], 4)
        self.assertEqual(result['cg_m'], [0, 0, 0])
        self.assertAlmostEqual(result['inertia_about_cg_kg_m2'][0][0], 2/3)
        self.assertAlmostEqual(result['inertia_about_cg_kg_m2'][1][1], 4+2/3)
        c = box_component(2, [1, 1, 0], [1, 1, 1])
        d = box_component(2, [-1, -1, 0], [1, 1, 1])
        self.assertAlmostEqual(combine_components([c, d])['inertia_about_cg_kg_m2'][0][1], -4)

    def test_impossible_inertia_rejected(self):
        self.assertFalse(valid_mass_properties(1, [0, 0, 0], [[10,0,0],[0,1,0],[0,0,1]]))
        self.assertFalse(valid_mass_properties(None, None, None))

    def test_no_fake_results_or_missing_mass_defaults(self):
        result = campaign(self.config)
        self.assertEqual(len(result['cases']), 114)
        self.assertTrue(all(c['metrics'] is None for c in result['cases']))
        self.assertIsNone(self.config['loading']['total_mass_kg'])
        self.assertTrue(readiness(self.config))
        case45 = next(c for c in result['cases'] if c['name']=='baseline' and c['speed_mph']==45)
        self.assertAlmostEqual(case45['speed_m_s'], 20.1168)
        self.assertAlmostEqual(case45['Fn_length'], 5.20365, places=3)

    def test_deterministic_ids_include_loading(self):
        a = campaign(self.config)
        self.assertEqual(a, campaign(self.config))
        other = copy.deepcopy(self.config)
        other['loading']['total_mass_kg'] = 10
        self.assertNotEqual(a['cases'][0]['case_id'], campaign(other)['cases'][0]['case_id'])


if __name__ == '__main__':
    unittest.main()
