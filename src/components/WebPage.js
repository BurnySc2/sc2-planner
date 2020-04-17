import React, { Component } from 'react'
import { withRouter } from "react-router-dom"

import Title from "./Title"
import ImportExport from './ImportExport'
import RaceSelection from './RaceSelection'
import Time from './Time'
import BuildOrder from './BuildOrder'
import BOArea from './BOArea'
import ActionsSelection from './ActionSelection'
import Settings from './Settings'
import Footer from './Footer'
import {GameLogic} from '../game_logic/gamelogic'
import {defaultSettings, encodeSettings, decodeSettings, encodeBuildOrder, decodeBuildOrder} from  "../constants/helper"
import {isEqual, cloneDeep} from 'lodash'

// import UNIT_ICONS from "../icons/unit_icons"
// import UPGRADE_ICONS from "../icons/upgrade_icons"
const UNIT_ICONS = require("../icons/unit_icons.json")
const UPGRADE_ICONS = require("../icons/upgrade_icons.json")
// Importing json doesnt seem to work with `import` statements, but have to use `require`

export default withRouter(class WebPage extends Component {
    constructor(props) {
        super(props)
        
        // Get information from url
        // is "" local dev, file:///home/burny/Github/sc2-planner-react/build/index.html local build, /sc2-planner/ on github pages
        const urlParams = new URLSearchParams(this.props.location.search)
        const raceUrl = urlParams.get('race');
        const settingsEncoded = urlParams.get('settings');
        const boEncoded = urlParams.get('bo');

        let race = "terran"
        if (["terran", "protoss", "zerg"].includes(raceUrl)) {
            race = raceUrl
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
        let bo = []
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
            settings: settings
        }

        // Load unit icons
        this.unitIcons = {}
        Object.keys(UNIT_ICONS).forEach((item) => {
            this.unitIcons[item] = require(`../icons/png/${UNIT_ICONS[item]}`)
        });

        // Load upgrade icons
        this.upgradeIcons = {}
        Object.keys(UPGRADE_ICONS).forEach((item) => {
            this.upgradeIcons[item] = require(`../icons/png/${UPGRADE_ICONS[item]}`)
        });

    }

    updateUrl = (race, settings, buildOrder, pushHistory=false) => {
        // See router props
        // console.log(this.props);
        
        let newUrl = `?race=${race}`

        if (!isEqual(settings, defaultSettings)) {
            // Encode the settings
            const settingsEncoded = encodeSettings(settings)
            // const decoded = decodeSettings(settingsEncoded)
            newUrl += `&settings=${settingsEncoded}`
        }

        if (buildOrder.length > 0) {
            // Encode the build order
            const buildOrderEncoded = encodeBuildOrder(buildOrder)
            // const buildOrderDecoded = decodebuildOrder(buildOrderEncoded)
            newUrl += `&bo=${buildOrderEncoded}`
        }

        // Change current url
        if (pushHistory) {
            this.props.history.push(`${newUrl}`)
        } else {
            this.props.history.replace(`${newUrl}`)
        }
    }

    rerunBuildOrder(bo, settings) {
        const gamelogic = new GameLogic(this.state.race, bo, settings)
        gamelogic.setStart()
        gamelogic.runUntilEnd()
        this.setState({
            bo: bo,
            gamelogic: gamelogic,
            settings: settings,
        })
    }


    // TODO Pass the settings to Settings.js and let the user input handle it
    updateSettings = (e, fieldKey, fieldValue) => {
        const settings = this.state.settings
        settings.forEach((item) => {
            if (item.n === fieldKey) {
                item.v = fieldValue
            }
        })
        
        // Re-calculate the whole simulation
        // TODO optimize: only recalculate if settings were changed that affected it
        this.rerunBuildOrder(this.state.bo, settings)
        this.updateUrl(this.state.race, settings, this.state.bo)
    }

    raceSelectionClicked = (e, race) => {
        // Set race in state after a race selection icon has been pressed
        const gamelogic = new GameLogic(race, [], this.state.settings)
        gamelogic.setStart()
        
        this.setState({
            race: race,
            bo: [],
            gamelogic: gamelogic,
        })
        
        // If settings are unchanged, change url to just '/race' instead of encoded settings
        this.updateUrl(race, this.state.settings, [], true)
        // this.props.history.replace(`/${race}`)
        // this.props.history.push(`/race=${race}`)
    }

    // item.type is one of ["worker", "action", "unit", "structure", "upgrade"]
    addItemToBO = (item) => {
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
        this.rerunBuildOrder(bo, this.state.settings)
        this.updateUrl(this.state.race, this.state.settings, bo)
    }
    removeItemFromBO = (index) => {
        const bo = this.state.bo
        bo.splice(index, 1)
        
        // TODO load snapshot from shortly before the removed bo index
        if (bo.length > 0) {
            this.rerunBuildOrder(bo, this.state.settings)
        } else {
            const gamelogic = new GameLogic(this.state.race, bo, this.state.settings)
            gamelogic.setStart()
            this.setState({
                bo: bo,
                gamelogic: gamelogic,
            })
        }

        this.updateUrl(this.state.race, this.state.settings, bo)
    }

    // If a button is pressed in the action selection, add it to the build order
    // Then re-calculate the resulting time of all the items
    // Then send all items and events to the BOArea
    actionSelectionActionClicked = (e, action) => {
        this.addItemToBO({
            name: action.name,
            type: "action",
            image: require(`../icons/png/${action.imageSource}`)
        })
        console.log(action.name);
    }

    actionSelectionUnitClicked = (e, unit) => {
        if (["SCV", "Probe", "Drone"].indexOf(unit) >= 0) {
            this.addItemToBO({
                name: unit,
                type: "worker",
                image: this.unitIcons[unit.toUpperCase()]
            })
        } else {
            this.addItemToBO({
                name: unit,
                type: "unit",
                image: this.unitIcons[unit.toUpperCase()]
            })
        }
        console.log(unit);
    }

    actionSelectionStructureClicked = (e, structure) => {
        this.addItemToBO({
            name: structure,
            type: "structure",
            image: this.unitIcons[structure.toUpperCase()]
        })
        console.log(structure);
    }

    actionSelectionUpgradeClicked = (e, upgrade) => {
        this.addItemToBO({
            name: upgrade,
            type: "upgrade",
            image: this.upgradeIcons[upgrade.toUpperCase()]
        })
        console.log(upgrade);
    }

    buildOrderRemoveClicked = (e, index) => {
        // console.log(index)
        this.removeItemFromBO(index)
    }

    render() {
        return (
            <div className="flex-col h-full w-full bg-gray-500">
                <Title />
                <div className="flex flex-row">
                    <ImportExport />
                    <Settings settings={this.state.settings} updateSettings={this.updateSettings} />
                </div>
                <div className="flex flex-row">
                    <div className="w-9/12">
                        <div className="flex flex-row bg-indigo-400 m-1 p-1 items-center">
                            <RaceSelection onClick={this.raceSelectionClicked} />
                            <Time 
                            gamelogic={this.state.gamelogic} />
                            <BuildOrder bo={this.state.bo} removeClick={this.buildOrderRemoveClicked} />
                        </div>
                        <BOArea gamelogic={this.state.gamelogic} />
                    </div>
                    <div className="w-3/12">
                        <ActionsSelection 
                        gamelogic={this.state.gamelogic}  
                        race={this.state.race} 
                        actionClick={this.actionSelectionActionClicked} 
                        unitClick={this.actionSelectionUnitClicked} 
                        structureClick={this.actionSelectionStructureClicked} 
                        upgradeClick={this.actionSelectionUpgradeClicked} />
                    </div>
                </div>
                <Footer />
            </div>
        )
    }
})
