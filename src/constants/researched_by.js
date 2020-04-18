import RESEARCH_ABILITIES from "./research_abilities"
import UNITS_BY_ID from "./units_by_id"
import UPGRADE_BY_ID from "./upgrade_by_id"
import data from "./data.json"

const RESEARCHED_BY = {}
data.Unit.forEach((researcherUnit) => {
    if ( researcherUnit.name === "TechLab") {
        return
    }
    researcherUnit.abilities.forEach((ability) => {
        const resultingUpgradeId = RESEARCH_ABILITIES[ability.ability]
        const resultingUpgrade = UPGRADE_BY_ID[resultingUpgradeId]
        if (resultingUpgrade !== undefined) {
            let requiredStructure = null
            let requiredUpgrade = null
            if (Array.isArray(ability.requirements)) {
                for (let requirement of ability.requirements) {
                    if (requirement.upgrade) {
                        requiredUpgrade = requirement.upgrade
                    }
                    if (requirement.building) {
                        requiredStructure = requirement.building
                    }
                }
            }
            // If it doesnt exist: create
            if (RESEARCHED_BY[resultingUpgrade.name] === undefined) {
                RESEARCHED_BY[resultingUpgrade.name] = {
                    researchedBy: { [researcherUnit.name]: 1 },
                    requiredStructure:
                        requiredStructure !== null
                            ? UNITS_BY_ID[requiredStructure].name
                            : null,
                    requiredUpgrade:
                        requiredUpgrade !== null
                            ? UPGRADE_BY_ID[requiredUpgrade].name
                            : null,
                }
            } else {
                // Entry already exists, add training unit to object of 'researchedBy'
                RESEARCHED_BY[resultingUpgrade.name].researchedBy[
                    researcherUnit.name
                ] = 1
            }
        }
    })
})

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

// console.log(RESEARCHED_BY);

console.assert(
    Object.keys(RESEARCHED_BY).length === 89,
    `${Object.keys(RESEARCHED_BY).length} is not 89`
)

export default RESEARCHED_BY
