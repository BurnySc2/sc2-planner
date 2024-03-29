import Event from "./event"
import Unit from "./unit"
import Task from "./task"
import { GameLogic } from "./gamelogic"
import { IBuildOrderElement } from "../constants/interfaces"
import { workerNameByRace, gasBuildingByRace } from "../constants/bo_items"
const { CUSTOMACTIONS_BY_NAME } = require("../constants/customactions")

const workerTypes = new Set(["SCV", "Probe", "Drone"])

const executeAction = (gamelogic: GameLogic, actionItem: IBuildOrderElement): boolean => {
    // Issue action
    const action = CUSTOMACTIONS_BY_NAME[actionItem.name]
    console.assert(action !== undefined, JSON.stringify(actionItem, null, 4))
    let actionCompleted = false

    // ALL RACES

    if (action.internal_name === "worker_to_mins") {
        gamelogic.errorMessage = "Could not find a worker that is mining vespene."
        gamelogic.requirements = [
            {
                name: "worker_to_gas",
                type: "action",
            },
        ]
        if (gamelogic.workersVespene > 0) {
            for (const unit of gamelogic.units) {
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
        gamelogic.errorMessage =
            "Could not find a worker that is mining minerals or a gas structure. Max allowed workers per gas are 3."
        gamelogic.requirements = [
            {
                name: gasBuildingByRace[gamelogic.race],
                type: "structure",
            },
        ]
        if (
            gamelogic.workersMinerals > 0 &&
            gamelogic.gasCount > 0 &&
            gamelogic.workersVespene + 1 <= gamelogic.gasCount * 3
        ) {
            for (const unit of gamelogic.idleUnits) {
                if (workerTypes.has(unit.name) && unit.isMiningMinerals()) {
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
        gamelogic.errorMessage =
            "Could not find three worker that are mining minerals or a gas structure. Max allowed workers per gas are 3."
        gamelogic.requirements = [
            {
                name: gasBuildingByRace[gamelogic.race],
                type: "structure",
            },
        ]
        if (
            gamelogic.workersMinerals >= 3 &&
            gamelogic.gasCount > 0 &&
            gamelogic.workersVespene + 3 <= gamelogic.gasCount * 3
        ) {
            const mineralWorkers = []
            for (const unit of gamelogic.idleUnits) {
                // Find 3 workers that are mining minerals
                if (workerTypes.has(unit.name) && unit.isMiningMinerals()) {
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
        gamelogic.errorMessage = "Could not find a worker that is mining minerals."
        gamelogic.requirements = [
            {
                name: workerNameByRace[gamelogic.race],
                type: "worker",
            },
        ]
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
        gamelogic.errorMessage = "Could not find a worker that is scouting."
        if (gamelogic.workersScouting > 0) {
            for (const unit of gamelogic.units) {
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
                    action.internal_name,
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
                    action.internal_name,
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

    if (action.internal_name === "chronoboost_busy_nexus") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                // Find target
                gamelogic.errorMessage = "No busy Nexus could be found."
                gamelogic.requirements = [
                    {
                        name: "Probe",
                        type: "unit",
                    },
                ]
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "Nexus" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_gateway") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Gateway could be found."
                gamelogic.requirements = [
                    {
                        name: "Zealot",
                        type: "unit",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "Gateway" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_warpgate") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Warpgate could be found."
                gamelogic.requirements = [
                    {
                        name: "Zealot",
                        type: "unit",
                    },
                    {
                        name: "convert_gateway_to_warpgate",
                        type: "action",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "WarpGate" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_cybercore") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Cybernetics Core could be found."
                gamelogic.requirements = [
                    {
                        name: "WarpGateResearch",
                        type: "upgrade",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "CyberneticsCore" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_forge") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Forge could be found."
                gamelogic.requirements = [
                    {
                        name: "ProtossGroundWeaponsLevel1",
                        type: "upgrade",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "Forge" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_robo") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Robotics Facility could be found."
                gamelogic.requirements = [
                    {
                        name: "Immortal",
                        type: "unit",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "RoboticsFacility" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_robotics_bay") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Robotics Bay could be found."
                gamelogic.requirements = [
                    {
                        name: "ExtendedThermalLance",
                        type: "upgrade",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "RoboticsBay" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_stargate") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Stargate could be found."
                gamelogic.requirements = [
                    {
                        name: "Phoenix",
                        type: "unit",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "Stargate" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_fleet_beacon") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Fleet Beacon could be found."
                gamelogic.requirements = [
                    {
                        name: "PhoenixRangeUpgrade",
                        type: "upgrade",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "FleetBeacon" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_twilight") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Twilight Council could be found."
                gamelogic.requirements = [
                    {
                        name: "Charge",
                        type: "upgrade",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "TwilightCouncil" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_templar_archive") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Templar Archive could be found."
                gamelogic.requirements = [
                    {
                        name: "PsiStormTech",
                        type: "upgrade",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "TemplarArchive" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "chronoboost_busy_dark_shrine") {
        // Find nexus with 50 energy
        for (const unit of gamelogic.units) {
            if (unit.name === "Nexus" && unit.energy >= 50) {
                gamelogic.errorMessage = "No busy Dark Shrine could be found."
                gamelogic.requirements = [
                    {
                        name: "DarkTemplarBlinkUpgrade",
                        type: "upgrade",
                    },
                ]
                // Find target
                for (const target of gamelogic.busyUnits) {
                    if (target.name === "DarkShrine" && target.hasChronoUntilFrame === -1) {
                        target.addChrono(gamelogic.frame)
                        unit.energy -= 50
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

    if (action.internal_name === "convert_gateway_to_warpgate") {
        gamelogic.errorMessage = "Required upgrade 'WarpGateResearch' not researched."
        gamelogic.requirements = [
            {
                name: "WarpGateResearch",
                type: "upgrade",
            },
        ]
        if (gamelogic.upgrades.has("WarpGateResearch")) {
            gamelogic.errorMessage = "Could not find a gateway."
            for (const unit of gamelogic.idleUnits) {
                if (unit.name === "Gateway" && !unit.isBusy()) {
                    const task = new Task(7 * 22.4, gamelogic.frame, gamelogic.supplyUsed, -1)
                    task.morphToUnit = "WarpGate"
                    unit.addTask(gamelogic, task)
                    actionCompleted = true
                    break
                }
            }
        }
    }

    if (action.internal_name === "convert_warpgate_to_gateway") {
        gamelogic.errorMessage = "Could not find a warpgate."
        gamelogic.requirements = [
            {
                name: "convert_gateway_to_warpgate",
                type: "action",
            },
        ]
        for (const unit of gamelogic.idleUnits) {
            if (unit.name === "WarpGate") {
                const task = new Task(7 * 22.4, gamelogic.frame, gamelogic.supplyUsed, -1)
                task.morphToUnit = "Gateway"
                unit.addTask(gamelogic, task)
                actionCompleted = true
                break
            }
        }
    }

    if (action.internal_name === "morph_archon_from_dt_dt") {
        gamelogic.errorMessage = "Could not find two dark templars."
        gamelogic.requirements = [
            {
                name: "DarkTemplar",
                type: "unit",
            },
            {
                name: "DarkTemplar",
                type: "unit",
            },
        ]
        for (const dt1 of gamelogic.idleUnits) {
            if (dt1.name === "DarkTemplar") {
                for (const dt2 of gamelogic.idleUnits) {
                    if (dt2.name === "DarkTemplar" && dt1.id !== dt2.id) {
                        const task = new Task(9 * 22.4, gamelogic.frame, gamelogic.supplyUsed, -1)
                        task.morphToUnit = "Archon"
                        dt1.addTask(gamelogic, task)
                        gamelogic.killUnit(dt2)
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

    if (action.internal_name === "morph_archon_from_ht_ht") {
        gamelogic.errorMessage = "Could not find two high templars."
        gamelogic.requirements = [
            {
                name: "HighTemplar",
                type: "unit",
            },
            {
                name: "HighTemplar",
                type: "unit",
            },
        ]
        for (const ht1 of gamelogic.idleUnits) {
            if (ht1.name === "HighTemplar") {
                for (const ht2 of gamelogic.idleUnits) {
                    if (ht2.name === "HighTemplar" && ht1.id !== ht2.id) {
                        const task = new Task(9 * 22.4, gamelogic.frame, gamelogic.supplyUsed, -1)
                        task.morphToUnit = "Archon"
                        ht1.addTask(gamelogic, task)
                        gamelogic.killUnit(ht2)
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

    if (action.internal_name === "morph_archon_from_ht_dt") {
        gamelogic.errorMessage = "Could not find one high templar and one dark templar."
        gamelogic.requirements = [
            {
                name: "HighTemplar",
                type: "unit",
            },
            {
                name: "DarkTemplar",
                type: "unit",
            },
        ]
        for (const dt of gamelogic.idleUnits) {
            if (dt.name === "DarkTemplar") {
                for (const ht of gamelogic.idleUnits) {
                    if (ht.name === "HighTemplar") {
                        const task = new Task(9 * 22.4, gamelogic.frame, gamelogic.supplyUsed, -1)
                        task.morphToUnit = "Archon"
                        dt.addTask(gamelogic, task)
                        gamelogic.killUnit(ht)
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

    // TERRAN

    if (action.internal_name === "call_down_mule") {
        gamelogic.errorMessage = "Could not find an orbital command."
        gamelogic.requirements = [
            {
                name: "OrbitalCommand",
                type: "structure",
            },
        ]
        for (const unit of gamelogic.units) {
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
        gamelogic.errorMessage = "Could not find an orbital command."
        gamelogic.requirements = [
            {
                name: "SupplyDepot",
                type: "structure",
            },
            {
                name: "OrbitalCommand",
                type: "structure",
            },
        ]
        for (const unit of gamelogic.units) {
            gamelogic.errorMessage = "Could not find a depopt with no supply drop."
            // Find orbital with >=50 energy
            if (unit.name === "OrbitalCommand" && unit.energy >= 50) {
                // Spawn temporary unit mule
                // TODO Might want to add mule spawn delay later? (2-3 seconds)
                for (const depot of gamelogic.units) {
                    if (depot.name === "SupplyDepot" && !depot.hasSupplyDrop) {
                        unit.energy -= 50
                        depot.hasSupplyDrop = true
                        gamelogic.increaseMaxSupply(8)
                        break
                    }
                }
                actionCompleted = true
                break
            }
        }
    }

    if (action.internal_name === "salvage_bunker") {
        gamelogic.errorMessage = "Could not find a Bunker."
        gamelogic.requirements = [
            {
                name: "Bunker",
                type: "structure",
            },
        ]
        for (const unit of gamelogic.units) {
            // Find any bunker
            if (unit.name === "Bunker") {
                gamelogic.killUnit(unit)
                actionCompleted = true
                gamelogic.minerals += 75
                break
            }
        }
    }

    // ATTACH TERRAN PRODUCTION TO FREE ADDONS

    const attach_to_addon = (structureName: string, attachReactor = false) => {
        if (!attachReactor) {
            if (gamelogic.freeTechlabs === 0) {
                gamelogic.errorMessage = "There are no free techlabs."
                gamelogic.requirements = [
                    {
                        name: `dettach_${structureName.toLowerCase()}_from_techlab`,
                        type: "action",
                    },
                ]
                return false
            }
        } else {
            if (gamelogic.freeReactors === 0) {
                gamelogic.errorMessage = "There are no free reactors."
                gamelogic.requirements = [
                    {
                        name: `dettach_${structureName.toLowerCase()}_from_reactor`,
                        type: "action",
                    },
                ]
                return false
            }
        }
        gamelogic.errorMessage = `Could not find a '${structureName}' without addons to attach to addon.`
        for (const unit of gamelogic.idleUnits) {
            if (unit.name === structureName && !unit.hasAddon() && !unit.isBusy()) {
                unit.isFlying = true
                const task = new Task(
                    +gamelogic.settings.addonSwapDelay * 22.4,
                    gamelogic.frame,
                    gamelogic.supplyUsed,
                    -1
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

    const dettach_from_addon = (structureName: string, dettachReactor = false) => {
        if (!dettachReactor) {
            gamelogic.errorMessage = `Could not find a '${structureName}' with Techlab to dettach from.`
            gamelogic.requirements = [
                {
                    name: structureName + "TechLab",
                    type: "structure",
                },
            ]
        } else {
            gamelogic.errorMessage = `Could not find a '${structureName}' with Reactor to attach to addon.`
            gamelogic.requirements = [
                {
                    name: structureName + "Reactor",
                    type: "structure",
                },
            ]
        }
        for (const unit of gamelogic.idleUnits) {
            if (
                unit.name === structureName &&
                ((!dettachReactor && unit.hasTechlab) || (dettachReactor && unit.hasReactor)) &&
                !unit.isBusy()
            ) {
                unit.isFlying = true
                const task = new Task(
                    +gamelogic.settings.addonSwapDelay * 22.4,
                    gamelogic.frame,
                    gamelogic.supplyUsed,
                    -1
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
        gamelogic.errorMessage = "Could not find a Queen to inject with."
        gamelogic.requirements = [
            {
                name: "Queen",
                type: "unit",
            },
        ]
        for (const queen of gamelogic.idleUnits) {
            // Find queen with >=25 energy
            if (queen.name === "Queen" && queen.energy >= 25) {
                gamelogic.errorMessage = "Could not find an inject target."
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
        gamelogic.errorMessage = "Could not find a Queen to create a Creep Tumor with."
        gamelogic.requirements = [
            {
                name: "Queen",
                type: "unit",
            },
        ]
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
                action.internal_name,
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
