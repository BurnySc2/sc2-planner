// npx tsx src/constants/structures.ts

import { convertUnit, type IRawUnit } from "./converters"
import data from "./data.json"
import { iconSortStructureFunction } from "./icon_order"
import type { IDataUnit } from "./interfaces"

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
    "AssimilatorRich",
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
    "RefineryRich",
    // Zerg
    "CreepTumor",
    "CreepTumorQueen",
    "SpineCrawlerUprooted",
    "SporeCrawlerUprooted",
    "NydusCanal",
    "ExtractorRich",
])

const STRUCTURES: Array<IDataUnit> = (Object.values(data.Units) as IRawUnit[])
    .filter((item) => {
        return !ignoreStructure.has(item.name) && item.type === "structure"
    })
    .map((item) => convertUnit(item))

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

console.assert(STRUCTURES.length === 55, `${STRUCTURES.length} is not equal to 55`)
console.assert(STRUCTURE_NAMES_BY_RACE.terran.size === 21, `${STRUCTURE_NAMES_BY_RACE.terran.size} is not equal to 21`)
console.assert(
    STRUCTURE_NAMES_BY_RACE.protoss.size === 15,
    `${STRUCTURE_NAMES_BY_RACE.protoss.size} is not equal to 15`,
)
console.assert(STRUCTURE_NAMES_BY_RACE.zerg.size === 17, `${STRUCTURE_NAMES_BY_RACE.zerg.size} is not equal to 17`)

export { STRUCTURE_NAMES_BY_RACE, STRUCTURES }
