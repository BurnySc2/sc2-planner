// npx tsx src/constants/units.ts

import { convertUnit, type IRawUnit } from "./converters"
import data from "./data.json"
import { iconSortUnitFunction } from "./icon_order"
import type { IDataUnit } from "./interfaces"

/**
 * This file contains all enabled units
{
    all: {
        id: 1
        etc
    },
    terran: {
        id: 1
        etc
    }
}
 */

const ignoreUnits = new Set([
    // Protoss
    "WarpPrismPhasing",
    "ObserverSiegeMode",
    "Archon",
    // Terran
    "SiegeTankSieged",
    "VikingAssault",
    "WidowMineBurrowed",
    "ThorAP",
    "GhostAlternate",
    "GhostNova",
    // Zerg
    "BanelingBurrowed",
    "BanelingCocoon",
    "BroodLordCocoon",
    "Changeling",
    "DefilerMP",
    "DefilerMPBurrowed",
    "DevourerCocoonMP",
    "DevourerMP",
    "DroneBurrowed",
    "GuardianCocoonMP",
    "GuardianMP",
    "HydraliskBurrowed",
    "InfestorBurrowed",
    "InfestorTerran",
    "InfestorTerranBurrowed",
    "LocustMPFlying",
    "LurkerMPBurrowed",
    "LurkerMPEgg",
    "OverlordCocoon",
    "OverlordTransport",
    "TransportOverlordCocoon",
    "OverseerSiegeMode",
    "QueenBurrowed",
    "RavagerBurrowed",
    "RavagerCocoon",
    "RoachBurrowed",
    "SwarmHostBurrowedMP",
    "UltraliskBurrowed",
    "ZerglingBurrowed",
])

const UNITS: Array<IDataUnit> = (Object.values(data.Units) as IRawUnit[])
    .filter((item) => {
        return !ignoreUnits.has(item.name) && item.type === "unit"
    })
    .map((item) => convertUnit(item))

UNITS.sort(iconSortUnitFunction)

const UNIT_NAMES_BY_RACE: {
    protoss: Set<string>
    terran: Set<string>
    zerg: Set<string>
} = {
    protoss: new Set(),
    terran: new Set(),
    zerg: new Set(),
}
UNITS.forEach((item) => {
    if (item.race === "Terran") {
        UNIT_NAMES_BY_RACE.terran.add(item.name)
    }
    if (item.race === "Protoss") {
        UNIT_NAMES_BY_RACE.protoss.add(item.name)
    }
    if (item.race === "Zerg") {
        UNIT_NAMES_BY_RACE.zerg.add(item.name)
    }
})

// Should be 63 units in total
console.assert(UNITS.length === 63, `${UNITS.length} is not equal to 63`)
console.assert(UNIT_NAMES_BY_RACE.terran.size === 16, `${UNIT_NAMES_BY_RACE.terran.size} is not equal to 16`)
console.assert(UNIT_NAMES_BY_RACE.protoss.size === 18, `${UNIT_NAMES_BY_RACE.protoss.size} is not equal to 18`)
console.assert(UNIT_NAMES_BY_RACE.zerg.size === 18, `${UNIT_NAMES_BY_RACE.zerg.size} is not equal to 18`)

export { UNIT_NAMES_BY_RACE, UNITS }
