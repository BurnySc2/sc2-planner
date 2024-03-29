import ENABLED_UNITS from "./enabled_units"
import data from "./data.json"
import { IDataUnit } from "./interfaces"
import { iconSortStructureFunction } from "./icon_order"

/**
 * This file contains all enabled structures
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

const ignoreStructure = new Set([
    // Protoss
    "WarpGate",
    "OracleStasisTrap",
    // Terran
    "SupplyDepotLowered",
    "CommandCenterFlying",
    "OrbitalCommandFlying",
    "BarracksFlying",
    "FactoryFlying",
    "StarportFlying",
    "AutoTurret",
    "TechLab",
    "Reactor",
    // Zerg
    "CreepTumor",
    "CreepTumorQueen",
    "SpineCrawlerUprooted",
    "SporeCrawlerUprooted",
    "NydusCanal",
])

const STRUCTURES: Array<IDataUnit> = data.Unit.filter((item) => {
    return !ignoreStructure.has(item.name) && ENABLED_UNITS.has(item.id) && item.is_structure
})

const STRUCTURE_NAMES_BY_RACE: {
    protoss: Set<string>
    terran: Set<string>
    zerg: Set<string>
} = {
    protoss: new Set(),
    terran: new Set(),
    zerg: new Set(),
}
STRUCTURES.forEach((item) => {
    if (item.race === "Terran") {
        STRUCTURE_NAMES_BY_RACE.terran.add(item.name)
    }
    if (item.race === "Protoss") {
        STRUCTURE_NAMES_BY_RACE.protoss.add(item.name)
    }
    if (item.race === "Zerg") {
        STRUCTURE_NAMES_BY_RACE.zerg.add(item.name)
    }
})

STRUCTURES.sort(iconSortStructureFunction)

console.assert(STRUCTURES.length === 53, `${STRUCTURES.length} is not equal to 53`)
console.assert(
    STRUCTURE_NAMES_BY_RACE.terran.size === 21,
    `${STRUCTURE_NAMES_BY_RACE.terran.size} is not equal to 21`
)
console.assert(
    STRUCTURE_NAMES_BY_RACE.protoss.size === 15,
    `${STRUCTURE_NAMES_BY_RACE.protoss.size} is not equal to 15`
)
console.assert(
    STRUCTURE_NAMES_BY_RACE.zerg.size === 17,
    `${STRUCTURE_NAMES_BY_RACE.zerg.size} is not equal to 17`
)

export { STRUCTURES, STRUCTURE_NAMES_BY_RACE }
