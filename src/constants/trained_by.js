import {CREATION_ABILITIES, MORPH_ABILITIES} from "./creation_abilities"
import UNITS_BY_ID from "./units_by_id"
import UPGRADE_BY_ID from "./upgrade_by_id"

import data from "./data.json"
// const data = require("./data.json")

const TRAINED_BY = {}
// console.log(CREATION_ABILITIES)

data.Unit.forEach((trainingUnit) => {
    trainingUnit.abilities.forEach((ability) => {
        const resultingUnitId = CREATION_ABILITIES[ability.ability]
        const resultingUnit = UNITS_BY_ID[resultingUnitId]
        // Check if ability id maps to a train / build command
        if (resultingUnit !== undefined) {
            let requiredStructure = null
            let requiredUpgrade = null
            let requiresTechlab = false
            let isMorph = MORPH_ABILITIES.has(ability.ability)
            // if (isMorph) {
            //     console.log("--------");
            //     console.log(trainingUnit);
            //     console.log(resultingUnit);
            // }
            let consumesUnit = resultingUnit.race === "zerg" && resultingUnit.is_structure && !trainingUnit.is_structure
            if (Array.isArray(ability.requirements)) {
                for (let requirement of ability.requirements) {
                    if (requirement.upgrade) {
                        requiredUpgrade = requirement.upgrade
                    }
                    if (requirement.building) {
                        requiredStructure = requirement.building
                    }
                    if (requirement.addon) {
                        requiresTechlab = true
                    }
                }
            }
            // If it doesnt exist: create
            if (TRAINED_BY[resultingUnit.name] === undefined) {
                TRAINED_BY[resultingUnit.name] = {
                    trainedBy: {[trainingUnit.name]: 1},

                    requiredStructure: requiredStructure !== null ? UNITS_BY_ID[requiredStructure].name : null,

                    requiredUpgrade: requiredUpgrade !== null ? UPGRADE_BY_ID[requiredUpgrade].name : null,

                    requiresTechlab: requiresTechlab,

                    isMorph: isMorph,

                    consumesUnit: consumesUnit,
                }
            } else {
                // Entry already exists, add training unit to object of 'trainedBy'
                TRAINED_BY[resultingUnit.name].trainedBy[trainingUnit.name] = 1
            }
        }
    })
})

// console.log(TRAINED_BY);
    
/**
{Adept: 
    requiredStructure: "CyberneticsCore",
    requiredUpgrade: null,
    requiresTechlab: false,
    trainedBy: { Gateway: 1, WarpGate: 1 }
    // E.g. when a hatch morphes to lair, is a morph
    isMorph: false
    // E.g. when a drone builds a spawning pool, it consumes the drone
    consumesUnit: false
}
 */
console.assert(Object.keys(TRAINED_BY).length === 144, `${Object.keys(TRAINED_BY).length} is not 144`)

export default TRAINED_BY
