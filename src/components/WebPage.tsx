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
import Footer from "./Footer"
import ErrorMessage from "./ErrorMessage"
import { GameLogic } from "../game_logic/gamelogic"
import {
    defaultSettings,
    decodeSettings,
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

// Importing json doesnt seem to work with `import` statements, but have to use `require`

interface MyState {
    race: IAllRaces
    bo: Array<IBuildOrderElement>
    gamelogic: GameLogic
    settings: Array<ISettingsElement>
    hoverIndex: number
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

            // Decode build order from url
            let bo: Array<IBuildOrderElement> = []
            if (boEncoded) {
                bo = decodeBuildOrder(boEncoded)
            }

            // Start the game logic with given settings and build order
            const gamelogic = new GameLogic(race, bo, settings)
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
                hoverIndex: -1,
            }
        }

        updateUrl = (
            race: string | undefined,
            buildOrder: Array<IBuildOrderElement>,
            settings: Array<ISettingsElement> | undefined,
            pushHistory = false
        ) => {
            // See router props
            // console.log(this.props);

            const newUrl = createUrlParams(race, settings, buildOrder)

            // Change current url
            if (pushHistory) {
                this.props.history.push(`${newUrl}`)
            } else {
                this.props.history.replace(`${newUrl}`)
            }
        }

        rerunBuildOrder(
            race: IAllRaces | undefined,
            buildOrder: Array<IBuildOrderElement>,
            settings: Array<ISettingsElement> | undefined
        ) {
            if (!race) {
                race = "terran" as IAllRaces
            }
            if (!settings) {
                settings = cloneDeep(defaultSettings)
            }

            const gamelogic = new GameLogic(race, buildOrder, settings)
            gamelogic.setStart()
            gamelogic.runUntilEnd()
            this.setState({
                race: race,
                bo: buildOrder,
                gamelogic: gamelogic,
                settings: settings,
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
            this.rerunBuildOrder(this.state.race, this.state.bo, settings)
            this.updateUrl(this.state.race, this.state.bo, settings)
        }

        raceSelectionClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            race: IAllRaces
        ) => {
            // Set race in state after a race selection icon has been pressed
            const gamelogic = new GameLogic(race, [], this.state.settings)
            gamelogic.setStart()

            this.setState({
                race: race,
                bo: [],
                gamelogic: gamelogic,
            })

            // If settings are unchanged, change url to just '/race' instead of encoded settings
            this.updateUrl(race, [], this.state.settings, true)
            // this.props.history.replace(`/${race}`)
            // this.props.history.push(`/race=${race}`)
        }

        // item.type is one of ["worker", "action", "unit", "structure", "upgrade"]
        addItemToBO = (item: IBuildOrderElement) => {
            const bo = this.state.bo
            bo.push(item)
            // Re-calculate build order

            // // Caching using snapshots - idk why this isnt working properly
            // const latestSnapshot = gamelogic.getLastSnapshot()
            // if (latestSnapshot) {
            //     gamelogic.loadFromSnapshotObject(latestSnapshot)
            // }
            // gamelogic.bo = cloneDeep(bo)
            // gamelogic.runUntilEnd()

            // Non cached:
            this.rerunBuildOrder(this.state.race, bo, this.state.settings)
            this.updateUrl(this.state.race, bo, this.state.settings)
        }

        removeItemFromBO = (index: number) => {
            const bo = this.state.bo
            bo.splice(index, 1)

            // TODO load snapshot from shortly before the removed bo index
            if (bo.length > 0) {
                this.rerunBuildOrder(this.state.race, bo, this.state.settings)
            } else {
                const gamelogic = new GameLogic(
                    this.state.race,
                    bo,
                    this.state.settings
                )
                gamelogic.setStart()
                this.setState({
                    bo: bo,
                    gamelogic: gamelogic,
                    hoverIndex: -1,
                })
            }

            this.updateUrl(this.state.race, bo, this.state.settings)
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
            console.log(action.internal_name)
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
            console.log(unit)
        }

        actionSelectionStructureClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            structure: string
        ) => {
            this.addItemToBO({
                name: structure,
                type: "structure",
            })
            console.log(structure)
        }

        actionSelectionUpgradeClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            upgrade: string
        ) => {
            this.addItemToBO({
                name: upgrade,
                type: "upgrade",
            })
            console.log(upgrade)
        }

        buildOrderRemoveClicked = (
            e: React.MouseEvent<HTMLDivElement, MouseEvent>,
            index: number
        ) => {
            // console.log(index)
            this.removeItemFromBO(index)
        }

        changeHoverIndex = (index: number) => {
            this.setState({
                hoverIndex: index,
            })
        }

        render() {
            return (
                <div className="flex-col h-full w-full bg-gray-500">
                    <Title />
                    <div className="flex flex-row items-center">
                        <ImportExport
                            gamelogic={this.state.gamelogic}
                            rerunBuildOrder={(race, bo, settings) =>
                                this.rerunBuildOrder(race, bo, settings)
                            }
                            updateUrl={(race, bo, settings) =>
                                this.updateUrl(race, bo, settings, true)
                            }
                        />
                        <Settings
                            settings={this.state.settings}
                            updateSettings={this.updateSettings}
                        />
                    </div>
                    <div className="flex flex-row">
                        <div className="w-9/12">
                            <div className="flex flex-row bg-indigo-400 m-1 p-1 items-center">
                                <RaceSelection
                                    onClick={this.raceSelectionClicked}
                                />
                                <Time gamelogic={this.state.gamelogic} />
                                <BuildOrder
                                    gamelogic={this.state.gamelogic}
                                    hoverIndex={this.state.hoverIndex}
                                    removeClick={this.buildOrderRemoveClicked}
                                    rerunBuildOrder={(race, bo, settings) =>
                                        this.rerunBuildOrder(race, bo, settings)
                                    }
                                    updateUrl={(race, bo, settings) =>
                                        this.updateUrl(race, bo, settings)
                                    }
                                    changeHoverIndex={(index) => {
                                        this.changeHoverIndex(index)
                                    }}
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
                        <div className="w-3/12">
                            <ActionsSelection
                                gamelogic={this.state.gamelogic}
                                race={this.state.race}
                                actionClick={this.actionSelectionActionClicked}
                                unitClick={this.actionSelectionUnitClicked}
                                structureClick={
                                    this.actionSelectionStructureClicked
                                }
                                upgradeClick={
                                    this.actionSelectionUpgradeClicked
                                }
                            />
                        </div>
                    </div>
                    <Footer />
                </div>
            )
        }
    }
)
