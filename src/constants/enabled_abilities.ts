import data from "./data.json"
// const data = require("./data.json")

let ENABLED_ABILITIES: Set<number> = new Set()
data.Unit.forEach((unit) => {
    unit.abilities.forEach((ability) => {
        ENABLED_ABILITIES.add(ability.ability)
        return
    })
})

// If an ability is enabled, it will be contained in ENABLED_ABILITIES
// E.g.: {4: 1}

export default ENABLED_ABILITIES
