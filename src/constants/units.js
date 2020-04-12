import ENABLED_UNITS from "./enabled_units"
import data from "./data.json"
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

const ignoreUnits = {
    // Protoss
    WarpPrismPhasing: 1,
    ObserverSiegeMode: 1,
    Archon: 1,
    // Terran
    SiegeTankSieged: 1,
    VikingAssault: 1,
    WidowMineBurrowed: 1,
    ThorAP: 1,
    // Zerg
    InfestorTerran: 1,
    Changeling: 1,
    BanelingBurrowed: 1,
    HydraliskBurrowed: 1,
    DroneBurrowed: 1,
    RoachBurrowed: 1,
    ZerglingBurrowed: 1,
    InfestorTerranBurrowed: 1,
    QueenBurrowed: 1,
    InfestorBurrowed: 1,
    UltraliskBurrowed: 1,
    SwarmHostBurrowedMP: 1,
    LurkerMPBurrowed: 1,
    RavagerBurrowed: 1,
    LocustMPFlying: 1,
    DefilerMPBurrowed: 1,
    DefilerMP: 1,
    OverlordTransport: 1,
    OverseerSiegeMode: 1,
}

const UNITS = {
    all: data.Unit.filter((item) => {
        return ignoreUnits[item.name] !== 1 && ENABLED_UNITS[item.id] === 1 && !item.is_structure
    }),
    terran: data.Unit.filter((item) => {
        return ignoreUnits[item.name] !== 1 && ENABLED_UNITS[item.id] === 1 && !item.is_structure && item.race === "Terran"
    }),
    protoss: data.Unit.filter((item) => {
        return ignoreUnits[item.name] !== 1 && ENABLED_UNITS[item.id] === 1 && !item.is_structure && item.race === "Protoss"
    }),
    zerg: data.Unit.filter((item) => {
        return ignoreUnits[item.name] !== 1 && ENABLED_UNITS[item.id] === 1 && !item.is_structure && item.race === "Zerg"
    }),
}

// Should be 77 units in total
// console.log(UNITS.zerg)
console.assert(UNITS.all.length === 52, `${UNITS.all.length} is not equal to 52`);
console.assert(UNITS.terran.length === 17, `${UNITS.terran.length} is not equal to 17`);
console.assert(UNITS.protoss.length === 18, `${UNITS.protoss.length} is not equal to 18`);
console.assert(UNITS.zerg.length === 17, `${UNITS.zerg.length} is not equal to 17`);

export default UNITS