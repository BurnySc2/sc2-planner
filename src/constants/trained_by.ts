import { CREATION_ABILITIES, MORPH_ABILITIES } from "./creation_abilities"
import UNITS_BY_ID from "./units_by_id"
import UPGRADE_BY_ID from "./upgrade_by_id"
import { ITrainedBy } from "./interfaces"
import { sortBy, uniq, without } from "lodash"

import data from "./data.json"
// const data = require("./data.json")

const TRAINED_BY: ITrainedBy = {}

data.Unit.forEach((trainingUnit) => {
    trainingUnit.abilities.forEach(
        // TODO Fix me
        // @ts-ignore
        (ability: {
            ability: number
            requirements: Array<{
                upgrade: number
                building: number
                addon: number
            }>
        }) => {
            const resultingUnitId = CREATION_ABILITIES[ability.ability]
            const resultingUnit = UNITS_BY_ID[resultingUnitId]
            // Check if ability id maps to a train / build command
            if (resultingUnit !== undefined) {
                let requiredStructureId = null
                let requiredUpgradeId = null
                let requiresUnit = null
                let requires = []
                let requiresTechlab = false
                let isMorph = MORPH_ABILITIES.has(ability.ability)
                if (isMorph) {
                    const morphes: {[resultingUnit: string]: string} = {
                        "Baneling": "Zergling",
                        "Ravager": "Roach",
                        "Overseer": "Overlord",
                        "LurkerMP": "Hydralisk",
                        "BroodLord": "Corruptor",
                    }
                    requiresUnit = morphes[resultingUnit.name]
                    if (morphes[resultingUnit.name]) {
                        requires.push(morphes[resultingUnit.name])
                    }
                }
                const isFreeMorph =
                    resultingUnit.minerals === trainingUnit.minerals &&
                    resultingUnit.gas === trainingUnit.gas &&
                    resultingUnit.is_structure === trainingUnit.is_structure
                // Ignore free morphs, e.g. hellbat to hellion is a free morph but adds the armory requirement for hellion
                if (isFreeMorph) {
                    return
                }
                let consumesUnit =
                    resultingUnit.race === "Zerg" &&
                    resultingUnit.is_structure &&
                    !trainingUnit.is_structure
                if (Array.isArray(ability.requirements)) {
                    for (let requirement of ability.requirements) {
                        if (requirement.upgrade) {
                            requiredUpgradeId = requirement.upgrade
                        }
                        if (requirement.building) {
                            requiredStructureId = requirement.building
                        }
                        if (requirement.addon) {
                            requiresTechlab = true
                        }
                    }
                }

                let requiredStructure =
                    requiredStructureId !== null ? UNITS_BY_ID[requiredStructureId].name : null
                if (requiredStructure) {
                    requires.push(requiredStructure)
                }
                let requiredUpgrade =
                    requiredUpgradeId !== null ? UPGRADE_BY_ID[requiredUpgradeId].name : null
                if (requiredUpgrade) {
                    requires.push(requiredUpgrade)
                }

                // If it doesnt exist: create
                if (TRAINED_BY[resultingUnit.name] === undefined) {
                    TRAINED_BY[resultingUnit.name] = {
                        trainedBy: new Set([trainingUnit.name]),
                        requiresTechlab: requiresTechlab,
                        requiresUnit: requiresUnit,
                        requires: [[...requires, trainingUnit.name]],
                        isMorph: isMorph,
                        consumesUnit: consumesUnit,
                        requiredStructure: null,
                        requiredUpgrade: null,
                    }
                } else {
                    // Entry already exists, add training unit to object of 'trainedBy' and update requirement
                    TRAINED_BY[resultingUnit.name].trainedBy.add(trainingUnit.name)
                    TRAINED_BY[resultingUnit.name].requires[0].push(trainingUnit.name, ...requires);
                }
                TRAINED_BY[resultingUnit.name].requiredStructure = !TRAINED_BY[resultingUnit.name]
                    .requiredStructure
                    ? requiredStructure
                    : TRAINED_BY[resultingUnit.name].requiredStructure

                TRAINED_BY[resultingUnit.name].requiredUpgrade = !TRAINED_BY[resultingUnit.name]
                    .requiredUpgrade
                    ? requiredUpgrade
                    : TRAINED_BY[resultingUnit.name].requiredUpgrade
            }
        }
    )
})

// Various fixes
const requirementPriority = ["Lair", "Corruptor", "GreaterSpire", "Hive"];
for (let itemName in TRAINED_BY) {
    const trainInfo = TRAINED_BY[itemName]
    trainInfo.requires = trainInfo.requires.map(requires => sortBy(without(uniq(requires), "Larva", "OverlordTransport"), name => -requirementPriority.indexOf(name)));
}
TRAINED_BY['Queen'].requires = [["SpawningPool", "Hatchery"], ["SpawningPool", "Lair"], ["SpawningPool", "Hive"]]

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
console.assert(
    Object.keys(TRAINED_BY).length === 115,
    `${Object.keys(TRAINED_BY).length} is not 115`
)

console.assert(
    TRAINED_BY["Zergling"].requiredStructure === "SpawningPool",
    `${TRAINED_BY["Zergling"].requiredStructure}`
)

export default TRAINED_BY
