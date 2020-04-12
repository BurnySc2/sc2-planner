import ENABLED_UNITS from "./enabled_units"
import data from "./data.json"
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

const ignoreStructure = {
    // Protoss
    OracleStasisTrap: 1,
    // Terran
    SupplyDepotLowered: 1,
    CommandCenterFlying: 1,
    OrbitalCommandFlying: 1,
    BarracksFlying: 1,
    FactoryFlying: 1,
    StarportFlying: 1,
    AutoTurret: 1,
    TechLab: 1,
    Reactor: 1,
    // Zerg
    CreepTumor: 1,
    CreepTumorQueen: 1,
    SpineCrawlerUprooted: 1,
    SporeCrawlerUprooted: 1,
}

const STRUCTURES = {
    all: data.Unit.filter((item) => {
        return ignoreStructure[item.name] !== 1 && ENABLED_UNITS[item.id] === 1 && item.is_structure
    }),
    terran: data.Unit.filter((item) => {
        return ignoreStructure[item.name] !== 1 && ENABLED_UNITS[item.id] === 1 && item.is_structure && item.race === "Terran"
    }),
    protoss: data.Unit.filter((item) => {
        return ignoreStructure[item.name] !== 1 && ENABLED_UNITS[item.id] === 1 && item.is_structure && item.race === "Protoss"
    }),
    zerg: data.Unit.filter((item) => {
        return ignoreStructure[item.name] !== 1 && ENABLED_UNITS[item.id] === 1 && item.is_structure && item.race === "Zerg"
    }),
}

// console.log(STRUCTURES.all)
console.assert(STRUCTURES.all.length === 51, `${STRUCTURES.all.length} is not equal to 51`);
console.assert(STRUCTURES.terran.length === 19, `${STRUCTURES.terran.length} is not equal to 19`);
console.assert(STRUCTURES.protoss.length === 15, `${STRUCTURES.protoss.length} is not equal to 15`);
console.assert(STRUCTURES.zerg.length === 17, `${STRUCTURES.zerg.length} is not equal to 17`);


export default STRUCTURES