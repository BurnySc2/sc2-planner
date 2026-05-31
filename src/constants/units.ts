// npx tsx src/constants/units.ts
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
    // Zerg
    "InfestorTerran",
    "Changeling",
    "BanelingBurrowed",
    "HydraliskBurrowed",
    "DroneBurrowed",
    "RoachBurrowed",
    "ZerglingBurrowed",
    "InfestorTerranBurrowed",
    "QueenBurrowed",
    "InfestorBurrowed",
    "UltraliskBurrowed",
    "SwarmHostBurrowedMP",
    "LurkerMPBurrowed",
    "RavagerBurrowed",
    "LocustMPFlying",
    "DefilerMPBurrowed",
    "DefilerMP",
    "OverlordTransport",
    "OverseerSiegeMode",
])

// @ts-expect-error
const UNITS: Array<IDataUnit> = Object.values(data.Units).filter((item) => {
    return !ignoreUnits.has(item.name) && item.type === "unit"
})

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

// Should be 77 units in total
console.assert(UNITS.length === 74, `${UNITS.length} is not equal to 74`)
console.assert(UNIT_NAMES_BY_RACE.terran.size === 19, `${UNIT_NAMES_BY_RACE.terran.size} is not equal to 19`)
console.assert(UNIT_NAMES_BY_RACE.protoss.size === 18, `${UNIT_NAMES_BY_RACE.protoss.size} is not equal to 18`)
console.assert(UNIT_NAMES_BY_RACE.zerg.size === 26, `${UNIT_NAMES_BY_RACE.zerg.size} is not equal to 26`)

export { UNIT_NAMES_BY_RACE, UNITS }
