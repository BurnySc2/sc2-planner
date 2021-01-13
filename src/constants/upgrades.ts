import ENABLED_UPGRADES from "./enabled_upgrades"
import data from "./data.json"
import { IDataUpgrade, IAllRaces } from "./interfaces"
import { iconSortUpgradeFunction } from "./icon_order"
// const data = require("./data.json")

// Maps ability id to upgrade id
const ABILITY_TO_UPGRADES: { [name: number]: number } = {}

data.Ability.forEach(
    // TODO Fix me
    // @ts-ignore
    (ability: { ability: number; id: number; target: { Research: { upgrade: number } } }) => {
        const target = ability.target
        if (typeof target !== "string") {
            const research = target.Research
            if (research) {
                ABILITY_TO_UPGRADES[ability.id] = research.upgrade
            }
        }
    }
)

// Maps upgrade_id to upgrade_data
const upgrade_data: { [name: number]: IDataUpgrade } = {}

data.Upgrade.forEach((upgrade) => {
    upgrade_data[upgrade.id] = upgrade
})

// Contains all race specific upgrades
const UPGRADES: Array<IDataUpgrade> = []

// Store all upgrade ids
const alreadyUsedIds = new Set()

data.Unit.forEach((unit) => {
    unit.abilities.forEach((ability, index) => {
        const upgrade_id = ABILITY_TO_UPGRADES[ability.ability]
        if (ENABLED_UPGRADES.has(upgrade_id) && !alreadyUsedIds.has(upgrade_id)) {
            alreadyUsedIds.add(upgrade_id)
            const upgrade = upgrade_data[upgrade_id]
            upgrade.race = unit.race.toLowerCase() as IAllRaces
            UPGRADES.push(upgrade)
        }
        return
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

// Should be enabled 90 upgrades
console.assert(Object.keys(UPGRADES).length === 90, `${Object.keys(UPGRADES).length} is not 90`)

// Returns object with keys as upgrade id and value is equal to 1 (int) if the upgrade is available from an ability
export { UPGRADES, UPGRADE_NAMES_BY_RACE }
