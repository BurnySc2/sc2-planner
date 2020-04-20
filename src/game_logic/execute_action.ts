import Event from "./event"
import Unit from "./unit"
import Task from "./task"
import { GameLogic } from "./gamelogic"
import { IBuildOrderElement } from "../constants/interfaces"
const { CUSTOMACTIONS_BY_NAME } = require("../constants/customactions")

const workerTypes = new Set(["SCV", "Probe", "Drone"])

const executeAction = (
    gamelogic: GameLogic,
    actionItem: IBuildOrderElement
) => {
    // Issue action
    const action = CUSTOMACTIONS_BY_NAME[actionItem.name]
    console.assert(action !== undefined, JSON.stringify(actionItem, null, 4))
    let actionCompleted = false

    // ALL RACES

    if (action.internal_name === "worker_to_mins") {
        gamelogic.errorMessage = `Could not find a worker that is mining vespene.`
        if (gamelogic.workersVespene > 0) {
            for (const unit of gamelogic.idleUnits) {
                if (workerTypes.has(unit.name) && unit.isMiningGas) {
                    unit.isMiningGas = false
                    gamelogic.workersMinerals += 1
                    gamelogic.workersVespene -= 1
                    actionCompleted = true
                    break
                }
            }
        }
    }

    if (action.internal_name === "worker_to_gas") {
        gamelogic.errorMessage = `Could not find a worker that is mining minerals.`
        if (gamelogic.workersMinerals > 0) {
            for (const unit of gamelogic.idleUnits) {
                if (
                    gamelogic.gasCount > 0 &&
                    workerTypes.has(unit.name) &&
                    unit.isMiningMinerals()
                ) {
                    unit.isMiningGas = true
                    gamelogic.workersMinerals -= 1
                    gamelogic.workersVespene += 1
                    actionCompleted = true
                    break
                }
            }
        }
    }

    if (action.internal_name === "3worker_to_gas") {
        gamelogic.errorMessage = `Could not find three worker that are mining minerals.`
        if (gamelogic.workersMinerals >= 3) {
            const mineralWorkers = []
            for (const unit of gamelogic.idleUnits) {
                // console.log(unit);

                // Find 3 workers that are mining minerals
                if (
                    gamelogic.gasCount > 0 &&
                    workerTypes.has(unit.name) &&
                    unit.isMiningMinerals()
                ) {
                    mineralWorkers.push(unit)
                    if (mineralWorkers.length === 3) {
                        mineralWorkers.forEach((worker) => {
                            worker.isMiningGas = true
                        })
                        gamelogic.workersMinerals -= 3
                        gamelogic.workersVespene += 3
                        actionCompleted = true
                        break
                    }
                }
            }
        }
    }

    if (action.internal_name === "worker_to_scout") {
        gamelogic.errorMessage = `Could not find a worker that is mining minerals.`
        if (gamelogic.workersMinerals > 0) {
            for (const unit of gamelogic.idleUnits) {
                if (workerTypes.has(unit.name) && unit.isMiningMinerals()) {
                    unit.isScouting = true
                    gamelogic.workersMinerals -= 1
                    gamelogic.workersScouting += 1
                    actionCompleted = true
                    break
                }
            }
        }
    }

    if (action.internal_name === "worker_from_scout") {
        gamelogic.errorMessage = `Could not find a worker that is scouting.`
        if (gamelogic.workersScouting > 0) {
            for (const unit of gamelogic.idleUnits) {
                if (workerTypes.has(unit.name) && unit.isScouting) {
                    unit.isScouting = false
                    gamelogic.workersMinerals += 1
                    gamelogic.workersScouting -= 1
                    actionCompleted = true
                    break
                }
            }
        }
    }

    if (action.internal_name === "do_nothing_1_sec") {
        gamelogic.waitTime += 1
        if (gamelogic.waitTime >= 1 * 22.4) {
            gamelogic.waitTime = 0
            actionCompleted = true
            const start = gamelogic.frame - 22.4 * 1 + 1
            gamelogic.eventLog.push(
                new Event(
                    action.name,
                    action.imageSource,
                    "action",
                    start,
                    start + action.duration * 22.4,
                    gamelogic.getEventId(),
                    gamelogic.supplyUsed
                )
            )
            return true
        }
    }

    if (action.internal_name === "do_nothing_5_sec") {
        gamelogic.waitTime += 1
        if (gamelogic.waitTime >= 5 * 22.4) {
            gamelogic.waitTime = 0
            actionCompleted = true
            const start = gamelogic.frame - 22.4 * 5 + 1
            gamelogic.eventLog.push(
                new Event(
                    action.name,
                    action.imageSource,
                    "action",
                    start,
                    start + action.duration * 22.4,
                    gamelogic.getEventId(),
                    gamelogic.supplyUsed
                )
            )
            return true
        }
    }

    // PROTOSS

    if (action.internal_name === "convert_gateway_to_warpgate") {
        gamelogic.errorMessage = `Required upgrade 'WarpGateResearch' not researched.`
        if (gamelogic.upgrades.has("WarpGateResearch")) {
            gamelogic.errorMessage = `Could not find a gateway.`
            for (const unit of gamelogic.idleUnits) {
                if (unit.name === "Gateway") {
                    const task = new Task(
                        7 * 22.4,
                        gamelogic.frame,
                        gamelogic.supplyUsed,
                        gamelogic.getEventId()
                    )
                    task.morphToUnit = "WarpGate"
                    unit.addTask(gamelogic, task)
                    actionCompleted = true
                }
            }
        }
    }

    if (action.internal_name === "convert_warpgate_to_gateway") {
        gamelogic.errorMessage = `Could not find a warpgate.`
        for (const unit of gamelogic.idleUnits) {
            if (unit.name === "WarpGate") {
                const task = new Task(
                    7 * 22.4,
                    gamelogic.frame,
                    gamelogic.supplyUsed,
                    gamelogic.getEventId()
                )
                task.morphToUnit = "Gateway"
                unit.addTask(gamelogic, task)
                actionCompleted = true
            }
        }
    }

    if (action.internal_name === "morph_archon_from_dt_dt") {
        gamelogic.errorMessage = `Could not find two dark templars.`
        for (const dt1 of gamelogic.idleUnits) {
            if (dt1.name === "DarkTemplar") {
                for (const dt2 of gamelogic.idleUnits) {
                    if (dt2.name === "DarkTemplar" && dt1.id !== dt2.id) {
                        const task = new Task(
                            9 * 22.4,
                            gamelogic.frame,
                            gamelogic.supplyUsed,
                            gamelogic.getEventId()
                        )
                        task.morphToUnit = "Archon"
                        dt1.addTask(gamelogic, task)
                        gamelogic.killUnit(dt2)
                        actionCompleted = true
                    }
                }
            }
        }
    }

    if (action.internal_name === "morph_archon_from_ht_ht") {
        gamelogic.errorMessage = `Could not find two high templars.`
        for (const ht1 of gamelogic.idleUnits) {
            if (ht1.name === "DarkTemplar") {
                for (const ht2 of gamelogic.idleUnits) {
                    if (ht2.name === "DarkTemplar" && ht1.id !== ht2.id) {
                        const task = new Task(
                            9 * 22.4,
                            gamelogic.frame,
                            gamelogic.supplyUsed,
                            gamelogic.getEventId()
                        )
                        task.morphToUnit = "Archon"
                        ht1.addTask(gamelogic, task)
                        gamelogic.killUnit(ht2)
                        actionCompleted = true
                    }
                }
            }
        }
    }

    if (action.internal_name === "morph_archon_from_ht_dt") {
        gamelogic.errorMessage = `Could not find one high templar and one dark templar.`
        for (const dt of gamelogic.idleUnits) {
            if (dt.name === "DarkTemplar") {
                for (const ht of gamelogic.idleUnits) {
                    if (ht.name === "HighTemplar") {
                        const task = new Task(
                            9 * 22.4,
                            gamelogic.frame,
                            gamelogic.supplyUsed,
                            gamelogic.getEventId()
                        )
                        task.morphToUnit = "Archon"
                        dt.addTask(gamelogic, task)
                        gamelogic.killUnit(ht)
                        actionCompleted = true
                    }
                }
            }
        }
    }

    // TERRAN

    if (action.internal_name === "call_down_mule") {
        gamelogic.errorMessage = `Could not find an orbital command.`
        for (const unit of gamelogic.idleUnits) {
            // Find orbital with >=50 energy
            if (unit.name === "OrbitalCommand" && unit.energy >= 50) {
                unit.energy -= 50
                // Spawn temporary unit mule
                // TODO Might want to add mule spawn delay later? (2-3 seconds)
                const newUnit = new Unit("MULE")
                newUnit.isAliveUntilFrame = gamelogic.frame + 71 * 22.4
                gamelogic.units.add(newUnit)
                gamelogic.muleCount += 1
                actionCompleted = true
                break
            }
        }
    }

    if (action.internal_name === "call_down_supply") {
        gamelogic.errorMessage = `Could not find an orbital command.`
        for (const unit of gamelogic.idleUnits) {
            // Find orbital with >=50 energy
            if (unit.name === "OrbitalCommand" && unit.energy >= 50) {
                unit.energy -= 50
                // Spawn temporary unit mule
                // TODO Might want to add mule spawn delay later? (2-3 seconds)
                for (const depot of gamelogic.units) {
                    if (depot.name === "SupplyDepot" && !depot.hasSupplyDrop) {
                        depot.hasSupplyDrop = true
                        break
                    }
                }
                actionCompleted = true
                break
            }
        }
    }

    // ATTACH TERRAN PRODUCTION TO FREE ADDONS

    const attach_to_addon = (structureName: string, attachReactor = false) => {
        if (!attachReactor) {
            if (gamelogic.freeTechlabs === 0) {
                gamelogic.errorMessage = `There are no free techlabs.`
                return false
            }
        } else {
            if (gamelogic.freeReactors === 0) {
                gamelogic.errorMessage = `There are no free reactors.`
                return false
            }
        }
        gamelogic.errorMessage = `Could not find a '${structureName}' without addons to attach to addon.`
        for (const unit of gamelogic.idleUnits) {
            if (
                unit.name === structureName &&
                !unit.hasAddon() &&
                !unit.isBusy()
            ) {
                unit.isFlying = true
                const task = new Task(
                    gamelogic.settings.addonSwapDelay * 22.4,
                    gamelogic.frame,
                    gamelogic.supplyUsed,
                    gamelogic.getEventId()
                )
                if (!attachReactor) {
                    task.addsTechlab = true
                    gamelogic.freeTechlabs -= 1
                } else {
                    task.addsReactor = true
                    gamelogic.freeReactors -= 1
                }
                task.isLanding = true
                unit.addTask(gamelogic, task)
                actionCompleted = true
                return true
            }
        }
    }

    if (action.internal_name === "attach_barracks_to_free_techlab") {
        attach_to_addon("Barracks")
    }
    if (action.internal_name === "attach_barracks_to_free_reactor") {
        attach_to_addon("Barracks", true)
    }

    if (action.internal_name === "attach_factory_to_free_techlab") {
        attach_to_addon("Factory")
    }
    if (action.internal_name === "attach_factory_to_free_reactor") {
        attach_to_addon("Factory", true)
    }
    if (action.internal_name === "attach_starport_to_free_techlab") {
        attach_to_addon("Starport")
    }
    if (action.internal_name === "attach_starport_to_free_reactor") {
        attach_to_addon("Starport", true)
    }

    // DETTACH TERRAN PRODUCTION FROM ADDONS

    const dettach_from_addon = (
        structureName: string,
        dettachReactor = false
    ) => {
        if (!dettachReactor) {
            gamelogic.errorMessage = `Could not find a '${structureName}' with Techlab to dettach from.`
        } else {
            gamelogic.errorMessage = `Could not find a '${structureName}' with Reactor to attach to addon.`
        }
        for (const unit of gamelogic.idleUnits) {
            if (
                unit.name === structureName &&
                ((!dettachReactor && unit.hasTechlab) ||
                    (dettachReactor && unit.hasReactor)) &&
                !unit.isBusy()
            ) {
                unit.isFlying = true
                const task = new Task(
                    gamelogic.settings.addonSwapDelay * 22.4,
                    gamelogic.frame,
                    gamelogic.supplyUsed,
                    gamelogic.getEventId()
                )
                task.isLanding = true
                unit.addTask(gamelogic, task)
                if (!dettachReactor) {
                    gamelogic.freeTechlabs += 1
                    unit.hasTechlab = false
                } else {
                    gamelogic.freeReactors += 1
                    unit.hasReactor = false
                }
                actionCompleted = true
                return true
            }
        }
    }

    if (action.internal_name === "dettach_barracks_from_techlab") {
        dettach_from_addon("Barracks")
    }
    if (action.internal_name === "dettach_barracks_from_reactor") {
        dettach_from_addon("Barracks", true)
    }
    if (action.internal_name === "dettach_factory_from_techlab") {
        dettach_from_addon("Factory")
    }
    if (action.internal_name === "dettach_factory_from_reactor") {
        dettach_from_addon("Factory", true)
    }
    if (action.internal_name === "dettach_starport_from_techlab") {
        dettach_from_addon("Starport")
    }
    if (action.internal_name === "dettach_starport_from_reactor") {
        dettach_from_addon("Starport", true)
    }

    // ZERG

    if (action.internal_name === "inject") {
        gamelogic.errorMessage = `Could not find a Queen to inject with.`
        for (const queen of gamelogic.idleUnits) {
            // Find queen with >=25 energy
            if (queen.name === "Queen" && queen.energy >= 25) {
                gamelogic.errorMessage = `Could not find an inject target.`
                for (const hatch of gamelogic.idleUnits) {
                    // Find zerg townhall without inject
                    if (
                        ["Hatchery", "Lair", "Hive"].includes(hatch.name) &&
                        hatch.hasInjectUntilFrame === -1
                    ) {
                        queen.energy -= 25
                        hatch.hasInjectUntilFrame = gamelogic.frame + 29 * 22.4
                        actionCompleted = true
                        break
                    }
                }
            }
            if (actionCompleted) {
                break
            }
        }
    }
    if (action.internal_name === "creep_tumor") {
        gamelogic.errorMessage = `Could not find a Queen to create a Creep Tumor with.`
        for (const queen of gamelogic.idleUnits) {
            // Find queen with >=25 energy
            if (queen.name === "Queen" && queen.energy >= 25) {
                queen.energy -= 25
                const newUnit = new Unit("CreepTumor")
                gamelogic.units.add(newUnit)
                gamelogic.idleUnits.add(newUnit)
                actionCompleted = true
                break
            }
        }
    }

    if (actionCompleted) {
        // Add event
        gamelogic.eventLog.push(
            new Event(
                action.name,
                action.imageSource,
                "action",
                gamelogic.frame,
                gamelogic.frame + 22.4 * action.duration,
                gamelogic.getEventId(),
                gamelogic.supplyUsed
            )
        )
        return true
    }

    return false
}

export default executeAction
