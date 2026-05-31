// npx tsx src/constants/researched_by.ts
import data from "./data.json"
import type { IResearchedBy } from "./interfaces"

const RESEARCHED_BY: IResearchedBy = {}

const allUpgrades = new Set(Object.keys(data.Upgrades))

for (const [_key, researcherUnit] of Object.entries(data.Units)) {
    if (researcherUnit.name === "TechLab") {
        continue
    }
    // @ts-expect-error
    researcherUnit.researches?.forEach(
        // TODO Fix me
        (resultingUpgrade: string) => {
            const researchedByInfo = RESEARCHED_BY[resultingUpgrade] ?? {
                requiredStructure: null,
                requiredUpgrade: null,
                requires: [],
                researchedBy: new Set(),
            }

            // @ts-expect-error
            const upgradeInfo = data.Upgrades[resultingUpgrade]
            upgradeInfo.requires.forEach((requirement: string) => {
                if (allUpgrades.has(requirement)) {
                    researchedByInfo.requiredUpgrade = requirement
                } else {
                    researchedByInfo.requiredStructure = requirement
                }
            })

            researchedByInfo.researchedBy.add(researcherUnit.name)
            if (upgradeInfo.requires && 0 < upgradeInfo.requires.length) {
                researchedByInfo.requires.push(upgradeInfo.requires)
            }

            if (researchedByInfo.researchedBy.size) {
                RESEARCHED_BY[resultingUpgrade] = researchedByInfo
            }
        },
    )
}

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

console.assert(Object.keys(RESEARCHED_BY).length === 89, `${Object.keys(RESEARCHED_BY).length} is not 89`)

export default RESEARCHED_BY
