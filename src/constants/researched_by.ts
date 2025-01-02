import RESEARCH_ABILITIES from "./research_abilities"
import UNITS_BY_ID from "./units_by_id"
import UPGRADE_BY_ID from "./upgrade_by_id"
import data from "./data.json"
import { IResearchedBy } from "./interfaces"

const RESEARCHED_BY: IResearchedBy = {}
data.Unit.forEach((researcherUnit) => {
    if (researcherUnit.name === "TechLab") {
        return
    }
    researcherUnit.abilities.forEach(
        // TODO Fix me
        // @ts-ignore
        (ability: {
            ability: number
            requirements: Array<{ upgrade: number; building: number }>
        }) => {
            const resultingUpgradeId = RESEARCH_ABILITIES[ability.ability]
            const resultingUpgrade = UPGRADE_BY_ID[resultingUpgradeId]
            const requires: string[] = []
            if (resultingUpgrade !== undefined) {
                let requiredStructureId = null
                let requiredUpgradeId = null
                if (ability.requirements && Array.isArray(ability.requirements)) {
                    for (const requirement of ability.requirements) {
                        if (requirement.upgrade) {
                            requiredUpgradeId = requirement.upgrade
                        }
                        if (requirement.building) {
                            requiredStructureId = requirement.building
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

                // If it doesnt exist: create
                if (!RESEARCHED_BY[resultingUpgrade.name]) {
                    RESEARCHED_BY[resultingUpgrade.name] = {
                        researchedBy: new Set([researcherUnit.name]),
                        requiredStructure: requiredStructure,
                        requiredUpgrade: requiredUpgrade,
                        requires: [[...requires, researcherUnit.name]],
                    }
                } else {
                    // Entry already exists, add training unit to object of 'researchedBy'
                    RESEARCHED_BY[resultingUpgrade.name].researchedBy.add(researcherUnit.name)
                }
            }
        }
    )
})

RESEARCHED_BY["ZergFlyerWeaponsLevel1"].requires = [["Spire"], ["GreaterSpire"]]
RESEARCHED_BY["ZergFlyerWeaponsLevel2"].requires = [
    ["Spire", "Lair"],
    ["Spire", "Hive"],
    ["GreaterSpire", "Lair"],
    ["GreaterSpire", "Hive"],
]
RESEARCHED_BY["ZergFlyerWeaponsLevel3"].requires = [
    ["Spire", "Hive"],
    ["GreaterSpire", "Hive"],
]

RESEARCHED_BY["ZergMeleeWeaponsLevel2"].requires = [
    ["ZergMeleeWeaponsLevel1", "Lair"],
    ["ZergMeleeWeaponsLevel1", "Hive"],
]

/**
{OverlordSpeed:
    requiredStructure: null,
    requiredUpgrade: null,
    researchedBy: { Hatchery: 1, Lair: 1, Hive: 1 }
}

{ProtossAir2:
    requiredStructure: FleetBeacon,
    requiredUpgrade: ProtossAir1,
    researchedBy: { CyberneticsCore: 1 }
}
 */

console.assert(
    Object.keys(RESEARCHED_BY).length === 88,
    `${Object.keys(RESEARCHED_BY).length} is not 88`
)

export default RESEARCHED_BY
