// import UNITS from "../constants/units"
// import STRUCTURES from "../constants/structures"
// import UPGRADES from "../constants/upgrades"

import UNITS_BY_NAME from "../constants/units_by_name"
import TRAINED_BY from "../constants/trained_by"
// import UPGRADES_BY_NAME from "../constants/upgrade_by_name"
// import RESEARCHED_BY from "../constants/researched_by"
// import CUSTOMACTIONS from "../constants/customactions"
import {incomeMinerals, incomeVespene} from "./income"

// import data from "../constants/data.json"

/** Logic of this file:
Each frame
    Calculate and add income
    Update the state of each unit:
        Update energy available
        Update progress (if they are doing something)
    Check if the next build order item can be executed
Each second (22.4 frames): 
    Add the current state to the object for cached view 
*/


/**
Upgrades
custom actions
add cached view every second
*/

class Event {
    constructor(name, imageSource, start, end) {
        this.name = name
        this.imageSource = imageSource
        this.start = start
        this.end = end
    }
}

class Task {
    constructor(totalFramesRequired=0) {
        // Once progress reaches 1, the task is supposed to be removed and the unit ends up idle
        this.progress = 0
        // How much total progress is required
        this.totalFramesRequired = totalFramesRequired
        // Automatically set by updateProgress
        this.isCompleted = false
        this.newWorker = null
        this.newUnit = null
        this.newStructure = null
        this.newUpgrade = null
        // this.morphToUnit = null
        this.addsTechlab = false
        this.addsReactor = false
    }

    updateProgress(hasChrono=false) {
        if (hasChrono) {
            this.progress += 1.5
        } else {
            this.progress += 1
        }
        if (this.progress >= this.totalFramesRequired) {
            this.isCompleted = true
        }
    }
}

class Unit { 
    constructor(name) {
        this.name = name
        this.energy = 0
        this.tasks = []
        // Protoss train and research structures
        this.hasChrono = false
        // Zerg townhalls
        this.larvaCount = 0
        // Terran depot
        this.hasSupplyDrop = false
        // Terran addon
        this.hasTechlab = false
        this.hasReactor = false
        this.reactorTasks = []
    }

    addTask(task, taskForReactor=false) {
        if (taskForReactor) {
            this.reactorTasks.push(task)
            return
        }
        this.tasks.push(task)
    }

    isIdle() {
        return this.tasks.length === 0 || (this.hasReactor && this.reactorTasks.length === 0)
    }
}

class GameLogic {
    constructor(race="terran", bo=[], customSettings={}) {
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
        this.workersMinerals = 12
        this.workersVespene = 0
        this.muleCount = 0
        this.baseCount = 1
        this.gasCount = 0
        this.frame = 0
        // this.eventLog = []

        // Custom settings from the settings page
        // TODO
        this.workerStartDelay = 2

    }
    
    reset() {
        this.boIndex = 0
        this.minerals = 50
        this.vespene = 0
        this.supplyUsed = 12
        this.supplyLeft = this.race === "zerg" ? 2 : 3
        this.supplyCap = this.race === "zerg" ? 14 : 15
        this.units = new Set()
        this.idleUnits = new Set()
        this.workersMinerals = 12
        this.workersVespene = 0
        this.baseCount = 1
        this.gasCount = 0
        this.frame = 0
        // this.eventLog = []
        // TODO verify variables from constructor
    }

    setStart() {
        this.reset()
        if (this.race === "terran") {
            const cc = new Unit("CommandCenter")
            this.units.add(cc)
            this.idleUnits.add(cc)
            for (let i = 0; i < 12; i++) {
                const unit = new Unit("SCV")
                // Add worker delay of 2 seconds before they start gathering minerals
                const workerStartDelayTask = new Task(22.4 * this.workerStartDelay)
                unit.addTask(workerStartDelayTask)
                this.units.add(unit)
            }
        }
        // TODO set start of zerg and protoss
    }

    runUntilEnd() {
        // Runs until all units are idle
        // TODO
        // while (this.frame < 22.4 * 1 * 60) { // Limit to 20 mins
        while (this.frame < 22.4 * 60) { // Limit to 20 mins
            this.runFrame()
            this.frame += 1
        }
    }

    runFrame() {
        // Return true when end of BO is reached and all units are idle
        this.addIncome()
        // this.parseEvents()
        this.updateUnitsProgress()

        let endOfActions = false
        while (!endOfActions && this.boIndex < this.bo.length) {
            endOfActions = true
            const boElement = this.bo[this.boIndex]
            // Check requirements
            // Check idle unit who can train / produce / research / execute action
            // TODO set endOfActions false when boIndex is incremented
            
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
                this.researchUpgrade(boElement)
            }

            // Run action
            else if (boElement.type === "action") {
                this.executeAction(boElement)
            }
            if (!endOfActions) {
                this.boIndex += 1
            }
        }
    }

    trainUnit(unit) {
        // Issue train command of unit type

        // Get cost (mineral, vespene, supply)
        if (!this.canAfford(unit)) {
            return false
        }

        // Get unit type / structure type that can train this unit
        const trainedInfo = TRAINED_BY[unit.name]
        // The unit/structure that is training the target unit or structure
        for (let trainerUnit of this.idleUnits){
            // const unitName = unit.name

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
            }
            if (!requiredStructureMet) {
                return false
            }

            // Loop over all idle units and check if they match unit type
            // TODO If this is a barracks and has reactor: build from reactor if reactor is idle
            // TODO could be a morph, then just morph current unit
            if (trainedInfo.trainedBy[trainerUnit.name] !== 1) {
                continue
            }

            // The trainerUnit can train the target unit

            // Add task to unit
            const buildTime = this.getTime(unit.name)
            const newTask = new Task(buildTime)

            if (unit.type === "worker") {
                newTask.newWorker = unit.name
            } else if (unit.type === "unit") {
                newTask.newUnits = unit.name
            } else if (unit.type === "structure") {
                newTask.newStructure = unit.name
            }
            trainerUnit.addTask(newTask)   

            // console.log(this.frame);
            // console.log(unit);
            // console.log(trainerUnit);

            const cost = this.getCost(unit.name)
            this.minerals -= cost.minerals
            this.vespene -= cost.minerals
            if (cost.supply > 0) {
                this.supply += cost.supply
                this.supplyLeft -= cost.supply
            }

            // Remove unit from idle
            this.idleUnits.delete(trainerUnit)

            return true
        }
        return true
    }
    
    researchUpgrade(upgrade) {
        // Issue research command of upgrade type
        // TODO
        return true
    }
    
    executeAction(action) {
        // Issue action
        // TODO
        return true
    }

    updateUnitsProgress() {
        // Updates the energy on each unit and their task progress
        this.units.forEach((unit) => {
            const unitWasIdle = unit.isIdle()

            if (unit.tasks.length > 0) {
                // TODO If structure has reactor: progress reactor-task too
                const firstTask = unit.tasks[0]
                firstTask.updateProgress(unit.hasChrono)
                // Remove first task if completed
                if (firstTask.isCompleted) {
                    const completedTask = unit.tasks.shift()

                    // Spawn worker
                    if (completedTask.newWorker !== null) {
                        const newUnit = new Unit(completedTask.newWorker)
                        // Add worker spawn delay
                        this.units.add(newUnit)
                        this.idleUnits.add(newUnit)
                        this.workersMinerals += 1
                        // console.log(this.frame);
                    }
                    // Spawn unit
                    if (completedTask.newUnit !== null) {
                        const newUnit = new Unit(completedTask.newUnit)
                        this.units.add(newUnit)
                        this.idleUnits.add(newUnit)
                        // console.log(this.frame);
                        // console.log(newUnit);
                    }
                    // Spawn structure
                    if (completedTask.newStructure !== null) {
                        const newUnit = new Unit(completedTask.newStructure)
                        this.units.add(newUnit)
                        this.idleUnits.add(newUnit)
                        // console.log(this.frame);
                        // console.log(newUnit);
                    }
                    // Mark upgrade as researched
                    if (completedTask.newUpgrade !== null) {
                        // const newUnit = new Unit(completedTask.newUpgrade)
                        // this.units.add(newUnit)
                        // this.idleUnits.add(newUnit)
                    }
                }
            }

            // Energy per frame
            unit.energy += 0.03515625

            // Turn units idle if they have no more tasks (or reactor has no task)
            if (!unitWasIdle && unit.isIdle()) {
                this.idleUnits.add(unit)
                // console.log(this.frame);
                // console.log(unit);
            }
        })
    }

    getCost(unitName, isUpgrade=false) {
        // Gets cost of unit, structure or upgrade
        console.assert(UNITS_BY_NAME[unitName] !== undefined, `${unitName}`)
        return {
            minerals: UNITS_BY_NAME[unitName].minerals,
            vespene: UNITS_BY_NAME[unitName].gas,
            supply: UNITS_BY_NAME[unitName].supply,
        }
    }
    
    getTime(unitName, isUpgrade=false) {
        // Get build time of unit or structure, or research time of upgrade (in frames)
        return UNITS_BY_NAME[unitName].time
    }
    
    addIncome() {
        // Calculate income based on mineral and gas workers
        this.minerals += incomeMinerals(this.workersMinerals, this.baseCount, this.muleCount) / 22.4
        this.vespene += incomeVespene(this.workersVespene, this.gasCount) / 22.4
    }

    canAfford(unit) {
        // Input: unit or upgrade object
        if (unit.type === "upgrade") {
            return this._canAfford(this.getCost(unit.name, true))
        } else {
            return this._canAfford(this.getCost(unit.name, false))
        }

    }
    _canAfford(cost) {
        // Input: cost object
        if (cost.minerals <= this.minerals && cost.vespene <= this.vespene && (cost.supply < 0 || cost.supply <= this.supplyLeft)) {
            return true
        }
        return false
    }
    
}


export {Event, GameLogic}


