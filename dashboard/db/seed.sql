-- Starting BOM for the two active phases. Only runs into an empty parts table
-- (see scripts/db-setup.mjs), so it never overwrites edits made on the site.
--
-- unit_weight_g is what ends up ON the boat, not what you buy: 10 kg of
-- filament becomes a 7.8 kg shell, and the charger stays ashore at 0 g.
-- weight_basis 'cad' = derived from cad/hull.py; 'estimate' = weigh it on arrival.

insert into phases (slug, title, goal, sort, active) values
  ('hull',  'Make the hull',
   'Printed sections bonded into one shell, glassed outside and in, with the aluminium backbone and plywood baseboard fitted.',
   1, true),
  ('power', 'Preliminary power electronics',
   'Batteries, pods and the power wiring. With the hull, this is the dynamic system that goes in the water first.',
   2, true)
on conflict (slug) do nothing;

insert into parts
  (phase, sort, category, name, qty, unit_price, unit_weight_g, weight_basis, status, vendor, link, notes)
values
  -- ---------------------------------------------------------------- hull
  ('hull', 10, 'Shell', 'PETG filament, 10 kg', 1, 225, 7790, 'cad', 'decided', 'Bambu Lab (PETG Basic)', 'https://us.store.bambulab.com/products/petg-basic',
   'The printed shell is 7.8 kg at 3 mm walls. The extra 2 kg covers the section a 100-hour print will lose.'),
  ('hull', 20, 'Layup', 'Epoxy resin + slow hardener, 1 gal kit', 1, 90, 1280, 'estimate', 'decided',
   'TotalBoat / West System', 'https://www.totalboat.com/collections/epoxy-resin',
   'Outside skin, inside tape, baseboard, and bonding the sections and backbone. About 1.6 kg mixed of the ~5 kg the kit makes.'),
  ('hull', 30, 'Layup', 'Fiberglass cloth, 6 oz, 10 yd', 1, 45, 680, 'cad', 'decided', 'TotalBoat', 'https://www.totalboat.com/products/6-oz-fiberglass-cloth',
   'Two plies over the whole outside (about 1 m²), one ply each side of the baseboard, and tape over the inside joints.'),
  ('hull', 40, 'Layup', 'Epoxy fairing compound, 1 qt', 1, 45, 290, 'cad', 'decided', 'TotalBoat TotalFair', 'https://www.totalboat.com/products/totalfair-epoxy-fairing-compound',
   'Fills the cloth weave and the steps at section joints after the outside glass.'),
  ('hull', 50, 'Layup', 'Layup consumables', 1, 35, 0, 'estimate', 'decided', 'Any hardware store', null,
   'Sandpaper 80–220, mixing cups and sticks, brushes, rollers, peel ply, gloves. Nothing stays on the boat.'),
  ('hull', 60, 'Finish', 'Epoxy primer + marine topside paint', 1, 55, 100, 'estimate', 'decided', 'TotalBoat TotalProtect primer + Wet Edge paint', 'https://www.totalboat.com/products/wet-edge-marine-topside-paint',
   'UV protection for the epoxy skin. A light colour keeps the hull below the temperature where PETG softens.'),
  ('hull', 70, 'Structure', '6061 aluminium for the backbone', 1, 85, 2040, 'cad', 'decided', 'Online Metals', 'https://www.onlinemetals.com/en/buy/aluminum/0-125-aluminum-sheet-6061-t6/pid/1246',
   '1/8 in sheet for the keelson, gussets and floors; 1/4 in plate for the transom. Abrade and prime before bonding.'),
  ('hull', 80, 'Structure', 'Marine plywood, 1/4 in okoume, 2 × 4 ft', 1, 40, 600, 'cad', 'decided', 'Chesapeake Light Craft', 'https://clcboats.com/products/okoume-marine-plywood',
   'The baseboard. Cut to the CAD outline (0.21 m²), glassed both sides, bolted down to the backbone.'),
  ('hull', 90, 'Structure', 'Stainless bolts, washers, nylon isolators', 1, 35, 350, 'estimate', 'decided', 'Monster Bolts (316 / A4)', 'https://monsterbolts.com/products/socket-cap-316-m5',
   '8 × M8 through the transom plate, 16 × M5 through the keelson feet, plus baseboard and pad-eye bolts.'),
  ('hull', 100, 'Collar', 'Custom 5 in inflatable tubes, 3 chambers a side', 2, null, 1000, 'estimate', 'open', 'Not sourced yet', null,
   'About 56 in of centreline each. How they get made is still open, so there is no price yet.'),
  ('hull', 110, 'Collar', 'Lacing hardware, webbing, rub strip', 1, 40, 150, 'estimate', 'decided', 'US Stainless (pad eyes)', 'https://usstainless.com/categories/hardware/pad-eyes.html',
   'Pad eyes along the sheer to lace the tubes down.'),

  -- --------------------------------------------------------------- power
  ('power', 10, 'Propulsion', 'Flipsky 65150 160KV 3 kW pod, ESC built in — stepped shaft', 2, 299, 2550, 'estimate', 'decided',
   'Flipsky',
   'https://flipsky.net/collections/waterproof-motor/products/flipsky-65150-motor-160kv-3000w-ip68-bldc-motor-esc-2-in-1-combo-for-surfing-boat-underwater-thruster-hydro-efoil?variant=46096877715697',
   'IP68, 4–13S, 30 A rated / 70 A max. Weight includes its 1.4 m leads.'),
  ('power', 20, 'Propulsion', 'Contender 25 propeller, self-printed', 2, 15, 45, 'estimate', 'decided', 'Self-printed (RC Test Flight CAD)', null,
   'The primary prop, scaled about 15% up for the 65 mm motor.'),
  ('power', 30, 'Propulsion', 'Flipsky matched propeller (spare)', 2, 15, 0, 'estimate', 'decided',
   'Flipsky',
   'https://flipsky.net/collections/waterproof-motor/products/flipsky-65150-motor-160kv-3000w-ip68-bldc-motor-esc-2-in-1-combo-for-surfing-boat-underwater-thruster-hydro-efoil?variant=46096877715697',
   'Metal backup, a +$15 option on the pod page. Kept ashore, so no weight on the boat.'),
  ('power', 40, 'Propulsion', 'Stepped-shaft prop adapters', 2, 20, 20, 'estimate', 'decided', 'Made in-house', null,
   'Measure the actual shaft step before finalizing. Adapters fail before props do.'),
  ('power', 50, 'Propulsion', 'Transom bracket, struts, trim tabs (aluminium)', 1, 80, 500, 'estimate', 'decided', 'Made in-house', null,
   'Pods hang behind the transom in clean flow. Trim tabs from day one.'),
  ('power', 60, 'Battery', 'Zeee 6S 10,000 mAh LiPo, EC5 — 2-pack', 1, 180, 2500, 'estimate', 'decided',
   'Zeee', 'https://www.amazon.com/Zeee-Connector-Batteries-Fireproof-Explosionproof/dp/B0CQ1W91P2',
   'Two packs in series make one 12S string.'),
  ('power', 70, 'Battery', 'Second Zeee 2-pack for 12S2P', 1, 180, 2500, 'estimate', 'optional',
   'Zeee', 'https://www.amazon.com/Zeee-Connector-Batteries-Fireproof-Explosionproof/dp/B0CQ1W91P2',
   'Roughly doubles runtime to 50–60 min. Not counted in the totals while optional.'),
  ('power', 80, 'Battery', 'HOTA D6 Pro dual-channel 6S charger', 1, 119, 0, 'estimate', 'decided',
   'RaceDayQuads', 'https://www.racedayquads.com/products/hota-d6-pro-dual-channel-325w-15a-ac-dc-battery-charger',
   'Stays ashore. Charge each 6S pack on its own channel, never the 12S string as one.'),
  ('power', 90, 'Power', 'Flipsky Smart Anti-Spark 300 A', 1, 57, 100, 'estimate', 'decided',
   'Flipsky', 'https://flipsky.net/collections/anti-spark-switch/products/flipsky-anti-spark-switch-smart-300a-v3-0-for-electric-skateboard-ebike-scooter-robots',
   'One switch on the main lead. Its over-current cutoff doubles as the fuse.'),
  ('power', 100, 'Power', 'EC5 series harness, bulkhead, 8 AWG', 1, 45, 700, 'estimate', 'decided', 'E-flite EFLAEC508 via AMain', 'https://www.amainhobbies.com/eflite-ec5-battery-series-harness-10awg-eflaec508/p211759',
   'Main leads, the series harness and the runs to both pods.'),
  ('power', 110, 'Enclosure', 'Pelican 1200 case', 1, 60, 700, 'estimate', 'decided',
   'Pelican', 'https://www.pelican.com/us/en/product/cases/protector/1200',
   'Holds both packs and the anti-spark. Vented, not sealed.'),
  ('power', 120, 'Enclosure', 'Gore screw-in protective vent', 1, 15, 5, 'estimate', 'decided', 'Gore (M12 screw-in)', 'https://www.gore.com/products/screw-protective-vents-outdoor-electronics-enclosures',
   'Gas relief high on the case, still splash-tight.'),
  ('power', 130, 'Enclosure', 'IP68 cable glands / bulkhead pass-through', 1, 25, 50, 'estimate', 'decided', 'VCELINK PG7–PG16 kit', 'https://www.vcelink.com/products/cable-gland-pg-7-pg-16',
   'So the case unplugs from outside without opening it.'),
  ('power', 140, 'Software', 'VESC Tool', 1, 0, 0, 'spec', 'decided', null, 'https://vesc-project.com/vesc_tool',
   'Free. Configure each pod over USB and start current-limited at 30–40 A per motor.');
