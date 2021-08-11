import React, { Component } from "react"
import { RouteComponentProps, withRouter } from "react-router-dom"

import Title from "./Title"
import ImportExport from "./ImportExport"
import RaceSelection from "./RaceSelection"
import Time from "./Time"
import BuildOrder from "./BuildOrder"
import BOArea from "./BOArea"
import ActionsSelection from "./ActionSelection"
import Settings from "./Settings"
import { Optimize } from "./Optimize"
import Logging from "./Logging"
import Read from "./Read"
import Footer from "./Footer"
import ErrorMessage from "./ErrorMessage"
import { GameLogic } from "../game_logic/gamelogic"
import Event from "../game_logic/event"
import { OptimizeLogic, ConstraintType } from "../game_logic/optimize"
import {
    defaultSettings,
    defaultOptimizeSettings,
    decodeSettings,
    decodeOptimizeSettings,
    decodeBuildOrder,
    createUrlParams,
} from "../constants/helper"
import { cloneDeep, defaults, isEqual, remove, includes } from "lodash"
import {
    IBuildOrderElement,
    ISettingsElement,
    ICustomAction,
    IAllRaces,
    WebPageState,
    Log,
} from "../constants/interfaces"
import CLASSES from "../constants/classes"

interface Save {
    search: string
    insertIndex: number
    log?: Log
}

// Importing json doesnt seem to work with `import` statements, but have to use `require`

export default withRouter(
    class WebPage extends Component<RouteComponentProps, WebPageState> {
        onLogCallback: (line?: Log) => void = () => null
        onAddConstraint: (index: number, action: ConstraintType) => void = () => null
        history: Save[] = []
        historyPosition: number = 0
        currentLogLine?: Log

        // TODO I dont know how to fix these properly
        constructor(props: RouteComponentProps) {
            super(props)

            // Get information from url
            // is "" local dev, file:///home/burny/Github/sc2-planner-react/build/index.html local build, /sc2-planner/ on github pages
            this.state = this.getStateFromUrl(this.props.location.search)
            this.undoPush(this.state, this.props.location.search)
        }

        getStateFromUrl(urlSearch: string): WebPageState {
            const urlParams = new URLSearchParams(urlSearch)
            const raceUrl: string | null = urlParams.get("race")
            const settingsEncoded: string | null = urlParams.get("settings")
            const optimizeSettingsEncoded: string | null = urlParams.get("optimizeSettings")
            const boEncoded: string | null = urlParams.get("bo")

            let race: IAllRaces = "terran"
            if (raceUrl && ["terran", "protoss", "zerg"].includes(raceUrl)) {
                race = raceUrl as IAllRaces
            }

            // Decode settings from url
            let settings = cloneDeep(defaultSettings)
            if (settingsEncoded) {
                const decodedSettings = decodeSettings(settingsEncoded)
                // Override default settings from settings in url
                settings.forEach((item1) => {
                    decodedSettings.forEach((item2) => {
                        if (item1.n === item2.n) {
                            item1.v = item2.v
                        }
                    })
                })
            }

            // Decode optimize settings from url
            let optimizeSettings = cloneDeep(defaultOptimizeSettings)
            if (optimizeSettingsEncoded) {
                const decodedSettings = decodeOptimizeSettings(optimizeSettingsEncoded)
                // Override default optimizeSettings from optimizeSettings in url
                optimizeSettings.forEach((item1) => {
                    decodedSettings.forEach((item2) => {
                        if (item1.n === item2.n) {
                            item1.v = item2.v
                        }
                    })
                })
            }

            // Decode build order from url
            let bo: Array<IBuildOrderElement> = []
            if (boEncoded) {
                // Replace spaces with plus signs because somehow this is not retrieved
                let search = " "
                let replacement = "+"
                bo = decodeBuildOrder(boEncoded.split(search).join(replacement))
            }

            // Start the game logic with given settings and build order
            const gamelogic = new GameLogic(race, bo, settings, optimizeSettings)
            gamelogic.setStart()
            if (bo.length > 0) {
                // If a build order was given, simulate it
                gamelogic.runUntilEnd()
            }

            return {
                race: race,
                // Build order
                // Each element needs to have an .image attached and tooltip with: name, minerals, vespene, time
                bo: bo,
                gamelogic: gamelogic,
                settings: settings,
                optimizeSettings: optimizeSettings,
                // Index the mouse is hovering over
                hoverIndex: -1,
                highlightedIndexes: [],
                // Index at which new build order items should be inserted (selected index)
                insertIndex: bo.length,
                multilineBuildOrder: true,
                minimizedActionsSelection: false,
            }
        }

        updateHistory = (state: Partial<WebPageState>, pushHistory = false) => {
            const race: IAllRaces = state?.race || state?.gamelogic?.race || "terran"
            const settings: Array<ISettingsElement> =
                state?.settings || state?.gamelogic?.customSettings || []
            const optimizeSettings: Array<ISettingsElement> =
                state?.optimizeSettings || state?.gamelogic?.customOptimizeSettings || []
            const buildOrder: Array<IBuildOrderElement> = state?.bo || state?.gamelogic?.bo || []
            // See router props
            const newUrl = createUrlParams(race, settings, optimizeSettings, buildOrder)

            // Change current url
            if (pushHistory) {
                this.props.history.push(`${newUrl}`)
            } else {
                this.props.history.replace(`${newUrl}`)
            }

            this.undoPush(state, newUrl)
        }

        undoPush(state: Partial<WebPageState>, search?: string): void {
            if (search === undefined) {
                search = createUrlParams(
                    state.race || state.gamelogic?.race,
                    state.gamelogic?.customSettings,
                    state.gamelogic?.customOptimizeSettings,
                    state.bo || state.gamelogic?.bo
                )
            }
            const prevSearch = this.history[this.historyPosition - 1]?.search
            if (prevSearch === search) {
                return
            }
            this.history.splice(this.historyPosition)
            this.history.push({
                search,
                insertIndex: state?.insertIndex || 0,
                log: this.currentLogLine,
            })
            this.historyPosition = this.history.length
        }

        restoreSave(save: Save): void {
            this.props.history.replace(save.search)
            const state = this.getStateFromUrl(save.search)
            state.insertIndex = save.insertIndex
            this.setState(state)
            this.logRestore(save.log)
        }

        undo = () => {
            if (this.historyPosition === 1) {
                return
            }
            this.historyPosition--
            const save = this.history[this.historyPosition - 1]
            this.restoreSave(save)
        }

        redo(): void {
            if (this.historyPosition === this.history.length) {
                return
            }
            const save = this.history[this.historyPosition]
            this.historyPosition++
            this.restoreSave(save)
        }

        rerunBuildOrder(
            gamelogic: GameLogic,
            buildOrder: Array<IBuildOrderElement>,
            doSetState = true
        ): Partial<WebPageState> {
            const newGamelogic = GameLogic.simulatedBuildOrder(gamelogic, buildOrder)
            const state = {
                race: newGamelogic.race,
                bo: buildOrder,
                gamelogic: newGamelogic,
                settings: newGamelogic.customSettings,
                hoverIndex: -1,
            }
            if (doSetState) {
                this.setState(state)
            }
            return state
        }

        // TODO Pass the settings to Settings.js and let the user input handle it
        updateSettings = (fieldKey: string, fieldValue: number) => {
            const settings = this.state.settings
            settings.forEach((item) => {
                if (item.n === fieldKey) {
                    item.v = fieldValue
                }
            })

            // Re-calculate the whole simulation
            // TODO optimize: only recalculate if settings were changed that affected it
            const gamelogic = new GameLogic(
                this.state.race,
                this.state.bo,
                cloneDeep(settings),
                this.state.optimizeSettings
            )
            this.rerunBuildOrder(gamelogic, this.state.bo)
            this.updateHistory({ gamelogic })
        }

        updateOptimize = (fieldKey: string, fieldValue: number | string, doRerunBO = true) => {
            const optimizeSettings = this.state.optimizeSettings
            optimizeSettings.forEach((item) => {
                if (item.n === fieldKey) {
                    item.v = fieldValue
                }
            })

            // Re-calculate the whole simulation
            // TODO optimize: only recalculate if settings were changed that affected it
            const gamelogic = new GameLogic(
                this.state.race,
                this.state.bo,
                this.state.settings,
                cloneDeep(optimizeSettings)
            )
            if (doRerunBO) {
                this.rerunBuildOrder(gamelogic, this.state.bo)
            }
            this.updateHistory({ gamelogic })
        }

        applyOpitimization = async (optimizationList: string[]): Promise<Log | undefined> => {
            const optimize = new OptimizeLogic(
                this.state.race,
                this.state.settings,
                this.state.optimizeSettings,
                this.log
            )
            const [state, log] = await optimize.optimizeBuildOrder(
                this.state.gamelogic,
                this.state.bo,
                optimizationList
            )
            if (state !== undefined) {
                this.setState(state as WebPageState)
                defaults(state, this.state)
                this.updateHistory(state)
            }
            return log
        }

        raceSelectionClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            race: IAllRaces
        ) => {
            // Set race in state after a race selection icon has been pressed
            const gamelogic = new GameLogic(
                race,
                [],
                this.state.settings,
                this.state.optimizeSettings
            )
            gamelogic.setStart()
            const newState = {
                race: race,
                bo: [],
                gamelogic: gamelogic,
                insertIndex: 0,
            }
            this.setState(newState)

            // If settings are unchanged, change url to just '/race' instead of encoded settings
            this.updateHistory(newState, true)
            // this.props.history.replace(`/${race}`)
            // this.props.history.push(`/race=${race}`)
        }

        // item.type is one of ["worker", "action", "unit", "structure", "upgrade"]
        addItemToBO = (item: IBuildOrderElement, doUpdateHistory = true): Partial<WebPageState> => {
            const [gamelogic, insertedItems] = GameLogic.addItemToBO(
                this.state.gamelogic,
                item,
                this.state.insertIndex
            )

            // Increment index because we appended a new build order item
            const state = {
                bo: gamelogic.bo,
                gamelogic: gamelogic,
                insertIndex: this.state.insertIndex + insertedItems,
            }
            this.setState(state)
            if (doUpdateHistory) {
                this.updateHistory(state)
            }
            return state
        }

        removeAllItemFromBO = (index: number) => {
            const bo = this.state.bo
            const itemToRemove = cloneDeep(bo[index])
            let removedCount = bo.length
            remove(bo, (item, i) => i >= index && isEqual(item, itemToRemove))
            removedCount += bo.length
            this.updateBO(bo, removedCount)
        }

        removeItemFromBO = (index: number) => {
            const bo = this.state.bo
            bo.splice(index, 1)
            this.updateBO(bo, 1)
        }

        // Start the item earlier without delaying any item
        preponeItemFromBO = (
            index: number,
            canDelayAnythingButLastItem: boolean,
            doUpdateHistory = true,
            bo?: Array<IBuildOrderElement>,
            gamelogic?: GameLogic
        ) => {
            bo = bo || this.state.bo
            gamelogic = gamelogic || this.state.gamelogic
            index = index === -1 ? bo.length - 1 : index
            const deleted = bo.splice(index, 1)
            let pushDistance
            for (pushDistance = 1; pushDistance <= index; pushDistance++) {
                bo.splice(index - pushDistance, 0, deleted[0])
                const state = this.rerunBuildOrder(gamelogic, bo, false)
                bo.splice(index - pushDistance, 1)
                if (
                    !state.gamelogic ||
                    state.gamelogic.errorMessage ||
                    state.gamelogic.frame > gamelogic.frame + 3
                ) {
                    break
                }
                if (!canDelayAnythingButLastItem) {
                    let isLate = false
                    for (let pos = index - pushDistance; pos < bo.length; pos++) {
                        if (
                            state.gamelogic.eventLog[pos + 1].start >
                            gamelogic.eventLog[pos].start + 3
                        ) {
                            isLate = true
                            break
                        }
                    }
                    if (isLate) {
                        break
                    }
                }
            }
            bo.splice(index - pushDistance + 1, 0, deleted[0])
            if (pushDistance === 1) {
                this.log({ notice: "Can't be preponed", temporary: true, autoClose: true })
            } else {
                this.log({
                    notice: `Preponed by ${pushDistance - 1} item(s)`,
                    temporary: true,
                    autoClose: true,
                })
                this.updateBO(bo, 0, undefined, doUpdateHistory)
            }
        }

        updateBO = (
            bo: IBuildOrderElement[],
            removedCount: number = 0,
            state?: Partial<WebPageState>,
            doUpdateHistory = true
        ) => {
            // TODO load snapshot from shortly before the removed bo index
            if (bo.length > 0) {
                state = state || this.rerunBuildOrder(this.state.gamelogic, bo)
                if (this.state.insertIndex > this.state.hoverIndex) {
                    const stateUpdate = {
                        insertIndex: Math.max(0, this.state.insertIndex - removedCount),
                    }
                    state.insertIndex = stateUpdate.insertIndex
                    this.setState(stateUpdate)
                }
            } else {
                const gamelogic = new GameLogic(
                    this.state.race,
                    bo,
                    this.state.settings,
                    this.state.optimizeSettings
                )
                gamelogic.setStart()
                const state: Partial<WebPageState> = {
                    bo: bo,
                    gamelogic: gamelogic,
                    hoverIndex: -1,
                    insertIndex: 0,
                }
                this.setState(state as any)
            }
            if (doUpdateHistory && state) {
                this.updateHistory(state)
            }
        }

        preponeEventHandler(
            e: React.MouseEvent<HTMLElement, MouseEvent>,
            index = -1,
            doUpdateHistory = true,
            bo?: Array<IBuildOrderElement>,
            gamelogic?: GameLogic
        ): boolean {
            if (e.shiftKey) {
                this.preponeItemFromBO(index, e.ctrlKey, doUpdateHistory, bo, gamelogic)
                return true
            }
            return false
        }

        updateHistoryFromState(): void {
            this.updateHistory({
                bo: this.state.bo,
                gamelogic: this.state.gamelogic,
                insertIndex: this.state.insertIndex,
            })
        }

        // If a button is pressed in the action selection, add it to the build order
        // Then re-calculate the resulting time of all the items
        // Then send all items and events to the BOArea
        actionSelectionClicked(
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            item: IBuildOrderElement
        ): void {
            const state: Partial<WebPageState> = this.addItemToBO(item, false)
            const addedItemIndex = (state.insertIndex || 0) - 1
            this.preponeEventHandler(e, addedItemIndex, true, state.bo, state.gamelogic)
            this.updateHistoryFromState()
        }
        actionSelectionActionClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            action: ICustomAction
        ) => {
            this.actionSelectionClicked(e, {
                name: action.internal_name,
                type: "action",
            })
        }

        actionSelectionUnitClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            unit: string
        ) => {
            const isWorker = ["SCV", "Probe", "Drone"].indexOf(unit) >= 0
            this.actionSelectionClicked(e, {
                name: unit,
                type: isWorker ? "worker" : "unit",
            })
        }

        actionSelectionStructureClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            structure: string
        ) => {
            this.actionSelectionClicked(e, {
                name: structure,
                type: "structure",
            })
        }

        actionSelectionUpgradeClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            upgrade: string
        ) => {
            this.addItemToBO(
                {
                    name: upgrade,
                    type: "upgrade",
                },
                false
            )
            this.preponeEventHandler(e)
            this.updateHistoryFromState()
        }

        buildOrderClicked = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
            if (this.preponeEventHandler(e, index)) {
                this.updateHistoryFromState()
            } else {
                if (e.ctrlKey && !e.shiftKey) {
                    this.removeAllItemFromBO(index)
                } else {
                    this.removeItemFromBO(index)
                }
            }
        }

        changeHoverIndex = (index: number) => {
            this.setState({
                hoverIndex: index,
            })
        }

        changeHighlight = (highlightedItem?: Event) => {
            if (highlightedItem) {
                const toBeHighlighted: number[] = []
                let index = 0
                for (let item of this.state.gamelogic.eventLog) {
                    if (highlightedItem.start <= item.start && item.start <= highlightedItem.end) {
                        toBeHighlighted.push(index)
                    }
                    index++
                }
                this.setState({
                    highlightedIndexes: toBeHighlighted,
                })
            } else {
                this.setState({
                    highlightedIndexes: [],
                })
            }
        }

        changeInsertIndex = (index: number) => {
            if (this.historyPosition > 0) {
                this.history[this.historyPosition - 1].insertIndex = index
            }
            this.setState({
                insertIndex: index,
            })
        }

        handleKeyDown = (e: KeyboardEvent) => {
            // Undo/redo
            if (e.metaKey || e.ctrlKey) {
                // metaKey is for macs
                if (e.key === "y" || e.key === "Y") {
                    this.redo()
                    e.preventDefault()
                    return
                } else if (e.key === "z" || e.key === "Z") {
                    if (e.shiftKey) {
                        // On macs, Cmd+Shift+z is redo
                        this.redo()
                    } else {
                        this.undo()
                    }
                    e.preventDefault()
                    return
                }
            }

            //Optimize constraints
            const keyToConstraintType: { [key: string]: ConstraintType } = {
                e: "after",
                E: "after",
                r: "at",
                R: "at",
                t: "before",
                T: "before",
                y: "remove",
                Y: "remove",
            }
            if (!e.ctrlKey && includes(Object.keys(keyToConstraintType), e.key)) {
                this.onAddConstraint(this.state.hoverIndex, keyToConstraintType[e.key])
            }

            // Handle keyboard presses: Arrow keys (left / right) to change insert-index
            let currentIndex = this.state.insertIndex
            let targetIndex = currentIndex
            // Move to the right with arrow key right, allow ctrl and shift modifiers
            if (!["ArrowLeft", "ArrowRight"].includes(e.key) || e.repeat) {
                return
            }

            if (e.ctrlKey && e.key === "ArrowLeft") {
                // Move all the way to the left if ctrl + left arrow
                targetIndex = 0
            } else if (e.ctrlKey && e.key === "ArrowRight") {
                // Move all the way to the right if ctrl + right arrow
                targetIndex = this.state.gamelogic.boIndex
            } else {
                let moveAmount = 1
                // Allow shift modifier to move in steps of 5
                if (e.shiftKey) {
                    moveAmount = 5
                }
                if (e.key === "ArrowLeft") {
                    moveAmount = -moveAmount
                }
                targetIndex = Math.max(
                    0,
                    Math.min(this.state.gamelogic.boIndex, currentIndex + moveAmount)
                )
            }
            // TODO Move the scroll bar
            this.changeInsertIndex(targetIndex)
        }

        componentDidMount() {
            window.addEventListener("keydown", this.handleKeyDown)
        }

        componentWillUnmount() {
            window.removeEventListener("keydown", this.handleKeyDown)
        }

        onMultiline = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            this.setState({
                multilineBuildOrder: !this.state.multilineBuildOrder,
            })
        }

        onMinimize = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            this.setState({
                minimizedActionsSelection: !this.state.minimizedActionsSelection,
            })
        }

        getOnAddConstraint(callback: (index: number, action: ConstraintType) => void): void {
            this.onAddConstraint = callback
        }

        logRestore = (log?: Log) => {
            this.currentLogLine = log
            this.onLogCallback(log)
        }

        log = (log?: Log, temporary?: boolean) => {
            this.currentLogLine = log
            if (!temporary && !log?.temporary) {
                this.history[this.historyPosition - 1].log = log
            }
            this.onLogCallback(log)
        }

        onLog = (callback: (line?: Log) => void) => {
            this.onLogCallback = callback
        }

        render() {
            const read = !Read.isSupported() ? (
                ""
            ) : (
                <Read gamelogic={this.state.gamelogic} log={this.log} />
            )
            return (
                <div
                    className={`flex flex-col h-screen justify-between ${CLASSES.backgroundcolor}`}
                >
                    <div className="flex flex-col">
                        <Title />
                        <div className="select-none flex flex-row items-end">
                            <ImportExport
                                gamelogic={this.state.gamelogic}
                                rerunBuildOrder={(bo) =>
                                    this.rerunBuildOrder(this.state.gamelogic, bo)
                                }
                                updateUrl={(race, bo, settings, optimizeSettings) =>
                                    this.updateHistory(
                                        { race, bo, settings, optimizeSettings },
                                        true
                                    )
                                }
                            />
                            <Settings
                                settings={this.state.settings}
                                updateSettings={this.updateSettings}
                            />
                            <Optimize
                                race={this.state.race}
                                optimizeSettings={this.state.optimizeSettings}
                                updateOptimize={this.updateOptimize}
                                applyOpitimization={this.applyOpitimization}
                                gamelogic={this.state.gamelogic}
                                getOnAddConstraint={this.getOnAddConstraint.bind(this)}
                                log={this.log}
                            />
                            {read}
                            <Logging onLog={this.onLog} undo={() => this.undo()} />

                            <div className="absolute w-full h-0 text-right">
                                <div className="w-6 inline-block">
                                    <div
                                        className={
                                            CLASSES.tinyButtons +
                                            (this.state.multilineBuildOrder ? "" : " text-lg") +
                                            " ml-auto"
                                        }
                                        onClick={(e) => this.onMultiline(e)}
                                    >
                                        {this.state.multilineBuildOrder ? "―" : "≡"}
                                    </div>
                                </div>

                                <div
                                    className={
                                        (this.state.minimizedActionsSelection ? "w-8" : "w-3/12") +
                                        " inline-block"
                                    }
                                >
                                    <div
                                        className={CLASSES.tinyButtons + " ml-auto"}
                                        onClick={(e) => this.onMinimize(e)}
                                    >
                                        {this.state.minimizedActionsSelection ? "🗖" : "🗕"}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`flex flex-row  ${CLASSES.backgroundcolor}`}>
                            <div
                                className={
                                    this.state.minimizedActionsSelection ? "w-full" : "w-9/12"
                                }
                            >
                                <div className="select-none flex flex-row bg-indigo-400 m-1 p-1 items-center">
                                    <RaceSelection onClick={this.raceSelectionClicked} />
                                    <Time gamelogic={this.state.gamelogic} />
                                    <BuildOrder
                                        gamelogic={this.state.gamelogic}
                                        hoverIndex={this.state.hoverIndex}
                                        highlightedIndexes={this.state.highlightedIndexes}
                                        insertIndex={this.state.insertIndex}
                                        removeClick={this.buildOrderClicked}
                                        rerunBuildOrder={(bo) =>
                                            this.rerunBuildOrder(this.state.gamelogic, bo)
                                        }
                                        updateUrl={(race, bo, settings, optimizeSettings) =>
                                            this.updateHistory({
                                                race,
                                                bo,
                                                settings,
                                                optimizeSettings,
                                            })
                                        }
                                        changeHoverIndex={(index) => {
                                            this.changeHoverIndex(index)
                                        }}
                                        changeHighlight={(item?: Event) => {
                                            this.changeHighlight(item)
                                        }}
                                        changeInsertIndex={(index) => {
                                            this.changeInsertIndex(index)
                                        }}
                                        multilineBuildOrder={this.state.multilineBuildOrder}
                                    />
                                </div>
                                <BOArea
                                    gamelogic={this.state.gamelogic}
                                    hoverIndex={this.state.hoverIndex}
                                    highlightedIndexes={this.state.highlightedIndexes}
                                    removeClick={this.buildOrderClicked}
                                    changeHoverIndex={(index) => {
                                        this.changeHoverIndex(index)
                                    }}
                                    changeHighlight={(item?: Event) => {
                                        this.changeHighlight(item)
                                    }}
                                />
                                <ErrorMessage gamelogic={this.state.gamelogic} />
                            </div>

                            <div
                                className={
                                    this.state.minimizedActionsSelection ? "hidden" : "w-3/12"
                                }
                            >
                                <ActionsSelection
                                    gamelogic={this.state.gamelogic}
                                    race={this.state.race}
                                    insertIndex={this.state.insertIndex}
                                    actionClick={this.actionSelectionActionClicked}
                                    unitClick={this.actionSelectionUnitClicked}
                                    structureClick={this.actionSelectionStructureClicked}
                                    upgradeClick={this.actionSelectionUpgradeClicked}
                                />
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
)
