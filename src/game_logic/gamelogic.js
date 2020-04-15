import UNITS_BY_NAME from "../constants/units_by_name"
import TRAINED_BY from "../constants/trained_by"
import UPGRADES_BY_NAME from "../constants/upgrade_by_name"
// import RESEARCHED_BY from "../constants/researched_by"
import {CUSTOMACTIONS_BY_NAME} from "../constants/customactions"
import {incomeMinerals, incomeVespene} from "./income"

import {cloneDeep} from 'lodash'

import Unit from "./unit"
import Event from "./event"
import Task from "./task"

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

let boSnapshots = {}
let mineralIncomeCache = {}
let vespeneIncomeCache = {}
const workerTypes = new Set(["SCV", "Probe", "Drone"])

class GameLogic {
    constructor(race="terran", bo=[], customSettings=[]) {
        this.race = race
        this.bo = bo
        this.boIndex = 0
        this.minerals = 50
        this.vespene = 0
        this.supplyUsed = 12
        this.supplyLeft = this.race === "zerg" ? 2 : 3
        this.supplyCap = this.race === "zerg" ? 14 : 15
        this.units = new Set()
        this.idleUnits = new Set()
        this.busyUnits = new Set()
        this.workersMinerals = 12
        this.workersVespene = 0
        this.muleCount = 0
        this.baseCount = 1
        this.gasCount = 0
        this.frame = 0
        // Keep track of how long all units were idle (waiting for resources)
        this.idleTime = 0
        this.eventLog = []

        // Custom settings from the settings page
        // TODO
        // How many seconds the worker mining should be delayed at game start
        this.workerStartDelay = 2
        // How many seconds a worker needs before starting to build a structure
        this.workerBuildDelay = 2
        // How many seconds a worker needs to return back to mining after completing a structure
        this.workerReturnDelay = 2
        // Allow max 40 seocnds frames for all units to be idle, before the game logic aborts and marks the build order as 'not valid' (cc off 12 workers can be started after 35 seconds)
        this.idleLimit = 40 * 22.4
        // HTML element width factor
        this.htmlElementWidthFactor = 0.3
        // this.htmlElementWidthFactor = 1

        // Update settings from customSettings object, see WebPage.js defaultSettings
        for (let item of customSettings) {
            this[item.variableName] = item.value
        }
    }
    
    reset() {
        this.boIndex = 0
        this.minerals = 50
        this.vespene = 0
        this.supplyUsed = 12
        this.supplyLeft = this.race === "zerg" ? 2 : 3
        this.supplyCap = this.race === "zerg" ? 14 : 15
        // All units that are alive
        this.units = new Set()
        // Units that have a slot open to do something, e.g. a barracks with reactor will be idle if it only trains one marine
        this.idleUnits = new Set()
        // Units that have a task, a barracks with reactor that only trains one marine will be busy
        this.busyUnits = new Set()
        this.workersMinerals = 12
        this.workersVespene = 0
        // Amount of bases
        this.baseCount = 1
        // Amount of refineries, extractors, assimilators
        this.gasCount = 0
        this.frame = 0
        this.eventLog = []
        boSnapshots = {}
    }

    hasSnapshot() {
        return Object.keys(this.getBOIndexSnapshots()).length > 0
    }

    getBOIndexSnapshots() {
        return boSnapshots
    }

    loadFromSnapshotObject(snapshot) {
        console.assert(snapshot !== undefined, snapshot)
        this.boIndex = snapshot.boIndex
        this.minerals = snapshot.minerals
        this.vespene = snapshot.vespene
        this.supplyUsed = snapshot.supplyUsed
        this.supplyLeft = snapshot.supplyLeft
        this.supplyCap = snapshot.supplyCap
        this.units = snapshot.units
        this.idleUnits = snapshot.idleUnits
        this.busyUnits = snapshot.busyUnits
        this.workersMinerals = snapshot.workersMinerals
        this.workersVespene = snapshot.workersVespene
        this.baseCount = snapshot.baseCount
        this.gasCount = snapshot.gasCount
        this.frame = snapshot.frame
        this.eventLog = snapshot.eventLog
        
    }

    setStart() {
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
        }
        const townhall = new Unit(townhallName)
        if (this.race === "zerg") {
            townhall.larvaCount = 3
        }
        this.units.add(townhall)
        this.idleUnits.add(townhall)
        for (let i = 0; i < 12; i++) {
            const unit = new Unit(workerName)
            // Add worker delay of 2 seconds before they start gathering minerals
            const workerStartDelayTask = new Task(22.4 * this.workerStartDelay, this.frame)
            unit.addTask(workerStartDelayTask)
            this.units.add(unit)
            this.busyUnits.add(unit)
        }
    }

    runUntilEnd() {
        // Runs until all units are idle
        while (this.frame < 22.4 * 20 * 60) { // Limit to 20 mins
            this.runFrame()
            this.frame += 1
            // Abort once all units are idle and end of build order is reached
            if (this.boIndex >= this.bo.length && this.busyUnits.size === 0) {
                break
            }

            // Abort if units idle for too long (waiting for resources), e.g. when making all workers scout and only one more worker is mining, then build a cc will take forever
            if (this.busyUnits.size === 0) {
                this.idleTime += 1
                if (this.idleTime >= this.idleLimit) {
                    break
                }
            } else {
                this.idleTime = 0
            }
        }
        // TODO better assertion statements
        // if bo is not valid and current item in bo requires more supply than we have left: tell user that we are out of supply
        // if bo item costs gas but no gas mining: tell user that we dont mine gas
        console.assert(this.boIndex >= this.bo.length, cloneDeep(this))
        // console.assert(this.boIndex >= this.bo.length, JSON.stringify(cloneDeep(this), undefined, 4))
        // TODO sort eventList by item.start 
    }

    runFrame() {
        // Run one frame in game logic
        this.addIncome()
        this.updateUnitsProgress()

        let endOfActions = false
        // Each frame could theoretically have multiple actions
        while (!endOfActions && this.boIndex < this.bo.length) {
            endOfActions = true
            const boElement = this.bo[this.boIndex]
            // Check requirements
            // Check idle unit who can train / produce / research / execute action

            // console.log(this.frame, this.boIndex, boElement);
            
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
                const executed = this.executeAction(boElement)
                if (executed) {
                    endOfActions = false
                }
            }

            if (!endOfActions) {
                // console.log(this.frame);
                this.boIndex += 1
                // Each time the boIndex gets incremented, take a snapshot of the current state - this way i can cache the gamelogic and reload it from the state
                // e.g. bo = [scv, depot, scv]
                // and i want to remove depot, i can resume from cached state of index 0
                const clone = cloneDeep(this)
                // Need to add one frame here
                clone.frame += 1
                boSnapshots[this.boIndex] = clone
            }
        }
    }

    trainUnit(unit) {
        // Issue train command of unit type
        console.assert(unit.name, JSON.stringify(unit, null, 4))
        console.assert(unit.type, JSON.stringify(unit, null, 4))

        // Get cost (mineral, vespene, supply)
        if (!this.canAfford(unit)) {
            // console.log(this.frame, this.minerals, this.vespene);
            return false
        }

        // Get unit type / structure type that can train this unit
        const trainedInfo = TRAINED_BY[unit.name]
        console.assert(trainedInfo, unit.name)


        // Check if requirement is met
        const requiredStructure = trainedInfo.requiredStructure
        let requiredStructureMet = requiredStructure === null ? true : false
        if (!requiredStructureMet) {
            for (let structure of this.units) {
                if (structure.name === requiredStructure) {
                    requiredStructureMet = true
                    break
                } 
            }
            if (!requiredStructureMet) {
                return false
            }
        }
        
        // The unit/structure that is training the target unit or structure
        for (let trainerUnit of this.idleUnits) {
            console.assert(trainerUnit.name, trainerUnit)
            console.assert(trainerUnit.constructor.name === "Unit")
            // Unit might no longer be idle while iterating over idleUnits
            if (!trainerUnit.isIdle()) {
                continue
            }

            // Loop over all idle units and check if they match unit type
            
            const trainerCanTrainThisUnit = trainedInfo.trainedBy[trainerUnit.name] === 1
            const trainerCanTrainThroughReactor = !trainedInfo.requiresTechlab && trainerUnit.hasReactor
            const trainerCanTrainThroughLarva = trainedInfo.trainedBy["Larva"] === 1 && trainerUnit.larvaCount > 0
            // console.log(this.frame);
            // console.log(trainerUnit.name);
            // console.log(trainedInfo);
            // console.log(trainerCanTrainThisUnit);
            // console.log(trainerCanTrainThroughLarva);
            if (
                !trainerCanTrainThisUnit 
                && !trainerCanTrainThroughReactor 
                && !trainerCanTrainThroughLarva) {
                continue
            }
            
            // The trainerUnit can train the target unit

            // Add task to unit
            // If trained unit is made by worker: add worker move delay
            const buildTime = this.getTime(unit.name)
            
            const newTask = new Task(buildTime, this.frame)
            
            const morphCondition = (trainedInfo.isMorph || trainedInfo.consumesUnit) && !trainerCanTrainThroughLarva
            newTask.morphToUnit = morphCondition || trainedInfo.consumesUnit ? unit.name : null
            
            if (newTask.morphToUnit === null) {
                if (unit.type === "worker") {
                    newTask.newWorker = unit.name
                } else if (unit.type === "unit") {
                    newTask.newUnit = unit.name
                } else if (unit.type === "structure") {
                    newTask.newStructure = unit.name
                }
            }
            // console.log(trainedInfo);
            // console.log(newTask);
            trainerUnit.addTask(newTask, trainerCanTrainThroughReactor, trainerCanTrainThroughLarva)
            // TODO If trainerUnit is a worker: reduce mineral worker count by 1 and add it by 1 once the task is complete
            // Unit is definitely busy after receiving a task
            this.busyUnits.add(trainerUnit)
            if (trainerCanTrainThroughLarva) {
                trainerUnit.larvaCount -= 1
            }
            // console.log(cloneDeep(trainerUnit));
            
            // console.log(this.frame);
            // console.log(cloneDeep(unit));
            // console.log(cloneDeep(trainerUnit));
            // console.log(cloneDeep(trainedInfo));
            // console.log(cloneDeep(newTask));

            const cost = this.getCost(unit.name)
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
    
    researchUpgrade(upgrade) {
        // Issue research command of upgrade type
        console.assert(upgrade.name, JSON.stringify(upgrade, null, 4))
        console.assert(upgrade.type, JSON.stringify(upgrade, null, 4))
        // TODO
        return true
    }
    
    executeAction(actionItem) {
        // Issue action
        // TODO
        // console.log(this.frame);
        // console.log(actionItem);
        const action = CUSTOMACTIONS_BY_NAME[actionItem.name]
        console.assert(action !== undefined, JSON.stringify(actionItem, null, 4))
        let actionCompleted = false

        // ALL RACES

        if (action.internal_name === "worker_to_mins" && this.workersVespene > 0) {
            for (const unit of this.idleUnits) {
                if (workerTypes.has(unit.name) && unit.isMiningGas) {
                    unit.isMiningGas = false
                    this.workersMinerals += 1
                    this.workersVespene -= 1
                    actionCompleted = true
                    break
                }
            }
        }

        if (action.internal_name === "worker_to_gas" && this.workersMinerals > 0) {
            for (const unit of this.idleUnits) {
                if (this.gasCount > 0 && workerTypes.has(unit.name) && unit.isMiningMinerals()) {
                    unit.isMiningGas = true
                    this.workersMinerals -= 1
                    this.workersVespene += 1
                    actionCompleted = true
                    break
                }
            }
        }

        if (action.internal_name === "3worker_to_gas" && this.workersMinerals >= 3) {
            const mineralWorkers = []
            for (const unit of this.idleUnits) {
                // Find 3 workers that are mining minerals
                if (this.gasCount > 0 && workerTypes.has(unit.name) && unit.isMiningMinerals()) {
                    mineralWorkers.push(unit)
                    if (mineralWorkers.length === 3) {
                        mineralWorkers.forEach((worker) => {
                            worker.isMiningGas = true
                        })
                        this.workersMinerals -= 3
                        this.workersVespene += 3
                        actionCompleted = true
                        break
                    }
                }
            }
        }

        // TERRAN

        if (action.internal_name === "call_down_mule") {
            for (const unit of this.idleUnits) {
                // Find orbital with >=50 energy
                if (unit.name === "OrbitalCommand" && unit.energy >= 50) {
                    unit.energy -= 50
                    // Spawn temporary unit mule
                    // TODO Might want to add mule spawn delay later? (2-3 seconds)
                    const newUnit = new Unit("MULE")
                    newUnit.isAliveUntilFrame = this.frame + action.duration * 22.4
                    this.units.add(newUnit)
                    this.muleCount += 1
                    actionCompleted = true
                }
            }
        }

        if (actionCompleted) {    
            // Add event                  
            this.eventLog.push(new Event(
                action.name, action.imageSource, "action", this.frame, this.frame + 22.4 * action.duration
            ))
            return true
        }

        
        return false
    }

    updateUnitsProgress() {
        // Updates the energy on each unit and their task progress
        this.units.forEach((unit) => {
            unit.updateUnitState(this)
        })
        this.units.forEach((unit) => {
            const isAlive = unit.isAlive()
            if (!isAlive) {
                if (unit.name === "MULE") {
                    this.muleCount -= 1
                } 
                this.units.delete(unit)
                this.idleUnits.delete(unit)
                this.busyUnits.delete(unit)
            }
        })
        this.units.forEach((unit) => {
            unit.updateUnit(this)
        })
    }

    getCost(unitName, isUpgrade=false) {
        // Gets cost of unit, structure or upgrade
        // TODO get cost of upgrade
        if (isUpgrade) {
            console.assert(UPGRADES_BY_NAME[unitName], `${unitName}`)
            return {
                minerals: UPGRADES_BY_NAME[unitName].minerals,
                vespene: UPGRADES_BY_NAME[unitName].gas,
                supply: 0,
            }
        }
        console.assert(UNITS_BY_NAME[unitName], `${unitName}`)
        return {
            minerals: UNITS_BY_NAME[unitName].minerals,
            vespene: UNITS_BY_NAME[unitName].gas,
            supply: UNITS_BY_NAME[unitName].supply,
        }
    }
    
    getTime(unitName, isUpgrade=false) {
        // Get build time of unit or structure, or research time of upgrade (in frames)
        // TODO get time of upgrade
        if (isUpgrade) {
            console.assert(UPGRADES_BY_NAME[unitName], `${unitName}`)
            return UPGRADES_BY_NAME[unitName].time
        }
        console.assert(UNITS_BY_NAME[unitName], `${unitName}`)
        return UNITS_BY_NAME[unitName].time
    }
    
    addIncome() {
        // Calculate income based on mineral and gas workers
        let minerals = mineralIncomeCache[[this.workersMinerals, this.baseCount, this.muleCount]]
        if (minerals === undefined) {
            minerals = incomeMinerals(this.workersMinerals, this.baseCount, this.muleCount) / 22.4
            mineralIncomeCache[[this.workersMinerals, this.baseCount, this.muleCount]] = minerals
        } 

        let vespene = vespeneIncomeCache[[this.workersVespene, this.gasCount]]
        if (vespene === undefined) {
            vespene = incomeVespene(this.workersVespene, this.gasCount) / 22.4
            vespeneIncomeCache[[this.workersVespene, this.gasCount]] = vespene
        } 
        this.minerals += minerals
        this.vespene += vespene
        // this.minerals += incomeMinerals(this.workersMinerals, this.baseCount, this.muleCount) / 22.4
        // this.vespene +=  incomeVespene(this.workersVespene, this.gasCount) / 22.4
    }

    canAfford(unit) {
        // Input: unit or upgrade object {name: "SCV", type: "worker"}
        console.assert(unit.name, JSON.stringify(unit, null, 4))
        console.assert(unit.type, JSON.stringify(unit, null, 4))
        if (unit.type === "upgrade") {
            return this._canAfford(this.getCost(unit.name, true))
        } else {
            return this._canAfford(this.getCost(unit.name, false))
        }

    }
    _canAfford(cost) {
        // Input: cost object
        console.assert(cost.minerals, JSON.stringify(cost, null, 4))
        if (cost.minerals <= this.minerals && cost.vespene <= this.vespene && (cost.supply < 0 || cost.supply <= this.supplyLeft)) {
            return true
        }
        return false
    }
    
}


export {Event, GameLogic}


