import ENABLED_UPGRADES from "./enabled_upgrades"
import data from "./data.json"
// const data = require("./data.json")

// Maps ability id to upgrade id
const ABILITY_TO_UPGRADES = {}

data.Ability.forEach((ability) => {
    // console.log(unit)
    const research = ability.target.Research
    if (research !== undefined) {
        ABILITY_TO_UPGRADES[ability.id] = research.upgrade
    }
})

// Maps upgrade_id to upgrade_data
const upgrade_data = {}

data.Upgrade.forEach((upgrade) => {
    upgrade_data[upgrade.id] = upgrade
})

// Contains all race specific upgrades
const UPGRADES = {
    all: [],
    protoss: [],
    terran: [],
    zerg: [],
}

// Store all upgrade ids
const alreadyUsedIds = {}

data.Unit.forEach((unit) => {
    // console.log(unit)
    unit.abilities.forEach((ability, index) => {
        // console.log(ability)
        const upgrade_id = ABILITY_TO_UPGRADES[ability.ability]
        if (
            ENABLED_UPGRADES[upgrade_id] === 1 &&
            alreadyUsedIds[upgrade_id] !== 1
        ) {
            alreadyUsedIds[upgrade_id] = 1
            // console.log(upgrade_id);
            const upgrade = upgrade_data[upgrade_id]
            // console.log(upgrade);
            // console.log(index);
            UPGRADES.all.push(upgrade)
            UPGRADES[unit.race.toLowerCase()].push(upgrade)
        }
        return
    })
})
// console.log(UPGRADES);

const sortFn = (a, b) => {
    if (a.id < b.id) {
        return -1
    } else if (a.id > b.id) {
        return 1
    }
    return 0
}
UPGRADES.all.sort(sortFn)
UPGRADES.terran.sort(sortFn)
UPGRADES.protoss.sort(sortFn)
UPGRADES.zerg.sort(sortFn)

// Should be enabled 90 upgrades
console.assert(
    Object.keys(UPGRADES.all).length === 90,
    `${Object.keys(UPGRADES.all).length} is not 90`
)

// Returns object with keys as upgrade id and value is equal to 1 (int) if the upgrade is available from an ability
export default UPGRADES
