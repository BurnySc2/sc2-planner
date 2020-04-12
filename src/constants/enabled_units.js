import ENABLED_ABILITIES from "./enabled_abilities"
import data from "./data.json"
// const data = require("./data.json")

const ENABLED_UNITS = {}

data.Ability.forEach((ability) => {
    // Train abilities, e.g. probe
    let train = ability.target.Train
    if (train !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(train)
        ENABLED_UNITS[train.produces] = 1
        return
    }

    // Morph abilities, e.g. lurker
    let morph = ability.target.Morph
    if (morph !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(morph)
        ENABLED_UNITS[morph.produces] = 1
        return
    }

    // Instant build abilities, e.g. reactor
    let build = ability.target.BuildInstant
    if (build !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(build)
        ENABLED_UNITS[build.produces] = 1
        return
    }

    // Train place abilities, e.g. warp in stalker
    let trainPlace = ability.target.TrainPlace
    if (trainPlace !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(trainPlace)
        ENABLED_UNITS[trainPlace.produces] = 1
        return
    }
    
    // Build abilities, e.g. build nexus
    let buildStructure = ability.target.Build
    if (buildStructure !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(buildStructure)
        ENABLED_UNITS[buildStructure.produces] = 1
        return
    }
    
    // Build abilities, e.g. build refinery
    let buildGas = ability.target.BuildOnUnit
    if (buildGas !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(buildStructure)
        ENABLED_UNITS[buildGas.produces] = 1
        return
    }
});

// Returns object with keys as upgrade id and value is equal to 1 (int) if the unit is available from an ability
export default ENABLED_UNITS