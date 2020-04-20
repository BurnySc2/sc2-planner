import data from "./data.json"
// const data = require("./data.json")

const ENABLED_UPGRADES: Set<number> = new Set()

data.Ability.forEach((ability) => {
    const target = ability.target
    if (typeof target !== "string") {
        let research = target.Research
        if (research !== undefined) {
            // console.log(research)
            ENABLED_UPGRADES.add(research.upgrade)
            return
        }
    }
})

// Returns object with keys as upgrade id and value is equal to 1 (int) if the upgrade is available from an ability
export default ENABLED_UPGRADES
