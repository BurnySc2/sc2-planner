// npx tsx src/constants/upgrades.ts

import { convertUpgrade, type IRawUnit, type IRawUpgrade } from "./converters"
import data from "./data.json"
import { iconSortUpgradeFunction } from "./icon_order"
import type { IDataUpgrade } from "./interfaces"

// Contains all race specific upgrades
const UPGRADES: Array<IDataUpgrade> = []

// Mapping from raw Race short codes to IAllRaces
const RACE_MAP: Record<string, "terran" | "protoss" | "zerg"> = {
    Terr: "terran",
    Prot: "protoss",
    Zerg: "zerg",
}

;(Object.values(data.Units) as IRawUnit[]).forEach((unit) => {
    unit.researches?.forEach((upgradeName: string) => {
        const rawUpgrade = (data.Upgrades as unknown as Record<string, IRawUpgrade>)[upgradeName]
        if (rawUpgrade) {
            const converted = convertUpgrade(rawUpgrade)
            // Override race from the parent unit's Race field
            if (unit.Race && RACE_MAP[unit.Race]) {
                converted.race = RACE_MAP[unit.Race]
            }
            if (!UPGRADES.some((u) => u.name === upgradeName)){
            UPGRADES.push(converted)}
        }
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

console.assert(Object.keys(UPGRADES).length === 89, `${Object.keys(UPGRADES).length} is not 89`)

// Returns object with keys as upgrade id and value is equal to 1 (int) if the upgrade is available from an ability
export { UPGRADE_NAMES_BY_RACE, UPGRADES }
