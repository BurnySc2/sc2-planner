import React, { Component } from 'react'

import Title from "./Title"
import ImportExport from './ImportExport'
import RaceSelection from './RaceSelection'
import Time from './Time'
import BuildOrder from './BuildOrder'
import BOArea from './BOArea'
import ActionsSelection from './ActionSelection'
import Settings from './Settings'
import Footer from './Footer'

// Importing json doesnt seem to work with `import` statements, but have to use `require`
const UNIT_ICONS = require("../icons/unit_icons.json")
const UPGRADE_ICONS = require("../icons/upgrade_icons.json")

export default class WebPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            race: "terran",
            // Build order
            // Each element needs to have an .image attached and tooltip with: name, minerals, vespene, time
            bo: [],
            // Selected timestamp
            time: 0,
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

    raceSelectionClicked = (e, race) => {
        // Set race in state after a race selection icon has been pressed
        this.setState({
            race: race,
            bo: [],
            time: 0,
        })
    }

    // type is one of ["worker", "action", "unit", "structure", "upgrade"]
    addItemToBO = (item) => {
        const bo = this.state.bo
        bo.push(item)
        this.setState({
            bo: bo
        })
        // TODO re-calculate build order
    }
    removeItemFromBO = (index) => {
        const bo = this.state.bo
        bo.splice(index, 1)
        this.setState({
            bo: bo
        })
        // TODO re-calculate build order
    }

    // If a button is pressed in the action selection, add it to the build order
    // Then re-calculate the resulting time of all the items
    // Then send all items and events to the BOArea
    actionSelectionActionClicked = (e, action) => {
        this.addItemToBO({
            name: action,
            type: "action",
            // TODO Add custom action icon
            image: ""
        })
        console.log(action);
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
        // console.log(e.target)
        console.log(index)
        this.removeItemFromBO(index)
    }

    render() {
        return (
            <div className="flex-col h-full w-full bg-gray-500">
                <Title />
                <div className="flex flex-row">
                    <ImportExport />
                    <Settings />
                </div>
                <div className="flex flex-row">
                    <div className="w-9/12">
                        <div className="flex flex-row bg-indigo-400 m-2 p-2 items-center">
                            <RaceSelection onClick={this.raceSelectionClicked} />
                            <Time time={this.state.time} />
                            <BuildOrder bo={this.state.bo} removeClick={this.buildOrderRemoveClicked} />
                        </div>
                        <BOArea bo={this.state.bo} />
                    </div>
                    <div className="w-3/12">
                        <ActionsSelection race={this.state.race} 
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
}
