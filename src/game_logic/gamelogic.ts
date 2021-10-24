import UNITS_BY_NAME from "../constants/units_by_name"
import TRAINED_BY from "../constants/trained_by"
import UPGRADES_BY_NAME from "../constants/upgrade_by_name"
import RESEARCHED_BY from "../constants/researched_by"
import { BO_ITEMS, supplyUnitNameByRace } from "../constants/bo_items"
import { incomeMinerals, incomeVespene } from "./income"

import { cloneDeep, minBy, find, remove } from "lodash"
import Unit from "./unit"
import Event from "./event"
import Task from "./task"
import executeAction from "./execute_action"
import { defaultSettings, defaultOptimizeSettings } from "../constants/helper"
import {
    IBuildOrderElement,
    ISettingsElement,
    ICost,
    IAllRaces,
    IResourceHistory,
} from "../constants/interfaces"

/** Logic of this file:
Each frame
    Calculate and add income
    Update the state of each unit:
        Update energy available
        Update progress (if they are doing something)
    Check if the next build order item can be executed

Each build order index increment
    Add the current state to snapshots for cached view
*/

type IError = {
    message: string
    requirements: IBuildOrderElement[]
    neededEffort: number
}

let eventId = 0
let mineralIncomeCache = {}
let vespeneIncomeCache = {}
const workerTypes = new Set(["SCV", "Probe", "Drone"])

class GameLogic {
    race: IAllRaces
    bo: Array<IBuildOrderElement>
    boIndex: number
    minerals: number
    vespene: number
    supplyUsed: number
    supplyLeft: number
    supplyCap: number
    raceSpecificResource: number
    resourceHistory: IResourceHistory
    units: Set<Unit>
    idleUnits: Set<Unit>
    busyUnits: Set<Unit>
    workersMinerals: number
    workersVespene: number
    workersScouting: number
    muleCount: number
    upgrades: Set<string>
    baseCount: number
    gasCount: number
    freeTechlabs: number
    freeReactors: number
    frame: number
    waitTime: number
    eventLog: Array<Event>
    unitsCountArray: Array<{ [name: string]: number }>
    errorMessage: string
    requirements?: IBuildOrderElement[]
    settings: { [name: string]: number | string }
    customSettings: Array<ISettingsElement>
    optimizeSettings: { [name: string]: number | string }
    customOptimizeSettings: Array<ISettingsElement>

    constructor(
        race: IAllRaces = "terran",
        bo: Array<IBuildOrderElement> = [],
        customSettings: Array<ISettingsElement> = [],
        customOptimizeSettings: Array<ISettingsElement> = []
    ) {
        this.race = race
        this.bo = bo
        this.boIndex = 0
        this.minerals = 50
        this.vespene = 0
        this.supplyUsed = 12
        this.supplyLeft = this.race === "zerg" ? 2 : 3
        this.supplyCap = this.race === "zerg" ? 14 : 15
        this.raceSpecificResource = this.race === "protoss" ? 1 : this.race === "terran" ? 0 : 3
        this.resourceHistory = {
            minerals: [this.minerals],
            vespene: [this.vespene],
            supplyLeft: [this.supplyLeft],
            raceSpecificResource: [this.raceSpecificResource],
        }
        // All units that are alive
        this.units = new Set()
        // Units that have a slot open to do something, e.g. a barracks with reactor will be idle if it only trains one marine
        this.idleUnits = new Set()
        // Units that have a task, a barracks with reactor that only trains one marine will be busy
        this.busyUnits = new Set()
        this.workersMinerals = 12
        this.workersVespene = 0
        this.workersScouting = 0
        this.muleCount = 0
        // Researched upgrades
        this.upgrades = new Set()
        // Amount of bases
        this.baseCount = 1
        // Amount of refineries, extractors, assimilators
        this.gasCount = 0
        this.freeTechlabs = 0
        this.freeReactors = 0
        this.frame = 0
        // Keep track of time for action 'do_nothing_5_sec'
        this.waitTime = 0
        this.eventLog = []
        // Number of units, will only be saved after every build order index advances - only used for UI purpose on the right side of the website
        this.unitsCountArray = []
        // Error message appearing on GUI if build order is invalid
        this.errorMessage = ""
        this.requirements = undefined
        eventId = -1
        mineralIncomeCache = {}
        vespeneIncomeCache = {}

        // Custom settings from the settings page
        this.customSettings = customSettings
        this.settings = {}
        this.loadSettings(defaultSettings)
        // How many seconds the worker mining should be delayed at game start
        // this.workerStartDelay = 2
        // How many seconds a worker needs before starting to build a structure
        // this.workerBuildDelay = 1
        // How many seconds a worker needs to return back to mining after completing a structure
        // this.workerReturnDelay = 3
        // Allow max 40 seocnds frames for all units to be idle, before the game logic aborts and marks the build order as 'not valid' (cc off 12 workers can be started after 35 seconds)
        // this.idleLimit = 15
        // HTML element width factor
        // this.htmlElementWidthFactor = 0.3
        // How long it takes buildings to dettach from addons (lift, fly away and land)
        // this.addonSwapDelay = 3
        // Keep track of how long all units were idle (waiting for resources)
        // this.idleTime = 0

        // Update settings from customSettings object, see WebPage.js defaultSettings
        this.loadSettings(customSettings)

        this.customOptimizeSettings = customOptimizeSettings
        this.optimizeSettings = {}
        this.loadOptimizeSettings(defaultOptimizeSettings)
        this.loadOptimizeSettings(customOptimizeSettings)
    }

    /**
     * Prepares default properties for this.setStart()
     */
    reset(): void {
        this.boIndex = 0
        this.minerals = 50
        this.vespene = 0
        this.supplyUsed = 12
        this.supplyLeft = this.race === "zerg" ? 2 : 3
        this.supplyCap = this.race === "zerg" ? 14 : 15
        this.raceSpecificResource = this.race === "protoss" ? 1 : this.race === "terran" ? 0 : 3
        this.resourceHistory = {
            minerals: [this.minerals],
            vespene: [this.vespene],
            supplyLeft: [this.supplyLeft],
            raceSpecificResource: [this.raceSpecificResource],
        }
        this.units = new Set()
        this.idleUnits = new Set()
        this.busyUnits = new Set()
        this.workersMinerals = 0
        this.workersVespene = 0
        this.workersScouting = 0
        this.muleCount = 0
        this.upgrades = new Set()
        this.baseCount = 1
        this.gasCount = 0
        this.freeTechlabs = 0
        this.freeReactors = 0
        this.frame = 0
        this.waitTime = 0
        this.eventLog = []
        this.unitsCountArray = []
        eventId = -1
        mineralIncomeCache = {}
        vespeneIncomeCache = {}
    }

    /**
     *
     * @param {Object} customSettings - See helper.js for default settings
     */
    loadSettings(customSettings: Array<ISettingsElement>): void {
        for (const item of customSettings) {
            this.settings[item.variableName] = item.v
        }
    }

    loadOptimizeSettings(customSettings: Array<ISettingsElement>): void {
        for (const item of customSettings) {
            this.optimizeSettings[item.variableName] = item.v
        }
    }

    exportSettings(): ISettingsElement[] {
        // Update default settings from gamelogic.settings object, then return it
        const settingsObject = cloneDeep(defaultSettings)
        settingsObject.forEach((item) => {
            item.v = this.settings[item.variableName]
        })
        return settingsObject
    }

    exportOptimizeSettings(): ISettingsElement[] {
        // Update default settings from gamelogic.settings object, then return it
        const optimizeSettingsObject = cloneDeep(defaultOptimizeSettings)
        optimizeSettingsObject.forEach((item) => {
            item.v = this.optimizeSettings[item.variableName]
        })
        return optimizeSettingsObject
    }

    /**
     *
     */
    getEventId(): number {
        eventId += 1
        return eventId
    }

    /**
     * Sets the start conditions: spawns all start structures, starting resources and values will be set in this.reset()
     */
    setStart(): void {
        this.reset()
        let townhallName = ""
        let workerName = ""
        if (this.race === "terran") {
            townhallName = "CommandCenter"
            workerName = "SCV"
        }
        if (this.race === "protoss") {
            townhallName = "Nexus"
            workerName = "Probe"
        }
        if (this.race === "zerg") {
            townhallName = "Hatchery"
            workerName = "Drone"
            this.units.add(new Unit("Overlord"))
        }
        const townhall = new Unit(townhallName)
        townhall.energy = 50
        if (this.race === "zerg") {
            townhall.larvaCount = 3
        }
        this.units.add(townhall)
        this.idleUnits.add(townhall)
        for (let i = 0; i < 12; i++) {
            const unit = new Unit(workerName)
            // Add worker delay of 2 seconds before they start gathering minerals
            const workerStartDelayTask = new Task(
                22.4 * +this.settings.workerStartDelay,
                this.frame,
                this.supplyUsed
            )
            workerStartDelayTask.addMineralWorker = true
            unit.addTask(this, workerStartDelayTask)
            this.units.add(unit)
        }
        this.unitsCountArray.push(this.updateUnitsCount())
    }

    /**
     * Runs the simulation until a limit is reached (20 minutes)
     * or until the end of build order is reached and no unit is busy (= no unit has a task)
     * or if no unit was busy for a long time, then it is assumed that the build order cannot be executed completely and must be invalid
     */
    runUntilEnd(): void {
        // Runs until all units are idle
        while (this.frame < 22.4 * 20 * 60) {
            // Limit to 20 mins
            this.runFrame()
            this.frame += 1
            // Abort once all units are idle and end of build order is reached
            if (this.boIndex >= this.bo.length && this.busyUnits.size === 0) {
                break
            }

            // Abort if units idle for too long (waiting for resources), e.g. when making all workers scout and only one more worker is mining, then build a cc will take forever
            if (this.busyUnits.size === 0) {
                this.settings.idleTime = +this.settings.idleTime + 1
                if (this.settings.idleTime >= +this.settings.idleLimit * 22.4) {
                    break
                }
            } else {
                this.settings.idleTime = 0
            }
        }
        // TODO better assertion statements
        // if bo is not valid and current item in bo requires more supply than we have left: tell user that we are out of supply
        // if bo item costs gas but no gas mining: tell user that we dont mine gas
        // console.assert(this.boIndex >= this.bo.length, cloneDeep(this))
        // console.assert(this.boIndex >= this.bo.length, JSON.stringify(cloneDeep(this), undefined, 4))

        // Sort eventList by item.start, but perhaps the reverse is the desired behavior?
        this.eventLog.sort((a, b) => {
            if (a.id < b.id) {
                return -1
            }
            if (a.id > b.id) {
                return 1
            }
            return 0
        })
    }

    /**
     * Executes one frame of the simulation
     * Adds income
     * Steps each unit by 1 frame (task progress, energy generation etc.)
     * Tries to execute next build order elements until it is no longer possible
     */
    runFrame(): void {
        // Run one frame in game logic
        this.raceSpecificResource = 0
        this.addIncome()
        this.updateUnitsProgress()

        let endOfActions = false
        // Each frame could theoretically have multiple actions
        while (!endOfActions && this.boIndex < this.bo.length) {
            endOfActions = true
            const boElement = this.bo[this.boIndex]
            // Check requirements
            // Check idle unit who can train / produce / research / execute action

            // Train unit
            if (["worker", "unit"].includes(boElement.type)) {
                const trained = this.trainUnit(boElement)

                if (trained) {
                    endOfActions = false
                }
            }

            // Build structures
            else if (boElement.type === "structure") {
                const built = this.trainUnit(boElement)
                if (built) {
                    endOfActions = false
                }
            }

            // Research upgrade
            else if (boElement.type === "upgrade") {
                const researched = this.researchUpgrade(boElement)
                if (researched) {
                    endOfActions = false
                }
            }

            // Run action
            else if (boElement.type === "action") {
                const executed = executeAction(this, boElement)
                if (executed) {
                    endOfActions = false
                }
            }

            if (!endOfActions) {
                this.boIndex += 1
                this.errorMessage = ""
                this.requirements = undefined
                this.unitsCountArray.push(this.updateUnitsCount())
                // Each time the boIndex gets incremented, take a snapshot of the current state - this way i can cache the gamelogic and reload it from the state
                // e.g. bo = [scv, depot, scv]
                // and i want to remove depot, i can resume from cached state of index 0
            }
        }

        this.resourceHistory.minerals.push(this.minerals)
        this.resourceHistory.vespene.push(this.vespene)
        this.resourceHistory.supplyLeft.push(this.supplyLeft)
        this.resourceHistory.raceSpecificResource.push(this.raceSpecificResource)
    }

    /**
     * Updates the statistics of available actions, how many units and structures we have, and what upgrades are researched
     */
    updateUnitsCount(): { [p: string]: number } {
        // Counts all available actions and how many units, structures we have and if an upgrade is researched
        const unitsCount: { [name: string]: number } = {}
        const incrementUnitName = (item: string, amount = 1) => {
            if (!unitsCount[item]) {
                unitsCount[item] = amount
            } else {
                unitsCount[item] += amount
            }
        }
        // Count of HT and DT for archon
        let htCount = 0
        let dtCount = 0
        this.units.forEach((unit, _index) => {
            // Reduce drone count by 1 if it received a task to build a structure
            // Reduce HT or DT count by 1 if it is busy morphing to archon
            if (
                !["Drone", "HighTemplar", "DarkTemplar"].includes(unit.name) ||
                unit.tasks.length === 0 ||
                !unit.tasks[unit.tasks.length - 1].morphToUnit
            ) {
                incrementUnitName(unit.name)
            }
            if (unit.hasTechlab) {
                incrementUnitName(`${unit.name}Techlab`)
            } else if (unit.hasReactor) {
                incrementUnitName(`${unit.name}Reactor`)
            }
            if (unit.larvaCount > 0) {
                incrementUnitName("Larva", unit.larvaCount)
            }
            if (unit.isMiningMinerals()) {
                // Amount of workers mining minerals
                incrementUnitName("worker_to_mins")
            }
            if (unit.isMiningGas) {
                // Amount of workers mining gas
                incrementUnitName("worker_to_gas")
            }
            if (unit.isScouting) {
                // Amount of scouting workers
                incrementUnitName("worker_to_scout")
            }
            // Count actions by dividing energy through action energy cost, e.g. Math.floor(OC / 50) for amount of mule calldown available
            // Protoss

            if (unit.name === "Nexus") {
                const amount = Math.floor(unit.energy / 50)
                incrementUnitName("chronoboost_busy_nexus", amount)
                incrementUnitName("chronoboost_busy_gateway", amount)
                incrementUnitName("chronoboost_busy_warpgate", amount)
                incrementUnitName("chronoboost_busy_cybercore", amount)
                incrementUnitName("chronoboost_busy_forge", amount)
                incrementUnitName("chronoboost_busy_robo", amount)
                incrementUnitName("chronoboost_busy_stargate", amount)
                incrementUnitName("chronoboost_busy_twilight", amount)
                incrementUnitName("chronoboost_busy_dark_shrine", amount)
                incrementUnitName("chronoboost_busy_templar_archive", amount)
                incrementUnitName("chronoboost_busy_fleet_beacon", amount)
                incrementUnitName("chronoboost_busy_robotics_bay", amount)
            }
            if (unit.name === "Gateway" && this.upgrades.has("WarpGate")) {
                incrementUnitName("convert_gateway_to_warpgate")
            }
            if (unit.name === "WarpGate") {
                incrementUnitName("convert_warpgate_to_gateway")
            }
            if (unit.name === "HighTemplar") {
                htCount += 1
            }
            if (unit.name === "DarkTemplar") {
                dtCount += 1
            }
            // Terran
            if (unit.name === "OrbitalCommand") {
                const amount = Math.floor(unit.energy / 50)
                incrementUnitName("call_down_mule", amount)
                incrementUnitName("call_down_supply", amount)
            }
            if (this.freeTechlabs > 0) {
                if (unit.name === "Barracks" && !unit.hasAddon()) {
                    incrementUnitName("attach_barracks_to_free_techlab")
                }
                if (unit.name === "Factory" && !unit.hasAddon()) {
                    incrementUnitName("attach_factory_to_free_techlab")
                }
                if (unit.name === "Starport" && !unit.hasAddon()) {
                    incrementUnitName("attach_starport_to_free_techlab")
                }
            }
            if (this.freeReactors > 0) {
                if (unit.name === "Barracks" && !unit.hasAddon()) {
                    incrementUnitName("attach_barracks_to_free_reactor")
                }
                if (unit.name === "Factory" && !unit.hasAddon()) {
                    incrementUnitName("attach_factory_to_free_reactor")
                }
                if (unit.name === "Starport" && !unit.hasAddon()) {
                    incrementUnitName("attach_starport_to_free_reactor")
                }
            }
            if (unit.name === "Barracks" && unit.hasTechlab) {
                incrementUnitName("dettach_barracks_from_techlab")
            }
            if (unit.name === "Barracks" && unit.hasReactor) {
                incrementUnitName("dettach_barracks_from_reactor")
            }
            if (unit.name === "Factory" && unit.hasTechlab) {
                incrementUnitName("dettach_factory_from_techlab")
            }
            if (unit.name === "Factory" && unit.hasReactor) {
                incrementUnitName("dettach_factory_from_reactor")
            }
            if (unit.name === "Starport" && unit.hasTechlab) {
                incrementUnitName("dettach_starport_from_techlab")
            }
            if (unit.name === "Starport" && unit.hasReactor) {
                incrementUnitName("dettach_starport_from_reactor")
            }
            if (unit.name === "Bunker") {
                incrementUnitName("salvage_bunker")
            }
            // Zerg
            if (unit.name === "Queen") {
                const amount = Math.floor(unit.energy / 25)
                incrementUnitName("inject", amount)
                incrementUnitName("creep_tumor", amount)
            }
        })
        incrementUnitName("morph_archon_from_dt_dt", Math.floor(dtCount / 2))
        incrementUnitName("morph_archon_from_ht_ht", Math.floor(htCount / 2))
        incrementUnitName("morph_archon_from_ht_dt", Math.min(htCount, dtCount))
        this.upgrades.forEach((upgrade, _index) => {
            incrementUnitName(upgrade)
        })

        // Also add minerals, vespene and supply as this acts like a 'snapshot' when selecting at which index to insert a new build order item
        incrementUnitName("minerals", this.minerals)
        incrementUnitName("vespene", this.vespene)
        incrementUnitName("supplyused", this.supplyUsed)
        incrementUnitName("supplycap", this.supplyCap)
        incrementUnitName("frame", this.frame)

        return unitsCount
    }

    /**
     * Checks if what an item requires is present or not
     */
    addRequirements(itemName: string, requires: string[][]): boolean {
        this.requirements = this.requirements || []
        const itemPresence: { [unitName: string]: boolean } = {}
        for (const item of this.units) {
            let itemName = item.name
            if (item.hasTechlab) {
                itemName += "TechLab"
            }
            if (item.hasReactor) {
                itemName += "Reactor"
            }
            itemPresence[itemName] = true
        }
        for (const upgradeName of this.upgrades) {
            itemPresence[upgradeName] = true
        }

        const errorList: IError[] = []
        for (const requirementList of requires) {
            const error: IError = {
                message: "",
                requirements: [],
                neededEffort: 0,
            }
            errorList.push(error)
            for (const requiredItem of requirementList) {
                if (!itemPresence[requiredItem]) {
                    error.message = `Required ${requiredItem} for ${itemName} could not be found.`
                    error.requirements.push(BO_ITEMS[requiredItem])
                    error.neededEffort += 1 / requirementList.length
                }
            }
        }

        const leastEffortError = minBy(errorList, "neededEffort")
        if (leastEffortError && leastEffortError.neededEffort) {
            this.errorMessage = leastEffortError.message
            this.requirements.push(...leastEffortError.requirements)
            return false
        }
        return true
    }

    /**
     * The simulation tries to train a unit, builds a structure or morphs a unit
     */
    trainUnit(unit: IBuildOrderElement): boolean {
        // Issue train command of unit type
        console.assert(unit.name, JSON.stringify(unit, null, 4))
        console.assert(unit.type, JSON.stringify(unit, null, 4))

        // Get unit type / structure type that can train this unit
        const trainInfo = TRAINED_BY[unit.name]
        this.requirements = []
        let morphCondition = trainInfo.isMorph || trainInfo.consumesUnit
        console.assert(trainInfo, unit.name)
        // Check if requirement is met
        if (trainInfo.requires.length) {
            const requirements = this.addRequirements(unit.name, trainInfo.requires)
            if (!requirements) {
                return false
            }
        }

        // Get cost (mineral, vespene, supply)
        const cost = GameLogic.getCost(unit.name)
        if (!this._canAfford(cost) && !morphCondition) {
            // Generate error message if not able to afford (missing minerals, vespene or free supply)
            this.setCostErrorMessage(cost, unit.name)
            return false
        }

        // The unit/structure that is training the target unit or structure
        // TODO Sort units, e.g. try to train marines first from reactor barracks, then normal barracks, then techlab barracks
        // ^ The same for warpgate first, then gateway
        for (const trainerUnit of this.idleUnits) {
            // Unit might no longer be idle while iterating over idleUnits
            if (!trainerUnit.isIdle()) {
                continue
            }

            // If target is an addon but building structure already has addon: skip
            if (
                (unit.name.includes("TechLab") || unit.name.includes("Reactor")) &&
                trainerUnit.hasAddon()
            ) {
                this.errorMessage = `Could not find structure without addon to build '${unit.name}'.`
                continue
            }

            // Loop over all idle units and check if they match unit type

            const trainerCanTrainThisUnit =
                trainInfo.trainedBy.has(trainerUnit.name) &&
                (!trainInfo.requiresTechlab || trainerUnit.hasTechlab)
            const trainerCanTrainThroughReactor =
                trainInfo.trainedBy.has(trainerUnit.name) &&
                !trainInfo.requiresTechlab &&
                trainerUnit.hasReactor &&
                trainerUnit.addonTasks.length === 0
            // TODO Rename this task as 'background task' as probes are building structures in the background aswell as hatcheries are building stuff with their larva
            const trainerCanTrainThroughLarva =
                (trainInfo.trainedBy.has("Larva") && trainerUnit.larvaCount > 0) ||
                (unit.type === "structure" && trainerUnit.name === "Probe")
            morphCondition = morphCondition && !trainerCanTrainThroughLarva

            // Unit has to be produced through main unit queue, but if unit is busy: dont train
            if (!trainerCanTrainThroughLarva && !trainerCanTrainThroughReactor) {
                if (trainerUnit.tasks.length > 0) {
                    continue
                }
            }

            if (
                !trainerCanTrainThisUnit &&
                !trainerCanTrainThroughReactor &&
                !trainerCanTrainThroughLarva
            ) {
                this.errorMessage = `Could not find unit to produce '${unit.name}'.`
                if (trainInfo.consumesUnit) {
                    if (unit.type === "structure") {
                        this.requirements = [
                            {
                                name: "Drone",
                                type: "worker",
                            },
                        ]
                    } else {
                        this.errorMessage += ` Didn't know which requirement to insert here for ${unit.name}`
                    }
                }
                continue
            }

            if (unit.name === "Zergling") {
                // Was 0.5 and 25
                cost.supply = 1
                cost.minerals = 50
            }
            if (!this._canAfford(cost)) {
                // This is nearly the same error as above, but this is for a morph
                // Generate error message if not able to afford (missing minerals, vespene or free supply)
                this.setCostErrorMessage(cost, unit.name)
                return false
            }
            // The trainerUnit can train the target unit

            // Add task to unit
            // If trained unit is made by worker: add worker move delay
            let buildTime = this.getTime(unit.name)

            // Create the build start delay task
            let buildStartDelay = 0
            if (workerTypes.has(trainerUnit.name)) {
                this.workersMinerals -= 1
                // Worker moving to location delay
                const workerMovingToConstructionSite = new Task(
                    +this.settings.workerBuildDelay * 22.4,
                    this.frame,
                    this.supplyUsed
                )
                trainerUnit.addTask(this, workerMovingToConstructionSite)
                buildStartDelay = +this.settings.workerBuildDelay * 22.4
                // Since this task is run immediately, it needs to end later when made by probes
                if (trainerUnit.name === "Probe") {
                    buildTime += buildStartDelay
                }
            }

            const taskId = this.getEventId()
            // Create the new task
            const newTask = new Task(
                buildTime,
                this.frame + buildStartDelay,
                this.supplyUsed,
                taskId
            )
            newTask.morphToUnit = morphCondition || trainInfo.consumesUnit ? unit.name : null
            if (newTask.morphToUnit === null) {
                if (unit.type === "worker") {
                    newTask.newWorker = unit.name
                } else if (unit.type === "unit") {
                    newTask.newUnit = unit.name
                } else if (unit.type === "structure") {
                    newTask.newStructure = unit.name
                }
            }

            if (trainerUnit.name === "WarpGate") {
                // Training through warpgate reduces train time to 4 seconds
                newTask.totalFramesRequired = 3.6 * 22.4
                trainerUnit.addTask(this, newTask, trainerCanTrainThroughReactor, true)
                // Add the warpgate recover time which can be sped up through chrono
                trainerUnit.addTask(
                    this,
                    new Task(
                        this.warpgateRecoverTime(unit.name),
                        this.frame,
                        this.supplyUsed,
                        taskId
                    ),
                    trainerCanTrainThroughReactor,
                    trainerCanTrainThroughLarva
                )
            } else {
                // Add normal task to unit, add to reactor if unit has reactor, add to larva if unit has larva
                trainerUnit.addTask(
                    this,
                    newTask,
                    trainerCanTrainThroughReactor,
                    trainerCanTrainThroughLarva
                )
            }

            // Create the builder return task
            if (["Probe", "SCV"].includes(trainerUnit.name)) {
                // Probe and SCV return to mining after they are done with their task
                const workerReturnToMinerals = new Task(
                    +this.settings.workerReturnDelay * 22.4,
                    this.frame,
                    this.supplyUsed
                )
                workerReturnToMinerals.addMineralWorker = true
                trainerUnit.addTask(this, workerReturnToMinerals)
            }
            if (trainerCanTrainThroughLarva) {
                trainerUnit.larvaCount -= 1
            }

            this.minerals -= cost.minerals
            this.vespene -= cost.vespene
            if (cost.supply > 0) {
                this.supplyUsed += cost.supply
                this.supplyLeft -= cost.supply
            }
            if (trainerUnit.name === "Drone") {
                this.supplyUsed -= 1
                this.supplyLeft += 1
            }

            return true
        }
        return false
    }

    /**
     * The simulation tries to research an upgrade
     * Nearly the same as trainUnit(unit)
     */
    researchUpgrade(upgrade: IBuildOrderElement): boolean {
        this.requirements = []
        // Issue research command of upgrade type
        console.assert(upgrade.name, JSON.stringify(upgrade, null, 4))
        console.assert(upgrade.type, JSON.stringify(upgrade, null, 4))

        // Get unit type / structure type that can train this unit
        const researchInfo = RESEARCHED_BY[upgrade.name]

        // Check if requirement is met
        const requiredStructure = researchInfo.requiredStructure
        let requiredStructureMet = requiredStructure === null ? true : false
        if (!requiredStructureMet) {
            for (const structure of this.units) {
                if (structure.name === requiredStructure) {
                    requiredStructureMet = true
                    break
                }
            }
            if (
                !requiredStructureMet &&
                !this.addRequirements(upgrade.name, researchInfo.requires)
            ) {
                return false
            }
        }
        const requiredUpgrade = researchInfo.requiredUpgrade
        let requiredUpgradeMet = requiredUpgrade === null ? true : false
        if (requiredUpgrade && !requiredUpgradeMet) {
            if (this.upgrades.has(requiredUpgrade)) {
                requiredUpgradeMet = true
            }
            if (!requiredUpgradeMet) {
                this.errorMessage = `Required upgrade '${requiredUpgrade}' to research upgrade '${upgrade.name}' could not be found.`
                this.requirements.push({
                    name: requiredUpgrade,
                    type: "upgrade",
                })
                return false
            }
        }

        if (!this.addRequirements(upgrade.name, researchInfo.requires)) {
            return false
        }

        // Get cost (mineral, vespene, supply)
        const cost = GameLogic.getCost(upgrade.name, true)
        if (!this._canAfford(cost)) {
            this.setCostErrorMessage(cost, upgrade.name)
            return false
        }

        // The unit/structure that is training the target unit or structure

        for (const researcherStructure of this.idleUnits) {
            const structureCanResearchUpgrade = researchInfo.researchedBy.has(
                researcherStructure.name
            )

            const canBeResearchedByAddon =
                researcherStructure.hasTechlab &&
                researchInfo.researchedBy.has(`${researcherStructure.name}TechLab`)

            if (!structureCanResearchUpgrade && !canBeResearchedByAddon) {
                continue
            }

            // Unit is busy researching / building stuff
            if (structureCanResearchUpgrade && researcherStructure.tasks.length !== 0) {
                continue
            }

            if (canBeResearchedByAddon && researcherStructure.addonTasks.length !== 0) {
                // Addon is busy researching
                continue
            }

            // All requirement checks complete, start the task

            const researchTime = this.getTime(upgrade.name, true)
            const newTask = new Task(researchTime, this.frame, this.supplyUsed, this.getEventId())
            newTask.newUpgrade = upgrade.name

            researcherStructure.addTask(this, newTask, canBeResearchedByAddon)

            const cost = GameLogic.getCost(upgrade.name, true)
            this.minerals -= cost.minerals
            this.vespene -= cost.vespene
            return true
        }
        return false
    }

    /**
     * Updates the unit state and progress of all living units
     */
    updateUnitsProgress(): void {
        // Updates the energy on each unit and their task progress

        this.units.forEach((unit) => {
            unit.updateUnitState(this)
        })
        this.units.forEach((unit) => {
            const isAlive = unit.isAlive(this.frame)
            if (!isAlive) {
                if (unit.name === "MULE") {
                    this.muleCount -= 1
                }
                this.killUnit(unit)
            }
        })
        this.units.forEach((unit) => {
            unit.updateUnit(this)
        })
    }

    // UTILITY FUNCTIONS

    /**
     * Kills a unit and removes it from the game logic
     */
    killUnit(unit: Unit): void {
        this.units.delete(unit)
        this.idleUnits.delete(unit)
        this.busyUnits.delete(unit)
    }

    setCostErrorMessage(cost: ICost, unitName: string): void {
        if (cost.supply > this.supplyLeft) {
            this.errorMessage = `Missing ${Math.ceil(
                cost.supply - this.supplyLeft
            )} supply to produce '${unitName}'.`
            this.requirements = [supplyUnitNameByRace[this.race] as IBuildOrderElement]
        } else if (cost.vespene > this.vespene) {
            this.errorMessage = `Unable to afford '${unitName}', missing ${Math.ceil(
                cost.vespene - this.vespene
            )} vespene.`
            if (this.workersVespene === 0) {
                this.requirements = [
                    {
                        name: "3worker_to_gas",
                        type: "action",
                    },
                ]
            }
        } else if (cost.minerals > this.minerals) {
            this.errorMessage = `Unable to afford '${unitName}', missing ${Math.ceil(
                cost.minerals - this.minerals
            )} minerals.`
        }
    }

    increaseMaxSupply(amount: number): void {
        const remainingTillMaxSupply = 200 - this.supplyCap
        const increaseAmount = Math.min(amount, remainingTillMaxSupply)
        this.supplyCap += increaseAmount
        this.supplyLeft += increaseAmount
    }

    /**
     * Gets the cost of a unit, structure, morph or upgrade
     */
    static getCost(unitName: string, isUpgrade = false): ICost {
        // Gets cost of unit, structure or upgrade
        if (isUpgrade) {
            console.assert(UPGRADES_BY_NAME[unitName], `${unitName}`)
            return {
                minerals: UPGRADES_BY_NAME[unitName].cost.minerals,
                vespene: UPGRADES_BY_NAME[unitName].cost.gas,
                supply: 0,
            }
        }
        // Fixes unit cost for morphing units and structures (e.g. Hatchery to Lair, Roach to Ravager, Drone to Hatchery)
        if (unitName in TRAINED_BY) {
            const trained_by = TRAINED_BY[unitName]
            if (trained_by.isMorph || trained_by.consumesUnit) {
                return {
                    minerals: trained_by.morphCostMinerals,
                    vespene: trained_by.morphCostGas,
                    supply: trained_by.morphCostSupply,
                }
            }
        }
        console.assert(UNITS_BY_NAME[unitName], `${unitName}`)
        return {
            minerals: UNITS_BY_NAME[unitName].minerals,
            vespene: UNITS_BY_NAME[unitName].gas,
            supply: UNITS_BY_NAME[unitName].supply,
        }
    }

    /**
     * Gets build or research time of a unit, structure, morph or upgrade
     */
    getTime(unitName: string, isUpgrade = false): number {
        // Get build time of unit or structure, or research time of upgrade (in frames)
        if (isUpgrade) {
            console.assert(UPGRADES_BY_NAME[unitName], `${unitName}`)
            return UPGRADES_BY_NAME[unitName].cost.time
        }
        console.assert(UNITS_BY_NAME[unitName], `${unitName}`)
        return UNITS_BY_NAME[unitName].time
    }

    /**
     * Recover time of warp gates when creating a specific unit, how long the warp gate will be on cooldown after warping in a specific unit
     */
    warpgateRecoverTime(unitName: string): number {
        const recoverTimes: { [name: string]: number } = {
            Zealot: 20 * 22.4,
            Adept: 20 * 22.4,
            Stalker: 23 * 22.4,
            Sentry: 23 * 22.4,
            DarkTemplar: 32 * 22.4,
            HighTemplar: 32 * 22.4,
        }
        return recoverTimes[unitName]
    }

    /**
     * Calculates and caches the income based on how many workers (and mules), bases and gas structures we have
     */
    addIncome(): void {
        // Calculate income based on mineral and gas workers
        let minerals =
            mineralIncomeCache[
                // TODO Fix me: array[number] cannot be used as index type
                // @ts-ignore
                [this.workersMinerals, this.baseCount, this.muleCount]
            ]
        if (minerals === undefined) {
            minerals =
                incomeMinerals(this.workersMinerals, this.baseCount, this.muleCount) /
                +this.settings.incomeFactor
            mineralIncomeCache[
                // TODO Fix me: array[number] cannot be used as index type
                // @ts-ignore
                [this.workersMinerals, this.baseCount, this.muleCount]
            ] = minerals
        }

        // TODO Fix me: array[number] cannot be used as index type
        // @ts-ignore
        let vespene = vespeneIncomeCache[[this.workersVespene, this.gasCount]]
        if (vespene === undefined) {
            vespene =
                incomeVespene(this.workersVespene, this.gasCount, this.baseCount) /
                +this.settings.incomeFactor
            // TODO Fix me: array[number] cannot be used as index type
            // @ts-ignore
            vespeneIncomeCache[[this.workersVespene, this.gasCount]] = vespene
        }
        this.minerals += minerals
        this.vespene += vespene
        // this.minerals += incomeMinerals(this.workersMinerals, this.baseCount, this.muleCount) / 22.4
        // this.vespene +=  incomeVespene(this.workersVespene, this.gasCount) / 22.4
    }

    canAfford(unit: IBuildOrderElement): boolean {
        // Input: unit or upgrade object {name: "SCV", type: "worker"}
        console.assert(unit.name, JSON.stringify(unit, null, 4))
        console.assert(unit.type, JSON.stringify(unit, null, 4))
        if (unit.type === "upgrade") {
            return this._canAfford(GameLogic.getCost(unit.name, true))
        } else {
            return this._canAfford(GameLogic.getCost(unit.name, false))
        }
    }

    _canAfford(cost: ICost): boolean {
        // Input: cost object
        console.assert(cost.minerals, JSON.stringify(cost, null, 4))
        return (
            cost.minerals <= this.minerals &&
            cost.vespene <= this.vespene &&
            (cost.supply < 0 || cost.supply <= this.supplyLeft)
        )
    }

    canRequirementBeDuplicated(requirementName: string, itemName: string): boolean {
        const itemInfo = TRAINED_BY[itemName]
        const isMorphedFromAnotherUnit =
            itemInfo && itemInfo.requiresUnits && itemInfo.requiresUnits.includes(requirementName)
        const isArchonMaterial =
            !itemInfo &&
            ((itemName === "morph_archon_from_ht_ht" && requirementName === "HighTemplar") ||
                (itemName === "morph_archon_from_dt_dt" && requirementName === "DarkTemplar") ||
                (itemName === "morph_archon_from_ht_dt" &&
                    (requirementName === "HighTemplar" || requirementName === "DarkTemplar")))
        const isSupplyProvider = requirementName === supplyUnitNameByRace[this.race].name
        return isMorphedFromAnotherUnit || isArchonMaterial || isSupplyProvider
    }

    static simulatedBuildOrder(
        prevGamelogic: GameLogic,
        buildOrder: Array<IBuildOrderElement>
    ): GameLogic {
        const gamelogic = new GameLogic(
            prevGamelogic.race,
            buildOrder,
            prevGamelogic.customSettings,
            prevGamelogic.customOptimizeSettings
        )
        gamelogic.setStart()
        gamelogic.runUntilEnd()

        return gamelogic
    }

    static addItemToBO(
        prevGamelogic: GameLogic,
        item: IBuildOrderElement,
        insertIndex: number
    ): [GameLogic, number] {
        const bo = prevGamelogic.bo
        const initialBOLength = bo.length

        if (item.type === "upgrade" && prevGamelogic.upgrades.has(item.name)) {
            // upgrade already researched, don't do anything.
            return [prevGamelogic, insertIndex]
        }

        bo.splice(insertIndex, 0, item)
        // Re-calculate build order

        // // Caching using snapshots - idk why this isnt working properly
        // const latestSnapshot = gamelogic.getLastSnapshot()
        // if (latestSnapshot) {
        //     gamelogic.loadFromSnapshotObject(latestSnapshot)
        // }
        // gamelogic.bo = cloneDeep(bo)
        // gamelogic.runUntilEnd()

        // Non cached:
        // Fill up with missing items
        let gamelogic = GameLogic.simulatedBuildOrder(prevGamelogic, bo)
        let fillingLoop = 0
        // Add required items if need be
        if (insertIndex === bo.length - 1 && !prevGamelogic.errorMessage) {
            do {
                if (fillingLoop > 0) {
                    // Simulation is done already, the first time
                    gamelogic = GameLogic.simulatedBuildOrder(prevGamelogic, bo)
                }
                if (gamelogic.errorMessage && gamelogic.requirements) {
                    fillingLoop++
                    const duplicatesToRemove: IBuildOrderElement[] = []
                    for (const req of gamelogic.requirements) {
                        let duplicateItem: IBuildOrderElement | undefined
                        if (!gamelogic.canRequirementBeDuplicated(req.name, item.name)) {
                            duplicateItem = find(bo, req)
                        }
                        // Add item if absent, or present later in the bo
                        if (!duplicateItem || bo.indexOf(duplicateItem) >= insertIndex) {
                            bo.splice(insertIndex, 0, req)
                            if (duplicateItem) {
                                duplicatesToRemove.push(duplicateItem)
                            }
                        }
                    }
                    for (const duplicate of duplicatesToRemove) {
                        remove(bo, (item) => item === duplicate) // Specificaly remove the later one
                    }
                }
            } while (gamelogic.errorMessage && gamelogic.requirements && fillingLoop < 25)
        }
        const insertedItems = bo.length - initialBOLength
        return [gamelogic, insertedItems]
    }
}

export { Event, GameLogic }
