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

const UNITS = {
    all: data.Unit.filter((item) => {
        return ENABLED_UNITS[item.id] === 1 && !item.is_structure
    }),
    terran: data.Unit.filter((item) => {
        return ENABLED_UNITS[item.id] === 1 && !item.is_structure && item.race === "Terran"
    }),
    protoss: data.Unit.filter((item) => {
        return ENABLED_UNITS[item.id] === 1 && !item.is_structure && item.race === "Protoss"
    }),
    zerg: data.Unit.filter((item) => {
        return ENABLED_UNITS[item.id] === 1 && !item.is_structure && item.race === "Zerg"
    }),
}

// Should be 77 units in total
// console.log(UNITS.zerg)
console.assert(UNITS.all.length === 78, `${UNITS.all.length} is not equal to 78`);
console.assert(UNITS.terran.length === 21, `${UNITS.terran.length} is not equal to 21`);
console.assert(UNITS.protoss.length === 21, `${UNITS.protoss.length} is not equal to 21`);
console.assert(UNITS.zerg.length === 36, `${UNITS.zerg.length} is not equal to 36`);

export default UNITS