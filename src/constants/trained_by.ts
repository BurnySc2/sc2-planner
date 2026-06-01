import { pull, sortBy, uniq, without } from "lodash"
import data from "./data.json"
import type { ITrainedBy } from "./interfaces"

const TRAINED_BY: ITrainedBy = {}

for (const [unit_name, unitInfo] of Object.entries(data.Units)) {
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

        const requires = [...(producedUnit.requires || [])]
        if (requiresTechlab) {
            requires.push(unit_name + "TechLab")
        } else {
            requires.push(unit_name)
        }
        
        // @ts-ignore
        const morphCostMinerals = producedUnit.CostResource?.Minerals??0  
        // @ts-ignore
        const morphCostGas = producedUnit.CostResource?.Vespene  ??0

        if (TRAINED_BY[producedUnitName] === undefined) {
            TRAINED_BY[producedUnitName] = {
                trainedBy: new Set([unit_name]),
                requiresTechlab,
                requiresUnits: null,
                requires: [requires],
                isMorph: false,
                morphCostMinerals,
                morphCostGas,
                morphCostSupply: producedUnit.Food ?? 0,
                consumesUnit: false,
                requiredStructure: (producedUnit.requires ?? []).length === 1 ? producedUnit.requires[0] : null,
                requiredUpgrade: null,
            }
        } else {
            TRAINED_BY[producedUnitName].trainedBy.add(unit_name)
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

        const requires = [...(builtUnit.requires || [])]
        if (requiresTechlab) {
            requires.push(unit_name + "TechLab")
        } else {
            requires.push(unit_name)
        }

        const consumesUnit = unit_name === "Drone"
        
        // @ts-ignore
        const morphCostMinerals = consumesUnit ?  (builtUnit.CostResource?.Minerals ?? 0) - (unitInfo.CostResource?.Minerals ?? 0) :builtUnit.CostResource?.Minerals??0  
        // @ts-ignore
        const morphCostGas = consumesUnit ?  (builtUnit.CostResource?.Vespene ?? 0)- (unitInfo.CostResource?.Vespene ?? 0)  :builtUnit.CostResource?.Vespene  ??0

        if (TRAINED_BY[builtUnitName] === undefined) {
            TRAINED_BY[builtUnitName] = {
                trainedBy: new Set([unit_name]),
                requiresTechlab,
                requiresUnits: null,
                requires: [requires],
                isMorph: false,
                morphCostMinerals,
                morphCostGas,
                morphCostSupply: builtUnit.Food ?? 0,
                consumesUnit,
                requiredStructure: null,
                requiredUpgrade: null,
            }
        } else {
            TRAINED_BY[builtUnitName].trainedBy.add(unit_name)
            TRAINED_BY[builtUnitName].requires[0].push(...requires)
        }
    })

    // Handle morphsto
    // @ts-expect-error
    if (unitInfo.morphsto) {
        // @ts-expect-error
        const morphTargets = Array.isArray(unitInfo.morphsto) ? unitInfo.morphsto : [unitInfo.morphsto]

        for (const resultingUnitName of morphTargets) {
            // @ts-expect-error
            const resultingUnit = data.Units[resultingUnitName]
            if (!resultingUnit || !resultingUnit.CostResource) {
                continue
            }

            const isFreeMorph =
                !resultingUnit.CostResource ||
                // @ts-expect-error
                (unitInfo.CostResource &&
                    // @ts-expect-error
                    resultingUnit.CostResource.Minerals === unitInfo.CostResource.Minerals &&
                    // @ts-expect-error
                    resultingUnit.CostResource.Vespene === unitInfo.CostResource.Vespene &&
                    resultingUnit.type === unitInfo.type)

            if (isFreeMorph) {
                continue
            }

            let morphCostMinerals =
                // @ts-expect-error
                (resultingUnit.CostResource?.Minerals ?? 0) - (unitInfo.CostResource?.Minerals ?? 0)
            // @ts-expect-error
            let morphCostGas = (resultingUnit.CostResource?.Vespene ?? 0) - (unitInfo.CostResource?.Vespene ?? 0)
            // @ts-expect-error
            let morphCostSupply = (resultingUnit.Food ?? 0) - (unitInfo.Food ?? 0)
            let consumesUnit = false

            if (resultingUnit.type !== "structure" && unitInfo.type !== "structure") {
                consumesUnit = true
                morphCostMinerals = resultingUnit.CostResource.Minerals
                morphCostGas = resultingUnit.CostResource.Vespene
                // @ts-ignore
                morphCostSupply = -(resultingUnit.Food ?? 0) 
            }

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
                    trainedBy: new Set([unit_name]),
                    requiresTechlab: false,
                    requiresUnits,
                    requires: [[unit_name]],
                    isMorph: true,
                    morphCostMinerals,
                    morphCostGas,
                    morphCostSupply,
                    consumesUnit,
                    requiredStructure: (resultingUnit.requires ?? []).length === 1 ? resultingUnit.requires[0] : null,
                    requiredUpgrade: null,
                }
            } else {
                TRAINED_BY[resultingUnitName].trainedBy.add(unit_name)
                TRAINED_BY[resultingUnitName].requires[0].push(unit_name)
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
            (name) => -requirementPriority.indexOf(name),
        ),
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
console.assert(Object.keys(TRAINED_BY).length === 112, `${Object.keys(TRAINED_BY).length} is not 112`)
console.assert(
    TRAINED_BY["Zergling"].requiredStructure === "SpawningPool",
    `${TRAINED_BY["Zergling"].requiredStructure}`,
)

export default TRAINED_BY
