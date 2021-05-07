import { CREATION_ABILITIES, MORPH_ABILITIES } from "./creation_abilities"
import UNITS_BY_ID from "./units_by_id"
import UPGRADE_BY_ID from "./upgrade_by_id"
import { ITrainedBy } from "./interfaces"
import { sortBy, uniq, without, pull } from "lodash"

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
                    const morphes: { [resultingUnit: string]: string } = {
                        Baneling: "Zergling",
                        Ravager: "Roach",
                        Overseer: "Overlord",
                        LurkerMP: "Hydralisk",
                        BroodLord: "Corruptor",
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

                if (requiresTechlab) {
                    requires.push(trainingUnit.name + "TechLab")
                } else {
                    requires.push(trainingUnit.name)
                }

                // If it doesnt exist: create
                if (TRAINED_BY[resultingUnit.name] === undefined) {
                    TRAINED_BY[resultingUnit.name] = {
                        trainedBy: new Set([trainingUnit.name]),
                        requiresTechlab: requiresTechlab,
                        requiresUnit: requiresUnit,
                        requires: [requires],
                        isMorph: isMorph,
                        consumesUnit: consumesUnit,
                        requiredStructure: null,
                        requiredUpgrade: null,
                    }
                } else {
                    // Entry already exists, add training unit to object of 'trainedBy' and update requirement
                    TRAINED_BY[resultingUnit.name].trainedBy.add(trainingUnit.name)
                    TRAINED_BY[resultingUnit.name].requires[0].push(...requires)
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
const requirementPriority = ["Lair", "Corruptor", "GreaterSpire", "Hive"]
for (let itemName in TRAINED_BY) {
    const trainInfo = TRAINED_BY[itemName]

    trainInfo.requires = trainInfo.requires.map((requires) =>
        sortBy(
            without(uniq(requires), "Larva", "OverlordTransport"),
            (name) => -requirementPriority.indexOf(name)
        )
    )

    // Split Gateway and WarpGate requirements
    if (trainInfo.requires[0].indexOf("Gateway") >= 0) {
        const nonGatewayRequires: string[] = without(trainInfo.requires[0], "Gateway", "WarpGate")
        trainInfo.requires = [
            [...nonGatewayRequires, "Gateway"],
            ["WarpGate", ...nonGatewayRequires],
        ]
    }

    // Allow units produced by Barracks (same for Factory and Starport) to be produced by BarracksReactor and BarracksTechLab
    for (let structureType of ["Barracks", "Factory", "Starport"]) {
        pull(trainInfo.requires[0], structureType + "Flying")
        if (trainInfo.requires[0].indexOf(structureType) >= 0 && !trainInfo.requiredStructure) {
            const nonBarracksRequires: string[] = without(trainInfo.requires[0], structureType)
            trainInfo.requires = [
                [...nonBarracksRequires, structureType],
                [structureType + "Reactor", ...nonBarracksRequires],
                [structureType + "TechLab", ...nonBarracksRequires],
            ]
        }
    }
}
TRAINED_BY["Queen"].requires = [
    ["SpawningPool", "Hatchery"],
    ["SpawningPool", "Lair"],
    ["SpawningPool", "Hive"],
]
//TODO1 add in requires that if Lair is needed, Hive works as well
//TODO1 add the following
//         // Hardcoded fix for requirement of corruptor: spire (in case there is only a greater spire)
//         // And hatch requirement: spawning pool (but we have a lair or hive)
//         // And lair requirement: infestation pit (but we have hive)
//         // And CC requirement: ebay (but we have only orbitals)
//         // And Cybercore requirement: gateway (but we have only warpgates)
//         structure.name === requiredStructure ||
//         (requiredStructure === "Spire" && structure.name === "GreaterSpire") ||
//         (requiredStructure === "Hatchery" &&
//             ["Lair", "Hive"].includes(structure.name)) ||
//         (requiredStructure === "Lair" && structure.name === "Hive") ||
//         (requiredStructure === "CommandCenter" &&
//             ["PlanetaryFortress", "OrbitalCommand"].includes(structure.name)) ||
//         (requiredStructure === "Gateway" && structure.name === "WarpGate")
TRAINED_BY["SCV"].requires = [["CommandCenter"], ["PlanetaryFortress"], ["OrbitalCommand"]]
TRAINED_BY["Mothership"].requires = [["FleetBeacon", "Nexus"]]
TRAINED_BY["WarpGate"] = {
    consumesUnit: false,
    isMorph: false,
    requiredStructure: "Pylon",
    requiredUpgrade: null,
    requires: [["WarpGateResearch", "Gateway"]],
    requiresTechlab: false,
    requiresUnit: null,
    trainedBy: new Set("Probe"),
}
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
    Object.keys(TRAINED_BY).length === 116,
    `${Object.keys(TRAINED_BY).length} is not 116`
)

console.assert(
    TRAINED_BY["Zergling"].requiredStructure === "SpawningPool",
    `${TRAINED_BY["Zergling"].requiredStructure}`
)

export default TRAINED_BY
