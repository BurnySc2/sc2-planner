type IAllRaces = "zerg" | "terran" | "protoss"

type IBarTypes = "worker" | "action" | "unit" | "structure" | "upgrade"

type IButton = "donate" | "contribute" | "report_bugs" | "contact" | "legal"

type IReplaceString = "$time" | "$supply" | "$action"

interface ISettingsElement {
    [name: string]: number | string
    n: string
    v: number
}

interface IBuildOrderElement {
    name: string
    type: IBarTypes
}

interface ICost {
    minerals: number
    vespene: number
    supply: number
}

interface ICustomAction {
    internal_name: string
    name: string
    imageSource: string
    duration: number
    id: number
    race?: IAllRaces | string
}

interface IDataUnit {
    name: string
    id: number
    minerals: number
    gas: number
    time: number
    supply: number
    race: string
    is_structure: boolean
    is_townhall: boolean
    needs_geyser: boolean
}

interface IDataUpgrade {
    name: string
    id: number
    cost: {
        minerals: number
        gas: number
        time: number
    }
    race?: IAllRaces
}

interface IDataAbility {
    name: string
    id: number
    target:
        | {
              Train: number
              Morph: number
              BuildInstant: number
              TrainPlace: number
              Build: number
              BuildOnUnit: number
          }
        | string
}

interface IResearchedBy {
    [name: string]: {
        requiredStructure: string | null
        requiredUpgrade: string | null
        requires: string[][]
        researchedBy: Set<string>
    }
}

interface ITrainedBy {
    [name: string]: {
        requiredStructure: string | null
        requiredUpgrade: string | null
        requiresUnits: string[] | null
        requires: string[][]
        trainedBy: Set<string>
        requiresTechlab: boolean
        isMorph: boolean
        consumesUnit: boolean
    }
}

interface IResourceHistory {
    minerals: number[]
    vespene: number[]
    supplyLeft: number[]
    raceSpecific: number[]
}

export type {
    IReplaceString,
    IAllRaces,
    IBarTypes,
    IButton,
    ISettingsElement,
    IBuildOrderElement,
    ICost,
    ICustomAction,
    IDataUnit,
    IDataUpgrade,
    IDataAbility,
    IResearchedBy,
    ITrainedBy,
    IResourceHistory,
}
