import ENABLED_ABILITIES from "./enabled_abilities"
import data from "./data.json"

const ENABLED_UNITS: Set<number> = new Set()

data.Ability.forEach((ability) => {
    const target = ability.target
    if (typeof target !== "string") {
        // Train abilities, e.g. probe
        let train: { produces: number } | undefined = target.Train
        if (train && ENABLED_ABILITIES.has(ability.id)) {
            ENABLED_UNITS.add(train.produces)
            return
        }

        // Morph abilities, e.g. lurker
        let morph = target.Morph
        if (morph !== undefined && ENABLED_ABILITIES.has(ability.id)) {
            ENABLED_UNITS.add(morph.produces)
            return
        }

        // Instant build abilities, e.g. reactor
        let build = target.BuildInstant
        if (build !== undefined && ENABLED_ABILITIES.has(ability.id)) {
            ENABLED_UNITS.add(build.produces)
            return
        }

        // Train place abilities, e.g. warp in stalker
        let trainPlace = target.TrainPlace
        if (trainPlace !== undefined && ENABLED_ABILITIES.has(ability.id)) {
            ENABLED_UNITS.add(trainPlace.produces)
            return
        }

        // Build abilities, e.g. build nexus
        let buildStructure = target.Build
        if (buildStructure !== undefined && ENABLED_ABILITIES.has(ability.id)) {
            ENABLED_UNITS.add(buildStructure.produces)
            return
        }

        // Build abilities, e.g. build refinery
        let buildGas = target.BuildOnUnit
        if (buildGas !== undefined && ENABLED_ABILITIES.has(ability.id)) {
            ENABLED_UNITS.add(buildGas.produces)
            return
        }
    }
})

// Returns object with keys as upgrade id and value is equal to 1 (int) if the unit is available from an ability
export default ENABLED_UNITS
