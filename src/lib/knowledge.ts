import type { BomPart, CatalogMode, Procedure } from "./types";

export const PROCEDURES: Procedure[] = [
  {
    id: "proc-feeder-chain",
    tsb: "TSB-AF-4412",
    title: "Feeder house chain stretch and idler chatter",
    family: "combine-final",
    steps: [
      "Lock out station 4 E-stop and tag the feeder house rail.",
      "Measure chain sag at the lower idler: spec is 12–18 mm at 50 N.",
      "If sag exceeds 22 mm, replace both AF feeder chains as a pair.",
      "Inspect idler bushings for flat spots; replace if OD wear exceeds 1.5 mm.",
      "Tension to the yellow mark on the slack-side gauge, then bump run 30 s.",
      "Sign the traveler and release the station hold.",
    ],
  },
  {
    id: "proc-rotor-belt",
    tsb: "TSB-AF-3908",
    title: "Rotor drive belt slip on Axial-Flow 250",
    family: "combine-final",
    steps: [
      "Confirm rotor speed command vs encoder: more than 8% lag is a slip flag.",
      "Check automatic tensioner arm travel; it must sit between the two scribed marks.",
      "Replace the matched rotor belt set — do not mix lots from the cage.",
      "Verify pulley alignment with the plant laser fixture (gap ≤ 0.5 mm).",
      "Reset the rotor slip counter in the cab display, then dry-run 2 minutes.",
    ],
  },
  {
    id: "proc-rotor-sensor",
    tsb: "TSB-NH-7711",
    title: "CR rotor speed sensor intermittent",
    family: "combine-final",
    steps: [
      "Wiggle the harness at the rotor gearbox bulkhead while watching the cab RPM.",
      "If dropouts follow the wiggle, replace the speed sensor and pigtail as a kit.",
      "Torque the sensor to 12 N·m; do not crush the O-ring.",
      "Reroute the harness clear of the residue shield hinge.",
      "Clear fault C7-442 and verify a solid 800–1200 pulse/rev at idle.",
    ],
  },
  {
    id: "proc-tank-sensor",
    tsb: "TSB-AF-2280",
    title: "Grain tank fill sensor false-full",
    family: "combine-final",
    steps: [
      "Empty the sample grain from the tank corner (demo seed is not crop).",
      "Wipe the capacitive paddle; paint overspray from station 6 is a known cause.",
      "Check the 12 V supply at the tank bulkhead: 11.5–13.0 V with key on.",
      "If voltage is good and the paddle still latches full, swap the sensor.",
      "Calibrate empty/full from the combine display service menu.",
    ],
  },
  {
    id: "proc-chopper",
    tsb: "TSB-AF-5519",
    title: "Residue chopper plug on first spin",
    family: "combine-final",
    steps: [
      "Do not restart under load. Open the chopper hood after lockout.",
      "Remove packing (foam, plastic, shipping wrap) from the knife drum.",
      "Inspect knives for shipping-bend; replace any with more than 3 mm runout.",
      "Check the counter-knife bank bolts — station 7 has a history of missed torques.",
      "Bump-run and listen for a clean whoosh, not a slap.",
    ],
  },
  {
    id: "proc-boom-weep",
    tsb: "TSB-CASE-PDI-118",
    title: "Loader boom cylinder rod seal weep at PDI",
    family: "construction-prep",
    steps: [
      "Wipe the rod and cycle three times; confirm it is oil, not assembly lube.",
      "Cap the drain and pressure-hold at 210 bar for 3 minutes.",
      "If the drip exceeds 2 drops/min, pull the gland and replace the rod seal kit.",
      "Fill from the sealed CASE HY-TRAN drum only — no bulk tank on this bay.",
      "Stamp the PDI sheet and photograph the dry rod for the dealer packet.",
    ],
  },
  {
    id: "proc-travel-alarm",
    tsb: "TSB-CASE-PDI-204",
    title: "Travel alarm silent after rail transport",
    family: "construction-prep",
    steps: [
      "Verify the alarm disable switch behind the seat is not taped over from shipping.",
      "Key-on, propel forward 0.5 m on the bay stands — alarm must exceed 97 dB.",
      "Check the two-pin weatherpack at the left frame rail; transport straps pinch it.",
      "Replace the alarm module if voltage is present and the horn is dead.",
      "Tie-wrap the harness to the factory clip, not the hydraulic tube.",
    ],
  },
  {
    id: "proc-hvac-charge",
    tsb: "TSB-CASE-PDI-067",
    title: "Cab HVAC not cooling at dealer prep",
    family: "construction-prep",
    steps: [
      "Confirm the shipping cap is off the high-side port.",
      "Evacuate to 500 microns and hold 10 minutes.",
      "Charge R-134a to the under-hood spec plate (do not guess from another model).",
      "Run A/C at max with doors closed; vent must drop below 10 °C in 8 minutes.",
      "Leak-check the compressor clutch connector — a bent pin is common after cab drop.",
    ],
  },
  {
    id: "proc-track-tension",
    tsb: "TSB-CASE-PDI-331",
    title: "Excavator track tensioner leak",
    family: "construction-prep",
    steps: [
      "Support the house. Do not work under a live track.",
      "Measure sag at the mid-roller: CX210D spec is 320–350 mm.",
      "If grease is on the idler face, replace the tensioner cylinder seal kit.",
      "Recharge with the plant grease gun (red NLGI 2 only).",
      "Log serial of the tensioner on the PDI traveler.",
    ],
  },
  {
    id: "proc-backhoe-aux",
    tsb: "TSB-CASE-PDI-090",
    title: "Backhoe aux hyd dead at the coupler",
    family: "construction-prep",
    steps: [
      "Verify the loader valve interlock is not left in the shipping lock position.",
      "Command aux flow from the joystick; listen for the solenoid click at the valve.",
      "If no click, check fuse F17 and the 24-pin cab-to-valve harness.",
      "Replace the aux solenoid coil if 12 V is present and the coil is open.",
      "Flow-test 40 L/min into the barrel — dealer will reject anything under 35.",
    ],
  },
];

export const BOM: BomPart[] = [
  { sku: "87654321", name: "Feeder house chain, AF 250 RH", family: "combine-final", bin: "C-Aisle 12", qtyOnHand: 6 },
  { sku: "87654322", name: "Feeder house chain, AF 250 LH", family: "combine-final", bin: "C-Aisle 12", qtyOnHand: 6 },
  { sku: "84110209", name: "Feeder idler bushing", family: "combine-final", bin: "C-Aisle 14", qtyOnHand: 18 },
  { sku: "47883190", name: "Rotor drive belt set (matched)", family: "combine-final", bin: "C-Cage 2", qtyOnHand: 4 },
  { sku: "47883191", name: "Rotor tensioner arm", family: "combine-final", bin: "C-Cage 2", qtyOnHand: 3 },
  { sku: "84329211", name: "CR rotor speed sensor kit", family: "combine-final", bin: "C-Elec 4", qtyOnHand: 9 },
  { sku: "84329212", name: "CR rotor sensor pigtail", family: "combine-final", bin: "C-Elec 4", qtyOnHand: 11 },
  { sku: "87501900", name: "Grain tank fill sensor", family: "combine-final", bin: "C-Elec 6", qtyOnHand: 7 },
  { sku: "47662001", name: "Chopper knife, serrated", family: "combine-final", bin: "C-Aisle 20", qtyOnHand: 40 },
  { sku: "47662008", name: "Counter-knife bank bolt kit", family: "combine-final", bin: "C-Aisle 20", qtyOnHand: 15 },
  { sku: "CA-380123", name: "Boom cylinder rod seal kit", family: "construction-prep", bin: "PDI-Hyd 1", qtyOnHand: 8 },
  { sku: "CA-221904", name: "Travel alarm module", family: "construction-prep", bin: "PDI-Elec 2", qtyOnHand: 5 },
  { sku: "CA-134890", name: "R-134a charge, 24 oz can", family: "construction-prep", bin: "PDI-HVAC", qtyOnHand: 22 },
  { sku: "CA-134891", name: "Compressor clutch connector", family: "construction-prep", bin: "PDI-HVAC", qtyOnHand: 10 },
  { sku: "CA-772210", name: "Track tensioner seal kit, CX", family: "construction-prep", bin: "PDI-U/C", qtyOnHand: 4 },
  { sku: "CA-580441", name: "Aux solenoid coil, 580N", family: "construction-prep", bin: "PDI-Hyd 3", qtyOnHand: 6 },
];

export const CATALOG_MODES: CatalogMode[] = [
  {
    id: "fm-feeder-chain",
    title: "Feeder house chain stretch",
    family: "combine-final",
    keywords: ["feeder", "rattle", "chatter", "chain", "idlers", "knock", "house"],
    defaultCopy:
      "Matches station 4 history: chain sag past 22 mm throws a knock into the feeder rails at high idle.",
    procedureId: "proc-feeder-chain",
    partSkus: ["87654321", "87654322", "84110209"],
  },
  {
    id: "fm-rotor-belt",
    title: "Rotor drive belt slip",
    family: "combine-final",
    keywords: ["rotor", "belt", "slip", "lag", "rpm", "drive", "squeal"],
    defaultCopy:
      "Command vs encoder lag over 8% on Axial-Flow 250 is almost always the matched belt set, not the rotor itself.",
    procedureId: "proc-rotor-belt",
    partSkus: ["47883190", "47883191"],
  },
  {
    id: "fm-rotor-sensor",
    title: "Rotor speed sensor dropout",
    family: "combine-final",
    keywords: ["rotor", "sensor", "intermittent", "rpm", "c7-442", "speed", "dropout"],
    defaultCopy:
      "CR bulkhead pigtails take a hit when the residue shield is cycled during assembly. Wiggle test first.",
    procedureId: "proc-rotor-sensor",
    partSkus: ["84329211", "84329212"],
  },
  {
    id: "fm-tank-sensor",
    title: "Grain tank false-full",
    family: "combine-final",
    keywords: ["tank", "grain", "full", "sensor", "false", "paddle", "overspray"],
    defaultCopy:
      "Station 6 paint overspray on the capacitive paddle is the usual false-full. Wipe before you replace.",
    procedureId: "proc-tank-sensor",
    partSkus: ["87501900"],
  },
  {
    id: "fm-chopper-plug",
    title: "Residue chopper packing",
    family: "combine-final",
    keywords: ["chopper", "plug", "residue", "knife", "slap", "pack", "wrap"],
    defaultCopy:
      "Shipping wrap and foam left in the drum will slap on first spin. Do not restart under load.",
    procedureId: "proc-chopper",
    partSkus: ["47662001", "47662008"],
  },
  {
    id: "fm-boom-weep",
    title: "Boom cylinder rod seal weep",
    family: "construction-prep",
    keywords: ["boom", "cylinder", "weep", "leak", "rod", "hyd", "oil", "pin"],
    defaultCopy:
      "PDI weeps that survive a wipe-and-cycle need the rod seal kit, not another wipe. Hold at 210 bar.",
    procedureId: "proc-boom-weep",
    partSkus: ["CA-380123"],
  },
  {
    id: "fm-travel-alarm",
    title: "Travel alarm silent after transport",
    family: "construction-prep",
    keywords: ["alarm", "travel", "horn", "silent", "propel", "beep", "transport"],
    defaultCopy:
      "Rail straps pinch the left-frame weatherpack, and shipping tape still shows up on the disable switch.",
    procedureId: "proc-travel-alarm",
    partSkus: ["CA-221904"],
  },
  {
    id: "fm-hvac",
    title: "Cab HVAC not charged",
    family: "construction-prep",
    keywords: ["hvac", "ac", "a/c", "cool", "charge", "vent", "compressor", "r134"],
    defaultCopy:
      "Cabs often arrive with the high-side cap still on. Evacuate, charge to the plate, then check the clutch pin.",
    procedureId: "proc-hvac-charge",
    partSkus: ["CA-134890", "CA-134891"],
  },
  {
    id: "fm-track-tension",
    title: "Track tensioner grease leak",
    family: "construction-prep",
    keywords: ["track", "tension", "grease", "idler", "sag", "undercarriage"],
    defaultCopy:
      "Grease on the CX idler face is a tensioner seal, not a loose fill. Support the house before you work.",
    procedureId: "proc-track-tension",
    partSkus: ["CA-772210"],
  },
  {
    id: "fm-aux-hyd",
    title: "Aux hyd dead at coupler",
    family: "construction-prep",
    keywords: ["aux", "hydraulic", "coupler", "solenoid", "joystick", "flow", "dead"],
    defaultCopy:
      "Shipping lock on the loader valve and an open aux coil are the two PDI hits. Flow-test before the dealer sees it.",
    procedureId: "proc-backhoe-aux",
    partSkus: ["CA-580441"],
  },
];

export function procedureById(id: string) {
  return PROCEDURES.find((p) => p.id === id);
}

export function partsBySkus(skus: string[]) {
  return BOM.filter((p) => skus.includes(p.sku));
}
