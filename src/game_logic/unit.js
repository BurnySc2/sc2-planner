
import UNITS_BY_NAME from "../constants/units_by_name"

import Event from "./event"
import Task from "./task"

const UNIT_ICONS = require("../icons/unit_icons.json")
// const UPGRADE_ICONS = require("../icons/upgrade_icons.json")

let currentId = 0
const getUnitId = () => {
    currentId += 1
    return currentId
}

class Unit { 
    constructor(name) {
        this.name = name
        this.id = getUnitId()
        this.energy = 0
        this.tasks = []
        // Worker
        this.isMiningGas = false
        this.isScouting = false
        // Mule expires
        this.isAliveUntilFrame = -1
        // Protoss train and research structures
        this.hasChronoUntilFrame = 0
        // Zerg townhalls
        this.hasInjectUntilFrame = 0
        this.nextLarvaSpawn = -1
        this.larvaCount = 0
        this.larvaTasks = []
        // Terran depot
        this.hasSupplyDrop = false
        // Terran production structures
        this.hasTechlab = false
        this.hasReactor = false
        this.reactorTasks = []
    }

    /**
     * 
     * @param {Task} task 
     * @param {boolean} taskForReactor 
     * @param {boolean} taskForLarva 
     */
    addTask(task, taskForReactor=false, taskForLarva=false) {
        console.assert([true, false].includes(taskForReactor), taskForReactor)
        console.assert([true, false].includes(taskForLarva), taskForLarva)
        
        if (taskForReactor) {
            this.reactorTasks.push(task)
            return
        }
        if (taskForLarva) {
            this.larvaTasks.push(task)
            return
        }
        this.tasks.push(task)
    }

    isIdle() {
        // Returns true if it has no tasks, or has reactor and reactor has no tasks, or has larva
        return this.tasks.length === 0 || (this.hasReactor && this.reactorTasks.length === 0) || this.larvaCount > 0
    }
    
    isBusy() {
        // Returns true it has a task (hatchery builds queen, or hatchery's larva builds drone, or barrack's reactor builds a marine)
        return this.tasks.length > 0 || (this.hasReactor && this.reactorTasks.length > 0) || this.larvaTasks.length > 0
    }

    isMiningMinerals() {
        // Return true if worker is not scouting or mining vespene
        return this.isIdle && !this.isMiningGas && !this.isScouting
    }

    isAlive(frame) {
        // Function that checks if a unit expired (e.g. mule)
        return this.isAliveUntilFrame === -1 || frame < this.isAliveUntilFrame
    }

    hasChrono(gamelogic) {
        return this.hasChronoUntilFrame <= this.frame
    }

    addChrono(frame) {
        this.hasChronoUntilFrame = frame + 20 * 22.4
    }

    updateUnitState(gamelogic) {
        // Should be called every frame for each unit

        // Energy per frame
        this.energy = Math.min(200, this.energy + 0.03515625)

        // If is zerg townhall: generate new larva
        if (["Hatchery", "Lair", "Hive"].includes(this.name)) {
            // If at max larva, dont generate new one until 11 secs elapsed
            if (this.larvaCount >= 3) {
                this.nextLarvaSpawn = gamelogic.frame + 11 * 22.4
            }
            
            if (this.nextLarvaSpawn < gamelogic.frame) {
                this.larvaCount += 1
                this.nextLarvaSpawn = gamelogic.frame + 11 * 22.4
            }
            
            // If has inject: spawn larva when frame has been reached
            if (Math.round(this.hasInjectUntilFrame) === gamelogic.frame) {
                this.larvaCount += 3
            }
        }
    }
    
    updateTask(gamelogic, task) {
        // Task is a task class instance

        // TODO If structure has reactor: progress reactor-task too
        task.updateProgress(this.hasChrono())
        // Remove first task if completed
        if (task.isCompleted) {
            let unitData
            // Spawn worker
            if (task.newWorker !== null) {
                const newUnit = new Unit(task.newWorker)
                // TODO Add worker spawn delay and add them to busy units instead of idle units for up to 2 seconds
                gamelogic.units.add(newUnit)
                gamelogic.idleUnits.add(newUnit)
                gamelogic.workersMinerals += 1
                // console.log(gamelogic.frame);
                // console.log(newUnit);
                gamelogic.eventLog.push(new Event(
                    newUnit.name, UNIT_ICONS[newUnit.name.toUpperCase()], "worker", task.startFrame, gamelogic.frame
                ))
            }
            // Spawn unit
            if (task.newUnit !== null) {
                const newUnit = new Unit(task.newUnit)
                newUnit.energy = 50
                gamelogic.units.add(newUnit)
                gamelogic.idleUnits.add(newUnit)
                // console.log(gamelogic.frame);
                // console.log(newUnit);
                gamelogic.eventLog.push(new Event(
                    newUnit.name, UNIT_ICONS[newUnit.name.toUpperCase()], "unit", task.startFrame, gamelogic.frame
                ))
                unitData = UNITS_BY_NAME[task.newUnit]
                // Overlord finishes, overlord will have -8 supply
                if (unitData.supply < 0) {
                    gamelogic.supplyCap += -unitData.supply
                    gamelogic.supplyCap = Math.min(200, gamelogic.supplyCap)
                    gamelogic.supplyLeft = gamelogic.supplyCap - gamelogic.supplyUsed
                }
            }
            // Spawn structure
            if (task.newStructure !== null) {
                const newUnit = new Unit(task.newStructure)
                newUnit.energy = 50
                gamelogic.units.add(newUnit)
                gamelogic.idleUnits.add(newUnit)

                unitData = UNITS_BY_NAME[newUnit.name]
                
                if (unitData.is_townhall) {
                    gamelogic.baseCount += 1
                }
                
                if (unitData.needs_geyser) {
                    gamelogic.gasCount += 1
                }
                // Structure that gives supply finishes, structure will have -X supply
                unitData = UNITS_BY_NAME[task.newStructure]
                if (unitData.supply < 0) {
                    gamelogic.supplyCap += -unitData.supply
                    gamelogic.supplyCap = Math.min(200, gamelogic.supplyCap)
                    gamelogic.supplyLeft = gamelogic.supplyCap - gamelogic.supplyUsed
                }
                // console.log(gamelogic.frame);
                // console.log(newUnit);
                gamelogic.eventLog.push(new Event(
                    newUnit.name, UNIT_ICONS[newUnit.name.toUpperCase()], "structure", task.startFrame, gamelogic.frame
                ))
                
            }
            // Mark upgrade as researched
            if (task.newUpgrade !== null) {
                const newUpgrade = new Unit(task.newUpgrade)
                // gamelogic.units.add(newUpgrade)
                // gamelogic.idleUnits.add(newUpgrade)

                gamelogic.eventLog.push(new Event(
                    newUpgrade.name, UNIT_ICONS[newUpgrade.name.toUpperCase()], "upgrade", task.startFrame, gamelogic.frame
                ))
            }
            // Morph to unit
            if (task.morphToUnit !== null) {
                this.name = task.morphToUnit
                this.energy = 50

                const targetUnit = UNITS_BY_NAME[task.morphToUnit]
                const eventType = targetUnit.is_structure ? "structure" : "unit"
                gamelogic.eventLog.push(new Event(
                    targetUnit.name, UNIT_ICONS[targetUnit.name.toUpperCase()], eventType, task.startFrame, gamelogic.frame
                ))
            } 
            // Task is complete, mark for removal
            return true
        }
        return false
    }

    updateUnit(gamelogic) {
        // Should be called every for each busy unit (tasks.length + reactortasks.length > 0)

        // const wasIdle = this.isIdle()
        // const wasBusy = this.isBusy()

        // Update normal unit task
        if (this.tasks.length > 0) {
            const taskCompleted = this.updateTask(gamelogic, this.tasks[0])
            if (taskCompleted) {
                this.tasks.shift()
            }
        }
        // Update the task of the unit's reactor
        if (this.reactorTasks.length > 0) {
            const taskCompleted = this.updateTask(gamelogic, this.reactorTasks[0])
            if (taskCompleted) {
                this.reactorTasks.shift()
            }
        }
        // Larva is linked to the zerg townhalls: update all of them
        this.larvaTasks.forEach((task) => {
            this.updateTask(gamelogic, task)
        })
        // Remove completed tasks
        this.larvaTasks = this.larvaTasks.filter((item) => {
            return !item.isCompleted
        })

        // TODO expire chrono

        // Turn units idle if they have no more tasks (or reactor has no task or there is larva), and vice versa
        // if (!wasIdle && this.isIdle()) {
        //     gamelogic.idleUnits.add(this)
        // } else if (wasIdle && !this.isIdle()) {
        //     gamelogic.idleUnits.delete(this)
        // }
        if (this.isIdle()) {
            gamelogic.idleUnits.add(this)
        } else {
            gamelogic.idleUnits.delete(this)
        }
        // TODO Dont know which saves time, if is idle: keep adding, if not idle: keep deleting? or keep it like this?

        // Turn busy if was previously not busy, and vice versa
        // if (!wasBusy && this.isBusy()) {
        //     gamelogic.busyUnits.add(this)
        // } else if (wasBusy && !this.isBusy()) {
        //     gamelogic.busyUnits.delete(this)
        // }
        if (this.isBusy()) {
            gamelogic.busyUnits.add(this)
        } else {
            gamelogic.busyUnits.delete(this)
        }
    }
}
export default Unit