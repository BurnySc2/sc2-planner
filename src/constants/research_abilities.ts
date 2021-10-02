import data from "./data.json"

const RESEARCH_ABILITIES: { [name: number]: number } = {}

data.Ability.forEach((ability) => {
    const target = ability.target
    if (typeof target !== "string") {
        const research = target.Research
        if (research !== undefined) {
            RESEARCH_ABILITIES[ability.id] = research.upgrade
            return
        }
    }
})

// Returns object with keys as ability id and value as resulting unit id

// COMMANDCENTERTRAIN_SCV: SCV
// Exported:
// {524, 45}

console.assert(
    Object.keys(RESEARCH_ABILITIES).length === 120,
    `${Object.keys(RESEARCH_ABILITIES).length} is not 120`
)

export default RESEARCH_ABILITIES
