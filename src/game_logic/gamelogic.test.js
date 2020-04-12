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
});

test('Build depot', () => {
    const bo = [{name: "SupplyDepot", type: "structure"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
});

test('Build SCV then depot', () => {
    const bo = [{name: "SCV", type: "worker"}, {name: "SupplyDepot", type: "structure"}]
    const logic = new GameLogic("terran", bo)
    logic.setStart()
    logic.runUntilEnd()
    expect(logic.units.size).toBe(14)
});
