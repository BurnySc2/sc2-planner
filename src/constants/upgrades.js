import ENABLED_UPGRADES from "./enabled_upgrades"
import data from "./data.json"
// const data = require("./data.json")

const UPGRADES = data.Upgrade.filter((item) => {
    return ENABLED_UPGRADES[item.id] === 1
})

// console.log(UPGRADES);

// Should be enabled 119 upgrades
console.assert(Object.keys(UPGRADES).length === 119, `${Object.keys(UPGRADES).length} is not 119`)

// Returns object with keys as upgrade id and value is equal to 1 (int) if the upgrade is available from an ability
export default UPGRADES