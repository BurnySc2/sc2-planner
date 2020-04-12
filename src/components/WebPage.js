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
            "race": "terran",
        }
    }

    raceSelectionPressed = (e, race) => {
        // Set race in state after a race selection icon has been pressed
        this.setState({
            "race": race
        })
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
                            <RaceSelection onClick={this.raceSelectionPressed} />
                            <Time />
                            <BuildOrder />
                        </div>
                        <BOArea />
                    </div>
                    <div className="w-3/12">
                        <ActionsSelection race={this.state.race} />
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