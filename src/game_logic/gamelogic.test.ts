import { GameLogic } from "./gamelogic"

test("Get the train time of SCV", () => {
    const logic = new GameLogic("terran")
    expect(logic.getTime("SCV")).toBe(272)
})

test("Get the train cost of SCV", () => {
    const logic = new GameLogic("terran")
    expect(logic.getCost("SCV").minerals).toBe(50)
    expect(logic.getCost("SCV").vespene).toBe(0)
    expect(logic.getCost("SCV").supply).toBe(1)
})

test("Get the train cost of Depot", () => {
    const logic = new GameLogic("terran")
    expect(logic.getCost("SupplyDepot").minerals).toBe(100)
    expect(logic.getCost("SupplyDepot").vespene).toBe(0)
    expect(logic.getCost("SupplyDepot").supply).toBe(-8)
})

test("Build an SCV", () => {
    // Test if building one worker works
    const bo = [{ name: "SCV", type: "worker" }]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
})

test("Build two SCVs", () => {
    // Test if building two workers works
    const bo = [
        { name: "SCV", type: "worker" },
        { name: "SCV", type: "worker" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(15)
    expect(logic.eventLog.length).toBe(2)
})

test("Build depot", () => {
    // Test if building a structure works
    const bo = [{ name: "SupplyDepot", type: "structure" }]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
})

test("Build SCV then depot", () => {
    const bo = [
        { name: "SCV", type: "worker" },
        { name: "SupplyDepot", type: "structure" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(15)
    expect(logic.supplyCap).toBe(23)
    expect(logic.eventLog.length).toBe(2)
})

test("Build 4 SCVs", () => {
    // Test to see if supply block matters
    const bo = []
    for (let i = 0; i < 4; i++) {
        bo.push({ name: "SCV", type: "worker" })
    }
    expect(bo.length).toBe(4)
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    // Should be 17 but since we get supply blocked, only get up to 16 units max (15 workers + 1 cc)
    expect(logic.units.size).toBe(16)
    expect(logic.eventLog.length).toBe(3)
})

test("Build 3 SCVs then depot then one more SCV", () => {
    const bo = []
    for (let i = 0; i < 3; i++) {
        bo.push({ name: "SCV", type: "worker" })
    }
    bo.push({ name: "SupplyDepot", type: "structure" })
    bo.push({ name: "SCV", type: "worker" })

    expect(bo.length).toBe(5)
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    // Should be 17 but since we get supply blocked, only get up to 16 units max (15 workers + 1 cc)
    expect(logic.supplyCap).toBe(23)
    expect(logic.units.size).toBe(18)
    expect(logic.eventLog.length).toBe(5)
})

test("Build commandcenter", () => {
    // Test command center - idleLimit cannot be set too low by default
    const bo = [{ name: "CommandCenter", type: "structure" }]
    const logic = new GameLogic("terran", bo)
    logic.settings.idleLimit = 50
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
})

test("Build refinery", () => {
    // Test refinery
    const bo = [{ name: "Refinery", type: "structure" }]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
})

test("Build 2 drones, 1 overlord, 4 drones", () => {
    // Test zerg mechanics
    const bo = [
        { name: "Drone", type: "worker" },
        { name: "Drone", type: "worker" },
        { name: "Overlord", type: "unit" },
        { name: "Drone", type: "worker" },
        { name: "Drone", type: "worker" },
        { name: "Drone", type: "worker" },
        { name: "Drone", type: "worker" },
    ]
    const logic = new GameLogic("zerg", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(21)
    expect(logic.eventLog.length).toBe(7)
    expect(logic.supplyCap).toBe(22)
})

test("Build OC and call down MULE", () => {
    // Morph CC to OC, then call down a mule
    const bo = [
        { name: "SupplyDepot", type: "structure" },
        { name: "Barracks", type: "structure" },
        { name: "OrbitalCommand", type: "structure" },
        { name: "call_down_mule", type: "action" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(16)
    expect(logic.eventLog.length).toBe(4)
})

test("Test if able to create a gas unit (reaper)", () => {
    // Morph CC to OC, then call down a mule
    const bo = [
        { name: "SupplyDepot", type: "structure" },
        { name: "Barracks", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "Reaper", type: "unit" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(17)
    expect(logic.eventLog.length).toBe(5)
})

test("Test if able to research +1 from ebay", () => {
    // Morph CC to OC, then call down a mule
    const bo = [
        { name: "SupplyDepot", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "EngineeringBay", type: "structure" },
        { name: "TerranInfantryWeaponsLevel1", type: "upgrade" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(16)
    expect(logic.upgrades.has("TerranInfantryWeaponsLevel1")).toBe(true)
    expect(logic.eventLog.length).toBe(5)
})

test("Test if able to research +2 from ebay after requirements are met", () => {
    // Morph CC to OC, then call down a mule
    const bo = [
        { name: "SupplyDepot", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "3worker_to_gas", type: "action" },
        { name: "Barracks", type: "structure" },
        { name: "Factory", type: "structure" },
        { name: "EngineeringBay", type: "structure" },
        { name: "EngineeringBay", type: "structure" },
        { name: "TerranInfantryWeaponsLevel1", type: "upgrade" },
        { name: "Armory", type: "structure" },
        { name: "TerranInfantryWeaponsLevel2", type: "upgrade" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.upgrades.has("TerranInfantryWeaponsLevel1")).toBe(true)
    expect(logic.upgrades.has("TerranInfantryWeaponsLevel2")).toBe(true)
    expect(logic.units.size).toBe(21)
    expect(logic.eventLog.length).toBe(12)
})

test("Test if able upgrade to PF", () => {
    // Morph CC to OC, then call down a mule
    const bo = [
        { name: "SupplyDepot", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "EngineeringBay", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "3worker_to_gas", type: "action" },
        { name: "PlanetaryFortress", type: "structure" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    let pfCount = 0
    logic.units.forEach((unit) => {
        if (unit.name === "PlanetaryFortress") {
            pfCount += 1
        }
    })
    expect(pfCount).toBe(1)
    expect(logic.units.size).toBe(17)
    expect(logic.eventLog.length).toBe(7)
})

test("Test if able lift Barracks from reactor and let factory attach to it", () => {
    // Morph CC to OC, then call down a mule
    const bo = [
        { name: "SupplyDepot", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "Barracks", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "BarracksReactor", type: "structure" },
        { name: "Factory", type: "structure" },
        { name: "dettach_barracks_from_reactor", type: "action" },
        { name: "attach_factory_to_free_reactor", type: "action" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()

    let nakedBarracksCount = 0
    logic.units.forEach((unit) => {
        if (unit.name === "Barracks" && unit.hasReactor) {
            nakedBarracksCount += 1
        }
    })
    expect(nakedBarracksCount).toBe(0)

    expect(logic.freeReactors).toBe(0)

    let factoryReactorCount = 0
    logic.units.forEach((unit) => {
        if (unit.name === "Factory" && unit.hasReactor) {
            factoryReactorCount += 1
        }
    })
    expect(factoryReactorCount).toBe(1)

    expect(logic.units.size).toBe(17)
    expect(logic.eventLog.length).toBe(8)
})
