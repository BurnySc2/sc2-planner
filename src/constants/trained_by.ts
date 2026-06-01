// npx tsx src/constants/trained_by.ts
import { pull, sortBy, uniq, without } from "lodash"
import data from "./data.json"
import type { ITrainedBy } from "./interfaces"
import { STRUCTURES } from "./structures"
import { UNITS } from "./units"
import UNITS_BY_NAME from "./units_by_name"

const TRAINED_BY: ITrainedBy = {}

for (const myUnit of [...UNITS, ...STRUCTURES]) {
    const unitName = myUnit.name

    // @ts-expect-error
    const unitInfo = data.Units[unitName]

    // Handle produces
    // @ts-expect-error
    unitInfo.produces?.forEach((producedUnitName) => {
        // @ts-expect-error
        const producedUnit = data.Units[producedUnitName]
        if (!producedUnit) {
            return
        }

        let requiresTechlab = false
        if (producedUnit.requires) {
            for (const req of producedUnit.requires) {
                if (typeof req === "string" && req.includes("TechLab")) {
                    requiresTechlab = true
                    break
                }
            }
        }

        const requires = [...(producedUnit.requires || [])].filter((r) => typeof r !== "string" || !r.startsWith("Attached"))
        if (requiresTechlab) {
            requires.push(unitName + "TechLab")
        } else {
            requires.push(unitName)
        }

        const { minerals, vespene, food } = getProductionCost(unitName, producedUnitName, false)

        if (TRAINED_BY[producedUnitName] === undefined) {
            TRAINED_BY[producedUnitName] = {
                trainedBy: new Set([unitName]),
                requiresTechlab,
                requiresUnits: null,
                requires: [requires],
                isMorph: false,
                morphCostMinerals: minerals,
                morphCostGas: vespene,
                morphCostSupply: food,
                consumesUnit: false,
                requiredStructure: (producedUnit.requires ?? []).length === 1 ? producedUnit.requires[0] : null,
                requiredUpgrade: null,
            }
        } else {
            TRAINED_BY[producedUnitName].trainedBy.add(unitName)
            TRAINED_BY[producedUnitName].requires[0].push(...requires)
        }
    })

    // Handle builds (add-ons, structures)
    // @ts-expect-error
    unitInfo.builds?.forEach((builtUnitName) => {
        // @ts-expect-error
        const builtUnit = data.Units[builtUnitName]
        if (!builtUnit) {
            return
        }

        let requiresTechlab = false
        if (builtUnit.requires) {
            for (const req of builtUnit.requires) {
                if (typeof req === "string" && req.includes("TechLab")) {
                    requiresTechlab = true
                    break
                }
            }
        }

        const requires = [...(builtUnit.requires || [])].filter((r) => typeof r !== "string" || !r.startsWith("Attached"))
        if (requiresTechlab) {
            requires.push(unitName + "TechLab")
        } else {
            requires.push(unitName)
        }

        const consumesUnit = unitName === "Drone"
        const { minerals, vespene } = getProductionCost(unitName, builtUnitName, consumesUnit)

        if (TRAINED_BY[builtUnitName] === undefined) {
            TRAINED_BY[builtUnitName] = {
                trainedBy: new Set([unitName]),
                requiresTechlab,
                requiresUnits: null,
                requires: [requires],
                isMorph: false,
                morphCostMinerals: minerals,
                morphCostGas: vespene,
                morphCostSupply: builtUnit.Food,
                consumesUnit,
                requiredStructure: null,
                requiredUpgrade: null,
            }
        } else {
            TRAINED_BY[builtUnitName].trainedBy.add(unitName)
            TRAINED_BY[builtUnitName].requires[0].push(...requires)
        }
    })

    // Handle morphsto
    if (unitInfo.morphsto) {
        const morphTargets = Array.isArray(unitInfo.morphsto) ? unitInfo.morphsto : [unitInfo.morphsto]

        for (const resultingUnitName of morphTargets) {
            // @ts-expect-error
            const resultingUnit = data.Units[resultingUnitName]
            if (!resultingUnit || !resultingUnit.CostResource) {
                continue
            }

            const isFreeMorph =
                !resultingUnit.CostResource ||
                (unitInfo.CostResource &&
                    resultingUnit.CostResource.Minerals === unitInfo.CostResource.Minerals &&
                    resultingUnit.CostResource.Vespene === unitInfo.CostResource.Vespene &&
                    resultingUnit.type === unitInfo.type)

            if (isFreeMorph) {
                continue
            }

            const { minerals, vespene, food } = getProductionCost(unitName, resultingUnitName, true)

            // if (resultingUnit.type !== "structure" && unitInfo.type !== "structure") {
            //     consumesUnit = true
            //     morphCostMinerals = resultingUnit.CostResource.Minerals
            //     morphCostGas = resultingUnit.CostResource.Vespene
            //     // @ts-expect-error
            //     morphCostSupply = -(resultingUnit.Food ?? 0)
            // }

            const morphes: { [key: string]: string[] } = {
                Baneling: ["Zergling"],
                Ravager: ["Roach"],
                Overseer: ["Overlord"],
                LurkerMP: ["Hydralisk"],
                BroodLord: ["Corruptor"],
                Archon: ["HighTemplar", "DarkTemplar"],
            }
            const requiresUnits = morphes[resultingUnitName]

            if (TRAINED_BY[resultingUnitName] === undefined) {
                TRAINED_BY[resultingUnitName] = {
                    trainedBy: new Set([unitName]),
                    requiresTechlab: false,
                    requiresUnits,
                    requires: [[unitName, ...(resultingUnit.requires ?? [])]],
                    isMorph: true,
                    morphCostMinerals: minerals,
                    morphCostGas: vespene,
                    morphCostSupply: food,
                    consumesUnit: true,
                    requiredStructure: (resultingUnit.requires ?? []).length === 1 ? resultingUnit.requires[0] : null,
                    requiredUpgrade: null,
                }
            } else {
                TRAINED_BY[resultingUnitName].trainedBy.add(unitName)
                TRAINED_BY[resultingUnitName].requires[0].push(unitName)
            }
        }
    }
}

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

    // Hardcoded fix: also add WarpGate to trainedBy for all Gateway-produced units
    // (WarpGate is excluded from STRUCTURES via ignoreStructure so its produces array is never processed)
    if (trainInfo.trainedBy.has("Gateway")) {
        trainInfo.trainedBy.add("WarpGate")
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

// Hardcoded fix for Gateway and Forge requiring a Pylon first
TRAINED_BY["Gateway"].requires = [["Pylon"]]
TRAINED_BY["Forge"].requires = [["Pylon"]]
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
            (name) => -requirementPriority.indexOf(name),
        ),
    )
}

export function getProductionCost(
    producerUnitName: string,
    resultingUnitName: string,
    isMorph: boolean,
): { minerals: number; vespene: number; food: number } {
    // @ts-expect-error
    const producerUnit = data.Units[producerUnitName]
    // @ts-expect-error
    const resultingUnit = data.Units[resultingUnitName]

    const resultingMinerals = resultingUnit?.CostResource?.Minerals ?? 0
    const resultingVespene = resultingUnit?.CostResource?.Vespene ?? 0
    const resultingFood = resultingUnit?.Food ?? 0

    if (isMorph) {
        const producerMinerals = producerUnit?.CostResource?.Minerals ?? 0
        const producerVespene = producerUnit?.CostResource?.Vespene ?? 0
        const producerFood = producerUnit?.Food ?? 0
        return {
            minerals: resultingMinerals - producerMinerals,
            vespene: resultingVespene - producerVespene,
            food: resultingFood - producerFood,
        }
    }
    return { minerals: resultingMinerals, vespene: resultingVespene, food: resultingFood }
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

console.assert(Object.keys(TRAINED_BY).length === 111, `${Object.keys(TRAINED_BY).length} is not 111`)
console.assert(
    TRAINED_BY["Zergling"].requiredStructure === "SpawningPool",
    `${TRAINED_BY["Zergling"].requiredStructure}`,
)

export default TRAINED_BY
