import type { IAllRaces, IDataUnit, IDataUpgrade } from "./interfaces"

// =============================================================================
// Raw Data Interfaces
// =============================================================================

export interface IRawUnit {
    name: string
    id?: number | string
    CostResource?: {
        Minerals?: number
        Vespene?: number
    }
    time?: number
    Food?: number
    race?: string
    Race?: string
    type?: string
    researches?: string[]
    [key: string]: unknown
}

export interface IRawUpgrade {
    name: string
    id?: number
    minerals?: number
    gas?: number
    time?: number
    race?: string
    [key: string]: unknown
}

// =============================================================================
// Constants
// =============================================================================

const TOWNHALL_NAMES = new Set([
    "CommandCenter",
    "OrbitalCommand",
    "PlanetaryFortress",
    "Nexus",
    "Hatchery",
    "Lair",
    "Hive",
])

const GEYSER_NAMES = new Set(["Refinery", "Assimilator", "Extractor"])

// =============================================================================
// Converter Functions
// =============================================================================

export function convertUnit(raw: IRawUnit): IDataUnit {
    return {
        name: raw.name,
        id: typeof raw.id === "number" ? raw.id : 0,
        minerals: raw.CostResource?.Minerals ?? 0,
        gas: raw.CostResource?.Vespene ?? 0,
        time: raw.time ?? 0,
        supply: raw.Food ? -raw.Food : 0,
        race: raw.race ?? "",
        is_structure: raw.type === "structure",
        is_townhall: TOWNHALL_NAMES.has(raw.name),
        needs_geyser: GEYSER_NAMES.has(raw.name),
    }
}

export function convertUpgrade(raw: IRawUpgrade): IDataUpgrade {
    const result: IDataUpgrade = {
        name: raw.name,
        id: raw.id ?? 0,
        cost: {
            minerals: raw.minerals ?? 0,
            gas: raw.gas ?? 0,
            time: raw.time ?? 0,
        },
    }
    if (raw.race) {
        const lowerRace = raw.race.toLowerCase()
        if (lowerRace === "terran" || lowerRace === "protoss" || lowerRace === "zerg") {
            result.race = lowerRace as IAllRaces
        }
    }
    return result
}
