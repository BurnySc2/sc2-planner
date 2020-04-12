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

// TODO remove the following imports
// import ABILITIES from '../constants/enabled_abilities'
// import ENABLED_UPGRADES from '../constants/enabled_upgrades'
// import UPGRADES from '../constants/upgrades'
// import ENABLED_UNITS from '../constants/enabled_units'
// import UNITS from '../constants/units'
// import STRUCTURES from '../constants/structures'

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
    }

    raceSelectionClicked = (e, race) => {
        // Set race in state after a race selection icon has been pressed
        this.setState({
            race: race,
            bo: [],
            time: 0,
        })
    }

    actionSelectionActionClicked = (e, action) => {
        console.log(action);
    }
    actionSelectionUnitClicked = (e, unit) => {
        console.log(unit);
    }
    actionSelectionStructureClicked = (e, structure) => {
        console.log(structure);
    }
    actionSelectionUpgradeClicked = (e, upgrade) => {
        console.log(upgrade);
        
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
                        <div className="flex flex-row bg-indigo-400 m-2 p-2">
                            <RaceSelection onClick={this.raceSelectionClicked} />
                            <Time time={this.state.time} />
                            <BuildOrder bo={this.state.bo} />
                        </div>
                        <BOArea />
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

// actionButtonPressed = () => {
//     // If a button is pressed in the action selection, add it to the build order
//     // Then re-calculate the resulting time of all the items
//     // Then send all items and events to teh BOArea
// }