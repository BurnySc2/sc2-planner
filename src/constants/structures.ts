import ENABLED_UNITS from "./enabled_units"
import data from "./data.json"
import { IDataUnit } from "./interfaces"
// const data = require("./data.json")

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

const STRUCTURES: { [name: string]: Array<IDataUnit> } = {
    all: data.Unit.filter((item) => {
        return (
            !ignoreStructure.has(item.name) &&
            ENABLED_UNITS.has(item.id) &&
            item.is_structure
        )
    }),
    terran: data.Unit.filter((item) => {
        return (
            !ignoreStructure.has(item.name) &&
            ENABLED_UNITS.has(item.id) &&
            item.is_structure &&
            item.race === "Terran"
        )
    }),
    protoss: data.Unit.filter((item) => {
        return (
            !ignoreStructure.has(item.name) &&
            ENABLED_UNITS.has(item.id) &&
            item.is_structure &&
            item.race === "Protoss"
        )
    }),
    zerg: data.Unit.filter((item) => {
        return (
            !ignoreStructure.has(item.name) &&
            ENABLED_UNITS.has(item.id) &&
            item.is_structure &&
            item.race === "Zerg"
        )
    }),
}

// console.log(STRUCTURES.all)
console.assert(
    STRUCTURES.all.length === 52,
    `${STRUCTURES.all.length} is not equal to 52`
)
console.assert(
    STRUCTURES.terran.length === 20,
    `${STRUCTURES.terran.length} is not equal to 20`
)
console.assert(
    STRUCTURES.protoss.length === 15,
    `${STRUCTURES.protoss.length} is not equal to 15`
)
console.assert(
    STRUCTURES.zerg.length === 17,
    `${STRUCTURES.zerg.length} is not equal to 17`
)

export default STRUCTURES
