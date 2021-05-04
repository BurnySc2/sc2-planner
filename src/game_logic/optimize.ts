import { cloneDeep } from "lodash"

import { defaultOptimizeSettings } from "../constants/helper"
import { IBuildOrderElement, ISettingsElement, IAllRaces } from "../constants/interfaces"
import { GameLogic } from "../game_logic/gamelogic"
import { BO_ITEMS, workerNameByRace } from "../constants/bo_items"

class OptimizeLogic {
    race: IAllRaces
    bo: Array<IBuildOrderElement>
    customSettings: Array<ISettingsElement>
    customOptimizeSettings: Array<ISettingsElement>
    optimizeSettings: { [name: string]: number }

    constructor(
        race: IAllRaces = "terran",
        bo: Array<IBuildOrderElement> = [],
        customSettings: Array<ISettingsElement> = [],
        customOptimizeSettings: Array<ISettingsElement> = []
    ) {
        this.optimizeSettings = {}
        this.loadOptimizeSettings(defaultOptimizeSettings)
        this.loadOptimizeSettings(customOptimizeSettings)

        this.race = race || ("terran" as IAllRaces)
        this.bo = bo
        this.customSettings = customSettings
        this.customOptimizeSettings = customOptimizeSettings
    }

    optimizeBuildOrder(
        currentGamelogic: GameLogic, // Used for comparison with future optimizations
        optimizationList: string[]
    ): any {
        if (optimizationList.indexOf("maximizeWorkers") >= 0) {
            return this.maximizeWorkers(currentGamelogic)
        }
    }

    /**
     * Adds workers at each bo step while the bo doesn't end later
     * TODO2 also add additional supply
     * TODO2 remove existing workers/supply if it allows to build more workers
     */
    maximizeWorkers(
        currentGamelogic: GameLogic // Used for comparison with future optimizations
    ): any {
        const currentFrameCount = currentGamelogic.frame
        const worker = BO_ITEMS[workerNameByRace[this.race]]
        let initialWorkerCount = 0
        for (let unit of currentGamelogic.units) {
            if (["SCV", "Probe", "Drone"].indexOf(unit.name) >= 0) {
                initialWorkerCount++
            }
        }

        const bo = cloneDeep(this.bo)

        let bestGameLogic: GameLogic = currentGamelogic
        let gamelogic: GameLogic = currentGamelogic
        let addedWorkerCount = 0
        for (let whereToAddWorker = 0; whereToAddWorker <= bo.length; whereToAddWorker++) {
            let isBetter = false
            do {
                const boToTest = cloneDeep(bo)
                boToTest.splice(whereToAddWorker, 0, worker)
                gamelogic = this.simulateBo(boToTest)
                isBetter = gamelogic.frame <= currentFrameCount && !gamelogic.errorMessage
                if (isBetter) {
                    bo.splice(whereToAddWorker, 0, worker)
                    whereToAddWorker++
                    addedWorkerCount++
                    bestGameLogic = gamelogic
                }
                //TODO1 use gamelogic.boIndex to identify error position and add supply before new worker if needed
            } while (
                isBetter ||
                initialWorkerCount + addedWorkerCount >= this.optimizeSettings.maximizeWorkers
            )
        }

        if (bestGameLogic === currentGamelogic) {
            return false
        }
        //else
        return {
            race: this.race,
            bo: bo,
            gamelogic: bestGameLogic,
            settings: this.customSettings,
            hoverIndex: -1,
        }
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
