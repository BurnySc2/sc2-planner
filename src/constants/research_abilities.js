import ENABLED_ABILITIES from "./enabled_abilities"
import data from "./data.json"
// const data = require("./data.json")

const RESEARCH_ABILITIES = {}

data.Ability.forEach((ability) => {
    let research = ability.target.Research
    if (research !== undefined) {
        // console.log(research)
        RESEARCH_ABILITIES[ability.id] = research.upgrade
        return
    }
});

// Returns object with keys as ability id and value as resulting unit id

// COMMANDCENTERTRAIN_SCV: SCV
// Exported:
// {524, 45}

console.assert(Object.keys(RESEARCH_ABILITIES).length === 119, `${Object.keys(RESEARCH_ABILITIES).length} is not 119`)


export default RESEARCH_ABILITIES