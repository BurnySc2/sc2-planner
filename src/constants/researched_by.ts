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

// Generic expansion for Zerg structure upgrade chains
// Anything requiring Spire -> also fulfilled by GreaterSpire
// Anything requiring Lair -> also fulfilled by Hive
for (const upgradeName in RESEARCHED_BY) {
    const info = RESEARCHED_BY[upgradeName]
    const newRequires: string[][] = []

    for (const reqSet of info.requires) {
        if (reqSet.includes("Lair")) {
            // Expand Lair -> Lair, Hive
            for (const structure of ["Lair", "Hive"]) {
                newRequires.push(reqSet.map((r) => (r === "Lair" ? structure : r)))
            }
        } else {
            newRequires.push(reqSet)
        }
    }

    info.requires = newRequires
}

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
