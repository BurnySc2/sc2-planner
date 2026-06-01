// npx tsx src/constants/upgrades.ts
import data from "./data.json"
import { iconSortUpgradeFunction } from "./icon_order"
import type { IDataUpgrade } from "./interfaces"

// Contains all race specific upgrades
const UPGRADES: Array<IDataUpgrade> = []

Object.values(data.Units).forEach((unit) => {
    // @ts-expect-error
    unit.researches?.forEach((upgradeName: string) => {
        // @ts-expect-error
        const upgradeInfo = data.Upgrades[upgradeName]
        UPGRADES.push({
            name: upgradeName,
            id: upgradeInfo.id,
            cost: {
                minerals: upgradeInfo.minerals ?? 0,
                gas: upgradeInfo.gas ?? 0,
                time: upgradeInfo.time ?? 0,
            },
            // @ts-expect-error
            race: unit.Race,
        })
    })
})
UPGRADES.sort(iconSortUpgradeFunction)

const UPGRADE_NAMES_BY_RACE: {
    protoss: Set<string>
    terran: Set<string>
    zerg: Set<string>
} = {
    protoss: new Set(),
    terran: new Set(),
    zerg: new Set(),
}
UPGRADES.forEach((item) => {
    if (item.race === "terran") {
        UPGRADE_NAMES_BY_RACE.terran.add(item.name)
    }
    if (item.race === "protoss") {
        UPGRADE_NAMES_BY_RACE.protoss.add(item.name)
    }
    if (item.race === "zerg") {
        UPGRADE_NAMES_BY_RACE.zerg.add(item.name)
    }
})

// const sortFn = (a: IDataUpgrade, b: IDataUpgrade) => {
//     if (a.id < b.id) {
//         return -1
//     } else if (a.id > b.id) {
//         return 1
//     }
//     return 0
// }
// UPGRADES.all.sort(sortFn)
// UPGRADES.terran.sort(sortFn)
// UPGRADES.protoss.sort(sortFn)
// UPGRADES.zerg.sort(sortFn)

console.assert(Object.keys(UPGRADES).length === 99, `${Object.keys(UPGRADES).length} is not 99`)

// Returns object with keys as upgrade id and value is equal to 1 (int) if the upgrade is available from an ability
export { UPGRADE_NAMES_BY_RACE, UPGRADES }
