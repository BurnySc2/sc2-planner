import UNITS_BY_NAME from "../constants/units_by_name"

import Event from "./event"
import Task from "./task"
import { GameLogic } from "./gamelogic"

const UNIT_ICONS = require("../icons/unit_icons.json")
const UPGRADE_ICONS = require("../icons/upgrade_icons.json")

let currentId = 0
const getUnitId = () => {
    currentId += 1
    return currentId
}
const workerTypes = new Set(["SCV", "Probe", "Drone"])

class Unit {
    name: string
    id = -1
    energy = 0
    tasks: Array<Task>
    isMiningGas = false
    isScouting = false
    isAliveUntilFrame = -1
    hasChronoUntilFrame = -1
    hasInjectUntilFrame = -1
    nextLarvaSpawn = -1
    larvaCount = 0
    backgroundTask: Array<Task>
    hasSupplyDrop = false
    hasTechlab = false
    hasReactor = false
    isFlying = false
    addonTasks: Array<Task>

    constructor(name: string) {
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
        this.hasChronoUntilFrame = -1
        // Zerg townhalls
        this.hasInjectUntilFrame = -1
        this.nextLarvaSpawn = 10.71428571 * 22.4
        this.larvaCount = 0
        this.backgroundTask = []
        // Terran depot
        this.hasSupplyDrop = false
        // Terran production structures
        this.hasTechlab = false
        this.hasReactor = false
        this.isFlying = false
        this.addonTasks = []
    }

    /**
     * Adding a task will also turn the unit 'busy' - If no unit is busy anymore, the runUntilEnd() function will stop
     * @param {GameLogic} gamelogic
     * @param {Task} task
     * @param {Boolean} taskForReactor
     * @param {Boolean} taskForLarva
     */
    addTask(gamelogic: GameLogic, task: Task, taskForReactor = false, taskForLarva = false): void {
        // console.assert([true, false].includes(taskForReactor), taskForReactor)
        // console.assert([true, false].includes(taskForLarva), taskForLarva)
        gamelogic.busyUnits.add(this)

        if (taskForReactor) {
            this.addonTasks.push(task)
            return
        }
        if (taskForLarva) {
            this.backgroundTask.push(task)
            return
        }
        this.tasks.push(task)
    }

    /**
     * Returns true if it has no tasks, or has reactor and reactor has no tasks, or has larva
     */
    isIdle(): boolean {
        return (
            (this.tasks.length === 0 ||
                this.larvaCount > 0 ||
                (this.hasAddon() && this.addonTasks.length === 0)) &&
            !this.isFlying &&
            (!workerTypes.has(this.name) || (!this.isMiningGas && !this.isScouting))
        )
    }

    /**
     * Returns true it has a task (hatchery builds queen, or hatchery's larva builds drone, or barrack's reactor builds a marine)
     */
    isBusy(): boolean {
        return this.tasks.length > 0 || this.backgroundTask.length > 0 || this.addonTasks.length > 0
    }

    /**
     *
     */
    hasAddon(): boolean {
        return this.hasTechlab || this.hasReactor
    }

    /**
     * Return true if worker is not scouting and not mining vespene
     */
    isMiningMinerals(): boolean {
        return workerTypes.has(this.name) && this.isIdle() && !this.isMiningGas && !this.isScouting
    }

    /**
     * Function that checks if a unit expired (e.g. mule)
     */
    isAlive(frame: number): boolean {
        return this.isAliveUntilFrame === -1 || frame < this.isAliveUntilFrame
    }

    /**
     * Checks if chronoboost ran out
     */
    hasChrono(frame: number): boolean {
        return this.hasChronoUntilFrame !== -1 && this.hasChronoUntilFrame > frame
    }

    /**
     * Activates chronoboost, automatically calculates when it should run out
     */
    addChrono(startFrame: number): void {
        this.hasChronoUntilFrame = startFrame + 20 * 22.4
    }

    /**
     * Should be called every frame for each unit, spawns larva for zerg townhalls, advances in energy and injects
     */
    updateUnitState(gamelogic: GameLogic): void {
        // Energy per frame
        this.energy = Math.min(200, this.energy + 0.03515625)

        // If is zerg townhall: generate new larva
        if (["Hatchery", "Lair", "Hive"].includes(this.name)) {
            // If at max larva, dont generate new one until 11 secs elapsed
            if (this.larvaCount >= 3) {
                this.nextLarvaSpawn = gamelogic.frame + 10.71428571 * 22.4
            }

            if (this.nextLarvaSpawn <= gamelogic.frame) {
                this.larvaCount += 1
                this.nextLarvaSpawn = this.nextLarvaSpawn + 10.71428571 * 22.4
            }

            // If has inject: spawn larva when frame has been reached
            if (this.hasInjectUntilFrame !== -1 && this.hasInjectUntilFrame <= gamelogic.frame) {
                this.hasInjectUntilFrame = -1
                this.larvaCount += 3
            }
            gamelogic.raceSpecificResource += this.larvaCount
        }

        if (["Nexus", "OrbitalCommand"].includes(this.name)) {
            gamelogic.raceSpecificResource += Math.floor(this.energy / 50)
        }
    }

    /**
     * Progresses a task by 1 frame
     * If a task was completed, this function will fire events
     */
    updateTask(gamelogic: GameLogic, task: Task, isMainTask = false): boolean {
        if (isMainTask) {
            task.updateProgress(this.hasChrono(gamelogic.frame))
        } else {
            task.updateProgress()
        }
        // Remove first task if completed
        if (task.isCompleted) {
            let unitData
            // Spawn worker
            if (task.newWorker) {
                const newUnit = new Unit(task.newWorker)
                // TODO Add worker spawn delay and add them to busy units instead of idle units for up to 2 seconds
                gamelogic.units.add(newUnit)
                gamelogic.idleUnits.add(newUnit)
                gamelogic.workersMinerals += 1
                gamelogic.eventLog.push(
                    new Event(
                        newUnit.name,
                        UNIT_ICONS[newUnit.name.toUpperCase()],
                        "worker",
                        task.startFrame,
                        gamelogic.frame,
                        task.id,
                        task.startSupply
                    )
                )
            }
            // Spawn unit
            if (task.newUnit !== null) {
                const newUnit = new Unit(task.newUnit)
                newUnit.energy = ["Queen"].includes(task.newUnit) ? 25 : 50
                gamelogic.units.add(newUnit)
                gamelogic.idleUnits.add(newUnit)
                if (newUnit.name === "Zergling") {
                    gamelogic.units.add(newUnit)
                    gamelogic.idleUnits.add(newUnit)
                }
                gamelogic.eventLog.push(
                    new Event(
                        newUnit.name,
                        UNIT_ICONS[newUnit.name.toUpperCase()],
                        "unit",
                        task.startFrame,
                        gamelogic.frame,
                        task.id,
                        task.startSupply
                    )
                )
                unitData = UNITS_BY_NAME[task.newUnit]
                // Overlord finishes, overlord will have -8 supply
                if (unitData.supply < 0) {
                    gamelogic.increaseMaxSupply(-unitData.supply)
                }
            }
            // Spawn structure
            if (task.newStructure !== null) {
                if (task.newStructure.includes("TechLab")) {
                    this.hasTechlab = true
                } else if (task.newStructure.includes("Reactor")) {
                    this.hasReactor = true
                } else {
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
                }

                gamelogic.eventLog.push(
                    new Event(
                        task.newStructure,
                        UNIT_ICONS[task.newStructure.toUpperCase()],
                        "structure",
                        task.startFrame,
                        gamelogic.frame,
                        task.id,
                        task.startSupply
                    )
                )
            }
            // Mark upgrade as researched
            if (task.newUpgrade !== null) {
                // const newUpgrade = new Unit(task.newUpgrade)
                // gamelogic.units.add(newUpgrade)
                // gamelogic.idleUnits.add(newUpgrade)
                gamelogic.upgrades.add(task.newUpgrade)

                gamelogic.eventLog.push(
                    new Event(
                        task.newUpgrade,
                        UPGRADE_ICONS[task.newUpgrade.toUpperCase()],
                        "upgrade",
                        task.startFrame,
                        gamelogic.frame,
                        task.id,
                        task.startSupply
                    )
                )
            }
            // Morph to unit
            if (task.morphToUnit !== null) {
                this.name = task.morphToUnit
                this.energy = 50
                const targetUnit = UNITS_BY_NAME[task.morphToUnit]
                const eventType = targetUnit.is_structure ? "structure" : "unit"
                if (!["WarpGate", "Gateway"].includes(task.morphToUnit)) {
                    // Drone morphing to hatch or extractor
                    unitData = UNITS_BY_NAME[task.morphToUnit]
                    if (
                        unitData.is_townhall &&
                        !["OrbitalCommand", "PlanetaryFortress"].includes(this.name)
                    ) {
                        gamelogic.baseCount += 1
                    }

                    if (unitData.needs_geyser) {
                        gamelogic.gasCount += 1
                    }
                    if (!["Archon"].includes(task.morphToUnit)) {
                        gamelogic.eventLog.push(
                            new Event(
                                targetUnit.name,
                                UNIT_ICONS[targetUnit.name.toUpperCase()],
                                eventType,
                                task.startFrame,
                                gamelogic.frame,
                                task.id,
                                task.startSupply
                            )
                        )
                    }
                }
                if (task.morphToUnit === "Hatchery") {
                    gamelogic.increaseMaxSupply(6)
                }
            }
            // Attach addon
            if (task.addsTechlab) {
                this.hasTechlab = true
                // Event is already added in execute_action.js
            }
            if (task.addsReactor) {
                this.hasReactor = true
                // Event is already added in execute_action.js
            }
            // Dettach addon
            if (task.isLanding) {
                this.isFlying = false
                // Event is already added in execute_action.js
            }
            // Worker returns from building structure
            if (task.addMineralWorker) {
                gamelogic.workersMinerals += 1
            }

            // Task is complete, mark for removal
            return true
        }
        return false
    }

    /**
     * Updates the unit
     */
    updateUnit(gamelogic: GameLogic): void {
        // Should be called every for each busy unit (tasks.length + reactortasks.length > 0)

        // Update normal unit task
        if (this.tasks.length > 0) {
            const taskCompleted = this.updateTask(gamelogic, this.tasks[0], true)
            if (taskCompleted) {
                this.tasks.shift()
            }
        }
        // Update the task of the unit's reactor
        if (this.addonTasks.length > 0) {
            const taskCompleted = this.updateTask(gamelogic, this.addonTasks[0])
            if (taskCompleted) {
                this.addonTasks.shift()
            }
        }
        // Larva is linked to the zerg townhalls: update all of them
        this.backgroundTask.forEach((task) => {
            this.updateTask(gamelogic, task)
        })
        // Remove completed tasks
        this.backgroundTask = this.backgroundTask.filter((item) => {
            return !item.isCompleted
        })

        // Expire chrono
        if (this.hasChronoUntilFrame !== -1 && this.hasChronoUntilFrame <= gamelogic.frame) {
            this.hasChronoUntilFrame = -1
        }

        // Turn units idle if they have no more tasks (or reactor has no task or there is larva), and vice versa
        if (this.isIdle()) {
            gamelogic.idleUnits.add(this)
        } else {
            gamelogic.idleUnits.delete(this)
        }
        // TODO Dont know which saves time, if is idle: keep adding, if not idle: keep deleting? or keep it like this?

        // Turn busy if was previously not busy, and vice versa
        if (this.isBusy()) {
            gamelogic.busyUnits.add(this)
        } else {
            gamelogic.busyUnits.delete(this)
        }
    }
}
export default Unit
