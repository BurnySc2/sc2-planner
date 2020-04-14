import {GameLogic} from "./gamelogic"

test('Get the train time of SCV', () => {
    const logic = new GameLogic("terran")
    expect(logic.getTime("SCV")).toBe(272)
});

test('Get the train cost of SCV', () => {
    const logic = new GameLogic("terran")
    expect(logic.getCost("SCV").minerals).toBe(50)
    expect(logic.getCost("SCV").vespene).toBe(0)
    expect(logic.getCost("SCV").supply).toBe(1)
});

test('Get the train cost of Depot', () => {
    const logic = new GameLogic("terran")
    expect(logic.getCost("SupplyDepot").minerals).toBe(100)
    expect(logic.getCost("SupplyDepot").vespene).toBe(0)
    expect(logic.getCost("SupplyDepot").supply).toBe(-8)
});

test('Build an SCV', () => {
    // Test if building one worker works
    const bo = [{name: "SCV", type: "worker"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
});

test('Build two SCVs', () => {
    // Test if building two workers works
    const bo = [{name: "SCV", type: "worker"}, {name: "SCV", type: "worker"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(15)
    expect(logic.eventLog.length).toBe(2)
});

test('Build depot', () => {
    // Test if building a structure works
    const bo = [{name: "SupplyDepot", type: "structure"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    // console.log(logic.units);
    
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
});

test('Build SCV then depot', () => {
    const bo = [{name: "SCV", type: "worker"}, {name: "SupplyDepot", type: "structure"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(15)
    expect(logic.supplyCap).toBe(23)
    expect(logic.eventLog.length).toBe(2)
});

test('Build 4 SCVs', () => {
    // Test to see if supply block matters
    const bo = []
    for (let i = 0; i < 4; i++) {
        bo.push({name: "SCV", type: "worker"})
    }
    expect(bo.length).toBe(4)
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    // Should be 17 but since we get supply blocked, only get up to 16 units max (15 workers + 1 cc)
    expect(logic.units.size).toBe(16)
    expect(logic.eventLog.length).toBe(3)
});

test('Build 3 SCVs then depot then one more SCV', () => {
    const bo = []
    for (let i = 0; i < 3; i++) {
        bo.push({name: "SCV", type: "worker"})
    }
    bo.push({name: "SupplyDepot", type: "structure"})
    bo.push({name: "SCV", type: "worker"})

    expect(bo.length).toBe(5)
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    // Should be 17 but since we get supply blocked, only get up to 16 units max (15 workers + 1 cc)
    expect(logic.supplyCap).toBe(23)
    expect(logic.units.size).toBe(18)
    expect(logic.eventLog.length).toBe(5)
});

test('Build commandcenter', () => {
    // Test command center - idleLimit cannot be set too low by default
    const bo = [{name: "CommandCenter", type: "structure"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
});

test('Build refinery', () => {
    // Test refinery
    const bo = [{name: "Refinery", type: "structure"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
});

test('Build 2 drones, 1 overlord, 4 drones', () => {
    // Test zerg mechanics
    const bo = [
        {name: "Drone", type: "worker"},
        {name: "Drone", type: "worker"},
        {name: "Overlord", type: "unit"},
        {name: "Drone", type: "worker"},
        {name: "Drone", type: "worker"},
        {name: "Drone", type: "worker"},
        {name: "Drone", type: "worker"},
    ]
    const logic = new GameLogic("zerg", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(20)
    expect(logic.eventLog.length).toBe(7)
    expect(logic.supplyCap).toBe(22)
});


test('Build OC and call down MULE', () => {
    // Morph CC to OC, then call down a mule
    const bo = [
        {name: "SupplyDepot", type: "structure"}, 
        {name: "Barracks", type: "structure"}, 
        {name: "OrbitalCommand", type: "structure"}, 
        {name: "call_down_mule", type: "action"}
    ]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(15)
    expect(logic.eventLog.length).toBe(4)
});

// TODO research an upgrade, e.g. from ebay

