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

const STRUCTURES = {
    all: data.Unit.filter((item) => {
        return ENABLED_UNITS[item.id] === 1 && item.is_structure
    }),
    terran: data.Unit.filter((item) => {
        return ENABLED_UNITS[item.id] === 1 && item.is_structure && item.race === "Terran"
    }),
    protoss: data.Unit.filter((item) => {
        return ENABLED_UNITS[item.id] === 1 && item.is_structure && item.race === "Protoss"
    }),
    zerg: data.Unit.filter((item) => {
        return ENABLED_UNITS[item.id] === 1 && item.is_structure && item.race === "Zerg"
    }),
}

// console.log(STRUCTURES.all)
console.assert(STRUCTURES.all.length === 59, `${STRUCTURES.all.length} is not equal to 59`);
console.assert(STRUCTURES.terran.length === 22, `${STRUCTURES.terran.length} is not equal to 22`);
console.assert(STRUCTURES.protoss.length === 16, `${STRUCTURES.protoss.length} is not equal to 16`);
console.assert(STRUCTURES.zerg.length === 21, `${STRUCTURES.zerg.length} is not equal to 21`);


export default STRUCTURES