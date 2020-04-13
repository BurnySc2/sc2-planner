import ENABLED_ABILITIES from "./enabled_abilities"
import data from "./data.json"
// const data = require("./data.json")

const CREATION_ABILITIES = {}

data.Ability.forEach((ability) => {
    // Train abilities, e.g. probe
    let train = ability.target.Train
    if (train !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(train)
        CREATION_ABILITIES[ability.id] = train.produces
        return
    }

    // Morph abilities, e.g. lurker
    let morph = ability.target.Morph
    if (morph !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(morph)
        CREATION_ABILITIES[ability.id] = morph.produces
        return
    }

    // Instant build abilities, e.g. reactor
    let build = ability.target.BuildInstant
    if (build !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(build)
        CREATION_ABILITIES[ability.id] = build.produces
        return
    }

    // Train place abilities, e.g. warp in stalker
    let trainPlace = ability.target.TrainPlace
    if (trainPlace !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(trainPlace)
        CREATION_ABILITIES[ability.id] = trainPlace.produces
        return
    }
    
    // Build abilities, e.g. build nexus
    let buildStructure = ability.target.Build
    if (buildStructure !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(buildStructure)
        CREATION_ABILITIES[ability.id] = buildStructure.produces
        return
    }

    // Build abilities, e.g. build refinery
    let buildGas = ability.target.BuildOnUnit
    if (buildGas !== undefined && ENABLED_ABILITIES[ability.id] === 1) {
        // console.log(buildStructure)
        CREATION_ABILITIES[ability.id] = buildGas.produces
        return
    }
});

// Returns object with keys as ability id and value as resulting unit id

// COMMANDCENTERTRAIN_SCV: SCV
// Exported:
// {524, 45}

export default CREATION_ABILITIES