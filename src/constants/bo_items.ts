import { IBuildOrderElement } from "./interfaces"
import { CUSTOMACTIONS } from "./customactions"
import { UNITS } from "./units"
import { STRUCTURES } from "./structures"
import { UPGRADES } from "./upgrades"

const BO_ITEMS: { [name: string]: IBuildOrderElement } = {}
for (const item of UNITS) {
    BO_ITEMS[item.name] = {
        name: item.name,
        type: ["SCV", "Probe", "Drone"].indexOf(item.name) >= 0 ? "worker" : "unit",
    }
}
for (const item of CUSTOMACTIONS) {
    BO_ITEMS[item.name] = {
        name: item.name,
        type: "action",
    }
}
for (const item of STRUCTURES) {
    BO_ITEMS[item.name] = {
        name: item.name,
        type: "structure",
    }
}
for (const item of UPGRADES) {
    BO_ITEMS[item.name] = {
        name: item.name,
        type: "upgrade",
    }
}

const workerNameByRace = {
    terran: "SCV",
    protoss: "Probe",
    zerg: "Drone",
}
const gasBuildingByRace = {
    terran: "Refinery",
    protoss: "Assimilator",
    zerg: "Extractor",
}

const supplyUnitNameByRace = {
    terran: {
        name: "SupplyDepot",
        type: "structure",
    },
    protoss: {
        name: "Pylon",
        type: "structure",
    },
    zerg: {
        name: "Overlord",
        type: "unit",
    },
}

console.assert(Object.keys(BO_ITEMS).length === 234, `${Object.keys(BO_ITEMS).length} is not 234`)

console.assert(BO_ITEMS["Zergling"].name === "Zergling", `${BO_ITEMS["Zergling"].name}`)
console.assert(BO_ITEMS["Zergling"].type === "unit", `${BO_ITEMS["Zergling"].type}`)
export { BO_ITEMS, workerNameByRace, gasBuildingByRace, supplyUnitNameByRace }
