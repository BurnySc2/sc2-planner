import { cloneDeep, isEqual, findIndex } from "lodash"

import { defaultOptimizeSettings } from "../constants/helper"
import { IBuildOrderElement, ISettingsElement, IAllRaces } from "../constants/interfaces"
import { GameLogic } from "../game_logic/gamelogic"
import { BO_ITEMS, workerNameByRace, supplyUnitNameByRace } from "../constants/bo_items"

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
    ): GameLogic | undefined {
        if (optimizationList.indexOf("maximizeWorkers") >= 0) {
            const maximizeWorkersOption1 = !!currentGamelogic.optimizeSettings[
                "maximizeWorkersOption1"
            ]
            const maximizeWorkersOption2 = !!currentGamelogic.optimizeSettings[
                "maximizeWorkersOption2"
            ]
            return this.maximizeWorkers(
                currentGamelogic,
                buildOrder,
                maximizeWorkersOption1,
                maximizeWorkersOption2
            )
        }

        if (optimizationList.indexOf("removeInjectsBeforeMaximizing") >= 0) {
            return this.maximizeInjects(currentGamelogic, buildOrder)
        }
    }

    removeFromBO(bo: IBuildOrderElement[], itemName: string): void {
        for (let i = 0; i < bo.length; i++) {
            const item = bo[i]
            if (item.name === itemName) {
                bo.splice(i, 1)
                i--
            }
        }
    }

    /**
     * Adds supply to a bo wherever it's needed
     * gamelogic is assumed to have been run until the end
     */
    addSupply(gamelogic: GameLogic): GameLogic {
        const supplyItem = supplyUnitNameByRace[this.race]
        let addedSupply = 0
        while (
            addedSupply < 15 &&
            gamelogic.errorMessage &&
            isEqual(gamelogic.requirements, [supplyItem])
        ) {
            // Start getting additional supply 1 bo item before the one needing it
            const bo = cloneDeep(gamelogic.bo)
            bo.splice(gamelogic.boIndex - 1, 0, supplyItem) //TODO2 minus [0, 1, 2, 3] should be tested here for perfect results, not just minus [1]
            addedSupply++
            gamelogic = this.simulateBo(bo)
        }
        return gamelogic
    }

    /**
     * Adds workers at each bo step while the bo doesn't end later
     */
    maximizeWorkers(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        buildOrder: Array<IBuildOrderElement>,
        removeWorkersBefore: boolean,
        addNecessarySupply: boolean
    ): GameLogic | undefined {
        const frameCountAllowed = currentGamelogic.frame
        const worker = BO_ITEMS[workerNameByRace[this.race]]
        const supplyItem = supplyUnitNameByRace[this.race]
        let initialWorkerCount = 0
        for (let unit of currentGamelogic.units) {
            if (unit.name === worker.name) {
                initialWorkerCount++
            }
        }

        const bo = cloneDeep(buildOrder)

        // Remove items before
        if (removeWorkersBefore) {
            this.removeFromBO(bo, worker.name)
        }

        // Remove supply before
        if (addNecessarySupply) {
            this.removeFromBO(bo, supplyItem.name)
        }

        let bestGameLogic: GameLogic = currentGamelogic
        let gamelogic: GameLogic = currentGamelogic
        let addedWorkerCount = 0
        for (let whereToAddWorker = 0; whereToAddWorker <= bo.length; whereToAddWorker++) {
            let isBetter = false
            if (whereToAddWorker < bo.length && bo[whereToAddWorker].name === worker.name) {
                continue
            }
            do {
                let boToTest = cloneDeep(bo)
                boToTest.splice(whereToAddWorker, 0, worker)
                gamelogic = this.simulateBo(boToTest)
                if (addNecessarySupply) {
                    gamelogic = this.addSupply(gamelogic)
                }
                isBetter = gamelogic.frame <= frameCountAllowed && !gamelogic.errorMessage
                if (isBetter) {
                    bo.splice(whereToAddWorker, 0, worker)
                    whereToAddWorker++
                    addedWorkerCount++
                    bestGameLogic = gamelogic
                }
            } while (
                isBetter ||
                initialWorkerCount + addedWorkerCount >= this.optimizeSettings.maximizeWorkers
            )
        }

        if (bestGameLogic === currentGamelogic) {
            return
        }
        //else
        return bestGameLogic
    }

    /**
     * Adds as many injects as possible
     */
    maximizeInjects(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        buildOrder: Array<IBuildOrderElement>
    ): GameLogic | undefined {
        const frameCountAllowed = currentGamelogic.frame
        const inject = BO_ITEMS["inject"]

        const bo = cloneDeep(buildOrder)

        // Remove items before
        if (this.optimizeSettings.removeInjectsBeforeMaximizing) {
            this.removeFromBO(bo, inject.name)
        }

        let bestGameLogic: GameLogic = currentGamelogic
        let gamelogic: GameLogic = currentGamelogic
        const firstQueenPosition = findIndex(bo, BO_ITEMS["Queen"])
        if (firstQueenPosition < 0) {
            return
        }
        for (
            let whereToAddInject = firstQueenPosition + 1;
            whereToAddInject <= bo.length;
            whereToAddInject++
        ) {
            let isBetter = false
            if (whereToAddInject < bo.length && bo[whereToAddInject].name === inject.name) {
                continue
            }
            do {
                let boToTest = cloneDeep(bo)
                boToTest.splice(whereToAddInject, 0, inject)
                gamelogic = this.simulateBo(boToTest)
                isBetter = gamelogic.frame <= frameCountAllowed && !gamelogic.errorMessage
                if (isBetter) {
                    bo.splice(whereToAddInject, 0, inject)
                    whereToAddInject++
                    bestGameLogic = gamelogic
                }
            } while (isBetter)
        }

        if (bestGameLogic === currentGamelogic) {
            return
        }
        //else
        return bestGameLogic
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
