import { GameLogic } from "./gamelogic"
//import { IBuildOrderElement } from "../constants/interfaces"
//TODO1

test("Optimize workers", () => {
    const prevLogic = new GameLogic("terran", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(
        prevLogic,
        { name: "Battlecruiser", type: "unit" },
        0
    )

    expect(insertedItems).toBe(9)
    expect(logic.units.size).toBe(20)
    expect(logic.eventLog.length).toBe(9)
    expect(logic.supplyCap).toBe(23)
})

test("Add BroodLord with required tech", () => {
    const prevLogic = new GameLogic("zerg", [])
    const [logic, insertedItems] = GameLogic.addItemToBO(
        prevLogic,
        { name: "BroodLord", type: "unit" },
        0
    )

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
        0
    )

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
        0
    )

    expect(insertedItems).toBe(11)
    expect(logic.units.size).toBe(21)
    expect(logic.eventLog.length).toBe(11)
    expect(logic.supplyCap).toBe(31)
    ;[logic, insertedItems] = GameLogic.addItemToBO(
        logic,
        { name: "morph_archon_from_ht_ht", type: "action" },
        insertedItems
    )

    expect(insertedItems).toBe(3)
    expect(logic.units.size).toBe(22)
    expect(logic.eventLog.length).toBe(14)
    expect(logic.supplyCap).toBe(31)
})
