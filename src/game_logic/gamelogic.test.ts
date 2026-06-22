import type { IBuildOrderElement } from "../constants/interfaces"
import { GameLogic } from "./gamelogic"

test("Get the train time of SCV", () => {
    const logic = new GameLogic("terran")
    expect(logic.getTime("SCV")).toBe(272)
})

test("Get the train cost of SCV", () => {
    expect(GameLogic.getCost("SCV").minerals).toBe(50)
    expect(GameLogic.getCost("SCV").vespene).toBe(0)
    expect(GameLogic.getCost("SCV").supply).toBe(1)
})

test("Get the train cost of Depot", () => {
    expect(GameLogic.getCost("SupplyDepot").minerals).toBe(100)
    expect(GameLogic.getCost("SupplyDepot").vespene).toBe(0)
    expect(GameLogic.getCost("SupplyDepot").supply).toBe(-8)
})

test("Get the train cost of Hatchery", () => {
    expect(GameLogic.getCost("Hatchery").minerals).toBe(300)
    expect(GameLogic.getCost("Hatchery").vespene).toBe(0)
    expect(GameLogic.getCost("Hatchery").supply).toBe(-4)
})

test("Get the train cost of Lair", () => {
    expect(GameLogic.getCost("Lair").minerals).toBe(150)
    expect(GameLogic.getCost("Lair").vespene).toBe(100)
    expect(GameLogic.getCost("Lair").supply).toBe(0)
})

test("Get the train cost of OrbitalCommand", () => {
    expect(GameLogic.getCost("OrbitalCommand").minerals).toBe(150)
    expect(GameLogic.getCost("OrbitalCommand").vespene).toBe(0)
    expect(GameLogic.getCost("OrbitalCommand").supply).toBe(0)
})

test("Get the train cost of Ravager", () => {
    expect(GameLogic.getCost("Ravager").minerals).toBe(25)
    expect(GameLogic.getCost("Ravager").vespene).toBe(75)
    expect(GameLogic.getCost("Ravager").supply).toBe(1)
})

test("Build an SCV", () => {
    // Test if building one worker works
    const bo: IBuildOrderElement[] = [{ name: "SCV", type: "worker" }]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
})

test("Build two SCVs", () => {
    // Test if building two workers works
    const bo: IBuildOrderElement[] = [
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
    const bo: IBuildOrderElement[] = [{ name: "SupplyDepot", type: "structure" }]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
})

test("Build SCV then depot", () => {
    const bo: IBuildOrderElement[] = [
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
    const bo: IBuildOrderElement[] = []
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
    const bo: IBuildOrderElement[] = []
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
    const bo: IBuildOrderElement[] = [{ name: "CommandCenter", type: "structure" }]
    const logic = new GameLogic("terran", bo)
    logic.settings.idleLimit = 50
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
})

test("Build refinery", () => {
    // Test refinery
    const bo: IBuildOrderElement[] = [{ name: "Refinery", type: "structure" }]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
})

test("Check duplicate upgrade prevention", () => {
    const name = "Stimpack"
    const bo: IBuildOrderElement[] = [
        { name: "CommandCenter", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "SupplyDepot", type: "structure" },
        { name: "Barracks", type: "structure" },
        { name: "BarracksTechLab", type: "structure" },
        { name, type: "upgrade" },
    ]
    const logic = new GameLogic("terran", bo)
    const [newLogic] = GameLogic.addItemToBO(logic, { name, type: "upgrade" }, bo.length + 1)
    expect(newLogic.upgrades.size).toBe(1)
})

test("Build 2 drones, 1 overlord, 4 drones", () => {
    // Test zerg mechanics
    const bo: IBuildOrderElement[] = [
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

test("Test spore requirements", () => {
    const bo: IBuildOrderElement[] = [
        { name: "SpawningPool", type: "structure" },
        { name: "SporeCrawler", type: "structure" },
    ]
    const logic = new GameLogic("zerg", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(2)
    expect(logic.supplyCap).toBe(14)
})

test("Build OC and call down MULE", () => {
    // Morph CC to OC, then call down a mule
    const bo: IBuildOrderElement[] = [
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
    const bo: IBuildOrderElement[] = [
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
    const bo: IBuildOrderElement[] = [
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
    const bo: IBuildOrderElement[] = [
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
    const bo: IBuildOrderElement[] = [
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
    const bo: IBuildOrderElement[] = [
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

test("Add Battlecruiser with required tech", () => {
    const prevLogic = new GameLogic("terran", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "Battlecruiser", type: "unit" }, 0)

    expect(insertedItems).toBe(9)
    expect(logic.units.size).toBe(20)
    expect(logic.eventLog.length).toBe(9)
    expect(logic.supplyCap).toBe(23)
})

test("Add BroodLord with required tech", () => {
    const prevLogic = new GameLogic("zerg", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "BroodLord", type: "unit" }, 0)

    expect(insertedItems).toBe(10)
    expect(logic.units.size).toBe(15)
    expect(logic.eventLog.length).toBe(10)
    expect(logic.supplyCap).toBe(14)
})

test("Add ZergFlyerWeaponsLevel3 with required tech", () => {
    const prevLogic = new GameLogic("zerg", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(
        prevLogic,
        { name: "ZergFlyerWeaponsLevel3", type: "upgrade" },
        0,
    )
    // This should not insert GreaterSpire as it is not required

    expect(logic.upgrades.has("ZergFlyerWeaponsLevel1")).toBe(true)
    expect(logic.upgrades.has("ZergFlyerWeaponsLevel2")).toBe(true)
    expect(logic.upgrades.has("ZergFlyerWeaponsLevel3")).toBe(true)
    expect(insertedItems).toBe(10)
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(10)
    expect(logic.supplyCap).toBe(14)
})

test("Add two Archons with required tech", () => {
    const prevLogic = new GameLogic("protoss", [])
    let [logic, insertedItems] = GameLogic.addItemToBO(
        prevLogic,
        { name: "morph_archon_from_ht_ht", type: "action" },
        0,
    )

    expect(insertedItems).toBe(11)
    expect(logic.units.size).toBe(21)
    expect(logic.eventLog.length).toBe(11)
    expect(logic.supplyCap).toBe(31)
    ;[logic, insertedItems] = GameLogic.addItemToBO(
        logic,
        { name: "morph_archon_from_ht_ht", type: "action" },
        insertedItems,
    )

    expect(insertedItems).toBe(3)
    expect(logic.units.size).toBe(22)
    expect(logic.eventLog.length).toBe(14)
    expect(logic.supplyCap).toBe(31)
})

test("Add ProtossGroundWeaponsLevel1 with required tech", () => {
    const prevLogic = new GameLogic("protoss", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(
        prevLogic,
        { name: "ProtossGroundWeaponsLevel1", type: "upgrade" },
        0,
    )

    expect(insertedItems).toBe(5) // Pylon, Forge, Assimilator, 3worker_to_gas, PGW1
    expect(logic.units.size).toBe(16) // Nexus(1) + 12 Probes + Pylon + Forge + Assimilator = 16
    expect(logic.eventLog.length).toBe(5)
    expect(logic.supplyCap).toBe(23) // Nexus(15) + Pylon(8) = 23
    expect(logic.upgrades.has("ProtossGroundWeaponsLevel1")).toBe(true)
})

test("Add Gateway with required tech", () => {
    const prevLogic = new GameLogic("protoss", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "Gateway", type: "structure" }, 0)

    expect(insertedItems).toBe(2) // Pylon, Gateway
    expect(logic.units.size).toBe(15) // Nexus(1) + 12 Probes + Pylon + Gateway = 15
    expect(logic.eventLog.length).toBe(2)
    expect(logic.supplyCap).toBe(23) // Nexus(15) + Pylon(8) = 23
})

test("Add Zealot with required tech", () => {
    const prevLogic = new GameLogic("protoss", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "Zealot", type: "unit" }, 0)

    expect(insertedItems).toBe(3) // Pylon, Gateway, Zealot
    expect(logic.units.size).toBe(16) // Nexus(1) + 12 Probes + Pylon + Gateway + Zealot
    expect(logic.eventLog.length).toBe(3) // Pylon built, Gateway built, Zealot trained
    expect(logic.supplyCap).toBe(23) // Nexus(15) + Pylon(8) = 23
})

test("Add Zealot via WarpGate path", () => {
    const prevLogic = new GameLogic("protoss", [])
    let [logic, insertedItems] = GameLogic.addItemToBO(
        prevLogic,
        { name: "convert_gateway_to_warpgate", type: "action" },
        0,
    )

    expect(insertedItems).toBe(7) // Pylon, Gateway, CyberneticsCore, WarpGateResearch, convert
    expect(logic.units.size).toBe(17) // Nexus(1) + 12 Probes + Pylon + WarpGate + CyberneticsCore
    expect(logic.eventLog.length).toBe(7) // Pylon, Gateway, CyberneticsCore, WarpGateResearch (no event for morph)
    expect(logic.supplyCap).toBe(23)
    expect(logic.upgrades.has("WarpGateResearch")).toBe(true)
    ;[logic, insertedItems] = GameLogic.addItemToBO(logic, { name: "Zealot", type: "unit" }, insertedItems)

    expect(insertedItems).toBe(1) // Just Zealot (WarpGate already exists)
    expect(logic.units.size).toBe(18) // +1 Zealot
    expect(logic.eventLog.length).toBe(8) // +1 Zealot train event
    expect(logic.supplyCap).toBe(23)

    // Verify Zealot was produced by WarpGate, not Gateway
    let zealotCount = 0
    let warpgateCount = 0
    let gatewayCount = 0
    logic.units.forEach((unit) => {
        if (unit.name === "Zealot") {
            zealotCount++
        }
        if (unit.name === "WarpGate") {
            warpgateCount++
        }
        if (unit.name === "Gateway") {
            gatewayCount++
        }
    })
    expect(zealotCount).toBe(1)
    expect(warpgateCount).toBe(1)
    expect(gatewayCount).toBe(0) // Gateway was morphed to WarpGate
})

test("Add LurkerMP with required tech", () => {
    const prevLogic = new GameLogic("zerg", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "LurkerMP", type: "unit" }, 0)

    expect(insertedItems).toBe(8)
    expect(logic.units.size).toBe(15)
    expect(logic.eventLog.length).toBe(8)
    expect(logic.supplyCap).toBe(14)
})

test("Add GreaterSpire, UltraliskCavern, and Corruptor", () => {
    const prevLogic = new GameLogic("zerg", [])

    // Add GreaterSpire (requires Spire -> Lair -> Hatchery + SpawningPool)
    let [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "GreaterSpire", type: "structure" }, 0)

    // Add UltraliskCavern (requires InfestationPit -> Lair)
    ;[logic, insertedItems] = GameLogic.addItemToBO(
        logic,
        { name: "UltraliskCavern", type: "structure" },
        insertedItems,
    )

    // Add Corruptor (requires Spire or GreaterSpire), Greaterspire will be done before Corruptor is queued
    ;[logic, insertedItems] = GameLogic.addItemToBO(logic, { name: "Corruptor", type: "unit" }, insertedItems)

    expect(insertedItems).toBe(1)
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
    expect(logic.supplyCap).toBe(14)
})

test("Add Lair then Queen", () => {
    const prevLogic = new GameLogic("zerg", [])

    // Add Lair (requires Hatchery + SpawningPool)
    let [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "Lair", type: "structure" }, 0)

    // Add Queen (requires Hatchery/Lair/Hive + SpawningPool)
    ;[logic, insertedItems] = GameLogic.addItemToBO(logic, { name: "Queen", type: "unit" }, insertedItems)

    expect(insertedItems).toBe(1)
    expect(logic.units.size).toBe(15)
    expect(logic.eventLog.length).toBe(5)
    expect(logic.supplyCap).toBe(14)
})

test("Add Hive then Queen", () => {
    const prevLogic = new GameLogic("zerg", [])

    // Add Hive (requires Lair + InfestationPit)
    let [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "Hive", type: "structure" }, 0)

    // Add Queen (requires Hatchery/Lair/Hive + SpawningPool)
    ;[logic, insertedItems] = GameLogic.addItemToBO(logic, { name: "Queen", type: "unit" }, insertedItems)

    expect(insertedItems).toBe(1)
    expect(logic.units.size).toBe(15)
    expect(logic.eventLog.length).toBe(7)
    expect(logic.supplyCap).toBe(14)
})

test("Add Hive then ZergMissileWeaponsLevel3", () => {
    const prevLogic = new GameLogic("zerg", [])

    // Add Hive (requires Lair + InfestationPit)
    let [logic, insertedItems] = GameLogic.addItemToBO(prevLogic, { name: "Hive", type: "structure" }, 0)

    // Add ZergMissileWeaponsLevel3 (requires Hive + Level1 + Level2)
    ;[logic, insertedItems] = GameLogic.addItemToBO(
        logic,
        { name: "ZergMissileWeaponsLevel3", type: "upgrade" },
        insertedItems,
    )

    // This test may fail because old systems required Lair for Level2. However, that Lair already has morphed to Hive
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(10)
})

test("Failing: Add drone after extractor trick", () => {
    const bo: IBuildOrderElement[] = [
        { name: "Drone", type: "worker" },
        { name: "Drone", type: "worker" },
        { name: "Extractor", type: "structure" },
        { name: "cancel_extractor", type: "action" },
        { name: "Drone", type: "worker" },
    ]
    const logic = new GameLogic("zerg", bo)

    logic.setStart()
    logic.runUntilEnd()
    expect(logic.supplyLeft).toBe(0)
    expect(logic.supplyUsed).toBe(14)
    expect(logic.units.size).toBe(16)
    expect(logic.eventLog.length).toBe(3)
    expect(logic.errorMessage).toBe("Missing 1 supply to produce 'Drone'.")
})

test("Add drone during extractor trick", () => {
    const bo: IBuildOrderElement[] = [
        { name: "Drone", type: "worker" },
        { name: "Drone", type: "worker" },
        { name: "Extractor", type: "structure" },
        { name: "Drone", type: "worker" },
        { name: "cancel_extractor", type: "action" },
    ]
    const logic = new GameLogic("zerg", bo)

    logic.setStart()
    logic.runUntilEnd()
    expect(logic.supplyLeft).toBe(-1)
    expect(logic.supplyUsed).toBe(15)
    expect(logic.units.size).toBe(17)
    expect(logic.eventLog.length).toBe(4)
})

test("Production tracking: 3 SupplyDepots and 1 SCV", () => {
    // Queue 3 SupplyDepots and 1 SCV in the build order
    // Verify that at the snapshot after the SCV is queued:
    //   - 1 Supply Depot is completed (the first one, which finished building)
    //   - 2 Supply Depots are still in production (the 2nd and 3rd, still being built by workers)
    //   - 1 SCV is in production (just queued at the CommandCenter)
    const bo: IBuildOrderElement[] = [
        { name: "SupplyDepot", type: "structure" },
        { name: "SupplyDepot", type: "structure" },
        { name: "SupplyDepot", type: "structure" },
        { name: "SCV", type: "worker" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()

    // unitsCountArray has bo.length + 1 snapshots (index 0 = initial state from setStart)
    // Indices 1-4 correspond to each BO item being processed
    expect(logic.unitsCountArray.length).toBe(5)

    // The snapshot at index 4 is taken when the SCV (4th item) is queued.
    // By this time, the first SupplyDepot (build time = 30s * 16 = 480 frames)
    // has completed because enough frames have elapsed while accumulating minerals
    // for the subsequent depots (each costs 100 minerals).
    expect(logic.unitsCountArray.length).toBeGreaterThan(0)
    const snapshot = logic.unitsCountArray.at(-1)

    expect(snapshot).not.toBeUndefined()
    if (snapshot === undefined) {
        return
    }

    // 1 Supply Depot completed (added as a unit, build task removed from worker)
    expect(snapshot.SupplyDepot).toBe(1)
    // 2 Supply Depots still in production (2nd and 3rd depots being built by workers)
    expect(snapshot.SupplyDepot_in_production).toBe(2)
    // 1 SCV in production (CommandCenter training the queued SCV)
    expect(snapshot.SCV_in_production).toBe(1)
})
