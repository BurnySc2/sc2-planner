import data from "./data.json"
// const data = require("./data.json")

let ENABLED_ABILITIES = {}
data.Unit.forEach((unit) => {
    // console.log(unit)
    unit.abilities.forEach((ability) => {
        // console.log(ability)
        ENABLED_ABILITIES[ability.ability] = 1
        return
    })
})

// console.log(Object.keys(ENABLED_ABILITIES).length)
// console.log(ENABLED_ABILITIES)

// If an ability is enabled, it will be contained in ENABLED_ABILITIES
// E.g.: {4: 1}

export default ENABLED_ABILITIES
