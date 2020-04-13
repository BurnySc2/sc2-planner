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
    const bo = [{name: "SCV", type: "worker"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
});

test('Build two SCVs', () => {
    const bo = [{name: "SCV", type: "worker"}, {name: "SCV", type: "worker"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(15)
    expect(logic.eventLog.length).toBe(2)
});

test('Build depot', () => {
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
    const bo = [{name: "CommandCenter", type: "structure"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
    expect(logic.eventLog.length).toBe(1)
});


