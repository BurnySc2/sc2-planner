import { GameLogic } from "./gamelogic"
import { OptimizeLogic } from "./optimize"
import { IBuildOrderElement } from "../constants/interfaces"

test("Optimize workers", () => {
    const bo: IBuildOrderElement[] = [
        { name: "Extractor", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "Drone", type: "worker" },
        { name: "SpawningPool", type: "structure" },
        { name: "BanelingNest", type: "structure" },
    ]
    const logic = new GameLogic("zerg", bo)
    logic.setStart()
    logic.runUntilEnd()

    const optimize = new OptimizeLogic(logic.race, [], [])
    const [state, log] = optimize.optimizeBuildOrder(logic, logic.bo, ["maximizeWorkers"])

    expect(state !== undefined).toBe(true)
    expect(state?.gamelogic !== undefined).toBe(true)
    if (state?.gamelogic !== undefined) {
        expect(state.gamelogic.units.size).toBe(25)
        expect(state.gamelogic.eventLog.length).toBe(15)
        expect(state.gamelogic.supplyCap).toBe(22)
    }
})

test("Optimize nexus chronos", () => {
    const bo: IBuildOrderElement[] = [
        { name: "Probe", type: "unit" },
        { name: "Pylon", type: "structure" },
        { name: "Gateway", type: "structure" },
        { name: "Probe", type: "worker" },
        { name: "Zealot", type: "unit" },
        { name: "Probe", type: "worker" },
    ]
    const logic = new GameLogic("protoss", bo)
    logic.setStart()
    logic.runUntilEnd()

    const optimize = new OptimizeLogic(logic.race, [], [])
    const [state, log] = optimize.optimizeBuildOrder(logic, logic.bo, ["maximizeNexusChronos"])

    expect(state !== undefined).toBe(true)
    expect(state?.gamelogic !== undefined).toBe(true)
    if (state?.gamelogic !== undefined) {
        expect(state.gamelogic.units.size).toBe(19)
        expect(state.gamelogic.eventLog.length).toBe(8)
        expect(state.gamelogic.supplyCap).toBe(23)
    }
})

test("Optimize MULEs", () => {
    const bo: IBuildOrderElement[] = [
        { name: "SupplyDepot", type: "structure" },
        { name: "Barracks", type: "structure" },
        { name: "OrbitalCommand", type: "structure" },
        { name: "Refinery", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "Factory", type: "structure" },
        { name: "Starport", type: "structure" },
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()

    const optimize = new OptimizeLogic(logic.race, [], [])
    const [state, log] = optimize.optimizeBuildOrder(logic, logic.bo, ["maximizeMULEs"])

    expect(state !== undefined).toBe(true)
    expect(state?.gamelogic !== undefined).toBe(true)
    if (state?.gamelogic !== undefined) {
        expect(state.gamelogic.units.size).toBe(19)
        expect(state.gamelogic.eventLog.length).toBe(9)
        expect(state.gamelogic.supplyCap).toBe(23)
    }
})

test("Optimize injects", () => {
    const bo: IBuildOrderElement[] = [
        { name: "Hatchery", type: "structure" },
        { name: "SpawningPool", type: "structure" },
        { name: "Queen", type: "unit" },
        { name: "Queen", type: "unit" },
        { name: "Extractor", type: "structure" },
        { name: "3worker_to_gas", type: "action" },
        { name: "Lair", type: "structure" },
    ]
    const logic = new GameLogic("zerg", bo)
    logic.setStart()
    logic.runUntilEnd()

    const optimize = new OptimizeLogic(logic.race, [], [])
    const [state, log] = optimize.optimizeBuildOrder(logic, logic.bo, ["maximizeInjects"])

    expect(state !== undefined).toBe(true)
    expect(state?.gamelogic !== undefined).toBe(true)
    if (state?.gamelogic !== undefined) {
        expect(state.gamelogic.units.size).toBe(16)
        expect(state.gamelogic.eventLog.length).toBe(13)
        expect(state.gamelogic.supplyCap).toBe(20)
    }
})
