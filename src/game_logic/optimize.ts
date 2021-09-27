import { cloneDeep, isEqual, findIndex, find, filter } from "lodash"

import { defaultOptimizeSettings, cancelableLog } from "../constants/helper"
import {
    IBuildOrderElement,
    ISettingsElement,
    IAllRaces,
    WebPageState,
    Log,
} from "../constants/interfaces"
import { CONVERT_SECONDS_TO_TIME_STRING, CONVERT_TIME_STRING_TO_SECONDS } from "../constants/helper"
import { GameLogic } from "./gamelogic"
import { BO_ITEMS, workerNameByRace, supplyUnitNameByRace } from "../constants/bo_items"
import { CUSTOMACTIONS_BY_NAME } from "../constants/customactions"
import UPGRADES_BY_NAME from "../constants/upgrade_by_name"
import UNITS_BY_NAME from "../constants/units_by_name"
import Event from "../game_logic/event"

export type OptimizationReturn = [Partial<WebPageState> | undefined, Log | undefined]

export type TimeConstraint = {
    type: "time"
    name: string
    pos: number
    after: number
    before: number
}
export type OrderConstraint = {
    type: "order"
    name: string
    pos: number
    followingName: string
    followingPos: number
}
export type Constraint = TimeConstraint | OrderConstraint

export type ConstraintType = "after" | "at" | "before" | "remove"

// Unused interface? TODO remove me
// interface MaxReordParams {
//     swapPos: number
//     boCode: string
//     bo: Array<IBuildOrderElement>
//     boCodes: { [code: string]: true }
//     bestGameLogic: GameLogic
//     improvedSinceStart: boolean
//     improvedSinceLastPass: boolean
// }

class OptimizeLogic {
    race: IAllRaces
    customSettings: Array<ISettingsElement>
    customOptimizeSettings: Array<ISettingsElement>
    constraintList: Constraint[]
    log: (line?: Log) => void
    optimizeSettings: { [name: string]: number | string }
    nameToCode: { [name: string]: string }

    constructor(
        race: IAllRaces = "terran",
        customSettings: Array<ISettingsElement> = [],
        customOptimizeSettings: Array<ISettingsElement> = [],
        log: (line?: Log) => void
    ) {
        this.optimizeSettings = {}
        this.loadOptimizeSettings(defaultOptimizeSettings)
        this.loadOptimizeSettings(customOptimizeSettings)

        this.race = race || ("terran" as IAllRaces)
        this.customSettings = customSettings
        this.customOptimizeSettings = customOptimizeSettings
        this.constraintList = getConstraintList(customOptimizeSettings)
        this.log = log

        let code = 1
        this.nameToCode = {}
        for (let name in UNITS_BY_NAME) {
            this.nameToCode[name] = String.fromCharCode(code++)
        }
        for (let name in CUSTOMACTIONS_BY_NAME) {
            this.nameToCode[name] = String.fromCharCode(code++)
        }
        for (let name in UPGRADES_BY_NAME) {
            this.nameToCode[name] = String.fromCharCode(code++)
        }
    }

    async optimizeBuildOrder(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        buildOrder: Array<IBuildOrderElement>,
        optimizationList: string[]
    ): Promise<OptimizationReturn> {
        let ret: OptimizationReturn = [undefined, undefined]
        if (optimizationList.indexOf("maximizeWorkers") >= 0) {
            const maximizeWorkersOption1 =
                !!currentGamelogic.optimizeSettings["maximizeWorkersOption1"]
            const maximizeWorkersOption2 =
                !!currentGamelogic.optimizeSettings["maximizeWorkersOption2"]
            const maximizeWorkersOption3 =
                !!currentGamelogic.optimizeSettings["maximizeWorkersOption3"]
            ret = await this.maximizeWorkers(
                currentGamelogic,
                buildOrder,
                maximizeWorkersOption1,
                maximizeWorkersOption2,
                maximizeWorkersOption3
            )
        }

        if (optimizationList.indexOf("maximizeNexusChronos") >= 0) {
            ret = await this.maximizeAddingItem(
                currentGamelogic,
                buildOrder,
                { name: "chronoboost_busy_nexus", type: "action" },
                !!this.optimizeSettings.maximizeNexusChronos
            )
        }

        if (optimizationList.indexOf("maximizeMULEs") >= 0) {
            ret = await this.maximizeAddingItem(
                currentGamelogic,
                buildOrder,
                { name: "call_down_mule", type: "action" },
                !!this.optimizeSettings.maximizeMULEs,
                BO_ITEMS["OrbitalCommand"]
            )
        }

        if (optimizationList.indexOf("maximizeInjects") >= 0) {
            ret = await this.maximizeAddingItem(
                currentGamelogic,
                buildOrder,
                { name: "inject", type: "action" },
                !!this.optimizeSettings.maximizeInjects,
                BO_ITEMS["Queen"]
            )
        }

        if (optimizationList.indexOf("improveByReordering") >= 0) {
            ret = await this.maximizeByReordering(currentGamelogic)
        }

        if (ret[0] !== undefined && ret[1] !== undefined) {
            ret[1].undo = { gamelogic: currentGamelogic, bo: buildOrder }
        }
        return ret
    }

    removeFromBO(bo: IBuildOrderElement[], itemName: string): number {
        let removeCount = 0
        for (let i = 0; i < bo.length; i++) {
            const item = bo[i]
            if (item.name === itemName) {
                removeCount++
                bo.splice(i, 1)
                i--
            }
        }
        return removeCount
    }

    /**
     * Adds supply to a bo wherever it's needed
     * gamelogic is assumed to have been run until the end
     */
    addSupply(gamelogic: GameLogic): [GameLogic, number] {
        const supplyItem = supplyUnitNameByRace[this.race]
        let addedSupply = 0
        let validatesConstraints = true
        while (
            addedSupply < 15 &&
            validatesConstraints &&
            gamelogic.errorMessage &&
            isEqual(gamelogic.requirements, [supplyItem])
        ) {
            // Start getting additional supply 1 bo item before the one needing it
            const bo = cloneDeep(gamelogic.bo)
            bo.splice(gamelogic.boIndex - 1, 0, cloneDeep(supplyItem)) //TODO2 minus [0, 1, 2, 3] should be tested here for perfect results, not just minus [1]
            addedSupply++
            gamelogic = this.simulateBo(bo)
            validatesConstraints = this.validatedConstraints(gamelogic)
        }
        return [gamelogic, addedSupply]
    }

    /**
     * Adds workers at each bo step while the bo doesn't end later
     */
    async maximizeWorkers(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        buildOrder: Array<IBuildOrderElement>,
        removeWorkersBefore: boolean,
        addNecessarySupply: boolean,
        removeSupplyBefore: boolean
    ): Promise<OptimizationReturn> {
        const currentFrameCount = currentGamelogic.frame
        const worker = BO_ITEMS[workerNameByRace[this.race]]
        let initialWorkerCount = 0
        for (let unit of currentGamelogic.units) {
            if (unit.name === worker.name) {
                initialWorkerCount++
            }
        }

        let initialBOWorkerCount = 0
        for (let item of currentGamelogic.bo) {
            if (item.name === worker.name) {
                initialBOWorkerCount++
            }
        }

        let bo = cloneDeep(buildOrder)

        // Remove items before
        if (removeWorkersBefore) {
            this.removeFromBO(bo, worker.name)
        }

        // Remove supply before
        if (removeSupplyBefore && addNecessarySupply) {
            const supplyItem = supplyUnitNameByRace[this.race]
            this.removeFromBO(bo, supplyItem.name)
        }

        let bestGameLogic: GameLogic = currentGamelogic
        let gamelogic: GameLogic = currentGamelogic
        let addedWorkerCount = 0
        let addedSupplyCount = 0
        for (let whereToAddWorker = 0; whereToAddWorker <= bo.length; whereToAddWorker++) {
            let isBetter = false
            if (whereToAddWorker < bo.length && bo[whereToAddWorker].name === worker.name) {
                continue
            }
            const percent = Math.round((whereToAddWorker / bo.length) * 100)
            const cancellationPromise = (
                await cancelableLog(this.log, {
                    notice: `${percent}%`,
                    temporary: true,
                })
            )()
            await Promise.race([
                cancellationPromise,
                // eslint-disable-next-line
                new Promise<void>((resolve) => {
                    let validatesConstraints: boolean
                    do {
                        let boToTest = cloneDeep(bo)
                        boToTest.splice(whereToAddWorker, 0, cloneDeep(worker))
                        gamelogic = this.simulateBo(boToTest)
                        validatesConstraints = this.validatedConstraints(gamelogic)
                        if (validatesConstraints) {
                            let addedSupply = 0
                            if (addNecessarySupply) {
                                ;[gamelogic, addedSupply] = this.addSupply(gamelogic)
                            }
                            isBetter =
                                gamelogic.frame <= currentFrameCount && !gamelogic.errorMessage
                            if (isBetter) {
                                bo = gamelogic.bo
                                addedWorkerCount += 1
                                addedSupplyCount += addedSupply
                                whereToAddWorker += 1 + addedSupply
                                bestGameLogic = gamelogic
                            }
                        }
                    } while (
                        (validatesConstraints && isBetter) ||
                        initialWorkerCount + addedWorkerCount >=
                            this.optimizeSettings.maximizeWorkers
                    )
                    resolve()
                }),
            ])
        }

        if (bestGameLogic === currentGamelogic) {
            return [
                undefined,
                {
                    notice: "No optimization could be performed",
                },
            ]
        }
        //else
        const supplyMessage = addedSupplyCount
            ? ` and ${addedSupplyCount} ${supplyUnitNameByRace[this.race].name}(s)`
            : ""
        const workerCountDiff = addedWorkerCount - initialBOWorkerCount
        const newWorkerCount =
            workerCountDiff !== 0 && initialBOWorkerCount > 1
                ? ` (${Math.abs(workerCountDiff)} ${
                      workerCountDiff < 0 ? "less" : "more"
                  } than before}`
                : ""
        return [
            {
                race: this.race,
                bo: bo,
                gamelogic: bestGameLogic,
                settings: this.customSettings,
                hoverIndex: -1,
            },
            {
                success: `Added ${addedWorkerCount} worker(s)${newWorkerCount}${supplyMessage}`,
            },
        ]
    }

    /**
     * Adds as many injects as possible
     */
    async maximizeAddingItem(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        buildOrder: Array<IBuildOrderElement>,
        itemToAdd: IBuildOrderElement,
        removeBefore: boolean,
        itemToStartAtt?: IBuildOrderElement
    ): Promise<OptimizationReturn> {
        const currentFrameCount = currentGamelogic.frame

        const bo = cloneDeep(buildOrder)

        // Remove items before
        const removedCount = removeBefore ? this.removeFromBO(bo, itemToAdd.name) : 0

        let bestGameLogic: GameLogic = currentGamelogic
        let gamelogic: GameLogic = currentGamelogic
        let addedItemsCount = -removedCount
        const firstQueenPosition = itemToStartAtt === undefined ? 0 : findIndex(bo, itemToStartAtt)
        if (itemToStartAtt !== undefined && firstQueenPosition < 0) {
            return [
                undefined,
                {
                    notice: `A ${itemToStartAtt.name} is needed before trying to maximize`,
                },
            ]
        }
        for (
            let whereToAddInject = firstQueenPosition + 1;
            whereToAddInject <= bo.length;
            whereToAddInject++
        ) {
            if (whereToAddInject < bo.length && bo[whereToAddInject].name === itemToAdd.name) {
                continue
            }

            const percent = Math.round((whereToAddInject / bo.length) * 100)
            const cancellationPromise = (
                await cancelableLog(this.log, {
                    notice: `${percent}%`,
                    temporary: true,
                })
            )()
            await Promise.race([
                cancellationPromise,
                // eslint-disable-next-line
                new Promise<void>((resolve) => {
                    let boToTest = cloneDeep(bo)
                    boToTest.splice(whereToAddInject, 0, cloneDeep(itemToAdd))
                    gamelogic = this.simulateBo(boToTest)
                    const validatesConstraints = this.validatedConstraints(gamelogic)
                    const isBetter = gamelogic.frame <= currentFrameCount && !gamelogic.errorMessage
                    if (validatesConstraints && isBetter) {
                        bo.splice(whereToAddInject, 0, cloneDeep(itemToAdd))
                        addedItemsCount++
                        bestGameLogic = gamelogic
                    }
                    resolve()
                }),
            ])
        }
        const asManyAsPossible = {
            notice: "There are as many as possible already",
        }
        if (bestGameLogic === currentGamelogic || isEqual(bestGameLogic.bo, currentGamelogic.bo)) {
            return [undefined, asManyAsPossible]
        }
        //else
        return [
            {
                race: this.race,
                bo: bo,
                gamelogic: bestGameLogic,
                settings: this.customSettings,
                hoverIndex: -1,
            },
            addedItemsCount === 0
                ? asManyAsPossible
                : {
                      success: `Added ${addedItemsCount}`,
                  },
        ]
    }

    /**
     * Reorder BO items as long as it makes it end sooner
     */
    async maximizeByReordering(
        initialGameLogic: GameLogic // Requires to have been run until the end
    ): Promise<OptimizationReturn> {
        const startTime = +new Date()
        let bo = cloneDeep(initialGameLogic.bo)
        let bestGameLogic: GameLogic = initialGameLogic
        let improvedSinceStart = false
        let boCode = this.boToCode(bo)
        let boCodes: { [code: string]: true } = {}
        let savedTime = 0
        const finalPass = 50
        for (let pass = 1; pass <= finalPass; pass++) {
            let improvedSinceLastPass = false
            let maxSwapPos = 0
            for (let swapPos = 0; swapPos < bo.length - 1; swapPos++) {
                maxSwapPos = Math.max(maxSwapPos, swapPos)
                const percent = Math.round((maxSwapPos / bo.length) * 100)
                const cancellationPromise = (
                    await cancelableLog(this.log, {
                        notice: `${percent}% of pass #${pass}${
                            savedTime ? `; so far, ${savedTime}s faster` : ""
                        }`,
                        temporary: true,
                    })
                )()
                await Promise.race([
                    cancellationPromise,
                    // eslint-disable-next-line
                    new Promise<void>((resolve) => {
                        const spreadingMax = bo.length - swapPos - 1
                        for (let spreading = 1; spreading <= spreadingMax; spreading++) {
                            const boCodeToTest = this.swapChars(
                                boCode,
                                swapPos,
                                swapPos + spreading
                            )
                            if (boCodeToTest === boCode || boCodes[boCodeToTest]) {
                                continue
                            }
                            //else
                            boCodes[boCodeToTest] = true

                            let boToTest = cloneDeep(bo)
                            this.swapBOItems(boToTest, swapPos, swapPos + spreading)

                            const gamelogic = this.simulateBo(boToTest)
                            const validatesConstraints = this.validatedConstraints(gamelogic)
                            const isBetter =
                                gamelogic.frame < bestGameLogic.frame && !gamelogic.errorMessage
                            if (validatesConstraints && isBetter) {
                                this.swapBOItems(bo, swapPos, swapPos + spreading)
                                bestGameLogic = gamelogic
                                boCode = boCodeToTest
                                improvedSinceStart = true
                                improvedSinceLastPass = true
                                swapPos = Math.max(-1, swapPos - 2)
                                break
                            }
                        }
                        resolve()
                    }),
                ])
            }
            const avoidedFramesCount = (initialGameLogic.frame - bestGameLogic.frame) / 22.4
            savedTime = Math.floor(avoidedFramesCount * 10) / 10

            if (!improvedSinceLastPass) {
                break
            }
        }

        if (improvedSinceStart) {
            const calculationsTime = Math.round((+new Date() - startTime) / 1000)
            return [
                {
                    race: this.race,
                    bo: bo,
                    gamelogic: bestGameLogic,
                    settings: this.customSettings,
                    hoverIndex: -1,
                },
                {
                    success: `Improved by ${savedTime}s (This took ${calculationsTime}s to calculate)`,
                },
            ]
        }
        // else

        return [
            undefined,
            {
                notice: "No adjacent swap could improve this BO",
            },
        ]
    }

    getEventLogFromConstraint(gamelogic: GameLogic, name: string, pos: number): Event {
        return filter(gamelogic.eventLog, { name })[pos]
    }

    validatedConstraints(gamelogic: GameLogic): boolean {
        for (let constraint of this.constraintList) {
            if (constraint.type === "time") {
                const eventLog: Event = this.getEventLogFromConstraint(
                    gamelogic,
                    constraint.name,
                    constraint.pos
                )
                if (eventLog) {
                    //Consider constraint as valid if item is not in the BO anymore
                    const endTime = Math.floor((eventLog.end || eventLog.start) / 22.4)
                    if (endTime < constraint.after || endTime > constraint.before) {
                        return false
                    }
                }
            } else if (constraint.type === "order") {
                const eventLog: Event = this.getEventLogFromConstraint(
                    gamelogic,
                    constraint.name,
                    constraint.pos
                )
                const eventLogPos: number = gamelogic.eventLog.indexOf(eventLog)
                const followingEventLog: Event = this.getEventLogFromConstraint(
                    gamelogic,
                    constraint.followingName,
                    constraint.followingPos
                )
                const followingEventLogPos: number = gamelogic.eventLog.indexOf(followingEventLog)
                if (
                    eventLogPos >= 0 &&
                    followingEventLogPos >= 0 &&
                    eventLogPos > followingEventLogPos
                ) {
                    return false
                }
            }
        }
        return true
    }

    boToCode(bo: Array<IBuildOrderElement>): string {
        return bo.map((item) => this.nameToCode[item.name]).join("")
    }

    swapChars(boCode: string, swapA: number, swapB = swapA + 1): string {
        return (
            boCode.slice(0, swapA) +
            boCode[swapB] +
            boCode.slice(swapA + 1, swapB) +
            boCode[swapA] +
            boCode.slice(swapB + 1)
        )
    }

    swapBOItems(bo: Array<IBuildOrderElement>, swapA: number, swapB = swapA + 1): void {
        const removedB = bo.splice(swapB, 1)
        const removedA = bo.splice(swapA, 1)
        bo.splice(swapA, 0, removedB[0])
        bo.splice(swapB, 0, removedA[0])
    }

    simulateBo(boToTest: IBuildOrderElement[]): GameLogic {
        const gamelogic = new GameLogic(
            this.race,
            boToTest,
            this.customSettings,
            this.customOptimizeSettings
        )
        gamelogic.setStart()
        gamelogic.runUntilEnd()
        return gamelogic
    }

    loadOptimizeSettings(customSettings: Array<ISettingsElement>) {
        for (let item of customSettings) {
            this.optimizeSettings[item.variableName] = item.v
        }
    }
}

export function getConstraintList(optimizeSettings: Array<ISettingsElement>): Constraint[] {
    const constraintSetting = find(optimizeSettings, { n: "c" })
    const list: Constraint[] = []
    if (constraintSetting) {
        for (let constraintStr of (constraintSetting.v as string).split(/\n/)) {
            const afterReg = constraintStr.match(/^([0-9:]+)<=?/)
            const beforeReg = constraintStr.match(/<=?([0-9:]+)$/)
            const after = afterReg ? CONVERT_TIME_STRING_TO_SECONDS(afterReg[1]) : -Infinity
            const before = beforeReg ? CONVERT_TIME_STRING_TO_SECONDS(beforeReg[1]) : Infinity
            if (afterReg || beforeReg) {
                const fullName = constraintStr
                    .replace(afterReg ? afterReg[0] : "", "")
                    .replace(beforeReg ? beforeReg[0] : "", "")
                const reg = fullName.match(/(.+)#([0-9]+)/)
                if (reg) {
                    const name = reg[1]
                    const pos = +reg[2] - 1
                    list.push({ type: "time", name, pos, after, before })
                }
            } else {
                // Could be item before other item constraint
                const tokens = constraintStr.split(/<?=/)
                if (tokens.length === 2) {
                    const firstReg = tokens[0].match(/(.+)#([0-9]+)/)
                    const secondReg = tokens[1].match(/(.+)#([0-9]+)/)
                    if (firstReg && secondReg) {
                        const name = firstReg[1]
                        const pos = +firstReg[2] - 1
                        const followingName = secondReg[1]
                        const followingPos = +secondReg[2] - 1
                        list.push({ type: "order", name, pos, followingName, followingPos })
                    }
                }
            }
        }
    }
    return list
}

export function setConstraintList(list: Constraint[]): string {
    const constraintList = filter(
        list.map((constraint: Constraint) => {
            if (constraint.type === "order") {
                return `${constraint.name}#${constraint.pos + 1}<=${constraint.followingName}#${
                    constraint.followingPos + 1
                }`
            }
            const afterStr =
                constraint.after === -Infinity
                    ? ""
                    : `${CONVERT_SECONDS_TO_TIME_STRING(constraint.after)}<=`
            const beforeStr =
                constraint.before === Infinity
                    ? ""
                    : `<=${CONVERT_SECONDS_TO_TIME_STRING(constraint.before)}`
            const nameStr = afterStr || beforeStr ? `${constraint.name}#${constraint.pos + 1}` : ""
            return `${afterStr}${nameStr}${beforeStr}`
        })
    )
    return constraintList.join("\n")
}

export { OptimizeLogic }
