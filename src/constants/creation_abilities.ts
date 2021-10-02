import ENABLED_ABILITIES from "./enabled_abilities"
import data from "./data.json"

const CREATION_ABILITIES: { [name: number]: number } = {}
const MORPH_ABILITIES = new Set()

data.Ability.forEach(
    // TODO Fix me
    // @ts-ignore
    (ability: {
        ability: number
        id: number
        target: {
            Train: { produces: number }
            Morph: { produces: number }
            BuildInstant: { produces: number }
            TrainPlace: { produces: number }
            Build: { produces: number }
            BuildOnUnit: { produces: number }
        }
    }) => {
        const target = ability.target
        if (typeof target !== "string") {
            // Train abilities, e.g. probe
            const train = target.Train
            if (train !== undefined && ENABLED_ABILITIES.has(ability.id)) {
                CREATION_ABILITIES[ability.id] = train.produces
                return
            }

            // Morph abilities, e.g. lurker
            const morph = target.Morph
            if (morph !== undefined && ENABLED_ABILITIES.has(ability.id)) {
                CREATION_ABILITIES[ability.id] = morph.produces
                MORPH_ABILITIES.add(ability.id)
                return
            }

            // Instant build abilities, e.g. reactor
            const build = ability.target.BuildInstant
            if (build !== undefined && ENABLED_ABILITIES.has(ability.id)) {
                CREATION_ABILITIES[ability.id] = build.produces
                return
            }

            // Train place abilities, e.g. warp in stalker
            const trainPlace = ability.target.TrainPlace
            if (trainPlace !== undefined && ENABLED_ABILITIES.has(ability.id)) {
                CREATION_ABILITIES[ability.id] = trainPlace.produces
                return
            }

            // Build abilities, e.g. build nexus
            const buildStructure = ability.target.Build
            if (buildStructure !== undefined && ENABLED_ABILITIES.has(ability.id)) {
                CREATION_ABILITIES[ability.id] = buildStructure.produces
                return
            }

            // Build abilities, e.g. build refinery
            const buildGas = ability.target.BuildOnUnit
            if (buildGas !== undefined && ENABLED_ABILITIES.has(ability.id)) {
                CREATION_ABILITIES[ability.id] = buildGas.produces
                return
            }
        }
    }
)

export { CREATION_ABILITIES, MORPH_ABILITIES }
