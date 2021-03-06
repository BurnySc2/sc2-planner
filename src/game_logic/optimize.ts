import { cloneDeep, isEqual, findIndex } from "lodash"

import { defaultOptimizeSettings } from "../constants/helper"
import {
    IBuildOrderElement,
    ISettingsElement,
    IAllRaces,
    WebPageState,
    Log,
} from "../constants/interfaces"
import { GameLogic } from "../game_logic/gamelogic"
import { BO_ITEMS, workerNameByRace, supplyUnitNameByRace } from "../constants/bo_items"

export type OptimizationReturn = [Partial<WebPageState> | undefined, Log | undefined]

class OptimizeLogic {
    race: IAllRaces
    customSettings: Array<ISettingsElement>
    customOptimizeSettings: Array<ISettingsElement>
    optimizeSettings: { [name: string]: number }

    constructor(
        race: IAllRaces = "terran",
        customSettings: Array<ISettingsElement> = [],
        customOptimizeSettings: Array<ISettingsElement> = []
    ) {
        this.optimizeSettings = {}
        this.loadOptimizeSettings(defaultOptimizeSettings)
        this.loadOptimizeSettings(customOptimizeSettings)

        this.race = race || ("terran" as IAllRaces)
        this.customSettings = customSettings
        this.customOptimizeSettings = customOptimizeSettings
    }

    optimizeBuildOrder(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        buildOrder: Array<IBuildOrderElement>,
        optimizationList: string[]
    ): OptimizationReturn {
        let ret: OptimizationReturn = [undefined, undefined]
        if (optimizationList.indexOf("maximizeWorkers") >= 0) {
            const maximizeWorkersOption1 = !!currentGamelogic.optimizeSettings[
                "maximizeWorkersOption1"
            ]
            const maximizeWorkersOption2 = !!currentGamelogic.optimizeSettings[
                "maximizeWorkersOption2"
            ]
            const maximizeWorkersOption3 = !!currentGamelogic.optimizeSettings[
                "maximizeWorkersOption3"
            ]
            ret = this.maximizeWorkers(
                currentGamelogic,
                buildOrder,
                maximizeWorkersOption1,
                maximizeWorkersOption2,
                maximizeWorkersOption3
            )
        }

        if (optimizationList.indexOf("maximizeNexusChronos") >= 0) {
            ret = this.maximizeAddingItem(
                currentGamelogic,
                buildOrder,
                { name: "chronoboost_busy_nexus", type: "action" },
                !!this.optimizeSettings.maximizeNexusChronos
            )
        }

        if (optimizationList.indexOf("maximizeMULEs") >= 0) {
            ret = this.maximizeAddingItem(
                currentGamelogic,
                buildOrder,
                { name: "call_down_mule", type: "action" },
                !!this.optimizeSettings.maximizeMULEs,
                BO_ITEMS["OrbitalCommand"]
            )
        }

        if (optimizationList.indexOf("maximizeInjects") >= 0) {
            ret = this.maximizeAddingItem(
                currentGamelogic,
                buildOrder,
                { name: "inject", type: "action" },
                !!this.optimizeSettings.maximizeInjects,
                BO_ITEMS["Queen"]
            )
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
        while (
            addedSupply < 15 &&
            gamelogic.errorMessage &&
            isEqual(gamelogic.requirements, [supplyItem])
        ) {
            // Start getting additional supply 1 bo item before the one needing it
            const bo = cloneDeep(gamelogic.bo)
            bo.splice(gamelogic.boIndex - 1, 0, cloneDeep(supplyItem)) //TODO2 minus [0, 1, 2, 3] should be tested here for perfect results, not just minus [1]
            addedSupply++
            gamelogic = this.simulateBo(bo)
        }
        return [gamelogic, addedSupply]
    }

    /**
     * Adds workers at each bo step while the bo doesn't end later
     */
    maximizeWorkers(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        buildOrder: Array<IBuildOrderElement>,
        removeWorkersBefore: boolean,
        addNecessarySupply: boolean,
        removeSupplyBefore: boolean
    ): OptimizationReturn {
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
            do {
                let boToTest = cloneDeep(bo)
                boToTest.splice(whereToAddWorker, 0, cloneDeep(worker))
                gamelogic = this.simulateBo(boToTest)
                let addedSupply = 0
                if (addNecessarySupply) {
                    ;[gamelogic, addedSupply] = this.addSupply(gamelogic)
                }
                isBetter = gamelogic.frame <= currentFrameCount && !gamelogic.errorMessage
                if (isBetter) {
                    bo = gamelogic.bo
                    addedWorkerCount += 1
                    addedSupplyCount += addedSupply
                    whereToAddWorker += 1 + addedSupply
                    bestGameLogic = gamelogic
                }
            } while (
                isBetter ||
                initialWorkerCount + addedWorkerCount >= this.optimizeSettings.maximizeWorkers
            )
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
    maximizeAddingItem(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        buildOrder: Array<IBuildOrderElement>,
        itemToAdd: IBuildOrderElement,
        removeBefore: boolean,
        itemToStartAtt?: IBuildOrderElement
    ): OptimizationReturn {
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
            let boToTest = cloneDeep(bo)
            boToTest.splice(whereToAddInject, 0, cloneDeep(itemToAdd))
            gamelogic = this.simulateBo(boToTest)
            const isBetter = gamelogic.frame <= currentFrameCount && !gamelogic.errorMessage
            if (isBetter) {
                bo.splice(whereToAddInject, 0, cloneDeep(itemToAdd))
                addedItemsCount++
                bestGameLogic = gamelogic
            }
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

export { OptimizeLogic }
