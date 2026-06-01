import { convertUnit, convertUpgrade } from "./converters"
import type { IRawUnit, IRawUpgrade } from "./converters"

describe("convertUnit", () => {
    test("converts a basic unit with all fields", () => {
        const raw: IRawUnit = {
            name: "Marine",
            id: 48,
            CostResource: { Minerals: 50, Vespene: 0 },
            time: 272,
            Food: -1,
            race: "Terran",
            type: "unit",
        }
        const result = convertUnit(raw)
        expect(result).toEqual({
            name: "Marine",
            id: 48,
            minerals: 50,
            gas: 0,
            time: 272,
            supply: 1,
            race: "Terran",
            is_structure: false,
            is_townhall: false,
            needs_geyser: false,
        })
    })

    test("handles missing optional fields with defaults", () => {
        const raw: IRawUnit = {
            name: "TestUnit",
            id: 999,
        }
        const result = convertUnit(raw)
        expect(result.minerals).toBe(0)
        expect(result.gas).toBe(0)
        expect(result.time).toBe(0)
        expect(result.supply).toBe(0)
        expect(result.race).toBe("")
        expect(result.is_structure).toBe(false)
        expect(result.is_townhall).toBe(false)
        expect(result.needs_geyser).toBe(false)
    })

    test("marks structures correctly", () => {
        const raw: IRawUnit = {
            name: "Barracks",
            id: 21,
            type: "structure",
            race: "Terran",
        }
        const result = convertUnit(raw)
        expect(result.is_structure).toBe(true)
    })

    test("marks townhalls correctly", () => {
        const townhallNames = [
            "CommandCenter",
            "OrbitalCommand",
            "PlanetaryFortress",
            "Nexus",
            "Hatchery",
            "Lair",
            "Hive",
        ]
        for (const name of townhallNames) {
            const raw: IRawUnit = {
                name,
                id: 1,
                type: "structure",
            }
            const result = convertUnit(raw)
            expect(result.is_townhall).toBe(true)
            expect(result.is_structure).toBe(true)
        }
    })

    test("marks geyser structures correctly", () => {
        const geyserNames = ["Refinery", "Assimilator", "Extractor"]
        for (const name of geyserNames) {
            const raw: IRawUnit = {
                name,
                id: 1,
                type: "structure",
            }
            const result = convertUnit(raw)
            expect(result.needs_geyser).toBe(true)
        }
    })

    test("negates Food value for supply cost", () => {
        const raw: IRawUnit = {
            name: "Adept",
            id: 1,
            Food: -2,
        }
        const result = convertUnit(raw)
        expect(result.supply).toBe(2)
    })

    test("handles positive Food value (supply provider)", () => {
        const raw: IRawUnit = {
            name: "Overlord",
            id: 1,
            Food: 8,
        }
        const result = convertUnit(raw)
        expect(result.supply).toBe(-8)
    })

    test("handles zero Food value", () => {
        const raw: IRawUnit = {
            name: "SCV",
            id: 1,
            Food: 0,
        }
        const result = convertUnit(raw)
        expect(result.supply).toBe(0)
    })
})

describe("convertUpgrade", () => {
    test("converts a basic upgrade with all fields", () => {
        const raw: IRawUpgrade = {
            name: "TerranInfantryWeaponsLevel1",
            id: 46,
            minerals: 100,
            gas: 100,
            time: 160,
            race: "Terran",
        }
        const result = convertUpgrade(raw)
        expect(result.name).toBe("TerranInfantryWeaponsLevel1")
        expect(result.id).toBe(46)
        expect(result.cost).toEqual({ minerals: 100, gas: 100, time: 160 })
        expect(result.race).toBe("terran")
    })

    test("handles missing optional fields with defaults", () => {
        const raw: IRawUpgrade = {
            name: "TestUpgrade",
            id: 999,
        }
        const result = convertUpgrade(raw)
        expect(result.cost).toEqual({ minerals: 0, gas: 0, time: 0 })
        expect(result.race).toBeUndefined()
    })

    test("lowercases race value", () => {
        const raw: IRawUpgrade = {
            name: "TestUpgrade",
            id: 1,
            race: "Zerg",
        }
        const result = convertUpgrade(raw)
        expect(result.race).toBe("zerg")
    })

    test("sets race to undefined for invalid race values", () => {
        const raw: IRawUpgrade = {
            name: "TestUpgrade",
            id: 1,
            race: "Invalid",
        }
        const result = convertUpgrade(raw)
        expect(result.race).toBeUndefined()
    })

    test("handles upgrades without race field", () => {
        const raw: IRawUpgrade = {
            name: "TestUpgrade",
            id: 1,
            minerals: 50,
            gas: 50,
            time: 80,
        }
        const result = convertUpgrade(raw)
        expect(result.race).toBeUndefined()
    })
})
