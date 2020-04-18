import data from "./data.json"
// const data = require("./data.json")

const ENABLED_UPGRADES = {}

data.Ability.forEach((ability) => {
    let research = ability.target.Research
    if (research !== undefined) {
        // console.log(research)
        ENABLED_UPGRADES[research.upgrade] = 1
        return
    }
})

// Returns object with keys as upgrade id and value is equal to 1 (int) if the upgrade is available from an ability
export default ENABLED_UPGRADES
