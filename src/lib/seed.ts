import type { PlantStore } from "./types";

const SEEDED_AT = "2026-10-03T13:40:00.000Z";

export const PLANT_NAME =
  "Fargo combine final · Racine construction dealer-prep";

export function buildSeedStore(): PlantStore {
  return {
    meta: {
      plant: PLANT_NAME,
      seededAt: SEEDED_AT,
      shift: "Days (Sat overtime)",
    },
    assets: [
      {
        id: "ast-af9250",
        tag: "AF9250-ST4-07",
        model: "Axial-Flow 9250",
        family: "combine-final",
        station: "Station 4 · Rotor & feeder",
        line: "Fargo combine final",
        status: "down",
      },
      {
        id: "ast-af7250",
        tag: "AF7250-ST6-12",
        model: "Axial-Flow 7250",
        family: "combine-final",
        station: "Station 6 · Grain tank",
        line: "Fargo combine final",
        status: "hold",
      },
      {
        id: "ast-cr890",
        tag: "CR8.90-ST2-03",
        model: "CR8.90",
        family: "combine-final",
        station: "Station 2 · Chassis",
        line: "Fargo combine final",
        status: "running",
      },
      {
        id: "ast-l220",
        tag: "L220-BAY-A",
        model: "CASE L220",
        family: "construction-prep",
        station: "Bay A · Pre-delivery",
        line: "Racine dealer-prep",
        status: "hold",
      },
      {
        id: "ast-cx210",
        tag: "CX210D-BAY-C",
        model: "CASE CX210D",
        family: "construction-prep",
        station: "Bay C · Track & hyd",
        line: "Racine dealer-prep",
        status: "down",
      },
      {
        id: "ast-580n",
        tag: "580N-BAY-B",
        model: "CASE 580N",
        family: "construction-prep",
        station: "Bay B · PTO / hyd",
        line: "Racine dealer-prep",
        status: "running",
      },
    ],
    faults: [
      {
        id: "flt-1001",
        assetId: "ast-af9250",
        reportedBy: "M. Kovacs, operator",
        shift: "Days",
        symptom:
          "Feeder house rattling hard at 1800 rpm after the chain was pulled onto the sprockets. Station 4 is on E-stop.",
        severity: "stop",
        status: "diagnosed",
        photoUrl: "/uploads/feeder-rail.svg",
        createdAt: "2026-10-03T12:18:00.000Z",
        diagnosis: {
          rankedAt: "2026-10-03T12:22:00.000Z",
          source: "catalog",
          modes: [
            {
              id: "fm-feeder-chain",
              title: "Feeder house chain stretch",
              confidence: 0.91,
              copy: "Matches station 4 history: chain sag past 22 mm throws a knock into the feeder rails at high idle.",
              procedureId: "proc-feeder-chain",
              partSkus: ["87654321", "87654322", "84110209"],
            },
          ],
        },
      },
      {
        id: "flt-1002",
        assetId: "ast-cr890",
        reportedBy: "J. Patel, operator",
        shift: "Days",
        symptom:
          "Rotor RPM drops out every time the residue shield is opened. Cab throws C7-442 then recovers.",
        severity: "slow",
        status: "assigned",
        createdAt: "2026-10-03T11:05:00.000Z",
        diagnosis: {
          rankedAt: "2026-10-03T11:09:00.000Z",
          source: "catalog",
          modes: [
            {
              id: "fm-rotor-sensor",
              title: "Rotor speed sensor dropout",
              confidence: 0.88,
              copy: "CR bulkhead pigtails take a hit when the residue shield is cycled during assembly. Wiggle test first.",
              procedureId: "proc-rotor-sensor",
              partSkus: ["84329211", "84329212"],
            },
          ],
        },
      },
      {
        id: "flt-1003",
        assetId: "ast-l220",
        reportedBy: "A. Ruiz, PDI tech",
        shift: "Days",
        symptom:
          "Left boom cylinder weeps at the rod after three cycles. Oil, not assembly lube. Dealer truck is at 15:00.",
        severity: "stop",
        status: "open",
        photoUrl: "/uploads/boom-rod.svg",
        createdAt: "2026-10-03T13:02:00.000Z",
      },
      {
        id: "flt-1004",
        assetId: "ast-cx210",
        reportedBy: "D. Nguyen, operator",
        shift: "Days",
        symptom:
          "Travel alarm silent after the machine came off the railcar. Propel on stands makes no sound.",
        severity: "stop",
        status: "open",
        createdAt: "2026-10-03T13:28:00.000Z",
      },
      {
        id: "flt-1005",
        assetId: "ast-af7250",
        reportedBy: "S. Berg, operator",
        shift: "Days",
        symptom:
          "Grain tank shows full with an empty tank. Looks like paint overspray on the paddle from station 6.",
        severity: "watch",
        status: "open",
        createdAt: "2026-10-03T13:35:00.000Z",
      },
    ],
    workOrders: [
      {
        id: "wo-4401",
        faultId: "flt-1001",
        assetId: "ast-af9250",
        title: "Replace AF feeder chains · ST4-07",
        status: "parts-hold",
        technician: "T. Ellis",
        procedureId: "proc-feeder-chain",
        partSkus: ["87654321", "87654322", "84110209"],
        notes: "Waiting on matched LH/RH chain pair from C-Aisle 12. Idler bushings pulled.",
        createdAt: "2026-10-03T12:25:00.000Z",
        updatedAt: "2026-10-03T13:10:00.000Z",
      },
      {
        id: "wo-4402",
        faultId: "flt-1002",
        assetId: "ast-cr890",
        title: "CR rotor sensor kit · ST2-03",
        status: "wrenching",
        technician: "K. Okonkwo",
        procedureId: "proc-rotor-sensor",
        partSkus: ["84329211", "84329212"],
        notes: "Wiggle test confirmed. Sensor kit on the cart, residue shield propped.",
        createdAt: "2026-10-03T11:12:00.000Z",
        updatedAt: "2026-10-03T13:30:00.000Z",
      },
    ],
    handoffs: [
      {
        id: "hnd-0901",
        fromShift: "Nights (Fri)",
        toShift: "Days (Sat overtime)",
        supervisor: "L. Hart, area lead",
        notes:
          "CR8.90 sensor job is first wrench of the day. AF9250 feeder rattle started on days — do not bump-run until chains are paired. Racine: L220 boom weep must close before the 15:00 dealer pickup. CX210D came off the rail mute; check the disable switch before you order a horn.",
        openFaultIds: ["flt-1001", "flt-1002", "flt-1003", "flt-1004", "flt-1005"],
        createdAt: "2026-10-03T06:05:00.000Z",
      },
    ],
  };
}
