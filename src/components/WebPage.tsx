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
import Optimize from "./Optimize"
import Read from "./Read"
import Footer from "./Footer"
import ErrorMessage from "./ErrorMessage"
import { GameLogic } from "../game_logic/gamelogic"
import { OptimizeLogic } from "../game_logic/optimize"
import {
    defaultSettings,
    defaultOptimizeSettings,
    decodeSettings,
    decodeOptimizeSettings,
    decodeBuildOrder,
    createUrlParams,
} from "../constants/helper"
import { cloneDeep } from "lodash"
import {
    IBuildOrderElement,
    ISettingsElement,
    ICustomAction,
    IAllRaces,
} from "../constants/interfaces"
import CLASSES from "../constants/classes"

// Importing json doesnt seem to work with `import` statements, but have to use `require`

interface MyState {
    race: IAllRaces
    bo: Array<IBuildOrderElement>
    gamelogic: GameLogic
    settings: Array<ISettingsElement>
    optimizeSettings: Array<ISettingsElement>
    hoverIndex: number
    insertIndex: number
    multilineBuildOrder: boolean
    minimizedActionsSelection: boolean
}

export default withRouter(
    class WebPage extends Component<RouteComponentProps, MyState> {
        // TODO I dont know how to fix these properly
        constructor(props: RouteComponentProps) {
            super(props)

            // Get information from url
            // is "" local dev, file:///home/burny/Github/sc2-planner-react/build/index.html local build, /sc2-planner/ on github pages
            const urlParams = new URLSearchParams(this.props.location.search)
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

            this.state = {
                race: race,
                // Build order
                // Each element needs to have an .image attached and tooltip with: name, minerals, vespene, time
                bo: bo,
                gamelogic: gamelogic,
                settings: settings,
                optimizeSettings: optimizeSettings,
                // Index the mouse is hovering over
                hoverIndex: -1,
                // Index at which new build order items should be inserted (selected index)
                insertIndex: 0,
                multilineBuildOrder: true,
                minimizedActionsSelection: false,
            }
        }

        updateUrl = (
            race: string | undefined,
            buildOrder: Array<IBuildOrderElement>,
            settings: Array<ISettingsElement> | undefined,
            optimizeSettings: Array<ISettingsElement> | undefined,
            pushHistory = false
        ) => {
            // See router props
            const newUrl = createUrlParams(race, settings, optimizeSettings, buildOrder)

            // Change current url
            if (pushHistory) {
                this.props.history.push(`${newUrl}`)
            } else {
                this.props.history.replace(`${newUrl}`)
            }
        }

        rerunBuildOrder(gamelogic: GameLogic, buildOrder: Array<IBuildOrderElement>) {
            const newGamelogic = GameLogic.simulatedBuildOrder(gamelogic, buildOrder)
            this.setState({
                race: newGamelogic.race,
                bo: buildOrder,
                gamelogic: newGamelogic,
                settings: newGamelogic.customSettings,
                hoverIndex: -1,
            })
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
            this.updateUrl(this.state.race, this.state.bo, settings, this.state.optimizeSettings)
        }

        updateOptimize = (fieldKey: string, fieldValue: number) => {
            const optimizeSettings = this.state.optimizeSettings
            optimizeSettings.forEach((item) => {
                if (item.n === fieldKey) {
                    item.v = fieldValue
                }
            })

            this.updateUrl(this.state.race, this.state.bo, this.state.settings, optimizeSettings)
        }

        applyOpitimization = (optimizationList: string[]) => {
            const optimize = new OptimizeLogic(
                this.state.race,
                this.state.settings,
                this.state.optimizeSettings
            )
            const state = optimize.optimizeBuildOrder(
                this.state.gamelogic,
                this.state.bo,
                optimizationList
            )
            if (state) {
                this.updateUrl(state.race, state.bo, state.settings, this.state.optimizeSettings)
                this.setState(state)
            }
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

            this.setState({
                race: race,
                bo: [],
                gamelogic: gamelogic,
                insertIndex: 0,
            })

            // If settings are unchanged, change url to just '/race' instead of encoded settings
            this.updateUrl(race, [], this.state.settings, this.state.optimizeSettings, true)
            // this.props.history.replace(`/${race}`)
            // this.props.history.push(`/race=${race}`)
        }

        // item.type is one of ["worker", "action", "unit", "structure", "upgrade"]
        addItemToBO = (item: IBuildOrderElement) => {
            const [gamelogic, insertedItems] = GameLogic.addItemToBO(
                this.state.gamelogic,
                item,
                this.state.insertIndex
            )

            this.updateUrl(
                this.state.race,
                gamelogic.bo,
                this.state.settings,
                this.state.optimizeSettings
            )
            // Increment index because we appended a new build order item
            this.setState({
                bo: gamelogic.bo,
                gamelogic: gamelogic,
                insertIndex: this.state.insertIndex + insertedItems,
            })
        }

        removeItemFromBO = (index: number) => {
            const bo = this.state.bo
            bo.splice(index, 1)

            // TODO load snapshot from shortly before the removed bo index
            if (bo.length > 0) {
                this.rerunBuildOrder(this.state.gamelogic, bo)
            } else {
                const gamelogic = new GameLogic(
                    this.state.race,
                    bo,
                    this.state.settings,
                    this.state.optimizeSettings
                )
                gamelogic.setStart()
                this.setState({
                    bo: bo,
                    gamelogic: gamelogic,
                    hoverIndex: -1,
                })
            }

            this.updateUrl(this.state.race, bo, this.state.settings, this.state.optimizeSettings)

            // Decrement index because we removed a build order item
            if (this.state.insertIndex > this.state.hoverIndex) {
                this.setState({ insertIndex: Math.max(0, this.state.insertIndex - 1) })
            }
        }

        // If a button is pressed in the action selection, add it to the build order
        // Then re-calculate the resulting time of all the items
        // Then send all items and events to the BOArea
        actionSelectionActionClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            action: ICustomAction
        ) => {
            this.addItemToBO({
                name: action.internal_name,
                type: "action",
            })
        }

        actionSelectionUnitClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            unit: string
        ) => {
            if (["SCV", "Probe", "Drone"].indexOf(unit) >= 0) {
                this.addItemToBO({
                    name: unit,
                    type: "worker",
                })
            } else {
                this.addItemToBO({
                    name: unit,
                    type: "unit",
                })
            }
        }

        actionSelectionStructureClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            structure: string
        ) => {
            this.addItemToBO({
                name: structure,
                type: "structure",
            })
        }

        actionSelectionUpgradeClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            upgrade: string
        ) => {
            this.addItemToBO({
                name: upgrade,
                type: "upgrade",
            })
        }

        buildOrderRemoveClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number
        ) => {
            this.removeItemFromBO(index)
        }

        changeHoverIndex = (index: number) => {
            this.setState({
                hoverIndex: index,
            })
        }

        changeInsertIndex = (index: number) => {
            this.setState({
                insertIndex: index,
            })
        }

        handleKeyDown = (e: KeyboardEvent) => {
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

        render() {
            return (
                <div
                    className={`flex flex-col h-screen justify-between ${CLASSES.backgroundcolor}`}
                >
                    <div className="flex flex-col">
                        <Title />
                        <div className="select-none flex flex-row items-center">
                            <ImportExport
                                gamelogic={this.state.gamelogic}
                                rerunBuildOrder={(bo) =>
                                    this.rerunBuildOrder(this.state.gamelogic, bo)
                                }
                                updateUrl={(race, bo, settings, optimizeSettings) =>
                                    this.updateUrl(race, bo, settings, optimizeSettings, true)
                                }
                            />
                            <Settings
                                settings={this.state.settings}
                                updateSettings={this.updateSettings}
                            />
                            <Optimize
                                optimizeSettings={this.state.optimizeSettings}
                                updateOptimize={this.updateOptimize}
                                applyOpitimization={this.applyOpitimization}
                            />
                            <Read gamelogic={this.state.gamelogic} />

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
                                        insertIndex={this.state.insertIndex}
                                        removeClick={this.buildOrderRemoveClicked}
                                        rerunBuildOrder={(bo) =>
                                            this.rerunBuildOrder(this.state.gamelogic, bo)
                                        }
                                        updateUrl={(race, bo, settings, optimizeSettings) =>
                                            this.updateUrl(race, bo, settings, optimizeSettings)
                                        }
                                        changeHoverIndex={(index) => {
                                            this.changeHoverIndex(index)
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
                                    removeClick={this.buildOrderRemoveClicked}
                                    changeHoverIndex={(index) => {
                                        this.changeHoverIndex(index)
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
