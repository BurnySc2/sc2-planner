import ENABLED_UNITS from "./enabled_units"
import data from "./data.json"
import { IDataUnit } from "./interfaces"

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

const UNITS: { [name: string]: Array<IDataUnit> } = {
    all: data.Unit.filter((item) => {
        return (
            !ignoreUnits.has(item.name) &&
            ENABLED_UNITS.has(item.id) &&
            !item.is_structure
        )
    }),
    terran: data.Unit.filter((item) => {
        return (
            !ignoreUnits.has(item.name) &&
            ENABLED_UNITS.has(item.id) &&
            !item.is_structure &&
            item.race === "Terran"
        )
    }),
    protoss: data.Unit.filter((item) => {
        return (
            !ignoreUnits.has(item.name) &&
            ENABLED_UNITS.has(item.id) &&
            !item.is_structure &&
            item.race === "Protoss"
        )
    }),
    zerg: data.Unit.filter((item) => {
        return (
            !ignoreUnits.has(item.name) &&
            ENABLED_UNITS.has(item.id) &&
            !item.is_structure &&
            item.race === "Zerg"
        )
    }),
}

// Should be 77 units in total
// console.log(UNITS.zerg)
console.assert(
    UNITS.all.length === 52,
    `${UNITS.all.length} is not equal to 52`
)
console.assert(
    UNITS.terran.length === 17,
    `${UNITS.terran.length} is not equal to 17`
)
console.assert(
    UNITS.protoss.length === 18,
    `${UNITS.protoss.length} is not equal to 18`
)
console.assert(
    UNITS.zerg.length === 17,
    `${UNITS.zerg.length} is not equal to 17`
)

export default UNITS
