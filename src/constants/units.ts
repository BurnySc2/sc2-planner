import ENABLED_UNITS from "./enabled_units"
import data from "./data.json"
import { IDataUnit } from "./interfaces"
import { iconSortUnitFunction } from "./icon_order"

// const data = require("./data.json")

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

const UNITS: Array<IDataUnit> = data.Unit.filter((item) => {
    return !ignoreUnits.has(item.name) && ENABLED_UNITS.has(item.id) && !item.is_structure
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
console.assert(UNITS.length === 52, `${UNITS.length} is not equal to 52`)
console.assert(
    UNIT_NAMES_BY_RACE.terran.size === 17,
    `${UNIT_NAMES_BY_RACE.terran.size} is not equal to 17`
)
console.assert(
    UNIT_NAMES_BY_RACE.protoss.size === 18,
    `${UNIT_NAMES_BY_RACE.protoss.size} is not equal to 18`
)
console.assert(
    UNIT_NAMES_BY_RACE.zerg.size === 17,
    `${UNIT_NAMES_BY_RACE.zerg.size} is not equal to 17`
)

export { UNITS, UNIT_NAMES_BY_RACE }
