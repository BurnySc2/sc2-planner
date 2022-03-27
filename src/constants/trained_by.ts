import { CREATION_ABILITIES, MORPH_ABILITIES } from "./creation_abilities"
import UNITS_BY_ID from "./units_by_id"
import UPGRADE_BY_ID from "./upgrade_by_id"
import { ITrainedBy } from "./interfaces"
import { sortBy, uniq, without, pull } from "lodash"

import data from "./data.json"

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
                let requiresUnits = null
                const requires = []
                let requiresTechlab = false
                let morphCostMinerals = 0
                let morphCostGas = 0
                let morphCostSupply = 0
                const isMorph = MORPH_ABILITIES.has(ability.ability)
                if (isMorph) {
                    const morphes: { [resultingUnit: string]: string[] } = {
                        Baneling: ["Zergling"],
                        Ravager: ["Roach"],
                        Overseer: ["Overlord"],
                        LurkerMP: ["Hydralisk"],
                        BroodLord: ["Corruptor"],
                        Archon: ["HighTemplar", "DarkTemplar"],
                    }
                    requiresUnits = morphes[resultingUnit.name]
                    morphCostMinerals = resultingUnit.minerals - trainingUnit.minerals
                    morphCostGas = resultingUnit.gas - trainingUnit.gas
                    morphCostSupply = resultingUnit.supply - trainingUnit.supply
                    if (morphes[resultingUnit.name]) {
                        requires.push(...morphes[resultingUnit.name])
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
                const consumesUnit =
                    resultingUnit.race === "Zerg" &&
                    resultingUnit.is_structure &&
                    !trainingUnit.is_structure
                if (consumesUnit) {
                    morphCostMinerals = resultingUnit.minerals - trainingUnit.minerals
                    morphCostGas = resultingUnit.gas - trainingUnit.gas
                    morphCostSupply = resultingUnit.supply
                }
                if (Array.isArray(ability.requirements)) {
                    for (const requirement of ability.requirements) {
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

                const requiredStructure =
                    requiredStructureId !== null ? UNITS_BY_ID[requiredStructureId].name : null
                if (requiredStructure) {
                    requires.push(requiredStructure)
                }
                const requiredUpgrade =
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
                        requiresTechlab,
                        requiresUnits,
                        requires: [requires],
                        isMorph,
                        morphCostMinerals,
                        morphCostGas,
                        morphCostSupply,
                        consumesUnit,
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

// Hardcoded fixes
for (const itemName in TRAINED_BY) {
    const trainInfo = TRAINED_BY[itemName]

    // Hardcoded fix for when Gateway is required and WarpGate would work
    if (trainInfo.requires[0].indexOf("Gateway") >= 0) {
        const nonGatewayRequires: string[] = without(trainInfo.requires[0], "Gateway", "WarpGate")
        trainInfo.requires = [
            [...nonGatewayRequires, "Gateway"],
            ["WarpGate", ...nonGatewayRequires],
        ]
    }

    // Hardcoded fix so allow units produced by Barracks (same for Factory and Starport) to be produced by BarracksReactor and BarracksTechLab
    for (const structureType of ["Barracks", "Factory", "Starport"]) {
        pull(trainInfo.requires[0], structureType + "Flying")
        if (
            trainInfo.requires[0].indexOf(structureType) >= 0 &&
            itemName.indexOf("Reactor") < 0 &&
            itemName.indexOf("TechLab") < 0
        ) {
            const nonBarracksRequires: string[] = without(trainInfo.requires[0], structureType)
            trainInfo.requires = [
                [...nonBarracksRequires, structureType],
                [structureType + "Reactor", ...nonBarracksRequires],
                [structureType + "TechLab", ...nonBarracksRequires],
            ]
        }
    }
}

// Hardcoded fix for Mothership requiring MothershipCore when it should be Nexus
TRAINED_BY["Mothership"].requires = [["FleetBeacon", "Nexus"]]
// Hardcoded fix for WarpGate being Absent
TRAINED_BY["WarpGate"] = {
    consumesUnit: false,
    isMorph: false,
    morphCostMinerals: 0,
    morphCostGas: 0,
    morphCostSupply: 0,
    requiredStructure: "Pylon",
    requiredUpgrade: null,
    requires: [["WarpGateResearch", "Gateway"]],
    requiresTechlab: false,
    requiresUnits: null,
    trainedBy: new Set("Probe"),
}

// Hardcoded fix for SCV requiring CommandCenter when OrbitalCommand and PlanetaryFortress could work as well
TRAINED_BY["SCV"].requires = [["CommandCenter"], ["PlanetaryFortress"], ["OrbitalCommand"]]
// Hardcoded fix for EngineeringBay requiring CommandCenter when OrbitalCommand and PlanetaryFortress could work as well
TRAINED_BY["EngineeringBay"].requires = [
    ["CommandCenter", "SCV"],
    ["OrbitalCommand", "SCV"],
    ["PlanetaryFortress", "SCV"],
]

// Hardcoded fix for Queen requiring Hatchery when Lair and Hive could work as well
TRAINED_BY["Queen"].requires = [
    ["Hatchery", "SpawningPool"],
    ["Lair", "SpawningPool"],
    ["Hive", "SpawningPool"],
]
// Hardcoded fix for SpawningPool requiring Hatchery when Lair and Hive could work as well
TRAINED_BY["SpawningPool"].requires = [
    ["Hatchery", "Drone"],
    ["Lair", "Drone"],
    ["Hive", "Drone"],
]
// Hardcoded fix for EvolutionChamber requiring Hatchery when Lair and Hive could work as well
TRAINED_BY["EvolutionChamber"].requires = [
    ["Hatchery", "Drone"],
    ["Lair", "Drone"],
    ["Hive", "Drone"],
]
// Hardcoded fix for LurkerDenMP
TRAINED_BY["LurkerDenMP"].requires = [
    ["HydraliskDen", "Lair", "Drone"],
    ["HydraliskDen", "Hive", "Drone"],
]
// Hardcoded fix for HydraliskDen
TRAINED_BY["HydraliskDen"].requires = [
    ["Lair", "Drone"],
    ["Hive", "Drone"],
]
// Hardcoded fix for Spire
TRAINED_BY["Spire"].requires = [
    ["Lair", "Drone"],
    ["Hive", "Drone"],
]
// Hardcoded fix for Spire
TRAINED_BY["InfestationPit"].requires = [
    ["Lair", "Drone"],
    ["Hive", "Drone"],
]
// Hardcoded fix for Ravager requiring Hatchery instead of RoachWarren
TRAINED_BY["Ravager"].requires = [["Roach", "RoachWarren"]]
// Hardcoded fix for when only GreaterSpire available
TRAINED_BY["Corruptor"].requires = [["Spire"], ["GreaterSpire"]]
// Reorder requirements to optimize build duration
const requirementPriority = ["Hive", "GreaterSpire", "Corruptor", "Lair"]
for (const itemName in TRAINED_BY) {
    const trainInfo = TRAINED_BY[itemName]

    trainInfo.requires = trainInfo.requires.map((requires) =>
        sortBy(
            without(uniq(requires), "Larva", "OverlordTransport"), // Hardcoded fix to remove requirements impossible to match from the bo
            (name) => -requirementPriority.indexOf(name)
        )
    )
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
